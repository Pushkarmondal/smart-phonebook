# API Documentation

## Base URL
`https://api.smartphonebook.com/v1`

## Authentication
All endpoints (except `/auth/*`) require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate token

### Contacts
- `GET /contacts` - List all contacts (paginated)
- `POST /contacts` - Create new contact
- `GET /contacts/:id` - Get contact details
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact
- `GET /contacts/search?q=` - Search contacts

### Relationships
- `POST /relationships` - Create relationship
- `GET /relationships` - List all relationships
- `GET /relationships/:id` - Get relationship details
- `PUT /relationships/:id` - Update relationship
- `DELETE /relationships/:id` - Remove relationship

### Businesses
- `GET /businesses` - List businesses
- `POST /businesses` - Add new business
- `GET /businesses/:id` - Get business details
- `GET /businesses/search?q=` - Search businesses
- `GET /businesses/:id/employees` - List employees

### AI Queries
- `POST /ai/query` - Process natural language query

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## Error Handling

Error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per user
