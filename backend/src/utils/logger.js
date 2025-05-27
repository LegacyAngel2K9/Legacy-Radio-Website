const winston = require('winston');
const { combine, timestamp, printf, colorize, align, errors } = winston.format;
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    const log = `${timestamp} [${level}]: ${stack || message}`;
    return log;
});

// Create transports
const transports = [
    // Console transport
    new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
        )
    }),

    // Daily rotate file transport for errors
    new DailyRotateFile({
        level: 'error',
        filename: path.join(__dirname, '../logs/error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
        )
    }),

    // Daily rotate file transport for all logs
    new DailyRotateFile({
        filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
        )
    })
];

// Create logger instance
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        winston.format.json()
    ),
    transports,
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs/exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d'
        })
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs/rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d'
        })
    ]
});

// Add Morgan stream for HTTP logging
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Add custom methods for different log levels
logger.success = function (message, meta) {
    this.log({ level: 'info', message, success: true, ...meta });
};

logger.api = function (message, meta) {
    this.log({ level: 'info', message, type: 'api', ...meta });
};

logger.db = function (message, meta) {
    this.log({ level: 'debug', message, type: 'database', ...meta });
};

module.exports = logger;