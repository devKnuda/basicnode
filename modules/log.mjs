// modules/log.mjs
import HTTP_CODES from '../utils/httpCodes.mjs';

export const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

export class Logger {
    constructor() {
        this.level = LogLevel.INFO;
        this.enabled = true;
    }

    setLevel(level) {
        this.level = level;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaStr = Object.entries(meta)
            .map(([key, value]) => `${key}=${value}`)
            .join(' ');
        return `[${timestamp}] ${level.padEnd(5)} ${message} ${metaStr}`;
    }

    log(level, message, meta) {
        if (!this.enabled || level > this.level) return;
        console.log(this.formatMessage(level, message, meta));
    }
}

const logger = new Logger();

export function loggingMiddleware(req, res, next) {
    const start = Date.now();
    
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const method = req.method;
        const url = req.url;
        
        const meta = {
            method,
            url,
            statusCode,
            duration: `${duration}ms`
        };

        if (statusCode >= HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR) {
            logger.log('ERROR', 'Request failed', meta);
        } else if (statusCode >= HTTP_CODES.CLIENT_ERROR.BAD_REQUEST) {
            logger.log('WARN', 'Client error', meta);
        } else {
            logger.log('INFO', 'Request completed', meta);
        }

        // Log request body for debug level
        if (req.body && Object.keys(req.body).length > 0) {
            logger.log('DEBUG', 'Request body', { body: JSON.stringify(req.body) });
        }

        originalEnd.apply(res, args);
    };

    next();
}

// Export logger instance for external configuration
export { logger };