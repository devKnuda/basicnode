// JavaScript: modules/chessGameRouter.mjs
import express from 'express';
import HTTP_CODES from '../utils/httpCodes.mjs';
import { ChessGame } from '../models/ChessGame.mjs';

const router = express.Router();
const games = new Map();

// Create a new chess game
router.post('/chess', (req, res) => {
    const game = new ChessGame();
    games.set(game.id, game);
    res.status(HTTP_CODES.SUCCESS.CREATED).json({
        game_id: game.id,
        board: game.board,
        turn: game.turn
    });
});

// Read a chess game state
router.get('/chess/:id', (req, res) => {
    const game = games.get(req.params.id);
    if (!game) {
        return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: 'Game not found' });
    }
    res.json({ game_id: game.id, board: game.board, turn: game.turn });
});

// Update a chess game with a move
router.put('/chess/:id/move', (req, res) => {
    const game = games.get(req.params.id);
    if (!game) {
        return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: 'Game not found' });
    }
    const { from, to } = req.body;
    if (!from || !to ||
        typeof from.row !== 'number' || typeof from.col !== 'number' ||
        typeof to.row !== 'number' || typeof to.col !== 'number') {
        return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Invalid move format' });
    }

    try {
        game.makeMove(from, to);
    } catch (err) {
        return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: err.message });
    }

    res.json({ game_id: game.id, board: game.board, turn: game.turn });
});

// Delete a chess game
router.delete('/chess/:id', (req, res) => {
    if (!games.has(req.params.id)) {
        return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: 'Game not found' });
    }
    games.delete(req.params.id);
    res.json({ message: 'Game deleted' });
});

export default router;