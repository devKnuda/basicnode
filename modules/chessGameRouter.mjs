// JavaScript: modules/chessGameRouter.mjs
import express from 'express';
import HTTP_CODES from '../utils/httpCodes.mjs';
import { ChessGame } from '../models/ChessGame.mjs';
import db from '../utils/db.mjs';
import { logger } from './log.mjs';

const router = express.Router();

// Create a new chess game
router.post('/chess', async (req, res) => {
  try {
    const game = new ChessGame();
    
    await db.query(
      'INSERT INTO chess_games(id, board, turn) VALUES($1, $2, $3)',
      [game.id, JSON.stringify(game.board), game.turn]
    );
    
    res.status(HTTP_CODES.SUCCESS.CREATED).json({
      game_id: game.id,
      board: game.board,
      turn: game.turn
    });
  } catch (error) {
    logger.log('ERROR', 'Failed to create chess game', { error: error.message });
    res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
       .json({ error: 'Failed to create chess game' });
  }
});

// Get a chess game
router.get('/chess/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM chess_games WHERE id = $1',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
               .json({ error: 'Game not found' });
    }
    
    const game = rows[0];
    res.json({ 
      game_id: game.id, 
      board: game.board,
      turn: game.turn
    });
  } catch (error) {
    logger.log('ERROR', 'Failed to fetch chess game', { error: error.message });
    res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
       .json({ error: 'Failed to fetch chess game' });
  }
});

// Update a chess game with a move
router.put('/chess/:id/move', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM chess_games WHERE id = $1',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
               .json({ error: 'Game not found' });
    }
    
    const gameData = rows[0];
    
    // Recreate game instance with the saved state
    const game = new ChessGame();
    game.id = gameData.id;
    
    // Parse board from JSON if it's a string
    game.board = typeof gameData.board === 'string' 
      ? JSON.parse(gameData.board) 
      : gameData.board;
      
    game.turn = gameData.turn;
    
    const { from, to } = req.body;
    if (!from || !to ||
        typeof from.row !== 'number' || typeof from.col !== 'number' ||
        typeof to.row !== 'number' || typeof to.col !== 'number') {
      return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST)
               .json({ error: 'Invalid move format' });
    }

    try {
      game.makeMove(from, to);
      
      // Update database with new game state
      const updateResult = await db.query(
        'UPDATE chess_games SET board = $1, turn = $2 WHERE id = $3',
        [JSON.stringify(game.board), game.turn, game.id]
      );

      logger.log('INFO', 'Game updated in database', { 
        gameId: game.id,
        rowsAffected: updateResult.rowCount,
        newTurn: game.turn 
      });
      
      res.json({ 
        game_id: game.id, 
        board: game.board, 
        turn: game.turn
      });
    } catch (err) {
      return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST)
               .json({ error: err.message });
    }
  } catch (error) {
    logger.log('ERROR', 'Failed to update chess game', { error: error.message });
    res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
       .json({ error: 'Failed to update chess game' });
  }
});

// Delete a chess game
router.delete('/chess/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM chess_games WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND)
               .json({ error: 'Game not found' });
    }
    
    res.json({ message: 'Game deleted' });
  } catch (error) {
    logger.log('ERROR', 'Failed to delete chess game', { error: error.message });
    res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR)
       .json({ error: 'Failed to delete chess game' });
  }
});

export default router;