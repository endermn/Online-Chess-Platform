import React, { useState, useEffect } from 'react';
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

const generatePieceStyles = (pieces) => {
  return pieces.map(({ piece, position }) => ({
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
};

// Convert board position back to FEN
const boardToFEN = (pieces) => {
  const board = Array(8).fill().map(() => Array(8).fill(null));
  
  pieces.forEach(({ piece, position }) => {
    board[position.y][position.x] = piece;
  });
  
  // Convert board to FEN
  const fenParts = [];
  for (let r = 0; r < 8; r++) {
    let row = '';
    let emptyCount = 0;
    
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === null) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          row += emptyCount.toString();
          emptyCount = 0;
        }
        row += board[r][c];
      }
    }
    
    if (emptyCount > 0) {
      row += emptyCount.toString();
    }
    
    fenParts.push(row);
  }
  
  return fenParts.join('/') + ' w KQkq - 0 1'; // Adding default values for other FEN parts
};

const isValidMove = (piece, fromPos, toPos, pieces) => {
  // TODO: implement move checks
  return true;
};

const Chessboard = ({ fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", squareSize = 50, onMove }) => {
  const [boardPieces, setBoardPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('w'); // 'w' for white, 'b' for black
  
  useEffect(() => {
    const parsedPieces = parseFEN(fen);
    setBoardPieces(parsedPieces);
    // Extract turn from FEN if available
    const fenParts = fen.split(' ');
    if (fenParts.length > 1) {
      setCurrentTurn(fenParts[1]);
    }
  }, [fen]);
  
  const boardSize = 8;
  const piecesWithStyles = generatePieceStyles(boardPieces);
  
  const isPiecesTurn = (piece) => {
    const isWhitePiece = piece.piece === piece.piece.toUpperCase();
    return (currentTurn === 'w' && isWhitePiece) || (currentTurn === 'b' && !isWhitePiece);
  };
  
  const handleSquareClick = (row, col, piece) => {
    // If no piece is selected and clicked on a piece, select it
    if (!selectedPiece && piece && isPiecesTurn(piece)) {
      setSelectedPiece(piece);
      setHighlightedSquares([{ x: col, y: row }]);
      return;
    }
    
    if (selectedPiece) {
      //Deselect piece
      if (piece && piece.position.x === selectedPiece.position.x && 
          piece.position.y === selectedPiece.position.y) {
        setSelectedPiece(null);
        setHighlightedSquares([]);
        return;
      }
      
      // Select different piece
      if (piece && isPiecesTurn(piece)) {
        setSelectedPiece(piece);
        setHighlightedSquares([{ x: col, y: row }]);
        return;
      }
      
      // Attempt to move the selected piece
      const fromPos = selectedPiece.position;
      const toPos = { x: col, y: row };
      
      if (isValidMove(selectedPiece, fromPos, toPos, boardPieces)) {
        // Create a new board state
        const newBoardPieces = boardPieces.filter(p => 
          !(p.position.x === fromPos.x && p.position.y === fromPos.y) && 
          !(p.position.x === toPos.x && p.position.y === toPos.y)
        );
        
        // Add the moved piece
        newBoardPieces.push({
          piece: selectedPiece.piece,
          position: toPos
        });
        
        // Update board state
        setBoardPieces(newBoardPieces);
        
        // Switch turns
        setCurrentTurn(currentTurn === 'w' ? 'b' : 'w');
        
        // Generate new FEN
        const newFen = boardToFEN(newBoardPieces);
        
        // Call onMove callback if provided
        if (onMove) {
          onMove({
            piece: selectedPiece.piece,
            from: fromPos,
            to: toPos,
            fen: newFen
          });
        }
      }
      
      // Reset selection
      setSelectedPiece(null);
      setHighlightedSquares([]);
    }
  };
  
  const isSquareHighlighted = (row, col) => {
    return highlightedSquares.some(sq => sq.x === col && sq.y === row);
  };
  
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
                  const piece = piecesWithStyles.find((p) => p.position.x === col && p.position.y === row);
                  const isHighlighted = isSquareHighlighted(row, col);
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`${styles.square} ${styles[squareColor]} ${isHighlighted ? styles.highlighted : ''}`}
                      style={{ 
                        width: `${squareSize}px`, 
                        height: `${squareSize}px`,
                        position: 'relative'
                      }}
                      onClick={() => handleSquareClick(row, col, piece)}
                    >
                      {piece && (
                        <div 
                          className={styles.piece} 
                          style={piece.style}
                        />
                      )}
                      {isHighlighted && (
                        <div className={styles.highlight} style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(255, 255, 0, 0.4)',
                          pointerEvents: 'none'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        {currentTurn === 'w' ? "White's turn" : "Black's turn"}
      </div>
    </div>
  );
};

export default Chessboard;