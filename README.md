# Basic Node Project

## Introduction

This project is part of the AppDev2 course, The goal is to practice working with Git, refactoring code, and using Express.js to handle HTTP requests.

## Deployment

The application is deployed and accessible at: https://seahorse-app-qdjex.ondigitalocean.app/

## Features

- RESTful Card Deck API
- Real-time logging with different levels (ERROR, WARN, INFO, DEBUG)
- Rate limiting protection
- Web interface for deck manipulation
- CSV log storage
- Color-coded console output

## API Endpoints

### Card Deck Operations

#### Create a New Deck
```sh
curl -X POST http://localhost:8000/tmp/deck
```
Creates and returns a new deck_id

#### Draw a Card
```sh
curl http://localhost:8000/tmp/deck/{deck_id}/card
```
Draws the top card from the specified deck.

#### Shuffle Deck
```sh
curl -X PATCH http://localhost:8000/tmp/deck/shuffle/{deck_id}
```
Randomly shuffles the specified deck.

#### View Deck
```sh
curl http://localhost:8000/tmp/deck/{deck_id}
```
Returns all remaining cards in the deck.

### Additional Endpoints
Get random Quote

Returns all remaining cards in the deck.
```sh
curl http://localhost:8000/tmp/quote
```
Returns a poem.

### Calculate Sum
```sh
curl -X POST http://localhost:8000/tmp/sum/5/10
```
Returns the sum of two numbers. (Replace 5 and 10 with any number).

# Security Features

## Rate Limiting
100 requests per minute per IP
Automatic cleanup of old request data
Configurable window and request limit

## Logging
Multiple log levels (ERROR, WARN, INFO, DEBUG)
CSV file logging in app.csv
Color-coded console output
Request duration tracking
Detailed error logging

# Web Interface
Access the web interface at http://localhost:8000 to:

Create new decks
Draw cards with animations
Shuffle decks
View all cards in a deck
Hide/show deck view

# Installation
1. Install dependencies:
```sh
npm install
```
2. Start the server:
```sh
Node script.mjs
```
The server will run on port 8000 by default (configurable via PORT environment variable).