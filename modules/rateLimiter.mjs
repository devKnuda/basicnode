// modules/rateLimiter.mjs
import { logger } from './log.mjs';
import HTTP_CODES from '../utils/httpCodes.mjs';

export function createRateLimiter(options = {}) {
    const {
        windowMs = 60000, // 1 minute default
        maxRequests = 100, // max requests per window
        message = 'Too many requests, please try again later.'
    } = options;

    // Store request counts with timestamp
    const requests = new Map();

    // Cleanup function to remove old entries
    const cleanup = () => {
        const now = Date.now();
        for (const [key, data] of requests.entries()) {
            if (now - data.timestamp > windowMs) {
                requests.delete(key);
            }
        }
    };

    // Run cleanup every minute
    setInterval(cleanup, 60000);

    return (req, res, next) => {
        const key = req.ip; // Use IP as identifier
        const now = Date.now();

        // Clean up old requests for this IP
        if (requests.has(key)) {
            const data = requests.get(key);
            if (now - data.timestamp > windowMs) {
                requests.delete(key);
            }
        }

        // Get or create request data
        const data = requests.get(key) || {
            timestamp: now,
            count: 0
        };

        // Check if limit is exceeded
        if (data.count >= maxRequests) {
            logger.log('WARN', 'Rate limit exceeded', {
                ip: key,
                requests: data.count,
                window: `${windowMs/1000}s`
            });

            return res.status(HTTP_CODES.CLIENT_ERROR.TOO_MANY_REQUESTS)
                     .json({
                         error: message,
                         retryAfter: Math.ceil((data.timestamp + windowMs - now) / 1000)
                     });
        }

        // Update request count
        data.count++;
        requests.set(key, data);

        // Log rate limiting info at debug level
        logger.log('DEBUG', 'Rate limit status', {
            ip: key,
            requests: data.count,
            remaining: maxRequests - data.count,
            window: `${windowMs/1000}s`
        });

        next();
    };
}