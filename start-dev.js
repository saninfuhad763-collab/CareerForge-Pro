const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[35m%s\x1b[0m', '==================================================');
console.log('\x1b[35m%s\x1b[0m', '       CareerForge Pro - Developer Launcher       ');
console.log('\x1b[35m%s\x1b[0m', '==================================================');

// Start backend
console.log('\x1b[36m%s\x1b[0m', '[Launcher] Launching Express Backend (Port 5000)...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// Start frontend
console.log('\x1b[32m%s\x1b[0m', '[Launcher] Launching Frontend Vite Client (Port 5173)...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  stdio: 'inherit'
});

// Graceful cleanup
const cleanExit = () => {
  console.log('\x1b[31m%s\x1b[0m', '\n[Launcher] Shutting down development servers...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
