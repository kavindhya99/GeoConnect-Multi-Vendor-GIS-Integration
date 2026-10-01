
export async function hereAdapter(address) {

    // Build our Express API URL
    const url = new URL(
        "/api/geocode",
        window.location.origin
    );

    url.searchParams.set("address", address);

    url.searchParams.set("provider", "here");

    const startTime = performance.now();

    let response;

    try {

        // Call Express backend
        response = await fetch(url);

        // Parse JSON response
        const data = await response.json();

        const responseTime =
            performance.now() - startTime;

        // Handle backend errors
        if (!response.ok) {

            throw {

                message: data.message || "HERE geocoding failed",

                status: response.status,

                responseTime: responseTime,

                provider: "HERE Maps",

                method: "GET",

                rawResponse: data

            };

        }

        // Return standardized result
        return {

            latitude: data.latitude,

            longitude: data.longitude,

            address: data.address,

            provider: data.provider,

            status: response.status,

            upstreamStatus: data.upstreamStatus,

            responseTime: responseTime,

            method: "GET",

            cached: data.cached,

            rawResponse: data

        };

    } catch (error) {

        // Preserve structured errors
        if (error.status !== undefined) {
            throw error;
        }

        throw {

            message: error.message || "Backend connection failed",

            status: response ? response.status : null,

            responseTime:
                performance.now() - startTime,

            provider: "HERE Maps",

            method: "GET",

            rawResponse: null

        };

    }

}
