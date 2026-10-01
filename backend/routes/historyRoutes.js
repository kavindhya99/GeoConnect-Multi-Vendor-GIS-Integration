const express = require("express");

const {
    getAllHistory,
    getHistoryById,
    deleteHistoryById,
    clearAllHistory
} = require("../repositories/historyRepository");

const router = express.Router();


// ==================================
// GET /history
// Retrieve Search History
// ==================================

router.get("/history", async (req, res, next) => {

    try {

        const records = await getAllHistory();

        return res.status(200).json({
            status: "success",
            count: records.length,
            data: records
        });

    } catch (error) {

        console.error(
            "History Retrieval Error:",
            error.message
        );

        error.status = 500;
        next(error);
    }
});


// ==================================
// GET /history/:id
// Retrieve One History Record
// ==================================

router.get("/history/:id", async (req, res, next) => {

    const id = req.params.id;

    if (!/^[1-9]\d*$/.test(id)) {

        return res.status(400).json({
            status: "error",
            message: "Invalid history ID"
        });
    }

    try {

        const record = await getHistoryById(id);

        if (!record) {

            return res.status(404).json({
                status: "error",
                message: "History record not found"
            });
        }

        return res.status(200).json({
            status: "success",
            data: record
        });

    } catch (error) {

        console.error(
            "History Lookup Error:",
            error.message
        );

        error.status = 500;
        next(error);
    }
});


// ==================================
// DELETE /history/:id
// Delete One History Record
// ==================================

router.delete("/history/:id", async (req, res, next) => {

    const id = req.params.id;

    if (!/^[1-9]\d*$/.test(id)) {

        return res.status(400).json({
            status: "error",
            message: "Invalid history ID"
        });
    }

    try {

        const deleted = await deleteHistoryById(id);

        if (!deleted) {

            return res.status(404).json({
                status: "error",
                message: "History record not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "History record deleted successfully"
        });

    } catch (error) {

        console.error(
            "History Delete Error:",
            error.message
        );

        error.status = 500;
        next(error);
    }
});


// ==================================
// DELETE /history
// Clear All Search History
// ==================================

router.delete("/history", async (req, res, next) => {

    try {

        const deletedCount = await clearAllHistory();

        return res.status(200).json({
            status: "success",
            message: "Search history cleared successfully",
            deletedCount: deletedCount
        });

    } catch (error) {

        console.error(
            "Clear History Error:",
            error.message
        );

        error.status = 500;
        next(error);
    }
});


module.exports = router;