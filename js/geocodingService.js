
import { nominatimAdapter }
    from "./adapters/nominatimAdapter.js";

import { hereAdapter }
    from "./adapters/hereAdapter.js";

import { mockVendorAdapter }
    from "./adapters/mockVendorAdapter.js";


// Provider Registry
const providers = {

    nominatim: nominatimAdapter,

    here: hereAdapter,

    mock: mockVendorAdapter

};


// Common Geocoding Service
export async function geocode(address, provider) {

    const selectedProvider = providers[provider];

    if (!selectedProvider) {

        throw new Error("Invalid geocoding provider");

    }

    return await selectedProvider(address);

}
