import React, { useState, useRef } from 'react';
import ChessGame from '../../components/chess/chess.js'

const ChessGamePage = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState('both'); // 'white', 'black', or 'both' for local play
  const chessGameRef = useRef(null);
  
  // Start a new game
  const startGame = () => {
    setGameStarted(true);
  };
  
  // Return to menu
  const backToMenu = () => {
    setGameStarted(false);
  };
  
  // Reset the current game
  const resetGame = () => {
    if (chessGameRef.current) {
      // The component should handle resetting to initial position
      chessGameRef.current.resetBoard?.() || window.location.reload();
    }
  };
  
  return (
    <div className="chess-page" style={{
      minHeight: '100vh',
      backgroundColor: '#0f1626',
      color: '#f5f5f5',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div className="container">
        <header className="text-center mb-5">
          <h1 style={{ color: '#4e89ae', fontWeight: 'bold', fontSize: '2.5rem' }}>
            Chess Arena
          </h1>
          <p style={{ color: '#8da9c4', fontSize: '1.2rem' }}>
            Challenge your friends in a battle of wits
          </p>
        </header>
        
        {!gameStarted ? (
          <div className="menu-container" style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(29, 53, 87, 0.8)',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 className="text-center mb-4" style={{ color: '#6cb4ee' }}>New Game</h2>
            
            <div className="form-group mb-4">
              <label className="mb-2">Play Vs</label>
              <div className="d-flex gap-3">
                <button 
                  onClick={() => setPlayerColor('white')}
                  className="btn"
                  style={{
                    flex: 1,
                    backgroundColor: playerColor === 'white' ? '#4e89ae' : 'transparent',
                    borderColor: '#4e89ae',
                    color: playerColor === 'white' ? 'white' : '#8da9c4'
                  }}
                >
                  Player
                </button>
                <button 
                  onClick={() => setPlayerColor('black')}
                  className="btn"
                  style={{
                    flex: 1,
                    backgroundColor: playerColor === 'black' ? '#4e89ae' : 'transparent',
                    borderColor: '#4e89ae',
                    color: playerColor === 'black' ? 'white' : '#8da9c4'
                  }}
                >
                 Bot 
                </button>
                <button 
                  onClick={() => setPlayerColor('both')}
                  className="btn"
                  style={{
                    flex: 1,
                    backgroundColor: playerColor === 'both' ? '#4e89ae' : 'transparent',
                    borderColor: '#4e89ae',
                    color: playerColor === 'both' ? 'white' : '#8da9c4'
                  }}
                >
                  Local Play
                </button>
              </div>
            </div>
            
            <div className="text-center mt-5">
              <button 
                onClick={startGame}
                className="btn btn-lg"
                style={{
                  backgroundColor: '#5d9ced',
                  color: 'white',
                  padding: '0.75rem 3rem',
                  fontSize: '1.2rem',
                  borderRadius: '30px',
                  boxShadow: '0 4px 15px rgba(93, 156, 237, 0.4)'
                }}
              >
                Start Playing
              </button>
            </div>
          </div>
        ) : (
          <div className="game-container">
            <div className="row">
              <div className="col-md-8 mx-auto">
                <div style={{
                  background: 'rgba(29, 53, 87, 0.8)',
                  borderRadius: '10px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ color: '#6cb4ee', margin: 0 }}>
                      {playerColor === 'both' ? 'Local Game' : `Playing as ${playerColor}`}
                    </h2>
                    <button
                      onClick={backToMenu}
                      className="btn btn-outline-light"
                      style={{ borderColor: '#8da9c4', color: '#8da9c4' }}
                    >
                      Back to Menu
                    </button>
                  </div>
                  
                  <div className="d-flex justify-content-center">
                    <ChessGame 
                      ref={chessGameRef}
                      squareSize={60}
                      // You might need to modify your component to support orientation
                      // orientation={playerColor === 'black' ? 'black' : 'white'}
                    />
                  </div>
                  
                  {/* <div className="mt-3 d-flex justify-content-center">
                    <div style={{
                      backgroundColor: 'rgba(29, 53, 87, 0.7)',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '5px',
                      fontWeight: 'bold'
                    }}>
                      {playerColor === 'both' ? 'Pass the device to your opponent after each move' : 
                       `You are playing as ${playerColor}`}
                    </div>
                  </div> */}
                </div>
                
                <div style={{
                  background: 'rgba(29, 53, 87, 0.8)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                  <h3 className="mb-3" style={{ color: '#6cb4ee' }}>Game Controls</h3>
                  <div className="d-flex flex-wrap gap-3">
                    <button 
                      className="btn"
                      style={{
                        backgroundColor: 'rgba(93, 156, 237, 0.2)',
                        color: '#8da9c4',
                        border: '1px solid #4e89ae'
                      }}
                      onClick={resetGame}
                    >
                      Reset Game
                    </button>
                    <button 
                      className="btn"
                      style={{
                        backgroundColor: 'rgba(93, 156, 237, 0.2)', 
                        color: '#8da9c4',
                        border: '1px solid #4e89ae'
                      }}
                      onClick={() => {
                        // This would be implemented in a real app
                        alert('Save game feature would be implemented here');
                      }}
                    >
                      Save Game
                    </button>
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(29, 53, 87, 0.8)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  marginTop: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                  <h3 className="mb-3" style={{ color: '#6cb4ee' }}>Game Rules</h3>
                  <p style={{ color: '#8da9c4' }}>
                    Standard chess rules apply. Each player takes turns moving their pieces.
                    The goal is to checkmate your opponent's king. Pieces move as follows:
                  </p>
                  <ul style={{ color: '#8da9c4' }}>
                    <li>Pawns: Move forward one square, capture diagonally</li>
                    <li>Knights: Move in an L-shape (2 squares in one direction, then 1 square perpendicular)</li>
                    <li>Bishops: Move diagonally any number of squares</li>
                    <li>Rooks: Move horizontally or vertically any number of squares</li>
                    <li>Queen: Move horizontally, vertically, or diagonally any number of squares</li>
                    <li>King: Move one square in any direction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessGamePage;