import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * useFocusTrap: Manages keyboard focus trapping, initial focus, return focus,
 * Escape handling, and background inertness for modal dialogs and drawers.
 *
 * @param {Object} options
 * @param {boolean} options.isOpen - Whether the dialog/drawer is currently mounted/visible
 * @param {Function} [options.onClose] - Callback when user presses Escape key
 * @param {React.RefObject} [options.initialFocusRef] - Optional specific element to receive initial focus
 * @param {boolean} [options.closeOnEscape=true] - Whether Escape key should trigger onClose
 * @param {boolean} [options.setInertBackground=true] - Whether to set 'inert' on background siblings
 * @returns {React.RefObject} containerRef to attach to the dialog/drawer panel DOM element
 */
export function useFocusTrap({
  isOpen,
  onClose,
  initialFocusRef,
  closeOnEscape = true,
  setInertBackground = true,
} = {}) {
  const containerRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // 1. Capture previously focused element when dialog opens, restore it when dialog closes
  useEffect(() => {
    if (isOpen) {
      if (document.activeElement && typeof document.activeElement.focus === 'function') {
        previouslyFocusedElementRef.current = document.activeElement;
      }
    } else if (previouslyFocusedElementRef.current) {
      const elToRestore = previouslyFocusedElementRef.current;
      previouslyFocusedElementRef.current = null;
      requestAnimationFrame(() => {
        if (elToRestore && typeof elToRestore.focus === 'function' && document.contains(elToRestore)) {
          elToRestore.focus();
        }
      });
    }
  }, [isOpen]);

  // 2. Initial focus placement into dialog
  useEffect(() => {
    if (!isOpen) return;

    const frameId = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      if (initialFocusRef && initialFocusRef.current && typeof initialFocusRef.current.focus === 'function') {
        initialFocusRef.current.focus();
        return;
      }

      const focusableElements = containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else if (containerRef.current.getAttribute('tabindex') !== null) {
        containerRef.current.focus();
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, initialFocusRef]);

  // 3. Tab trapping and Escape handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation();
        if (typeof onClose === 'function') {
          onClose();
        }
        return;
      }

      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0
      );

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose, closeOnEscape]);

  // 4. Background inertness
  useEffect(() => {
    if (!isOpen || !setInertBackground) return;

    const container = containerRef.current;
    if (!container) return;

    let overlayRoot = container;
    while (overlayRoot.parentElement && overlayRoot.parentElement !== document.body && overlayRoot.parentElement.id !== 'root') {
      overlayRoot = overlayRoot.parentElement;
    }

    const modifiedElements = [];
    const siblings = overlayRoot.parentElement ? Array.from(overlayRoot.parentElement.children) : [];

    siblings.forEach((sibling) => {
      if (sibling !== overlayRoot && !sibling.contains(container) && !sibling.hasAttribute('inert')) {
        sibling.setAttribute('inert', '');
        modifiedElements.push(sibling);
      }
    });

    return () => {
      modifiedElements.forEach((el) => {
        el.removeAttribute('inert');
      });
    };
  }, [isOpen, setInertBackground]);

  return containerRef;
}

export default useFocusTrap;