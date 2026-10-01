
const HERE_GEOCODING_URL =
    "https://geocode.search.hereapi.com/v1/geocode";

async function hereAdapter(address) {

    // 1. Read API key from environment variables
    const apiKey = process.env.HERE_API_KEY;

    if (!apiKey) {
        const error = new Error("HERE API key is not configured");
        error.status = 503;
        throw error;
    }

    // 2. Build HERE API URL
    const url = new URL(HERE_GEOCODING_URL);

    url.searchParams.set("q", address);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("limit", "1");

    // 3. Start response-time measurement
    const startTime = performance.now();

    try {

        // 4. Call HERE API
        const response = await fetch(url, {

            headers: {
                "Accept": "application/json"
            },

            signal: AbortSignal.timeout(10000)

        });

        // 5. Check HTTP response
        if (!response.ok) {

            const error = new Error(
                `HERE API returned HTTP ${response.status}`
            );

            error.status = 502;
            error.upstreamStatus = response.status;

            throw error;
        }

        // 6. Parse JSON response
        const data = await response.json();

        const responseTime =
            performance.now() - startTime;

        // 7. Check whether HERE found a location
        if (
            !Array.isArray(data.items) ||
            data.items.length === 0
        ) {

            const error = new Error("Location not found");

            error.status = 404;
            error.upstreamStatus = response.status;
            error.responseTime = responseTime;

            throw error;
        }

        // 8. Extract first matching location
        const location = data.items[0];

        // 9. Normalize HERE response
        return {

            status: "success",

            latitude: location.position.lat,

            longitude: location.position.lng,

            address: location.address.label,

            provider: "HERE Maps",

            upstreamStatus: response.status,

            responseTime: responseTime,

            method: "GET",

            cached: false

        };

    } catch (error) {

        // Preserve known API errors
        if (error.status) {
            throw error;
        }

        // Handle timeout and connection errors
        const isTimeout = error.name === "TimeoutError";

        const apiError = new Error(
            isTimeout
                ? "HERE API request timed out"
                : "HERE API connection failed"
        );

        apiError.status = isTimeout ? 504 : 502;

        throw apiError;
    }
}

module.exports = { hereAdapter };
