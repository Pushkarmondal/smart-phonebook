# Smart Phonebook API Documentation

## Base URL
`http://localhost:3009/api`

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
- `GET /contact/get-all` - List all contacts
- `POST /contact/create` - Create new contact
- `GET /contact/get-by-id/:id` - Get contact details
- `PUT /contact/update/:id` - Update contact
- `DELETE /contact/delete/:id` - Delete contact
- `GET /contact/search?q=` - Search contacts

### Relationships
- `POST /relationship/create` - Create relationship
- `GET /relationship/get-all` - List all relationships
- `GET /relationship/get-by-id/:id` - Get relationship details
- `PUT /relationship/update/:id` - Update relationship
- `DELETE /relationship/delete/:id` - Remove relationship

### Interactions
- `POST /interaction/create` - Create interaction record
- `GET /interaction/get-all` - List all interactions
- `GET /interaction/get-by-id/:id` - Get interaction details
- `GET /interaction/contact/:contactId` - Get interactions for a specific contact

### Contact Roles
- `POST /contact-role/create` - Assign role to contact
- `GET /contact-role/contact/:contactId` - Get roles for a contact
- `DELETE /contact-role/delete/:id` - Remove role from contact

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
