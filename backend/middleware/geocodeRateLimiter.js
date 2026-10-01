const rateLimit = require("express-rate-limit");


// ==================================
// Geocoding API Rate Limiter
// ==================================

const geocodeRateLimiter = rateLimit({

    // 1 minute
    windowMs: 60 * 1000,

    // Maximum 20 requests per client per minute
    limit: 20,

    // Include standard rate-limit headers
    standardHeaders: true,

    // Disable older X-RateLimit-* headers
    legacyHeaders: false,

    // Response when limit is exceeded
    handler: (req, res) => {

        return res.status(429).json({

            status: "error",

            statusCode: 429,

            message:
                "Too many geocoding requests. Please try again later."

        });

    }

});


module.exports = geocodeRateLimiter;