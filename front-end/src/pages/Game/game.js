import React, { useState, useRef, useEffect } from 'react';
import ChessGame from '../../components/chess/chess.js';

const ChessGamePage = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [connected, setConnected] = useState(false);
    const [actualPlayerColor, setActualPlayerColor] = useState('both')
    const [playerColor, setPlayerColor] = useState('both');
    const [gameStatus, setGameStatus] = useState('');
    const [gameID, setGameID] = useState(null);
    const [waitingForOpponent, setWaitingForOpponent] = useState(false);
    const chessGameRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const setupWebSocket = () => {
        try {
            setWaitingForOpponent(true);
            setGameStatus("Connecting to server...");
            
            wsRef.current = new WebSocket("ws://localhost:8080/game/create");

            wsRef.current.onopen = () => {
                console.log("WebSocket connection established");
                setConnected(true);
                setGameStatus("Connected! Waiting for opponent...");
                
                const gameType = playerColor === 'white' ? 'vs-player' : 
                                 playerColor === 'black' ? 'vs-bot' : 'both';
                
                wsRef.current.send(JSON.stringify({
                    type: 'game_init',
                    gameType: gameType,
                    preferredColor: playerColor === 'both' ? 'random' : playerColor
                }));
            };

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("Message received:", data);
                
                switch (data.type) {
                    case 'game_init':
                    case 'waiting':
                        setGameID(data.gameID);
                        setGameStatus(`Game created!`);
                        break;
                    
                    case 'game_start':
                        setGameID(data.gameID);
                        setWaitingForOpponent(false);
                        setGameStarted(true);
                        setActualPlayerColor(data.color)
                        setGameStatus(`Opponent joined! You are playing as ${data.color}`);
                        
                        if (chessGameRef.current && chessGameRef.current.setPosition) {
                            chessGameRef.current.setPosition(data.initialPosition || 'start');
                        }
                        break;
                    
                    case 'move':
                        if (chessGameRef.current && chessGameRef.current.makeMove) {
                            chessGameRef.current.makeMove(data.move);
                        }
                        break;
                    
                    case 'game_status':
                        setGameStatus(data.status);
                        break;
                    case 'opponent_disconnected':
                        setGameStatus(`Game over: opponent disconnected`);
                        break;
                    case 'game_over':
                        setGameStatus(`Game over: ${data.result}. ${data.reason || ''}`);
                        break;
                    
                    case 'error':
                        setGameStatus(`Error: ${data.message}`);
                        console.error("Game error:", data.message);
                        break;
                    
                    default:
                        console.log("Unknown message type:", data.type);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log("WebSocket connection closed:", event);
                setConnected(false);
                
                if (event.code !== 1000) {
                    setGameStatus("Connection lost. Please try again.");
                }
            };

            wsRef.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                setGameStatus("Connection error. Please try again.");
                setConnected(false);
            };
            
        } catch (error) {
            console.error("Error connecting to server:", error);
            setGameStatus("Failed to connect to server");
        }
    };

    const startGame = () => {
        if (playerColor === 'both') {
            // Start local game, no WebSocket needed
            setGameStarted(true);
            setGameStatus("Local game started");
        } else {
            // Start online game with WebSocket
            setupWebSocket();
        }
    };

    const sendMove = (move, to, promotion = null) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected");
            return;
        }
        console.log(move)
        
        try {
            wsRef.current.send(JSON.stringify({
                type: 'move',
                gameID: gameID,
                move: move.move.lan,
                promotion: promotion
            }));
        } catch (error) {
            console.error("Error sending move:", error);
            setGameStatus("Error sending move");
        }
    };

    const CancelGame = async () => {
        console.log(gameID)
        if (gameID && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                console.log("backing to menu")
                wsRef.current.send(JSON.stringify({
                    type: 'cancel',
                    message: "forfeiting",
                    gameID: gameID,
                }));
                
                wsRef.current.close();
            } catch (error) {
                console.error('Error forfeiting game:', error);
            }
        }

        // Reset all game state
        setGameStarted(false);
        setWaitingForOpponent(false);
        setGameStatus('');
        setGameID(null);
        wsRef.current = null;
    };
    const backToMenu = async () => {
        console.log(gameID)
        if (gameID && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                console.log("backing to menu")
                wsRef.current.send(JSON.stringify({
                    type: 'forfeit',
                    message: "forfeiting",
                    gameID: gameID,
                }));
                
                wsRef.current.close();
            } catch (error) {
                console.error('Error forfeiting game:', error);
            }
        }

        // Reset all game state
        setGameStarted(false);
        setWaitingForOpponent(false);
        setGameStatus('');
        setGameID(null);
        wsRef.current = null;
    };



    const resetGame = () => {
        if (playerColor === 'both' && chessGameRef.current) {
            // For local games, just reset the board
            chessGameRef.current.resetBoard?.() || window.location.reload();
        } else if (gameID && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // For online games, send reset request to server
            try {
                wsRef.current.send(JSON.stringify({
                    type: 'reset_request',
                    gameID: gameID
                }));
                setGameStatus("Reset request sent to opponent");
            } catch (error) {
                console.error("Error sending reset request:", error);
            }
        }
    };

    return (
        <div className="chess-page" style={{ minHeight: '100vh', backgroundColor: '#0f1626', color: '#f5f5f5', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <div className="container">
                <header className="text-center mb-5">
                    <h1 style={{ color: '#4e89ae', fontWeight: 'bold', fontSize: '2.5rem' }}>Chess Arena</h1>
                    <p style={{ color: '#8da9c4', fontSize: '1.2rem' }}>Challenge your friends in a battle of wits</p>
                </header>

                {!gameStarted && !waitingForOpponent ? (
                    <div className="menu-container" style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(29, 53, 87, 0.8)', borderRadius: '10px', padding: '2rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                        <h2 className="text-center mb-4" style={{ color: '#6cb4ee' }}>New Game</h2>
                        <div className="form-group mb-4">
                            <label className="mb-2">Play Vs</label>
                            <div className="d-flex gap-3">
                                <button onClick={() => setPlayerColor('white')} className="btn" style={{ flex: 1, backgroundColor: playerColor === 'white' ? '#4e89ae' : 'transparent', borderColor: '#4e89ae', color: playerColor === 'white' ? 'white' : '#8da9c4' }}>Player</button>
                                <button onClick={() => setPlayerColor('black')} className="btn" style={{ flex: 1, backgroundColor: playerColor === 'black' ? '#4e89ae' : 'transparent', borderColor: '#4e89ae', color: playerColor === 'black' ? 'white' : '#8da9c4' }}>Bot</button>
                                <button onClick={() => setPlayerColor('both')} className="btn" style={{ flex: 1, backgroundColor: playerColor === 'both' ? '#4e89ae' : 'transparent', borderColor: '#4e89ae', color: playerColor === 'both' ? 'white' : '#8da9c4' }}>Local Play</button>
                            </div>
                        </div>
                        <div className="text-center mt-5">
                            <button onClick={startGame} className="btn btn-lg" style={{ backgroundColor: '#5d9ced', color: 'white', padding: '0.75rem 3rem', fontSize: '1.2rem', borderRadius: '30px', boxShadow: '0 4px 15px rgba(93, 156, 237, 0.4)' }}>Start Playing</button>
                        </div>
                    </div>
                ) : waitingForOpponent ? (
                    <div className="waiting-container" style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(29, 53, 87, 0.8)', borderRadius: '10px', padding: '2rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', textAlign: 'center' }}>
                        <h2 style={{ color: '#6cb4ee' }}>Finding Opponent</h2>
                        <div className="spinner-border text-light my-4" role="status"><span className="visually-hidden">Loading...</span></div>
                        <p style={{ color: '#8da9c4', fontSize: '1.2rem' }}>{gameStatus}</p>
                        <button onClick={CancelGame} className="btn mt-4" style={{ backgroundColor: 'rgba(93, 156, 237, 0.2)', color: '#8da9c4', border: '1px solid #4e89ae' }}>Cancel</button>
                    </div>
                ) : (
                    <div className="game-container">
                        <div className="row">
                            <div className="col-md-8 mx-auto">
                                <div style={{ background: 'rgba(29, 53, 87, 0.8)', borderRadius: '10px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 style={{ color: '#6cb4ee', margin: 0 }}>{playerColor === 'both' ? 'Local Game' : `Playing as ${playerColor}`}</h2>
                                        <div>
                                            {gameStatus && (<span className="me-3" style={{ color: '#8da9c4' }}>{gameStatus}</span>)}
                                            <button onClick={backToMenu} className="btn btn-outline-light" style={{ borderColor: '#8da9c4', color: '#8da9c4' }}>Back to Menu</button>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-center">
                                        <ChessGame ref={chessGameRef} squareSize={60} onMove={playerColor !== 'both' ? sendMove : undefined} playerColor={actualPlayerColor} orientation={actualPlayerColor === 'both' ? 'white' : actualPlayerColor} />
                                    </div>

                                    <div className="mt-3 d-flex justify-content-center">
                                        <div style={{ backgroundColor: 'rgba(29, 53, 87, 0.7)', padding: '0.75rem 1.5rem', borderRadius: '5px', fontWeight: 'bold' }}>
                                            {playerColor === 'both' ? 'Pass the device to your opponent after each move' : `You are playing as ${actualPlayerColor}`}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(29, 53, 87, 0.8)', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                                    <h3 className="mb-3" style={{ color: '#6cb4ee' }}>Game Controls</h3>
                                    <div className="d-flex flex-wrap gap-3">
                                        <button className="btn" style={{ backgroundColor: 'rgba(93, 156, 237, 0.2)', color: '#8da9c4', border: '1px solid #4e89ae' }} onClick={resetGame} disabled={playerColor !== 'both' && !gameID}>Reset Game</button>
                                        <button className="btn" style={{ backgroundColor: 'rgba(93, 156, 237, 0.2)', color: '#8da9c4', border: '1px solid #4e89ae' }} onClick={() => { alert('Save game feature would be implemented here'); }}>Save Game</button>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(29, 53, 87, 0.8)', borderRadius: '10px', padding: '1.5rem', marginTop: '2rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                                    <h3 className="mb-3" style={{ color: '#6cb4ee' }}>Game Rules</h3>
                                    <p style={{ color: '#8da9c4' }}>Standard chess rules apply. Each player takes turns moving their pieces. The goal is to checkmate your opponent's king. Pieces move as follows:</p>
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