
// Simulated response from another GIS provider

const mockLocations = {
    "colombo": {
        location: {
            latitude: 6.9271,
            longitude: 79.8612
        },
        formattedAddress: "Colombo, Sri Lanka"
    },

    "galle": {
        location: {
            latitude: 6.0535,
            longitude: 80.2210
        },
        formattedAddress: "Galle, Sri Lanka"
    },

    "kandy": {
        location: {
            latitude: 7.2906,
            longitude: 80.6337
        },
        formattedAddress: "Kandy, Sri Lanka"
    }
};


export async function mockVendorAdapter(address) {

    const startTime = performance.now();

    // Simulate processing delay
    await new Promise(resolve =>
        setTimeout(resolve, 500)
    );

    const city = address
        .split(",")[0]
        .trim()
        .toLowerCase();

    const data = mockLocations[city];

    const duration = performance.now() - startTime;

    if (!data) {

        throw {
            message: "Location not found in Mock Provider",
            status: null,
            responseTime: duration,
            provider: "Mock GIS Provider",
            method: "SIMULATED",
            rawResponse: null
        };
    }

    return {

        latitude: data.location.latitude,

        longitude: data.location.longitude,

        address: data.formattedAddress,

        provider: "Mock GIS Provider",

        status: null,

        responseTime: duration,

        method: "SIMULATED",

        cached: false,

        rawResponse: data
    };
}

