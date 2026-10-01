
// ==================================
// GeoConnect History API Service
// ==================================

const HISTORY_API = "/api/history";


// Retrieve history from PostgreSQL
export async function getHistory() {

    const response = await fetch(HISTORY_API);

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message || "Failed to retrieve history"
        );

    }

    return result.data;
}


// Retrieve one history record
export async function getHistoryById(id) {

    const response = await fetch(
        `${HISTORY_API}/${encodeURIComponent(id)}`
    );

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message || "Failed to retrieve record"
        );

    }

    return result.data;
}


// Delete one history record
export async function deleteHistory(id) {

    const response = await fetch(
        `${HISTORY_API}/${encodeURIComponent(id)}`,
        {
            method: "DELETE"
        }
    );

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message || "Failed to delete record"
        );

    }

    return result;
}


// Clear all search history
export async function clearHistory() {

    const response = await fetch(HISTORY_API, {

        method: "DELETE"

    });

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message || "Failed to clear history"
        );

    }

    return result;
}
