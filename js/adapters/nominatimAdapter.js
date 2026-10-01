
export async function nominatimAdapter(address) {

    // Call our own Express backend
    const url = new URL(
        "/api/geocode",
        window.location.origin
    );

    url.searchParams.set("address", address);

    const startTime = performance.now();

    let response;

    try {

        // Send request to Express
        response = await fetch(url);

        // Parse backend JSON response
        const data = await response.json();

        const duration = performance.now() - startTime;

        // Handle unsuccessful backend response
        if (!response.ok) {

            throw {
                message: data.message || "Geocoding failed",

                status: response.status,

                responseTime: duration,

                provider: "Nominatim",

                method: "GET",

                rawResponse: data
            };
        }

        // Convert backend response to frontend format
        return {

            latitude: data.latitude,

            longitude: data.longitude,

            address: data.address,

            provider: data.provider,

            status: response.status,

            upstreamStatus: data.upstreamStatus,

            responseTime: duration,

            method: "GET",

            cached: data.cached,

            rawResponse: data
        };

    } catch (error) {

        // Preserve structured API errors
        if (error.status !== undefined) {
            throw error;
        }

        throw {

            message: error.message || "Backend connection failed",

            status: response ? response.status : null,

            responseTime: performance.now() - startTime,

            provider: "Nominatim",

            method: "GET",

            rawResponse: null
        };

    }
}
