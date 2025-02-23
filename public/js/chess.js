// Create a new chess game by calling the API endpoint defined in [modules/chessGameRouter.mjs](modules/chessGameRouter.mjs)
async function newGame() {
    const response = await fetch('/api/chess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    document.getElementById('gameId').value = data.game_id;
    document.getElementById('gameStatus').textContent = `Turn: ${data.turn}`;
    renderChessBoard(data.board);
}

// Render an 8x8 chess board with drag & drop functionality
function renderChessBoard(board) {
    const boardContainer = document.getElementById('chessBoard');
    boardContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'chess-board-table';

    const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    // Create header with file labels
    const headerRow = document.createElement('tr');
    const emptyCorner = document.createElement('th');
    headerRow.appendChild(emptyCorner);
    files.forEach(file => {
        const th = document.createElement('th');
        th.textContent = file;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create board rows with rank labels and cells with drag/drop support
    for (let i = 0; i < 8; i++) {
        const tr = document.createElement('tr');
        const rank = 8 - i;
        const rankCell = document.createElement('th');
        rankCell.textContent = rank;
        tr.appendChild(rankCell);

        for (let j = 0; j < 8; j++) {
            const td = document.createElement('td');
            td.style.width = '50px';
            td.style.height = '50px';
            td.style.textAlign = 'center';
            td.style.verticalAlign = 'middle';
            td.style.backgroundColor = (i + j) % 2 === 0 ? '#eee' : '#666';

            // Allow dropping on this cell
            td.addEventListener('dragover', event => event.preventDefault());
            td.addEventListener('drop', event => handleDrop(event, i, j));

            // If there's a piece, render it as a draggable span
            if (board[i][j]) {
                const pieceSpan = document.createElement('span');
                pieceSpan.textContent = getPieceSymbol(board[i][j]);
                pieceSpan.style.fontSize = '32px';
                pieceSpan.setAttribute('draggable', true);
                pieceSpan.addEventListener('dragstart', event => handleDragStart(event, i, j));
                td.appendChild(pieceSpan);
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    // Create footer with file labels (optional)
    const footerRow = document.createElement('tr');
    const emptyFooter = document.createElement('th');
    footerRow.appendChild(emptyFooter);
    files.forEach(file => {
        const th = document.createElement('th');
        th.textContent = file;
        footerRow.appendChild(th);
    });
    table.appendChild(footerRow);

    boardContainer.appendChild(table);
}

// Map each piece's type and color to a symbol
function getPieceSymbol(piece) {
    const symbols = {
        pawn: { white: '♙', black: '♟︎' },
        rook: { white: '♖', black: '♜' },
        knight: { white: '♘', black: '♞' },
        bishop: { white: '♗', black: '♝' },
        queen: { white: '♕', black: '♛' },
        king: { white: '♔', black: '♚' }
    };
    return symbols[piece.type]?.[piece.color] || '';
}

// Store source coordinates when dragging starts
function handleDragStart(event, row, col) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
}

// On drop, read the source and target coordinates then request a move from the API
async function handleDrop(event, targetRow, targetCol) {
    event.preventDefault();
    const gameId = document.getElementById('gameId').value;
    const data = event.dataTransfer.getData('text/plain');
    const { row: sourceRow, col: sourceCol } = JSON.parse(data);

    const payload = {
        from: { row: sourceRow, col: sourceCol },
        to: { row: targetRow, col: targetCol }
    };

    const response = await fetch(`/api/chess/${gameId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (result.error) {
        document.getElementById('gameStatus').textContent = `Error: ${result.error}`;
        return;
    }
    document.getElementById('gameStatus').textContent = `Turn: ${result.turn}`;
    renderChessBoard(result.board);
}

// Attach event listeners for UI buttons
document.getElementById('newGame').addEventListener('click', newGame);