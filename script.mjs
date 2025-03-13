import express from 'express'
import HTTP_CODES from './utils/httpCodes.mjs';
import Deck from './models/Deck.mjs';
import { v4 as uuidv4 } from 'uuid';
import { logger, LogLevel, loggingMiddleware } from './modules/log.mjs';
import { createRateLimiter } from './modules/rateLimiter.mjs';
import chessGameRouter from './modules/chessGameRouter.mjs';
import dotenv from 'dotenv';
import db from './utils/db.mjs';

// Load environment variables
dotenv.config();

// Add these near the top of your file
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Log error but don't exit
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Log error but don't exit
});

const server = express();
const port = (process.env.PORT || 8000);

// Add content arrays
const poems = [
    "Roses are red,\nViolets are blue,\nCoding is fun,\nAnd so are you!"
];

const quotes = [
    "Be the change you wish to see in the world. - Gandhi",
    "Stay hungry, stay foolish. - Steve Jobs",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
];

server.set('port', port);
server.use(express.static('public'));
server.use(express.json());  // Add JSON parser middleware

// Configure logger
logger.setLevel(LogLevel.DEBUG); // Set desired log level
logger.setEnabled(true);        // Enable/disable logging

// Add logging middleware
server.use(loggingMiddleware);

//configure rate limiter
const rateLimiter = createRateLimiter({
    windowMs: 60000,    // 1 minute window
    maxRequests: 1000,   // max 100 requests per minute
    message: 'Too many requests. Please try again later.'
});

// add rate limiter middleware
server.use(rateLimiter);

// Store for decks
const decks = new Map();

function getRoot(req, res, next) {
    res.status(HTTP_CODES.SUCCESS.OK).send('Hello World').end();
}

// Add poem handler
function getPoem(req, res, next) {
    res.status(HTTP_CODES.SUCCESS.OK).send(poems[0]).end();
}

// Add quote handler with random selection
function getQuote(req, res, next) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.status(HTTP_CODES.SUCCESS.OK).send(quotes[randomIndex]).end();
}

// Add sum handler
function postSum(req, res) {
    const a = parseInt(req.params.a);
    const b = parseInt(req.params.b);

    if (isNaN(a) || isNaN(b)) {
        return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST)
            .send('Parameters must be numbers')
            .end();
    }

    const sum = a + b;
    res.status(HTTP_CODES.SUCCESS.OK)
        .send({ result: sum })
        .end();
}

// Create new deck
async function createDeck(req, res) {
    try {
        const deckId = uuidv4();
        const deck = new Deck(deckId);
        
        await db.query(
            'INSERT INTO decks(id, cards) VALUES($1, $2)',
            [deckId, JSON.stringify(deck.cards)]
        );
        
        logger.log('INFO', 'New deck created', { deckId });
        res.status(HTTP_CODES.SUCCESS.CREATED).json({ deck_id: deckId });
    } catch (error) {
        logger.log('ERROR', 'Failed to create deck', { error: error.message });
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
           .json({ error: 'Failed to create deck' });
    }
}

// Shuffle deck
async function shuffleDeck(req, res) {
    try {
        const { rows } = await db.query(
            'SELECT * FROM decks WHERE id = $1',
            [req.params.deck_id]
        );
        
        if (rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
                     .json({ error: 'Deck not found' });
        }
        
        const deck = new Deck(rows[0].id);
        deck.cards = rows[0].cards;
        deck.shuffle();
        
        await db.query(
            'UPDATE decks SET cards = $1 WHERE id = $2',
            [JSON.stringify(deck.cards), deck.id]
        );
        
        res.status(HTTP_CODES.SUCCESS.OK)
           .json({ message: 'Deck shuffled' });
    } catch (error) {
        logger.log('ERROR', 'Failed to shuffle deck', { error: error.message });
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
           .json({ error: 'Failed to shuffle deck' });
    }
}

// Get deck
async function getDeck(req, res) {
    try {
        const { rows } = await db.query(
            'SELECT * FROM decks WHERE id = $1',
            [req.params.deck_id]
        );
        
        if (rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
                     .json({ error: 'Deck not found' });
        }
        
        res.status(HTTP_CODES.SUCCESS.OK)
           .json({ cards: rows[0].cards });
    } catch (error) {
        logger.log('ERROR', 'Failed to get deck', { error: error.message });
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
           .json({ error: 'Failed to get deck' });
    }
}

// Draw card
async function drawCard(req, res) {
    try {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            const { rows } = await client.query(
                'SELECT * FROM decks WHERE id = $1 FOR UPDATE',
                [req.params.deck_id]
            );
            
            if (rows.length === 0) {
                await client.query('ROLLBACK');
                logger.log('WARN', 'Deck not found', { deckId: req.params.deck_id });
                return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
                         .json({ error: 'Deck not found' });
            }
            
            const deck = new Deck(rows[0].id);
            deck.cards = rows[0].cards;
            
            const card = deck.drawCard();
            if (!card) {
                await client.query('ROLLBACK');
                logger.log('DEBUG', 'No cards left in deck', { deckId: req.params.deck_id });
                return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST)
                         .json({ error: 'No cards left' });
            }
            
            await client.query(
                'UPDATE decks SET cards = $1 WHERE id = $2',
                [JSON.stringify(deck.cards), deck.id]
            );
            
            await client.query('COMMIT');
            
            const cardResponse = { card };
            logger.log('INFO', 'Card drawn', {
                deckId: req.params.deck_id,
                cardValue: card.value,
                cardSuit: card.suit
            });
            
            res.status(HTTP_CODES.SUCCESS.OK).json(cardResponse);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        logger.log('ERROR', 'Failed to draw card', { error: error.message });
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
           .json({ error: 'Failed to draw card' });
    }
}

// Add routes
server.get("/", getRoot);
server.get("/tmp/poem", getPoem);
server.get("/tmp/quote", getQuote);
server.post("/tmp/sum/:a/:b", postSum);
server.post("/tmp/deck", createDeck);
server.patch("/tmp/deck/shuffle/:deck_id", shuffleDeck);
server.get("/tmp/deck/:deck_id", getDeck);
server.get("/tmp/deck/:deck_id/card", drawCard);

server.use('/api', chessGameRouter);

server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal Server Error' });
});

server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
    
    // Test DB connection after server starts
    testDBConnection();
});

// Add near server start, after db import
async function testDBConnection() {
  try {
    const result = await db.query('SELECT NOW() as now');
    logger.log('INFO', 'Database test query successful', { time: result.rows[0].now });
    
    // Try inserting test data
    const testUuid = uuidv4();
    await db.query(
      'INSERT INTO chess_games(id, board, turn) VALUES($1, $2, $3)',
      [testUuid, JSON.stringify([]), 'white']
    );
    logger.log('INFO', 'Test insert successful', { id: testUuid });
    
    // Then delete it
    await db.query('DELETE FROM chess_games WHERE id = $1', [testUuid]);
  } catch (err) {
    logger.log('ERROR', 'Database test failed', { error: err.message });
  }
}

testDBConnection();