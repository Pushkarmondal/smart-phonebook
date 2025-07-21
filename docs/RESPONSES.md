# Example API Responses

## 1. Contact Information

```json
{
  "success": true,
  "data": {
    "type": "contact_info",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "relationships": ["friend", "colleague"],
    "lastInteraction": "2025-07-20T10:30:00Z"
  }
}
```

## 2. Business Search Results

```json
{
  "success": true,
  "data": {
    "type": "business_results",
    "results": [
      {
        "id": "b550e8400-e29b-41d4-a716-446655440001",
        "name": "Joe's Auto Repair",
        "type": "Auto Repair",
        "address": "123 Main St, City",
        "phone": "+1987654321",
        "rating": 4.5,
        "recommendedBy": ["friend1", "friend2"]
      }
    ]
  }
}
```

## 3. Relationship Network

```json
{
  "success": true,
  "data": {
    "type": "relationship_network",
    "contacts": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "name": "Jane Smith",
        "relationship": "friend",
        "mutualConnections": 5,
        "lastContacted": "2025-07-18T15:30:00Z"
      }
    ]
  }
}
```

## 4. AI Query Response

```json
{
  "success": true,
  "data": {
    "query": "Show me carpenters my friends hired",
    "type": "business_recommendation",
    "results": [
      {
        "id": "b550e8400-e29b-41d4-a716-446655440003",
        "name": "Precision Carpentry",
        "recommendedBy": ["John D", "Sarah M"],
        "contact": {
          "phone": "+1555123456",
          "email": "contact@precisioncarpentry.com"
        },
        "rating": 4.8,
        "reviews": 24
      }
    ]
  }
}
```

## 5. Error Response

```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "No contacts found matching your criteria",
    "details": {
      "field": "searchQuery",
      "value": "nonexistent name"
    }
  }
}
```

## 6. Authentication Success

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```
