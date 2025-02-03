import express from 'express'
import HTTP_CODES from './utils/httpCodes.mjs';
import Deck from './models/Deck.mjs';
import { v4 as uuidv4 } from 'uuid';
import { logger, LogLevel, loggingMiddleware } from './modules/log.mjs';

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
function createDeck(req, res) {
    const deckId = uuidv4();
    const deck = new Deck(deckId);
    decks.set(deckId, deck);
    logger.log('INFO', 'New deck created', { deckId });
    res.status(HTTP_CODES.SUCCESS.CREATED).json({ deck_id: deckId });
}

// Shuffle deck
function shuffleDeck(req, res) {
    const deck = decks.get(req.params.deck_id);
    if (!deck) {
        return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
                 .json({ error: 'Deck not found' });
    }
    deck.shuffle();
    res.status(HTTP_CODES.SUCCESS.OK)
       .json({ message: 'Deck shuffled' });
}

// Get deck
function getDeck(req, res) {
    const deck = decks.get(req.params.deck_id);
    if (!deck) {
        return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
                 .json({ error: 'Deck not found' });
    }
    res.status(HTTP_CODES.SUCCESS.OK)
       .json({ cards: deck.cards });
}

// Draw card
function drawCard(req, res) {
    const deck = decks.get(req.params.deck_id);
    if (!deck) {
        logger.log('WARN', 'Deck not found', { deckId: req.params.deck_id });
        return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
                 .json({ error: 'Deck not found' });
    }
    const card = deck.drawCard();
    if (!card) {
        logger.log('DEBUG', 'No cards left in deck', { deckId: req.params.deck_id });
        return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST)
                 .json({ error: 'No cards left' });
    }
    logger.log('INFO', 'Card drawn', { 
        deckId: req.params.deck_id, 
        cardValue: card.value, 
        cardSuit: card.suit,
        card: `${card.value}${card.suit === 'hearts' ? '♥' : 
                              card.suit === 'diamonds' ? '♦' : 
                              card.suit === 'clubs' ? '♣' : '♠'}`
    });
    res.status(HTTP_CODES.SUCCESS.OK).json({ card });
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

server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
       .json({ error: 'Internal Server Error' });
});

server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});