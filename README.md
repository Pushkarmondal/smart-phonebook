# Smart Phonebook Backend

> **TL;DR:** A smart contact management system that understands relationships between people and businesses. It lets you ask questions like "Show me carpenters my friends hired" and get relevant results by combining natural language processing (Gemini AI) with structured data from your contacts and their relationships.

A modern, AI-powered phonebook backend that understands relationships between contacts and provides intelligent search capabilities. This application serves as a comprehensive contact management system with advanced features for personal and business use.

## ✨ Features

- **Smart Contact Management**: Store and manage both personal and business contacts with rich metadata
- **Advanced Relationship Tracking**: Define and track various types of relationships between contacts
- **Interaction Logging**: Comprehensive logging of calls, emails, meetings, and other interactions
- **AI-Powered Search**: Natural language processing for intelligent contact searches
- **Privacy Controls**: Granular visibility settings for contacts and relationships
- **Business Directory**: YellowPages-like business lookup functionality
- **Role-based Access**: Manage different roles and permissions for contacts

## 🚀 Tech Stack

- **Runtime**: [Bun](https://bun.sh/) (Node.js compatible)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **AI**: [Google's Gemini AI](https://ai.google/)
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Comprehensive OpenAPI/Swagger documentation

## 🛠️ Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or later) or [Node.js](https://nodejs.org/) (v18 or later)
- [PostgreSQL](https://www.postgresql.org/) (v14 or later)
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-phonebook-backend.git
cd smart-phonebook-backend
```

### 2. Install dependencies

```bash
bun install
# or if using npm
# npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/smart_phonebook?schema=public"
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
NODE_ENV=development
PORT=3009
```

### 4. Set up the database

```bash
# Run database migrations
bun run prisma:generate
bun run prisma:migrate

# (Optional) Seed the database with sample data
bun run seed
```

### 5. Start the development server

```bash
bun run dev
```

The server will be available at `http://localhost:3009`

## 🔍 API Documentation

### Authentication

All endpoints (except `/auth/*`) require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Available Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- `POST /auth/login` - Authenticate user
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- `POST /auth/refresh` - Refresh access token
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
- `POST /auth/logout` - Invalidate token

#### Contacts
- `GET /contact/get-all` - List all contacts
  - Query params: `page`, `limit`, `type` (PERSONAL/BUSINESS)
- `POST /contact/create` - Create new contact
  ```json
  {
    "name": "Jane Smith",
    "type": "PERSONAL",
    "phone": "+1234567890",
    "email": "jane@example.com",
    "location": "New York, USA",
    "tags": ["friend", "colleague"]
  }
  ```
- `GET /contact/get-by-id/:id` - Get contact details
- `PUT /contact/update/:id` - Update contact
  ```json
  {
    "name": "Jane Smith Updated",
    "email": "jane.updated@example.com"
  }
  ```
- `DELETE /contact/delete/:id` - Delete contact
- `GET /contact/search?q=` - Search contacts
  - Query params: `q` (search term), `type`, `tag`

#### Relationships
- `POST /relationship/create` - Create relationship
  ```json
  {
    "contactId": "contact-id-here",
    "relation": "FRIEND",
    "notes": "Met at the conference"
  }
  ```
- `GET /relationship/get-all` - List all relationships
  - Query params: `contactId`, `type`
- `GET /relationship/get-by-id/:id` - Get relationship details
- `PUT /relationship/update/:id` - Update relationship
  ```json
  {
    "relation": "COLLEAGUE",
    "notes": "Now working together"
  }
  ```
- `DELETE /relationship/delete/:id` - Remove relationship

#### Interactions
- `POST /interaction/create` - Create interaction record
  ```json
  {
    "contactId": "contact-id-here",
    "type": "MEETING",
    "title": "Coffee Meeting",
    "description": "Discussed project collaboration"
  }
  ```
- `GET /interaction/get-all` - List all interactions
  - Query params: `contactId`, `type`, `startDate`, `endDate`
- `GET /interaction/get-by-id/:id` - Get interaction details
- `GET /interaction/contact/:contactId` - Get interactions for a specific contact

#### Contact Roles
- `POST /contact-role/create` - Assign role to contact
  ```json
  {
    "contactId": "contact-id-here",
    "entityId": "entity-id-here",
    "role": "SOFTWARE_ENGINEER"
  }
  ```
- `GET /contact-role/contact/:contactId` - Get roles for a contact
- `DELETE /contact-role/delete/:id` - Remove role from contact

#### AI Query
- `POST /query` - Ask natural language questions about your contacts and relationships
  ```json
  {
    "question": "Show me all contacts who are software engineers and work at Google",
    "userId": "user-id-here"
  }
  ```
  - **Note**: This endpoint uses AI to process natural language queries and return relevant contact information.
  - **Rate Limited**: 20 requests per minute per user

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error Handling

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

### Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per user

## 🏗️ System Design

### Overview
The Smart Phonebook is designed to be an intelligent contact management system that understands relationships between contacts and provides AI-powered search capabilities. The system consists of several key components working together to deliver a seamless experience.

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│                 │     │                 │     │                     │
│  Mobile/Web     ├────►│  API Gateway    ├────►│  Authentication    │
│  Application    │     │  (Reverse Proxy)│     │  Service           │
│                 │     │                 │     │                     │
└─────────────────┘     └────────┬────────┘     └─────────────────────┘
                                 │
                                 ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│                 │     │                 │     │                     │
│  AI/ML          │     │  Application    │     │  Relationship      │
│  Service        │◄───►│  Service        │◄───►│  Graph Service     │
│  (Gemini)       │     │  (Core Logic)   │     │  (Neo4j)           │
│                 │     │                 │     │                     │
└─────────────────┘     └───────┬─────────┘     └─────────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│                 │     │                 │     │                     │
│  Cache Layer    │     │  Primary        │     │  Search Engine      │
│  (Redis)        │◄───►│  Database       │◄───►│  (Elasticsearch)    │
│                 │     │  (PostgreSQL)   │     │                     │
└─────────────────┘     └─────────────────┘     └─────────────────────┘
```

### Core Components

#### 1. Authentication Service
- Handles user registration, login, and JWT token management
- Implements role-based access control (RBAC)
- Manages OAuth2 integration for third-party logins

#### 2. Contact Management
- Stores and manages personal and business contacts
- Supports rich contact information (multiple phone numbers, emails, addresses)
- Handles contact deduplication and merging

#### 3. Relationship Graph
- Models relationships between users and contacts
- Supports different relationship types (family, friend, colleague, etc.)
- Implements privacy controls for relationship visibility
- Uses graph database (Neo4j) for efficient relationship queries

#### 4. Global YellowPages
- Public directory of businesses and services
- Categorized listings with searchable metadata
- Verified business information
- User reviews and ratings

#### 5. AI/ML Service
- Processes natural language queries
- Understands user intent and context
- Generates structured queries from natural language
- Provides smart suggestions and insights

#### 6. Search Engine
- Full-text search across contacts and businesses
- Faceted search with filters
- Location-based search
- Typo tolerance and fuzzy matching

### Data Models

#### Users
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  preferences: UserPreferences;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Contacts
```typescript
interface Contact {
  id: string;
  name: string;
  type: 'PERSONAL' | 'BUSINESS';
  phoneNumbers: PhoneNumber[];
  emails: Email[];
  addresses: Address[];
  tags: string[];
  notes: string;
  addedById: string;
  isFavorite: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Relationships
```typescript
interface Relationship {
  id: string;
  fromContactId: string;
  toContactId: string;
  type: RelationshipType;
  notes: string;
  strength: number; // 1-10
  isReciprocal: boolean;
  privacy: 'PRIVATE' | 'CONNECTIONS' | 'PUBLIC';
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### AI Query Processing

1. **Input**: Natural language query (e.g., "Show me carpenters my friends hired last year")
2. **Processing**:
   - Intent recognition
   - Entity extraction (carpenters, friends, time frame)
   - Relationship mapping
   - Privacy filtering
3. **Query Generation**:
   - Converts to structured database queries
   - Applies relevant filters and joins
4. **Result Processing**:
   - Ranks results by relevance
   - Formats response
   - Adds contextual information

### Security & Privacy

- End-to-end encryption for sensitive data
- Granular privacy controls
- Audit logging for all data access
- Regular security audits
- GDPR/CCPA compliance

### Future Enhancements

1. **Voice Interface**
   - Voice commands for hands-free operation
   - Call transcription and analysis

2. **Smart Suggestions**
   - Proactive contact suggestions
   - Meeting preparation insights

3. **Integration**
   - Calendar integration
   - Email and messaging apps
   - Social media platforms

## 🧪 Running Tests

To run the test suite:

```bash
bun test
```

## 🧰 Available Scripts

- `bun run dev` - Start development server with hot-reload
- `bun run prisma:migrate` - Run database migrations
- `bun run prisma:studio` - Launch Prisma Studio for database management

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Roadmap

For upcoming features and development timeline, see [ROADMAP.md](docs/ROADMAP.md).
