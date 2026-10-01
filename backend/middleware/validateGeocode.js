// ==================================
// Geocoding Request Validation
// ==================================

function validateGeocode(req, res, next) {

    const address = req.query.address;

    const provider =
        req.query.provider || "nominatim";


    // ==================================
    // Validate Address
    // ==================================

    if (
        typeof address !== "string" ||
        !address.trim() ||
        address.trim().length > 300
    ) {

        return res.status(400).json({

            status: "error",

            message:
                "Please provide a valid address (max 300 characters)"

        });

    }


    // ==================================
    // Validate Provider
    // ==================================

    if (
        typeof provider !== "string" ||
        !["nominatim", "here"].includes(
            provider.toLowerCase()
        )
    ) {

        return res.status(400).json({

            status: "error",

            message: "Invalid geocoding provider"

        });

    }


    // ==================================
    // Store Clean Values
    // ==================================

    req.geocode = {

        address: address.trim(),

        provider: provider.toLowerCase()

    };


    // Continue to /api/geocode
    next();

}


module.exports = validateGeocode;