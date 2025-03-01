import React from 'react';
import styles from './chessboard.module.css';
import piecesImage from '../../assets/pieces.png';

const getSquareColor = (row, col) => {
  return (row + col) % 2 === 0 ? 'white' : 'black';
};

const getPiecePosition = (piece) => {
  const pieceMap = {
    // White pieces (top row of sprite sheet)
    'K': '0% 0%',     'Q': '20% 0%',     'R': '80% 0%',
    'B': '40% 0%',    'N': '60% 0%',     'P': '100% 0%',
    
    // Black pieces (bottom row of sprite sheet)
    'k': '0% 100%',   'q': '20% 100%',   'r': '80% 100%',
    'b': '40% 100%',  'n': '60% 100%',   'p': '100% 100%'
  };

  // No idea why this is working as of right now, DO NOT TOUCH!
  return pieceMap[piece] || 'none';
};

const parseFEN = (fen) => {
  const board = [];
  const rows = fen.split(' ')[0].split('/');
  for (let r = 0; r < 8; r++) {
    let file = 0;
    for (const char of rows[r]) {
      if (!isNaN(char)) {
        file += parseInt(char, 10);
      } else {
        board.push({
          piece: char,
          position: { x: file, y: r }
        });
        file++;
      }
    }
  }

  return board;
};

const generatePieceStyles = (fen) => {
  const board = parseFEN(fen);
  const boardwithstyles = board.map(({ piece, position }) => ({
    piece,
    position,
    style: {
      backgroundImage: `url(${piecesImage})`,
      backgroundPosition: getPiecePosition(piece),
      backgroundSize: '600% 200%', // For 6 pieces horizontally, 2 rows vertically
      height: '100%',
      width: '100%'
    }
  }));

  return boardwithstyles;
};

const Chessboard = ({ fen, squareSize = 50 }) => {
  const boardSize = 8;
  const pieces = generatePieceStyles(fen);

  const handleClickEvent = (piece) => {
    console.log(piece)
  } 
  
  return (
    <div className="container">
      <div className="row">
        <div className="col d-flex justify-content-center align-items-center">
          <div 
            className={`${styles.chessboard} align-self-center`} 
            style={{ 
              width: `${squareSize * 8}px`, 
              height: `${squareSize * 8}px` 
            }}
          >
            {Array.from({ length: boardSize }, (_, row) => (
              <div key={row} className={styles.chessboardRow}>
                {Array.from({ length: boardSize }, (_, col) => {
                  const squareColor = getSquareColor(row, col);
                  const piece = pieces.find((piece) => piece.position.x === col && piece.position.y === row);
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`${styles.square} ${styles[squareColor]}`}
                      style={{ 
                        width: `${squareSize}px`, 
                        height: `${squareSize}px` 
                      }}
                      onClick={() => handleClickEvent(piece)}
                    >
                      {piece && (
                        <div 
                          className={styles.piece} 
                          style={piece.style}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chessboard;