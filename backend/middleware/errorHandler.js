// ==================================
// Centralized Error Handler
// ==================================

function errorHandler(error, req, res, next) {

    console.error(
        "Unhandled Application Error:",
        error
    );

    const statusCode =
        error.status ||
        error.statusCode ||
        500;

    const message =
        statusCode === 500
            ? "Internal server error"
            : error.message || "Request failed";

    return res.status(statusCode).json({

        status: "error",

        statusCode: statusCode,

        message: message

    });
}


module.exports = errorHandler;