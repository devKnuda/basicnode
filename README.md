# Chess Game Application

## Introduction

This full-stack application demonstrates a chess game system with a PWA client and RESTful API backend. The app includes features for creating chess games, making moves, and card deck operations, with all data persisted in PostgreSQL.

## Deployment

The application is deployed and accessible at: https://basicnode-a65w.onrender.com/

## Application Architecture

### Client Application
- Built with HTML, CSS, and vanilla JavaScript
- Progressive Web App (PWA) capabilities:
  - Installable via manifest.json
  - Service worker for offline functionality
  - Theme color and app icons
- Communicates with server exclusively via JSON API endpoints

### Server Application
- Node.js with Express
- Custom middleware implementations:
  - Logging middleware for request/response tracking
  - Rate limiter for protection against excessive requests
- RESTful CRUD API for chess games and card decks
- Data abstraction layer:
  - `ChessGame`, `Deck`, and `Card` classes
  - Game state management and validation
- Persistence manager:
  - Database connection pooling
  - Transaction support for data integrity
  - Parameterized queries for security

### Database
- PostgreSQL hosted on Render
- Tables:
  - `chess_games`: Stores game state, board configuration, and turn information
  - `decks`: Stores card deck information
- SQL script for table creation:
```sql
CREATE TABLE IF NOT EXISTS chess_games (
  id UUID PRIMARY KEY,
  board JSONB NOT NULL,
  turn VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY,
  cards JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Create a New Chess Game
```curl -X POST https://basicnode-a65w.onrender.com/api/chess```

Get Game State
```curl https://basicnode-a65w.onrender.com/api/chess/{game_id}```

Make a Move
```curl -X PUT https://basicnode-a65w.onrender.com/api/chess/{game_id}/move ```\
  -H "Content-Type: application/json" \
  -d '{"from": {"row": 6, "col": 0}, "to": {"row": 4, "col": 0}}'

  Delete a Game
  ```curl -X DELETE https://basicnode-a65w.onrender.com/api/chess/{game_id}```


Card Deck Operations
Create a New Deck
```curl -X POST https://basicnode-a65w.onrender.com/tmp/deck```

Draw a Card
```curl https://basicnode-a65w.onrender.com/tmp/deck/{deck_id}/card```

Shuffle Deck
```curl -X PATCH https://basicnode-a65w.onrender.com/tmp/deck/shuffle/{deck_id}```

View Deck
```curl https://basicnode-a65w.onrender.com/tmp/deck/{deck_id}```

Get Random Quote
```curl https://basicnode-a65w.onrender.com/tmp/poem```

Calculate Sum
```curl -X POST https://basicnode-a65w.onrender.com/tmp/sum/5/10```

Security Features
Rate Limiting
100 requests per minute per IP
Automatic cleanup of old request data
Configurable window and request limit
Logging
Multiple log levels (ERROR, WARN, INFO, DEBUG)
CSV file logging in app.csv
Color-coded console output
Request duration tracking
Detailed error logging
Database Security
Connection pooling for efficient resource use
Parameterized queries to prevent SQL injection
Environment-based configuration
SSL encryption for database connections
