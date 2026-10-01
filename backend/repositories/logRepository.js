const pool = require("../config/db");

// ==================================
// Save API Request Log
// ==================================

async function saveApiRequestLog(log) {

    const {
        provider,
        searchAddress,
        httpStatus,
        responseTime,
        requestMethod,
        requestStatus,
        errorMessage
    } = log;

    const query = `
        INSERT INTO api_request_logs (
            provider,
            search_address,
            http_status,
            response_time_ms,
            request_method,
            request_status,
            error_message
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const values = [
        provider,
        searchAddress,
        httpStatus ?? null,
        responseTime ?? null,
        requestMethod || "GET",
        requestStatus,
        errorMessage ?? null
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}


// ==================================
// Get All API Request Logs
// ==================================

async function getAllApiRequestLogs() {

    const query = `
        SELECT *
        FROM api_request_logs
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
}


// ==================================
// Clear API Request Logs
// ==================================

async function clearApiRequestLogs() {

    const query = `
        DELETE FROM api_request_logs;
    `;

    await pool.query(query);
}


module.exports = {
    saveApiRequestLog,
    getAllApiRequestLogs,
    clearApiRequestLogs
};