const express = require("express");

const {
    getAllApiRequestLogs,
    clearApiRequestLogs
} = require("../repositories/logRepository");

const router = express.Router();


// ==================================
// GET /logs
// Retrieve API Request Logs
// ==================================

router.get("/logs", async (req, res, next) => {

    try {

        const logs = await getAllApiRequestLogs();

        return res.status(200).json({
            status: "success",
            count: logs.length,
            data: logs
        });

    } catch (error) {

        console.error(
            "API Log Retrieval Error:",
            error.message
        );

        error.status = 500;
        next(error);
    }
});


// ==================================
// DELETE /logs
// Clear API Request Logs
// ==================================

router.delete("/logs", async (req, res, next) => {

    try {

        await clearApiRequestLogs();

        return res.status(200).json({
            status: "success",
            message: "API request logs cleared successfully"
        });

    } catch (error) {

        console.error(
            "API Log Clear Error:",
            error.message
        );

        error.status = 500;
        next(error);
    }
});


module.exports = router;