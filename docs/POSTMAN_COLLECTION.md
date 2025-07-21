# Smart Phonebook API - Postman Collection

This document provides request examples for testing the Smart Phonebook API using Postman, organized by resource type and operation.

## Quick Start Guide (In Order)

### 1. Sign Up (First Step)
```http
POST http://localhost:3009/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### 2. Login (Get JWT Token)
```http
POST http://localhost:3009/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### 3. Create a Contact
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

### 4. Create a Global Entity
```http
POST http://localhost:3009/api/entity/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Tech Solutions Inc.",
  "type": "BUSINESS",
  "categories": ["TECHNOLOGY"],
  "phone": "+1234567890",
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

### 5. Create a Relationship
```http
POST http://localhost:3009/api/relationship/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "userId": "YOUR_USER_ID",
  "contactId": "CONTACT_ID_FROM_STEP_3",
  "relation": "FRIEND",
  "visibility": "PRIVATE"
}
```

### 6. Create an Interaction
```http
POST http://localhost:3009/api/interaction/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "userId": "YOUR_USER_ID",
  "contactId": "CONTACT_ID_FROM_STEP_3",
  "type": "MEETING",
  "description": "Met for coffee"
}
```

### 7. Create a Contact Role
```http
POST http://localhost:3009/api/contact-role/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "contactId": "CONTACT_ID_FROM_STEP_3",
  "entityId": "ENTITY_ID_FROM_STEP_4",
  "role": "SOFTWARE_ENGINEER"
}
```

---

## Detailed Documentation

## Table of Contents
- [Authentication](#authentication)
- [Contacts](#contacts)
- [Global Entities](#global-entities)
- [Relationships](#relationships)
- [Interactions](#interactions)
- [Contact Roles](#contact-roles)
- [Notes](#notes)

## Contacts

### Get All Contacts
```http
GET http://localhost:3009/api/contact/get-all
Authorization: Bearer YOUR_JWT_TOKEN
```

### Search Contacts
```http
GET http://localhost:3009/api/contact/search?q=Jane
Authorization: Bearer YOUR_JWT_TOKEN
```

## Global Entities

### Get All Entities
```http
GET http://localhost:3009/api/entity/get-all
Authorization: Bearer YOUR_JWT_TOKEN
```

### Search Entities
```http
GET http://localhost:3009/api/entity/search?q=Tech&category=HEALTHCARE&type=BUSINESS
Authorization: Bearer YOUR_JWT_TOKEN
```

## Relationships

### Get All Relationships
```http
GET http://localhost:3009/api/relationship/get-all?userId=user-id-here
Authorization: Bearer YOUR_JWT_TOKEN
```

## Interactions


### Get All Interactions
```http
GET http://localhost:3009/api/interaction/get-all?userId=user-id-here
Authorization: Bearer YOUR_JWT_TOKEN
```

## Contact Roles

### Get All Contact Roles
```http
GET http://localhost:3009/api/contact-role/get-all?entityId=entity-id-here
Authorization: Bearer YOUR_JWT_TOKEN
```

## Notes

{
  "contactId": "contact-id-here",
  "entityId": "entity-id-here",
  "role": "SOFTWARE_ENGINEER",
  "startDate": "2023-01-15T00:00:00Z",
  "endDate": null,
  "metadata": {
    "department": "Engineering",
    "isFullTime": true
  }
}
```

### Get All Contact Roles
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
