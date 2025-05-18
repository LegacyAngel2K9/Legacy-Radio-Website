/**
 * Standardized API response structure
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Boolean} success - True for success, false for errors
 * @param {String} message - Descriptive message
 * @param {Object|Array} [data] - Optional payload (for success)
 * @param {Object} [error] - Optional error details (for failures)
 */
const apiResponse = (res, statusCode, success, message, data = null, error = null) => {
    const response = {
        status: success,
        message,
        ...(data && { data }),
        ...(error && { error }),
    };

    return res.status(statusCode).json(response);
};

// Success Responses
apiResponse.success = (res, { statusCode = 200, message = "Success", data = null }) => {
    return apiResponse(res, statusCode, true, message, data);
};

// Error Responses
apiResponse.error = (res, { statusCode = 500, message = "An error occurred", error = null }) => {
    return apiResponse(res, statusCode, false, message, null, error);
};

apiResponse.validationError = (res, { message = "Validation failed", errors = {} }) => {
    return apiResponse(res, 400, false, message, null, errors);
};

module.exports = apiResponse;