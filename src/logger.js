import log from 'loglevel';

// Get log level from environment variable or default to 'info'
const logLevel = (import.meta.env.VITE_LOG_LEVEL || 'info').trim().toLowerCase();

// Set the log level
log.setLevel(logLevel);

// Define color codes for different log levels
const levelColors = {
  trace: '\x1b[38;2;161;74;189m', // Purple
  debug: '\x1b[32m', // Green
  info: '\x1b[34m', // Blue
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m' // Red
};

const resetColor = '\x1b[0m';

// Custom plugin to add colors and timestamps
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function (...messages) {
    const timestamp = new Date().toLocaleString();
    const color = levelColors[methodName] || '';
    const levelUpper = methodName.toUpperCase();
    const prefix = `${timestamp} [${color}${levelUpper}${resetColor}]:`;

    rawMethod(prefix, ...messages);
  };
};

// Apply the custom factory
log.setLevel(log.getLevel());

export { log as logger };
