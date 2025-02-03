import { setUncaughtExceptionCaptureCallback } from "node:process"

const HTTP_CODES = {
    INFO: {
        CONTINUE: 100,
        SWITCHING_PROTOCOLS: 101,
        PROCESSING: 102
    },
    SUCCESS: {
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204,
        PARTIAL_CONTENT: 206
    },
    REDIRECTION: {
        MULTIPLE_CHOICES: 300,
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        SEE_OTHER: 303,
        NOT_MODIFIED: 304,
        TEMPORARY_REDIRECT: 307,
        PERMANENT_REDIRECT: 308
    },
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        NOT_ACCEPTABLE: 406,
        CONFLICT: 409,
        GONE: 410,
        PRECONDITION_FAILED: 412,
        PAYLOAD_TOO_LARGE: 413,
        UNSUPPORTED_MEDIA_TYPE: 415,
        TOO_MANY_REQUESTS: 429
    },
    SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504
    }
};

export default HTTP_CODES;