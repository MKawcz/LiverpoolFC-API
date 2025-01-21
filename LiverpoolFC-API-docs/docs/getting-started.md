---
sidebar_position: 2
---

# Getting Started

This guide will help you prepare environment, make your first request to the Liverpool FC API and understand its basic concepts.

## Pre-requirements
* Ensure you have supported Node.js version installed on your system

## Installation

1. Go ahead and clone git repository using:

```
git clone https://github.com/MKawcz/LiverpoolFC-API.git
```


2. Move to the REST API directory:

```
cd rest
```

3. Install required dependencies:

```
npm install
```

4. Start the server:

```
node index.js
```

## Base URL

All API requests should be made to:
```http
http://localhost:8989/api/v1
```

## Making Your First Request

Let's make a simple request to get all players:

```curl
curl http://localhost:8989/api/v1/players
```

The response will look like this:
```
{
  "data": {
    // Resource data
  },
  "_links": {
    "self": "/api/v1/resource/id",
    "collection": "/api/v1/resource"
    // Other related resources
  }
}
```

## Understanding the Response Format

All API responses follow a consistent format:

* Data Envelope: The main response data is always contained within a data property
* HATEOAS Links: Each response includes a _links object with related resources
* Metadata: Headers provide additional information

## Common Headers

| Header                 | Description                                            |
|------------------------|--------------------------------------------------------|
| Content-Type           | Always set to 'application/json' for our API responses |
| X-Content-Type-Options | Set to 'nosniff' to prevent MIME type sniffing         |
| X-Request-ID           | Unique request identifier                              |
| X-Response-Time        | Time when the response was generated                   |
| X-Resource-Type        | Type of resource being accessed                        |
| X-Total-Count          | Total number of items in a collection                  |
| X-Deleted-At           | UTC timestamp when a resource was deleted              |
| Last-Modified          | UTC timestamp when the resource was last modified      |
| Location               | URL of newly created resource                          |


## Response Codes
* 200 OK - Request succeeded
* 201 Created - Resource created
* 204 No Content - Success with no content to return
* 400 Bad Request - Validation error
* 404 Not Found - Resource not found
* 409 Conflict - Resource conflict (e.g., duplicate unique fields)
* 500 Internal Server Error - Server error

## Error Handling

When an error occurs, the API returns a consistent error format:

```json
{
    "error": "Error Type",
    "message": "Detailed error message",
    "_links": {
        "collection": "/api/v1/resource"
    }
}
```

## Available Resources

The API provides endpoints for managing:

| Resource     | Description               | Endpoint      |
|--------------|---------------------------|---------------|
| Players      | Player information        | /players      |
| PlayerStats  | Player Statistics         | /player-stats |
| Matches      | Match details and results | /matches      |
| Seasons      | Season information        | /seasons      |
| Competitions | Competition details       | /competitions |
| Contracts    | Player contracts          | /contracts    |
| Stadiums     | Stadium information       | /stadiums     |
| Managers     | Manager details           | /managers     |
| Trophies     | Trophy information        | /trophies     |

## Next Steps

1. Explore the API reference documentation for detailed information [here](/docs/resources/example-requests.md)
2. Try out the interactive Swagger documentation [here](http://localhost:8989/api-docs)