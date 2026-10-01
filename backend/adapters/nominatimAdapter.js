const NOMINATIM_URL =
    "https://nominatim.openstreetmap.org/search";

const APP_CONTACT = process.env.APP_CONTACT;

const cache = new Map();

let lastRequestTime = 0;

let requestQueue = Promise.resolve();

function scheduleNominatimRequest(task) {
    const next = requestQueue
        .catch(() => {})
        .then(async () => {
            const elapsed = Date.now() - lastRequestTime;

            if (elapsed < 1100) {
                await new Promise(resolve =>
                    setTimeout(resolve, 1100 - elapsed)
                );
            }

            lastRequestTime = Date.now();

            return task();
        });

    requestQueue = next.catch(() => {});

    return next;
}

async function nominatimAdapter(address) {
    const cacheKey = address.toLowerCase();

    // Return cached result if available
    if (cache.has(cacheKey)) {
        return {
            ...cache.get(cacheKey),
            cached: true
        };
    }

    // Build Nominatim request URL
    const url = new URL(NOMINATIM_URL);

    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "lk");

    // Send request through our request queue
    const result = await scheduleNominatimRequest(async () => {
        const startTime = performance.now();

        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    `GeoConnectLearning/1.0 (${APP_CONTACT})`,
                "Accept": "application/json"
            },
            signal: AbortSignal.timeout(10000)
        });

        const responseTime =
            performance.now() - startTime;

        if (!response.ok) {
            const error = new Error(
                `Nominatim returned HTTP ${response.status}`
            );

            error.upstreamStatus = response.status;
            error.responseTime = responseTime;

            throw error;
        }

        const data = await response.json();

        return {
            data,
            responseTime,
            upstreamStatus: response.status
        };
    });

    // No matching location
    if (
        !Array.isArray(result.data) ||
        result.data.length === 0
    ) {
        const error = new Error("Location not found");

        error.status = 404;
        error.upstreamStatus = result.upstreamStatus;
        error.responseTime = result.responseTime;

        throw error;
    }

    const location = result.data[0];

    // Normalize Nominatim response
    const normalizedResult = {
        status: "success",
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        address: location.display_name,
        provider: "Nominatim",
        upstreamStatus: result.upstreamStatus,
        responseTime: result.responseTime,
        method: "GET",
        cached: false
    };

    cache.set(cacheKey, normalizedResult);

    return normalizedResult;
}


module.exports = {
    nominatimAdapter
};