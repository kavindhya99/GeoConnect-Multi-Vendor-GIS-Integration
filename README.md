# GeoConnect – Multi-Vendor GIS Integration System

GeoConnect is a full-stack web application designed to demonstrate a scalable approach to integrating multiple geocoding service providers through a unified interface.

The application currently integrates **HERE Maps** and **OpenStreetMap Nominatim**, allowing users to search for locations using different geocoding providers while receiving a consistent response format.

GeoConnect also provides search history, API request monitoring, response-time tracking, error logging, caching, rate limiting, and secure environment-based API key management.

## Key Features

- Multi-vendor geocoding integration
- HERE Maps geocoding
- OpenStreetMap Nominatim geocoding
- Unified response format using the Adapter Pattern
- Interactive map visualization with Leaflet
- PostgreSQL-backed search history
- API request logging and monitoring
- Response-time tracking
- Successful and failed request tracking
- Nominatim response caching
- API rate limiting
- Input and provider validation
- Centralized error handling
- Secure API key management using environment variables
- HTTP security headers using Helmet
- Layered backend architecture

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Leaflet.js

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- `pg` PostgreSQL client for Node.js

### External APIs
- HERE Geocoding API
- OpenStreetMap Nominatim API

### Security & Reliability
- Helmet
- Express Rate Limit
- Environment variables with dotenv
- Input validation
- Centralized error handling
- External API timeout handling

### Architecture & Design
- Adapter Pattern for geocoding providers
- Repository Pattern for database access
- Express Router for modular API routes
- Middleware-based request processing
- Separation of concerns

## System Architecture

GeoConnect uses a layered backend architecture to separate routing, external API integration, database access, validation, security, and error handling.

```text
User
  │
  ▼
Frontend
HTML / CSS / JavaScript / Leaflet
  │
  ▼
Express REST API
  │
  ├── Security Middleware
  │     ├── Helmet
  │     └── Rate Limiting
  │
  ├── Validation Middleware
  │
  ▼
API Routes
  │
  ├── geocodeRoutes.js
  │       │
  │       ▼
  │   Geocoding Adapters
  │       ├── hereAdapter.js
  │       └── nominatimAdapter.js
  │             │
  │             ▼
  │       External Geocoding APIs
  │
  ├── historyRoutes.js
  │       │
  │       ▼
  │   historyRepository.js
  │
  └── logRoutes.js
          │
          ▼
      logRepository.js
          │
          ▼
      PostgreSQL

Errors
  │
  ▼
Centralized Error Handler

## API Endpoints

### Geocoding

#### Geocode an Address

```http
GET /api/geocode?address=Colombo&provider=here

## Database Design

GeoConnect uses PostgreSQL to persist geocoding search history and external API request monitoring data.

### Geocoding History

The `geocoding_history` table stores successful geocoding searches.

Important information includes:

- Original searched address
- Formatted address returned by the provider
- Latitude
- Longitude
- Geocoding provider
- Response time
- HTTP status
- Search timestamp

### API Request Logs

The `api_request_logs` table stores information about external geocoding API requests.

Tracked information includes:

- Provider
- Search address
- HTTP status
- Response time
- HTTP request method
- Request status (`SUCCESS` or `FAILED`)
- Error message
- Request timestamp

### Database Access

Database operations are implemented using the `pg` PostgreSQL client and parameterized SQL queries.

A PostgreSQL connection pool is used to manage database connections efficiently.

Database access is isolated inside repository modules instead of placing SQL directly inside API route handlers.

## Security and Reliability

GeoConnect includes several backend security and reliability mechanisms.

### Environment Variables

Sensitive configuration is stored in environment variables using `dotenv`.

Examples include:

- HERE API key
- PostgreSQL host
- PostgreSQL port
- Database name
- Database username
- Database password
- Application contact information

The real `.env` file is excluded from Git using `.gitignore`, while `.env.example` provides safe placeholder configuration.

### API Key Protection

The HERE API key is used only by the backend adapter.

The key is not exposed in frontend JavaScript, preventing users from directly accessing the credential through the browser source code.

### Input Validation

The geocoding endpoint validates:

- Address existence
- Address length
- Supported provider values

Invalid requests are rejected before an external geocoding provider is called.

### Rate Limiting

The geocoding endpoint uses `express-rate-limit` to limit the number of requests a client can make within a defined period.

This helps protect the API and external geocoding services from excessive requests.

### External API Timeout Handling

Requests to external geocoding providers use a timeout to prevent the application from waiting indefinitely for an upstream service.

### Nominatim Request Control

Nominatim requests are queued and spaced apart to avoid sending requests too rapidly to the external service.

### Caching

Nominatim results are cached in memory.

Repeated searches can be served from the cache without making another external API request.

### HTTP Security Headers

Helmet is used to add security-related HTTP headers to Express responses.

### Centralized Error Handling

Unhandled application errors are forwarded to a centralized Express error-handling middleware.

This provides a consistent error response structure and prevents internal implementation details from being exposed for unexpected server errors.

## Project Structure

```text
GeoConnect/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── geocodingService.js
│   ├── storage.js
│   ├── logService.js
│   └── adapters/
│       ├── nominatimAdapter.js
│       ├── hereAdapter.js
│       └── mockVendorAdapter.js
│
├── backend/
│   ├── server.js
│   │
│   ├── adapters/
│   │   ├── hereAdapter.js
│   │   └── nominatimAdapter.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── validateGeocode.js
│   │   └── geocodeRateLimiter.js
│   │
│   ├── repositories/
│   │   ├── historyRepository.js
│   │   └── logRepository.js
│   │
│   ├── routes/
│   │   ├── geocodeRoutes.js
│   │   ├── historyRoutes.js
│   │   └── logRoutes.js
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md

## Getting Started

### Prerequisites

Before running GeoConnect, install:

- Node.js
- PostgreSQL
- npm
- A HERE API key

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd GeoConnect
```

### 2. Install Backend Dependencies

Navigate to the backend directory:

```bash
cd backend
```

Install the required packages:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

You can use `.env.example` as the template:

```env
HERE_API_KEY=your_here_api_key_here

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

APP_CONTACT=your_contact_email_here
```

Do not commit the real `.env` file to source control.

### 4. Configure PostgreSQL

Create a PostgreSQL database for GeoConnect and configure the database credentials in the `.env` file.

Run the provided database schema:

```text
backend/database/schema.sql
```

The schema creates the required tables:

- `geocoding_history` — stores successful geocoding searches
- `api_request_logs` — stores external API request monitoring data

For example, using PostgreSQL:

```bash
psql -U your_database_user -d your_database_name -f database/schema.sql
```

### 5. Start the Application

From the `backend` directory, run:

```bash
node server.js
```

The application will be available at:

```text
http://localhost:3000/
```

### 6. Test Geocoding

From the user interface:

1. Select a geocoding provider.
2. Enter an address.
3. Perform the search.
4. View the location on the map.
5. Review the coordinates and API response information.
6. Review search history and API request monitoring data.

## Design Highlights

### Vendor Independence

GeoConnect avoids coupling the application directly to one geocoding provider. Vendor-specific logic is encapsulated inside adapters, while the application works with a normalized response structure.

This makes the architecture easier to extend with additional providers.

### Separation of Concerns

The backend separates responsibilities across:

- Routes for HTTP endpoint handling
- Adapters for external API integration
- Repositories for database access
- Middleware for validation, rate limiting, and error handling
- Configuration modules for shared infrastructure such as PostgreSQL

### External API Observability

GeoConnect records information about external API requests, including response time, HTTP status, provider, request status, and errors.

This makes it possible to monitor the behavior of different geocoding providers.

### Reliability

The application includes:

- External API timeouts
- Request validation
- Rate limiting
- Nominatim request spacing
- In-memory caching
- Centralized error handling

### Extensibility

The adapter-based design allows additional geocoding providers to be introduced without redesigning the entire application.

For example, a new provider can be implemented by:

1. Creating a new provider adapter.
2. Converting the provider response into the common GeoConnect response format.
3. Registering the provider in the geocoding flow.
4. Adding the provider to request validation and the frontend provider selection.