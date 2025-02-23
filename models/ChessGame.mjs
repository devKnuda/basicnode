// JavaScript: models/ChessGame.mjs
import { v4 as uuidv4 } from 'uuid';

export const PieceTypes = {
    PAWN: 'pawn',
    ROOK: 'rook',
    KNIGHT: 'knight',
    BISHOP: 'bishop',
    QUEEN: 'queen',
    KING: 'king'
};

export const Colors = {
    WHITE: 'white',
    BLACK: 'black'
};

export class ChessGame {
    constructor() {
        this.id = uuidv4();
        this.board = this.initializeBoard();
        this.turn = Colors.WHITE;
    }

    // Initialize the board with starting positions
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Row 0: Black major pieces
        board[0] = [
            { type: PieceTypes.ROOK, color: Colors.BLACK },
            { type: PieceTypes.KNIGHT, color: Colors.BLACK },
            { type: PieceTypes.BISHOP, color: Colors.BLACK },
            { type: PieceTypes.QUEEN, color: Colors.BLACK },
            { type: PieceTypes.KING, color: Colors.BLACK },
            { type: PieceTypes.BISHOP, color: Colors.BLACK },
            { type: PieceTypes.KNIGHT, color: Colors.BLACK },
            { type: PieceTypes.ROOK, color: Colors.BLACK }
        ];

        // Row 1: Black pawns
        board[1] = Array.from({ length: 8 }, () => ({ type: PieceTypes.PAWN, color: Colors.BLACK }));

        // Rows 2-5: Empty
        for (let i = 2; i <= 5; i++) {
            board[i] = Array(8).fill(null);
        }

        // Row 6: White pawns
        board[6] = Array.from({ length: 8 }, () => ({ type: PieceTypes.PAWN, color: Colors.WHITE }));

        // Row 7: White major pieces
        board[7] = [
            { type: PieceTypes.ROOK, color: Colors.WHITE },
            { type: PieceTypes.KNIGHT, color: Colors.WHITE },
            { type: PieceTypes.BISHOP, color: Colors.WHITE },
            { type: PieceTypes.QUEEN, color: Colors.WHITE },
            { type: PieceTypes.KING, color: Colors.WHITE },
            { type: PieceTypes.BISHOP, color: Colors.WHITE },
            { type: PieceTypes.KNIGHT, color: Colors.WHITE },
            { type: PieceTypes.ROOK, color: Colors.WHITE }
        ];

        return board;
    }

    // Apply a move from one coordinate to another (no move validation)
    makeMove(from, to) {
        const piece = this.board[from.row][from.col];
        if (!piece) {
            throw new Error('No piece at source position');
        }
        // For simplicity, we don't validate legal chess moves here
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;
        // Switch turn
        this.turn = this.turn === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
    }
}