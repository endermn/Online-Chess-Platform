import React, { useState, useRef, useEffect } from 'react';
import ChessGame from '../../components/chess/chess.js'

const ChessGamePage = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState('both'); // 'white', 'black', or 'both' for local play
  const [gameStatus, setGameStatus] = useState('');
  const [gameId, setGameId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const chessGameRef = useRef(null);
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Start game against online opponent
  const startOnlineGame = async () => {
    try {
      setWaitingForOpponent(true);
      setGameStatus('Connecting to server...');
      
      // Get JWT token from localStorage or your auth system
      const token = localStorage.getItem('jwt_token');
      
      // Make POST request to create a new game
      const response = await fetch('http://localhost:8080/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Use Authorization header for JWT
        },
        body: JSON.stringify({
          // Add any required request body parameters
          gameMode: playerColor === 'white' ? 'player_vs_player' : 'player_vs_bot'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set game ID and status
      setGameId(data.gameID || data.id);
      setGameStatus('Waiting for opponent to join...');
      
      // Begin polling for game status if waiting for opponent
      startPollingGameStatus(data.gameID || data.id);
      
    } catch (error) {
      console.error('Error starting game:', error);
      setGameStatus('Failed to connect to server');
      setWaitingForOpponent(false);
    }
  };
  
  // Poll for game status updates
  const startPollingGameStatus = (gameId) => {
    const token = localStorage.getItem('jwt_token');
    
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Set up polling every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8080/game/status/${gameId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if game has started
        if (data.status === 'in_progress' || data.gameStatus === 'in_progress') {
          clearInterval(interval);
          setPollingInterval(null);
          setWaitingForOpponent(false);
          setGameStarted(true);
          setGameStatus('Game started!');
          setOpponentId(data.opponentId || data.opponentUserID);
          
          // Determine player color based on server response if available
          if (data.playerColor) {
            setPlayerColor(data.playerColor);
          }
        }
      } catch (error) {
        console.error('Error polling game status:', error);
      }
    }, 2000);
    
    setPollingInterval(interval);
  };
  
  // Start a local game
  const startLocalGame = () => {
    setGameStarted(true);
  };
  
  // Start game based on selected mode
  const startGame = () => {
    if (playerColor === 'both') {
      startLocalGame();
    } else {
      startOnlineGame();
    }
  };
  
  // Send a move to the server
  const sendMove = async (from, to) => {
    if (!gameId) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch(`http://localhost:8080/game/move/${gameId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          from: from,
          to: to
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle server response
      // This might include validation of the move or opponent's response move
      
      // Start polling for opponent's move
      if (!pollingInterval) {
        startPollingMoves(gameId);
      }
      
    } catch (error) {
      console.error('Error sending move:', error);
      setGameStatus('Failed to send move');
    }
  };
  
  // Poll for opponent's moves
  const startPollingMoves = (gameId) => {
    const token = localStorage.getItem('jwt_token');
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8080/game/${gameId}/moves?last=${Date.now() - 10000}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if there are new moves
        if (data.moves && data.moves.length > 0) {
          // Process the latest move from opponent
          const latestMove = data.moves[data.moves.length - 1];
          
          // Only process opponent's moves
          if (latestMove.playerId !== localStorage.getItem('user_id')) {
            if (chessGameRef.current) {
              chessGameRef.current.handleOpponentMove(latestMove.from, latestMove.to);
            }
          }
        }
        
        // Check if game is over
        if (data.gameStatus === 'finished') {
          clearInterval(interval);
          setPollingInterval(null);
          setGameStatus(`Game over: ${data.result}`);
        }
        
      } catch (error) {
        console.error('Error polling for moves:', error);
      }
    }, 1000);
    
    setPollingInterval(interval);
  };
  
  // Return to menu
  const backToMenu = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // If in an online game, notify the server
    if (gameId && playerColor !== 'both') {
      const token = localStorage.getItem('jwt_token');
      
      fetch(`http://localhost:8080/game/forfeit/${gameId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(error => {
        console.error('Error forfeiting game:', error);
      });
    }
    
    setGameStarted(false);
    setWaitingForOpponent(false);
    setGameStatus('');
    setGameId(null);
    setOpponentId(null);
  };
  
  // Reset the current game (only for local games)
  const resetGame = () => {
    if (chessGameRef.current) {
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
        
        {!gameStarted && !waitingForOpponent ? (
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
        ) : waitingForOpponent ? (
          <div className="waiting-container" style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(29, 53, 87, 0.8)',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#6cb4ee' }}>Finding Opponent</h2>
            <div className="spinner-border text-light my-4" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: '#8da9c4', fontSize: '1.2rem' }}>{gameStatus}</p>
            {gameId && (
              <p style={{ color: '#8da9c4' }}>Game ID: {gameId}</p>
            )}
            <button 
              onClick={backToMenu}
              className="btn mt-4"
              style={{
                backgroundColor: 'rgba(93, 156, 237, 0.2)',
                color: '#8da9c4',
                border: '1px solid #4e89ae'
              }}
            >
              Cancel
            </button>
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
                    <div>
                      {gameStatus && (
                        <span className="me-3" style={{ color: '#8da9c4' }}>{gameStatus}</span>
                      )}
                      <button
                        onClick={backToMenu}
                        className="btn btn-outline-light"
                        style={{ borderColor: '#8da9c4', color: '#8da9c4' }}
                      >
                        Back to Menu
                      </button>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-center">
                    <ChessGame 
                      ref={chessGameRef}
                      squareSize={60}
                      onMove={playerColor !== 'both' ? sendMove : undefined}
                      orientation={playerColor === 'black' ? 'black' : 'white'}
                    />
                  </div>
                  
                  <div className="mt-3 d-flex justify-content-center">
                    <div style={{
                      backgroundColor: 'rgba(29, 53, 87, 0.7)',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '5px',
                      fontWeight: 'bold'
                    }}>
                      {playerColor === 'both' ? 'Pass the device to your opponent after each move' : 
                       `You are playing as ${playerColor}`}
                    </div>
                  </div>
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
                      disabled={playerColor !== 'both'}
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