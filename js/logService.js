// ==================================
// GeoConnect API Log Service
// ==================================

// Retrieve all API request logs
export async function getApiLogs() {

    const response = await fetch("/api/logs");

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message || "Failed to retrieve API logs"
        );

    }

    return result.data;
}


// Clear all API request logs
export async function clearApiLogs() {

    const response = await fetch("/api/logs", {
        method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message || "Failed to clear API logs"
        );

    }

    return result;
}