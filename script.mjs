import express from 'express'
import HTTP_CODES from './utils/httpCodes.mjs';

const server = express();
const port = (process.env.PORT || 8000);

// Add content arrays
const poems = [
    "Roses are red,\nViolets are blue,\nCoding is fun,\nAnd so are you!",
    "The sky is blue,\nThe grass is green,\nI love coding,\nIt's quite keen!",
    "The sun is bright,\nThe moon is pale,\nCoding is fun,\nIt never fails!",
    "The world is big,\nAnd life is long,\nCoding is great,\nIt's never wrong!",
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

// Add routes
server.get("/", getRoot);
server.get("/tmp/poem", getPoem);
server.get("/tmp/quote", getQuote);

server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});