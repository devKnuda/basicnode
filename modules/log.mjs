// modules/log.mjs
import HTTP_CODES from '../utils/httpCodes.mjs';

export const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Private instance using closure
let instance = null;

// Create logger instance
function createLogger() {
    let level = LogLevel.INFO;
    let enabled = true;

    const formatMessage = (logLevel, message, meta = {}) => {
        const timestamp = new Date().toISOString();
        const metaStr = Object.entries(meta)
            .map(([key, value]) => `${key}=${value}`)
            .join(' ');
        return `[${timestamp}] ${logLevel.padEnd(5)} ${message} ${metaStr}`;
    };

    return {
        setLevel: (newLevel) => {
            level = newLevel;
        },
        
        setEnabled: (isEnabled) => {
            enabled = isEnabled;
        },
        
        log: (logLevel, message, meta) => {
            if (!enabled || LogLevel[logLevel] > level) return;
            console.log(formatMessage(logLevel, message, meta));
        }
    };
}

// Singleton getter
export function getLogger() {
    if (!instance) {
        instance = createLogger();
    }
    return instance;
}

const logger = getLogger();

export function loggingMiddleware(req, res, next) {
    const start = Date.now();
    let logged = false;
    
    const originalEnd = res.end;
    res.end = function(...args) {
        if (!logged) {
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

            if (req.body && Object.keys(req.body).length > 0) {
                logger.log('DEBUG', 'Request body', { body: JSON.stringify(req.body) });
            }
            logged = true;
        }
        originalEnd.apply(res, args);
    };

    next();
}

export { logger };