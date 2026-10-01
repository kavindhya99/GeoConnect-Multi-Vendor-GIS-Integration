const express = require("express");

const validateGeocode =
    require("../middleware/validateGeocode");

const geocodeRateLimiter =
    require("../middleware/geocodeRateLimiter");


const { hereAdapter } =
    require("../adapters/hereAdapter");

const { nominatimAdapter } =
    require("../adapters/nominatimAdapter");

const {
    saveGeocodingHistory
} = require("../repositories/historyRepository");

const {
    saveApiRequestLog
} = require("../repositories/logRepository");

const router = express.Router();

router.get(
    "/geocode",
    geocodeRateLimiter,
    validateGeocode,
    async (req, res, next) => {
        try {
            const {
                address,
                provider
            } = req.geocode;

            let result;

            if (provider === "here") {
                result = await hereAdapter(address);
            } else {
                result = await nominatimAdapter(address);
            }    

            // Log external API request
            if (!result.cached) {
                try {
                    await saveApiRequestLog({
                        provider: result.provider,
                        searchAddress: address,
                        httpStatus: result.upstreamStatus ?? 200,
                        responseTime: result.responseTime ?? null,
                        requestMethod: result.method || "GET",
                        requestStatus: "SUCCESS",
                        errorMessage: null
                    });
                } catch (logError) {
                    console.error(
                        "API Log Insert Error:",
                        logError.message
                    );
                }
            }

            // Save successful geocoding result to PostgreSQL
            const savedRecord = await saveGeocodingHistory(
                address,
                result
            );

            return res.status(200).json({
                ...result,
                historyId: savedRecord.id
            });

        } catch (error) {

    // Log failed external API request
    try {
        await saveApiRequestLog({
            provider:
                req.geocode?.provider === "here"
                    ? "HERE Maps"
                    : "Nominatim",

            searchAddress:
                req.geocode?.address || "Unknown",

            httpStatus:
                error.upstreamStatus ??
                error.status ??
                500,

            responseTime:
                error.responseTime ?? null,

            requestMethod: "GET",

            requestStatus: "FAILED",

            errorMessage: error.message
        });

    } catch (logError) {
        console.error(
            "API Log Insert Error:",
            logError.message
        );
    }

    next(error);
}
}
);

module.exports = router;