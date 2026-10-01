-- ==========================================
-- GeoConnect Database Schema
-- PostgreSQL
-- ==========================================


-- ==========================================
-- Geocoding Search History
-- ==========================================

CREATE TABLE geocoding_history (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    searched_address VARCHAR(300) NOT NULL,

    formatted_address TEXT NOT NULL,

    latitude DOUBLE PRECISION NOT NULL,

    longitude DOUBLE PRECISION NOT NULL,

    provider VARCHAR(50) NOT NULL,

    response_time DOUBLE PRECISION,

    http_status INTEGER,

    searched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_latitude
        CHECK (latitude BETWEEN -90 AND 90),

    CONSTRAINT chk_longitude
        CHECK (longitude BETWEEN -180 AND 180)

);


-- ==========================================
-- External API Request Logs
-- ==========================================

CREATE TABLE api_request_logs (

    id SERIAL PRIMARY KEY,

    provider VARCHAR(50) NOT NULL,

    search_address VARCHAR(255) NOT NULL,

    http_status INTEGER,

    response_time_ms NUMERIC(10, 2),

    request_method VARCHAR(10) DEFAULT 'GET',

    request_status VARCHAR(20) NOT NULL,

    error_message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);