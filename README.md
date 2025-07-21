# Smart Phonebook Backend

A modern, AI-powered phonebook backend that understands relationships between contacts and provides intelligent search capabilities.

## Features

- **Relationship Management**: Track and manage various types of relationships
- **Privacy Controls**: Granular control over contact visibility
- **Interaction Tracking**: Log and query interactions with contacts
- **Business Directory**: YellowPages-like business lookup
- **AI-Powered Queries**: Natural language processing for smart searches

## Tech Stack

- **Runtime**: Bun (Node.js compatible)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **AI**: Google's Gemini AI (Free Tier)
- **Authentication**: JWT

## Project Structure

```
smart-phonebook-backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Helper functions
├── prisma/            # Prisma schema and migrations
├── tests/             # Test files
└── docs/              # Documentation
    ├── API.md         # Detailed API documentation
    ├── ROADMAP.md     # Development roadmap
    └── RESPONSES.md   # Example API responses
```

## API Documentation

See [docs/API.md](docs/API.md) for detailed API documentation.

## Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Set up environment variables (copy `.env.example` to `.env`)
4. Run database migrations: `bun prisma migrate dev`
5. Start the server: `bun dev`

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the development timeline and planned features.

