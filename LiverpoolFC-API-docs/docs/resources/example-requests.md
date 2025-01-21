---
sidebar_position: 1
---

# Example Requests
This page shows how to execute example API requests for five types of HTTP methods based on the Players resource.

## API Endpoints
Here are practical examples of how to interact with the Players API using curl.

### Retrieve All Players - GET `/players`

[🔗 Try in Swagger](http://localhost:8989/api-docs/#/Players/get_players)
```curl
curl -X GET http://localhost:8989/api/v1/players \
  -H "Content-Type: application/json"
```
- **Responses:**
   - `200 OK`: List of players.
   - `404 Not Found`: No players found.
   - `500 Internal Server Error`: Server error.

### Get Specific Player - GET `/players/{playerId}`
[🔗 Try in Swagger](http://localhost:8989/api-docs/#/Players/get_players__id_)
```curl
curl -X GET http://localhost:8989/api/v1/players/{playerId} \
  -H "Content-Type: application/json"
```
- **Parameters:**
   - `playerId`:  The unique identifier of the Player.

- **Responses:**
   - `200 OK`: Player found.
   - `404 Not Found`: Player not found.
   - `500 Internal Server Error`: Server error.

### Create New Player - POST `/players`
[🔗 Try in Swagger](http://localhost:8989/api-docs/#/Players/post_players)
```curl
curl -X POST http://localhost:8989/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{
    "name": {
      "first": "John",
      "last": "Smith",
      "displayName": "J. Smith"
    },
    "position": "FWD",
    "nationality": "England",
    "dateOfBirth": "2000-01-01",
    "height": 180,
    "weight": 75,
    "status": "ACTIVE",
    "jerseyNumber": 9,
    "currentContract": {contractId},
    "stats": {playerStatsId},
    "marketValue": {
      "value": 1000000,
      "currency": "EUR"
    }
  }'
```
- **Responses:**
   - `201 Created`: Player created.
   - `400 Bad Request`:  Validation error.
   - `409 Conflict`: Jersey number already taken.
   - `500 Internal Server Error`: Server error.

### Update Player - PUT/PATCH `/players/{playerId}`
[🔗 Try in Swagger (Complete Update)](http://localhost:8989/api-docs/#/Players/put_players__id_) 

[🔗 Try in Swagger (Partial Update)](http://localhost:8989/api-docs/#/Players/patch_players__id__)
```curl
# Complete update (PUT)
curl -X PUT http://localhost:8989/api/v1/players/{playerId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": {
      "first": "John",
      "last": "Smith",
      "displayName": "J. Smith"
    },
    "position": "FWD",
    "nationality": "England",
    "dateOfBirth": "2000-01-01",
    "height": 180,
    "weight": 75,
    "status": "ACTIVE",
    "jerseyNumber": 9,
    "currentContract": {contractId},
    "stats": {playerStatsId},
    "marketValue": {
      "value": 1000000,
      "currency": "EUR"
    }
  }'

# Partial update (PATCH)
curl -X PATCH http://localhost:8989/api/v1/players/{playerId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INJURED",
    "marketValue": {
      "value": 1500000,
      "currency": "EUR"
    }
  }'
```
- **Parameters:**
   - `playerId`:  The unique identifier of the Player.

- **Responses:**
   - `200 OK`: Player updated.
   - `400 Bad Request`:  Validation error.
   - `404 Not Found`: Player not found.
   - `409 Conflict`: Jersey number already taken.
   - `500 Internal Server Error`: Server error.


### Delete Player - DELETE `/players/{playerId}`
[🔗 Try in Swagger](http://localhost:8989/api-docs/#/Players/delete_players__id__)
```curl
curl -X DELETE http://localhost:8989/api/v1/players/{playerId} \
  -H "Content-Type: application/json"
```
- **Parameters:**
   - `playerId`:  The unique identifier of the Player.

- **Responses:**
   - `204 No Content`: Player deleted.
   - `404 Not Found`: Player not found.
   - `500 Internal Server Error`: Server error.


These examples can be run from any terminal. Remember to:

* Replace the ID fields with an actual IDs
* Adjust the base URL (http://localhost:8989) if your API is hosted elsewhere
* Ensure all required fields are included in POST and PUT requests

## Response Format

All API responses follow a consistent format with HATEOAS links:

```json
{
    "data": {
        // Resource data
    },
    "_links": {
        "self": "/api/v1/players/{id}",
        "collection": "/api/v1/players",
        "stats": "/api/v1/player-stats/{id}",
        "currentContract": "/api/v1/contracts/{id}"
    }
}
```
The response always includes:

* data - The main response payload
* _links - Navigation links to related resources

## Response Headers

Each response includes specific headers:

- `X-Total-Count` - For collection endpoints, shows total number of items
- `X-Resource-Type` - Set to "Player" for this resource
- `Last-Modified` - Timestamp of last modification
- `Location` - URL of newly created resource (only for POST requests)

## Next Steps

Learn more about:
- [How to fetch example data](/docs/resources/example-data.md)