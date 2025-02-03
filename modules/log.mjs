// modules/log.mjs
import HTTP_CODES from '../utils/httpCodes.mjs';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

export const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const LogColors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[90m', // Gray
    RESET: '\x1b[0m'   // Reset
};

// Private instance using closure
let instance = null;

// Create logs directory if it doesn't exist
const logDir = './logs';
const logFile = path.join(logDir, 'app.csv');

async function initializeLogFile() {
    try {
        if (!fs.existsSync(logDir)) {
            await fsPromises.mkdir(logDir);
        }
        if (!fs.existsSync(logFile)) {
            await fsPromises.writeFile(logFile, 'timestamp,level,message,metadata\n');
        }
    } catch (err) {
        console.error('Error initializing log file:', err);
    }
}

// Initialize log file
await initializeLogFile();

// Create logger instance
function createLogger() {
    let level = LogLevel.INFO;
    let enabled = true;

    const writeToFile = async (timestamp, logLevel, message, meta = {}) => {
        try {
            const metaStr = JSON.stringify(meta).replace(/"/g, '""');
            const logLine = `"${timestamp}","${logLevel}","${message}","${metaStr}"\n`;
            await fsPromises.appendFile(logFile, logLine);
        } catch (err) {
            console.error('Error writing to log file:', err);
        }
    };

    const formatMessage = (logLevel, message, meta = {}) => {
        const timestamp = new Date().toISOString();
        const color = LogColors[logLevel] || LogColors.RESET;
        
        // Format timestamp to be more readable
        const formattedTime = timestamp.replace('T', ' ').split('.')[0];
        
        // Format metadata with better structure
        const metaStr = Object.entries(meta)
            .map(([key, value]) => `\n\t${key}: ${value}`)
            .join('');
        
        // Write to CSV file
        writeToFile(timestamp, logLevel, message, meta);
        
        // Return console formatted message
        return `${color}[${formattedTime}] ${logLevel.padEnd(5)} ${message}${metaStr}${LogColors.RESET}`;
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