
const pool = require("../config/db");

// ==================================
// Save Successful Geocoding Search
// ==================================

async function saveGeocodingHistory(searchedAddress, result) {

    const query = `

        INSERT INTO geocoding_history (

            searched_address,
            formatted_address,
            latitude,
            longitude,
            provider,
            response_time,
            http_status

        )

        VALUES ($1, $2, $3, $4, $5, $6, $7)

        RETURNING id, searched_at

    `;

    const values = [

        searchedAddress,

        result.address,

        result.latitude,

        result.longitude,

        result.provider,

        result.responseTime ?? null,

        result.upstreamStatus ?? 200

    ];

    const dbResult = await pool.query(query, values);

    return dbResult.rows[0];

}


// ==================================
// Retrieve Search History
// ==================================

async function getAllHistory() {

    const result = await pool.query(`

        SELECT
            id,
            searched_address,
            formatted_address,
            latitude,
            longitude,
            provider,
            response_time,
            http_status,
            searched_at

        FROM geocoding_history

        ORDER BY searched_at DESC, id DESC

        LIMIT 20

    `);

    return result.rows;
}


// ==================================
// Retrieve One History Record
// ==================================

async function getHistoryById(id) {

    const result = await pool.query(`

        SELECT *
        FROM geocoding_history
        WHERE id = $1

    `, [id]);

    return result.rows[0] || null;
}


// ==================================
// Delete One History Record
// ==================================

async function deleteHistoryById(id) {

    const result = await pool.query(`

        DELETE FROM geocoding_history
        WHERE id = $1
        RETURNING id

    `, [id]);

    return result.rowCount > 0;
}


// ==================================
// Clear All History
// ==================================

async function clearAllHistory() {

    const result = await pool.query(`

        DELETE FROM geocoding_history

    `);

    return result.rowCount;
}



module.exports = {

    saveGeocodingHistory,

    getAllHistory,

    getHistoryById,

    deleteHistoryById,

    clearAllHistory

};

