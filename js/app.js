
import {
    getHistory,
    getHistoryById,
    deleteHistory,
    clearHistory
} from "./storage.js";

import { geocode } from "./geocodingService.js";

import {getApiLogs, clearApiLogs} from "./logService.js";

console.log("GeoConnect Application Started");


// ==================================
// 1. Initialize Leaflet Map
// ==================================

const map = L.map("map").setView([7.8731, 80.7718], 8);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = L.marker([6.9271, 79.8612]).addTo(map);

marker.bindPopup("Colombo, Sri Lanka");


// ==================================
// 2. Access HTML Elements
// ==================================

const addressInput = document.getElementById("address");
const providerSelect = document.getElementById("provider");
const searchBtn = document.getElementById("searchBtn");

const latitudeText = document.getElementById("latitude");
const longitudeText = document.getElementById("longitude");

const apiResponse = document.getElementById("apiResponse");

// Monitoring elements
const httpStatus = document.getElementById("httpStatus");
const responseTime = document.getElementById("responseTime");
const providerName = document.getElementById("providerName");
const requestMethod = document.getElementById("requestMethod");

// History elements
const historyBody = document.getElementById("historyBody");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// API Monitoring Summary Elements

const totalRequests = document.getElementById("totalRequests");

const successfulRequests = document.getElementById("successfulRequests");

const failedRequests = document.getElementById("failedRequests");

const averageResponseTime = document.getElementById("averageResponseTime");

const apiLogsBody = document.getElementById("apiLogsBody");

const clearLogsBtn = document.getElementById("clearLogsBtn");


// ==================================
// 3. Update Monitoring Dashboard
// ==================================

function updateMonitoring(result) {

    httpStatus.textContent =
        result.status === null || result.status === undefined
            ? "N/A"
            : result.status;

    httpStatus.className =
        result.status === null || result.status === undefined
            ? ""
            : result.status >= 200 && result.status < 300
                ? "success"
                : "error";

    responseTime.textContent =
        typeof result.responseTime === "number"
            ? `${result.responseTime.toFixed(2)} ms` +
              (result.cached ? " (cached)" : "")
            : "-";

    providerName.textContent = result.provider || "-";

    requestMethod.textContent = result.method || "-";
}

// ==================================
// Update API Monitoring Summary
// ==================================

async function updateApiMonitoringSummary() {

    try {

        // Get API logs from PostgreSQL
        const logs = await getApiLogs();

        // Total number of API requests
        const total = logs.length;

        // Successful requests
        const successful = logs.filter(
            log => log.request_status === "SUCCESS"
        ).length;

        // Failed requests
        const failed = logs.filter(
            log => log.request_status === "FAILED"
        ).length;

        // Get only logs that contain a response time
        const logsWithResponseTime = logs.filter(
            log =>
                log.response_time_ms !== null &&
                !isNaN(Number(log.response_time_ms))
        );

        // Calculate total response time
        const totalResponseTime =
            logsWithResponseTime.reduce(
                (sum, log) =>
                    sum + Number(log.response_time_ms),
                0
            );

        // Calculate average
        const average =
            logsWithResponseTime.length > 0
                ? totalResponseTime /
                  logsWithResponseTime.length
                : 0;

        // Update dashboard
        totalRequests.textContent = total;

        successfulRequests.textContent = successful;

        failedRequests.textContent = failed;

        averageResponseTime.textContent =
            `${average.toFixed(2)} ms`;

    } catch (error) {

        console.error(
            "Monitoring Summary Error:",
            error
        );

        totalRequests.textContent = "-";
        successfulRequests.textContent = "-";
        failedRequests.textContent = "-";
        averageResponseTime.textContent = "-";

    }

}

// ==================================
// Display API Request Logs
// ==================================

async function displayApiLogs() {

    apiLogsBody.innerHTML = "";

    try {

        const logs = await getApiLogs();

        // No logs available
        if (logs.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 8;
            cell.textContent = "No API request logs available";

            row.appendChild(cell);
            apiLogsBody.appendChild(row);

            return;
        }

        logs.forEach(log => {

            const row = document.createElement("tr");

            const providerCell = document.createElement("td");
            providerCell.textContent =
                log.provider || "-";

            const addressCell = document.createElement("td");
            addressCell.textContent =
                log.search_address || "-";

            const statusCell = document.createElement("td");
            statusCell.textContent =
                log.http_status ?? "-";

            const responseTimeCell =
                document.createElement("td");

            responseTimeCell.textContent =
                log.response_time_ms !== null
                    ? `${Number(
                        log.response_time_ms
                    ).toFixed(2)} ms`
                    : "-";

            const methodCell = document.createElement("td");
            methodCell.textContent =
                log.request_method || "-";

            const resultCell = document.createElement("td");
            resultCell.textContent =
                log.request_status || "-";

            const errorCell = document.createElement("td");
            errorCell.textContent =
                log.error_message || "-";

            const timeCell = document.createElement("td");

            timeCell.textContent =
                log.created_at
                    ? new Date(
                        log.created_at
                    ).toLocaleString()
                    : "-";

            row.appendChild(providerCell);
            row.appendChild(addressCell);
            row.appendChild(statusCell);
            row.appendChild(responseTimeCell);
            row.appendChild(methodCell);
            row.appendChild(resultCell);
            row.appendChild(errorCell);
            row.appendChild(timeCell);

            apiLogsBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "API Logs Display Error:",
            error
        );

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 8;
        cell.textContent =
            "Failed to load API request logs";

        row.appendChild(cell);
        apiLogsBody.appendChild(row);

    }

}

// ==================================
// 4. Update Leaflet Map
// ==================================

function updateMap(latitude, longitude, address) {

    map.setView([latitude, longitude], 13);

    // Remove previous marker
    if (marker) {
        map.removeLayer(marker);
    }

    // Add new marker
    marker = L.marker([
        latitude,
        longitude
    ]).addTo(map);

    marker.bindPopup(address).openPopup();

}


// ==================================
// 5. Search Location
// ==================================

async function searchLocation() {

    const address = addressInput.value.trim();
    const provider = providerSelect.value;

    if (address === "") {
        alert("Please enter an address");
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    try {

        // Call selected geocoding provider
        const result = await geocode(address, provider);

        console.log("GeoConnect API Result:", result);

        // Update coordinates
        latitudeText.textContent = result.latitude;
        longitudeText.textContent = result.longitude;

        // Update monitoring dashboard
        updateMonitoring(result);

        // Display API response
        apiResponse.textContent = JSON.stringify(
            result.rawResponse ?? result,
            null,
            2
        );

        // Update Leaflet map
        updateMap(
            result.latitude,
            result.longitude,
            result.address
        );

        // Nominatim and HERE searches are automatically
        // saved into PostgreSQL by Express.
        // Mock Vendor remains a frontend simulation.

        // Refresh database-backed history separately.
        // A history loading error should not erase
        // successful geocoding results.
        await displayHistory();
        await updateApiMonitoringSummary();
        await displayApiLogs();

        console.log("Geocoding successful:", result);

    } catch (error) {

        console.error("Geocoding Error:", error);

        // Update monitoring cards
        updateMonitoring(error);

        // Clear coordinates
        latitudeText.textContent = "-";
        longitudeText.textContent = "-";

        // Display error response
        apiResponse.textContent = JSON.stringify({

            error: error.message || "Unexpected error",

            rawResponse: error.rawResponse ?? null

        }, null, 2);

        // Refresh monitoring after failed request
        await updateApiMonitoringSummary();

        await displayApiLogs();

    } finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search Location";

    }

}


// ==================================
// 6. Display PostgreSQL Search History
// ==================================

async function displayHistory() {

    historyBody.innerHTML = "";

    let history;

    try {

        history = await getHistory();

    } catch (error) {

        console.error("History Retrieval Error:", error);

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent =
            error.message || "Failed to load history";

        row.appendChild(cell);
        historyBody.appendChild(row);

        return;
    }

    // Empty history
    if (history.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No search history available";

        row.appendChild(cell);
        historyBody.appendChild(row);

        return;
    }

    // Display records
    history.forEach(record => {

        const row = document.createElement("tr");

        const addressCell = document.createElement("td");
        addressCell.textContent = record.formatted_address;

        const providerCell = document.createElement("td");
        providerCell.textContent = record.provider;

        const latitudeCell = document.createElement("td");
        latitudeCell.textContent = record.latitude;

        const longitudeCell = document.createElement("td");
        longitudeCell.textContent = record.longitude;

        const actionCell = document.createElement("td");


        // ==================================
        // View Button
        // ==================================

        const viewButton = document.createElement("button");

        viewButton.textContent = "View";
        viewButton.className = "view-btn";

        viewButton.addEventListener("click", async () => {

            try {

                const selectedRecord =
                    await getHistoryById(record.id);

                // Update map
                updateMap(
                    selectedRecord.latitude,
                    selectedRecord.longitude,
                    selectedRecord.formatted_address
                );

                // Update coordinates
                latitudeText.textContent =
                    selectedRecord.latitude;

                longitudeText.textContent =
                    selectedRecord.longitude;

                // Update monitoring
                httpStatus.textContent = "N/A (History)";
                httpStatus.className = "";

                responseTime.textContent = "N/A";

                providerName.textContent =
                    selectedRecord.provider;

                requestMethod.textContent = "LOCAL";

                // Display database record
                apiResponse.textContent = JSON.stringify(
                    selectedRecord,
                    null,
                    2
                );

            } catch (error) {

                console.error("View History Error:", error);

                alert(error.message || "Failed to view history");

            }

        });


        // ==================================
        // Delete Button
        // ==================================

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", async () => {

            if (!confirm("Delete this history record?")) {
                return;
            }

            try {

                await deleteHistory(record.id);

                await displayHistory();

            } catch (error) {

                console.error("Delete History Error:", error);

                alert(error.message || "Failed to delete history");

            }

        });


        // Add buttons
        actionCell.appendChild(viewButton);
        actionCell.appendChild(deleteButton);

        // Add cells
        row.appendChild(addressCell);
        row.appendChild(providerCell);
        row.appendChild(latitudeCell);
        row.appendChild(longitudeCell);
        row.appendChild(actionCell);

        historyBody.appendChild(row);

    });

}


// ==================================
// 7. Event Listeners
// ==================================

searchBtn.addEventListener("click", searchLocation);

clearLogsBtn.addEventListener("click", async () => {

    if (!confirm("Are you sure you want to clear all API request logs?")) {
        return;
    }

    try {

        await clearApiLogs();

        // Refresh monitoring dashboard
        await updateApiMonitoringSummary();

        // Refresh API logs table
        await displayApiLogs();

    } catch (error) {

        console.error(
            "Clear API Logs Error:",
            error
        );

        alert(
            error.message ||
            "Failed to clear API request logs"
        );

    }

});


// ==================================
// 8. Clear All History
// ==================================

clearHistoryBtn.addEventListener("click", async () => {

    if (!confirm("Are you sure you want to clear all search history?")) {
        return;
    }

    try {

        await clearHistory();

        await displayHistory();

    } catch (error) {

        console.error("Clear History Error:", error);

        alert(error.message || "Failed to clear history");

    }

});


// ==================================
// 9. Load History on Application Startup
// ==================================

displayHistory();
updateApiMonitoringSummary();
displayApiLogs();
