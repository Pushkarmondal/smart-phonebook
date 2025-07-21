# Smart Phonebook API - Postman Collection

This document provides request examples for testing the Smart Phonebook API using Postman.

## Authentication

### 1. Sign Up

```http
POST http://localhost:3009/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### 2. Login

```http
POST http://localhost:3009/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

## Contacts

### 1. Create Contact

```http
POST http://localhost:3009/api/contact/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Jane Smith",
  "type": "PERSONAL",
  "phone": "+1234567890",
  "email": "jane@example.com",
  "location": "New York, USA",
  "tags": ["friend", "college"],
  "addedById": "user-id-here"
}
```

### 2. Get All Contacts

```http
GET http://localhost:3009/api/contact/get-all
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Search Contacts

```http
GET http://localhost:3009/api/contact/search?q=Jane
Authorization: Bearer YOUR_JWT_TOKEN
```

## Global Entities

### 1. Create Global Entity

```http
POST http://localhost:3009/api/entity/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Tech Solutions Inc.",
  "type": "BUSINESS",
  "description": "IT Services Company",
  "categories": ["IT_SERVICES", "SOFTWARE"],
  "phone": "+1987654321",
  "email": "info@techsolutions.com",
  "website": "https://techsolutions.com",
  "address": {
    "street": "123 Tech Park",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105",
    "country": "USA"
  },
  "tags": ["technology", "it", "services"]
}
```

### 2. Get All Entities

```http
GET http://localhost:3009/api/entity/get-all
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Search Entities

```http
GET http://localhost:3009/api/entity/search?q=Tech&category=IT_SERVICES
type=BUSINESS
Authorization: Bearer YOUR_JWT_TOKEN
```

## Relationships

### 1. Create Relationship (Contact)

```http
POST http://localhost:3009/api/relationship/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "userId": "user-id-here",
  "contactId": "contact-id-here",
  "relation": "FRIEND",
  "context": "College friends",
  "strength": "STRONG",
  "visibility": "PRIVATE",
  "isReciprocal": true,
  "notes": "Met in college"
}
```

### 2. Create Relationship (Entity)

```http
POST http://localhost:3009/api/relationship/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "userId": "user-id-here",
  "entityId": "entity-id-here",
  "relation": "CLIENT",
  "context": "Current client project",
  "strength": "MODERATE",
  "visibility": "PRIVATE",
  "notes": "Working on project X"
}
```

### 3. Get All Relationships

```http
GET http://localhost:3009/api/relationship/get-all?userId=user-id-here
Authorization: Bearer YOUR_JWT_TOKEN
```

## Interactions

### 1. Create Interaction

```http
POST http://localhost:3009/api/interaction/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "userId": "user-id-here",
  "contactId": "contact-id-here",
  "relationshipId": "relationship-id-here",
  "type": "MEETING",
  "title": "Project Discussion",
  "description": "Discussed the new project requirements and timeline.",
  "timestamp": "2025-07-21T10:30:00Z",
  "metadata": {
    "location": "Conference Room A",
    "duration": 60,
    "topics": ["Project X", "Timeline", "Requirements"]
  }
}
```

### 2. Get All Interactions

```http
GET http://localhost:3009/api/interaction/get-all?userId=user-id-here
Authorization: Bearer YOUR_JWT_TOKEN
```

## Contact Roles

### 1. Create Contact Role

```http
POST http://localhost:3009/api/contact-role/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "contactId": "contact-id-here",
  "entityId": "entity-id-here",
  "role": "SOFTWARE_ENGINEER",
  "title": "Senior Software Engineer",
  "startDate": "2023-01-15T00:00:00Z",
  "endDate": null,
  "metadata": {
    "department": "Engineering",
    "isFullTime": true
  }
}
```

### 2. Get All Contact Roles

```http
GET http://localhost:3009/api/contact-role/get-all?entityId=entity-id-here
Authorization: Bearer YOUR_JWT_TOKEN
```

## Notes

1. Replace `YOUR_JWT_TOKEN` with the actual JWT token received after login.
2. Replace placeholder IDs (`user-id-here`, `contact-id-here`, etc.) with actual IDs from your database.
3. The base URL is `http://localhost:3009` - update if your server is running on a different port or host.
4. All dates should be in ISO 8601 format (e.g., `2025-07-21T10:30:00Z`).
5. For enum fields, use the exact values defined in the API documentation.
