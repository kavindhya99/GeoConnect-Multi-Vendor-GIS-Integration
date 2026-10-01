require("dotenv").config();

const express = require("express");
const path = require("path");
const helmet = require("helmet");

const errorHandler =
    require("./middleware/errorHandler");

const geocodeRoutes =
    require("./routes/geocodeRoutes");

const historyRoutes =
    require("./routes/historyRoutes");

const logRoutes =
    require("./routes/logRoutes");


const app = express();

const PORT = process.env.PORT || 3000;


// ==================================
// Security Middleware
// ==================================

app.use(
    helmet({
        contentSecurityPolicy: false,
        referrerPolicy: {
            policy: "strict-origin-when-cross-origin"
        }
    })
);


// ==================================
// Request Body Middleware
// ==================================

app.use(express.json());


// ==================================
// API Routes
// ==================================

app.use("/api", geocodeRoutes);

app.use("/api", historyRoutes);

app.use("/api", logRoutes);


// ==================================
// Serve Frontend Static Files
// ==================================

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


// ==================================
// Unknown API Route Handler
// ==================================

app.use("/api", (req, res) => {

    return res.status(404).json({
        status: "error",
        message: "API endpoint not found"
    });

});


// ==================================
// Centralized Error Handler
// ==================================

app.use(errorHandler);


// ==================================
// Start Server
// ==================================

app.listen(PORT, () => {

    console.log(
        `GeoConnect Backend running at http://localhost:${PORT}`
    );

});