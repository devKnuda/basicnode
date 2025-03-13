// viewgame.mjs
import db from './utils/db.mjs';

const gameId = process.argv[2]; // Pass game ID as command line argument

if (!gameId) {
  console.log('Please provide a game ID');
  process.exit(1);
}

db.query('SELECT * FROM chess_games WHERE id = $1', [gameId])
  .then(res => {
    console.log('Game ID:', res.rows[0].id);
    console.log('Turn:', res.rows[0].turn);
    console.log('Created at:', res.rows[0].created_at);
    console.log('Board (formatted):', JSON.stringify(res.rows[0].board, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });