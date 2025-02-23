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

    // Check if the path is clear (for sliding pieces: rook, bishop, queen)
    isClearPath(from, to) {
        const rowDiff = Math.sign(to.row - from.row);
        const colDiff = Math.sign(to.col - from.col);
        let currentRow = from.row + rowDiff;
        let currentCol = from.col + colDiff;

        while (currentRow !== to.row || currentCol !== to.col) {
            if (this.board[currentRow][currentCol] !== null) {
                return false;
            }
            currentRow += rowDiff;
            currentCol += colDiff;
        }
        return true;
    }

    // Validate if a move is legal for the given piece (basic rules)
    isLegalMove(from, to) {
        // Off-board check
        if (from.row < 0 || from.row > 7 || from.col < 0 || from.col > 7 ||
            to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) {
            return false;
        }
        const piece = this.board[from.row][from.col];
        if (!piece) return false;
        if (piece.color !== this.turn) return false; // must move your own piece

        // Prevent capturing your own piece
        const targetPiece = this.board[to.row][to.col];
        if (targetPiece && targetPiece.color === piece.color) return false;

        const rowDiff = to.row - from.row;
        const colDiff = to.col - from.col;

        switch (piece.type) {
            case PieceTypes.PAWN: {
                // Pawns move forward; white moves up (to lower row index), black moves down.
                const direction = piece.color === Colors.WHITE ? -1 : 1;
                // Standard one-step move
                if (colDiff === 0 && rowDiff === direction && !targetPiece) return true;
                // Two-step move from initial position
                const startRow = piece.color === Colors.WHITE ? 6 : 1;
                if (from.row === startRow && colDiff === 0 && rowDiff === 2 * direction &&
                    !targetPiece && this.board[from.row + direction][from.col] === null) {
                    return true;
                }
                // Diagonal capture
                if (Math.abs(colDiff) === 1 && rowDiff === direction && targetPiece && targetPiece.color !== piece.color) {
                    return true;
                }
                return false;
            }
            case PieceTypes.ROOK: {
                // Rook moves in straight lines.
                if (rowDiff === 0 || colDiff === 0) {
                    return this.isClearPath(from, to);
                }
                return false;
            }
            case PieceTypes.KNIGHT: {
                // Knight moves in an L shape.
                if ((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
                    (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) {
                    return true;
                }
                return false;
            }
            case PieceTypes.BISHOP: {
                // Bishop moves diagonally.
                if (Math.abs(rowDiff) === Math.abs(colDiff)) {
                    return this.isClearPath(from, to);
                }
                return false;
            }
            case PieceTypes.QUEEN: {
                // Queen combines rook and bishop moves.
                if ((rowDiff === 0 || colDiff === 0) || (Math.abs(rowDiff) === Math.abs(colDiff))) {
                    return this.isClearPath(from, to);
                }
                return false;
            }
            case PieceTypes.KING: {
                // King moves one square in any direction.
                if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) {
                    return true;
                }
                return false;
            }
            default:
                return false;
        }
    }

    // Deep-clone the board (shallow clone for pieces is ok if objects are immutable)
    cloneBoard() {
        return this.board.map(row => row.map(cell => cell ? { ...cell } : null));
    }

    // Find the king's position for the specified color
    getKingPosition(color) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (piece && piece.type === PieceTypes.KING && piece.color === color) {
                    return { row: i, col: j };
                }
            }
        }
        throw new Error(`King of color ${color} not found`);
    }

    // Check if a piece at "from" can attack the "to" square (ignoring turns and captures)
    canPieceAttack(piece, from, to) {
        const rowDiff = to.row - from.row;
        const colDiff = to.col - from.col;

        switch (piece.type) {
            case PieceTypes.PAWN: {
                const direction = piece.color === Colors.WHITE ? -1 : 1;
                // Pawns attack diagonally
                return (rowDiff === direction && Math.abs(colDiff) === 1);
            }
            case PieceTypes.ROOK: {
                if (rowDiff === 0 || colDiff === 0) {
                    return this.isClearPath(from, to);
                }
                return false;
            }
            case PieceTypes.KNIGHT: {
                return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
                    (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
            }
            case PieceTypes.BISHOP: {
                if (Math.abs(rowDiff) === Math.abs(colDiff)) {
                    return this.isClearPath(from, to);
                }
                return false;
            }
            case PieceTypes.QUEEN: {
                if ((rowDiff === 0 || colDiff === 0) || (Math.abs(rowDiff) === Math.abs(colDiff))) {
                    return this.isClearPath(from, to);
                }
                return false;
            }
            case PieceTypes.KING: {
                return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
            }
            default:
                return false;
        }
    }

    // Determine if the square at (row, col) is attacked by any opponent piece of color "byColor"
    isSquareAttacked(row, col, byColor) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (piece && piece.color === byColor) {
                    if (this.canPieceAttack(piece, { row: i, col: j }, { row, col })) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Return true if the king of the given color is in check
    isKingInCheck(color) {
        const kingPos = this.getKingPosition(color);
        const opponentColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
        return this.isSquareAttacked(kingPos.row, kingPos.col, opponentColor);
    }

    // Return true if there are no legal moves that prevent a check => checkmate
    isCheckmate(color) {
        // If king is not in check, it cannot be checkmate:
        if (!this.isKingInCheck(color)) return false;

        // Try every possible move for every piece of the given color.
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (piece && piece.color === color) {
                    const from = { row: i, col: j };
                    // Try moving to every square on the board.
                    for (let x = 0; x < 8; x++) {
                        for (let y = 0; y < 8; y++) {
                            const to = { row: x, col: y };
                            // Use we already have legal move checking.
                            if (this.isLegalMove(from, to)) {
                                // Clone the current board and save current turn.
                                const savedBoard = this.cloneBoard();
                                const savedTurn = this.turn;
                                // Execute the move on the board.
                                this.board[to.row][to.col] = piece;
                                this.board[from.row][from.col] = null;
                                // Check if the king is still in check.
                                if (!this.isKingInCheck(color)) {
                                    // Restore board and turn and return false (not checkmate).
                                    this.board = savedBoard;
                                    this.turn = savedTurn;
                                    return false;
                                }
                                // Revert the move.
                                this.board = savedBoard;
                                this.turn = savedTurn;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    // Apply a move from one coordinate to another (includes simple move validation)
    makeMove(from, to) {
        const piece = this.board[from.row][from.col];
        if (!piece) {
            throw new Error('No piece at source position');
        }
        if (!this.isLegalMove(from, to)) {
            throw new Error('Illegal move for this piece');
        }

        // Execute move and capture target piece if present
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;

        // Check if both kings are still on board
        const whiteKingAlive = this.board.flat().some(
            p => p && p.type === PieceTypes.KING && p.color === Colors.WHITE
        );
        const blackKingAlive = this.board.flat().some(
            p => p && p.type === PieceTypes.KING && p.color === Colors.BLACK
        );

        // Instead of throwing, return game over status
        if (!whiteKingAlive || !blackKingAlive) {
            this.gameOver = true;
            this.winner = whiteKingAlive ? Colors.WHITE : Colors.BLACK;
            return {
                gameOver: true,
                winner: this.winner
            };
        }

        // Switch turn
        this.turn = this.turn === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
        return { gameOver: false };
    }
}