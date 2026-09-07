/**
 * In-process concurrency and resource guard for PDF exports.
 * Protects against:
 * 1. Unbounded parallel Puppeteer launches that exhaust server RAM/CPU.
 * 2. Rapid repeated/parallel export requests from the same user.
 * 3. Excessive queued export backpressure.
 *
 * SCOPE / LIMITATION:
 * This concurrency guard is instance-local (in-memory within the Node.js process).
 * In a multi-instance autoscaled deployment, each instance independently enforces
 * its own local resource limits.
 */

const MAX_CONCURRENT_EXPORTS = parseInt(process.env.PDF_MAX_CONCURRENT || '2', 10);
const MAX_QUEUE_SIZE = parseInt(process.env.PDF_MAX_QUEUE || '5', 10);
const QUEUE_TIMEOUT_MS = parseInt(process.env.PDF_QUEUE_TIMEOUT_MS || '15000', 10);

let activeExports = 0;
const activeUsers = new Set();
const waitingQueue = [];

const processQueue = () => {
  while (waitingQueue.length > 0 && activeExports < MAX_CONCURRENT_EXPORTS) {
    const nextItem = waitingQueue.shift();
    if (nextItem.timeoutId) {
      clearTimeout(nextItem.timeoutId);
    }
    if (nextItem.onClientClose) {
      nextItem.res.removeListener('close', nextItem.onClientClose);
    }

    if (nextItem.res.writableEnded || nextItem.res.headersSent) {
      continue;
    }

    acquireSlot(nextItem.req, nextItem.res, nextItem.next, nextItem.userKey);
  }
};

const acquireSlot = (req, res, next, userKey) => {
  activeExports++;
  activeUsers.add(userKey);

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    activeUsers.delete(userKey);
    activeExports = Math.max(0, activeExports - 1);
    processQueue();
  };

  res.once('finish', release);
  res.once('close', release);

  next();
};

export const pdfExportGuard = (req, res, next) => {
  const userKey = req.user?._id?.toString() || req.ip || 'anonymous';

  // 1. Prevent simultaneous parallel exports from the same user account
  if (activeUsers.has(userKey)) {
    return res.status(429).json({
      success: false,
      message: 'A PDF export is already in progress for your account. Please wait for it to complete.',
    });
  }

  // 2. If below max concurrent capacity, execute immediately
  if (activeExports < MAX_CONCURRENT_EXPORTS) {
    acquireSlot(req, res, next, userKey);
    return;
  }

  // 3. If capacity reached, check queue limit
  if (waitingQueue.length >= MAX_QUEUE_SIZE) {
    return res.status(503).json({
      success: false,
      message: 'PDF export service is currently busy. Please try again in a few moments.',
    });
  }

  // 4. Enqueue request with timeout
  let queueItem;
  const timeoutId = setTimeout(() => {
    const idx = waitingQueue.indexOf(queueItem);
    if (idx !== -1) {
      waitingQueue.splice(idx, 1);
    }
    if (!res.headersSent && !res.writableEnded) {
      res.status(503).json({
        success: false,
        message: 'PDF export request timed out waiting for available capacity. Please try again.',
      });
    }
  }, QUEUE_TIMEOUT_MS);

  const onClientClose = () => {
    if (!res.writableEnded && !res.headersSent) {
      if (timeoutId) clearTimeout(timeoutId);
      const idx = waitingQueue.indexOf(queueItem);
      if (idx !== -1) {
        waitingQueue.splice(idx, 1);
      }
    }
  };

  queueItem = { req, res, next, userKey, timeoutId, onClientClose };
  waitingQueue.push(queueItem);

  res.once('close', onClientClose);
};

// Export inspection helpers for testing
export const getPdfGuardState = () => ({
  activeExports,
  activeUsersCount: activeUsers.size,
  queueLength: waitingQueue.length,
  maxConcurrent: MAX_CONCURRENT_EXPORTS,
  maxQueue: MAX_QUEUE_SIZE,
});

export const resetPdfGuardState = () => {
  activeExports = 0;
  activeUsers.clear();
  waitingQueue.length = 0;
};
