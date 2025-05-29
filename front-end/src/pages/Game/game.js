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
    const botWsRef = useRef(null);  // Reference for the bot WebSocket
    const [mate, setMate] = useState("")
    const [afterFen, setAfterFen] = useState("")

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (botWsRef.current) {
                botWsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        console.log("mate effect running with value:", mate);
        console.log("WebSocket state:", wsRef.current?.readyState);
        console.log("gameID:", gameID);

        if (!mate) console.log("mate is falsy");
        if (!wsRef.current) console.log("wsRef.current is falsy");
        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) console.log("WebSocket not open");
        if (!gameID) console.log("gameID is falsy");

        if (mate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && gameID) {
            try {
                wsRef.current.send(JSON.stringify({
                    type: 'mate',
                    gameID: gameID,
                    message: mate,
                    gameType: ((window.location).pathname.match(/[^/]+(?=\/?$)/) || [''])[0]
                }));
                console.log("Successfully sent mate status:", mate);
                setMate('')
            } catch (error) {
                console.error("Error sending mate status:", error);
            }
        }
    }, [mate, gameID]);

    useEffect(() => {
        console.log(gameStarted, playerColor === 'black' || playerColor === 'both', chessGameRef.current)
        if (gameStarted && (playerColor === 'black' || playerColor === 'both') && chessGameRef.current) {
            // Initialize with standard starting position
            if (chessGameRef.current.setPosition) {
                chessGameRef.current.setPosition('start');
            }

            if (actualPlayerColor === 'black' && botWsRef.current &&
                botWsRef.current.readyState === WebSocket.OPEN) {
                console.log("sending initial pos")
                sendPositionToBot('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // Standard FEN
            }
        }
    }, [gameStarted, playerColor, actualPlayerColor]);

    const setupBotWebSocket = () => {
        try {
            console.log("Setting up bot WebSocket connection");

            botWsRef.current = new WebSocket("wss://chess-api.com/v1");

            botWsRef.current.onopen = () => {
                console.log("Bot WebSocket connection established");
                // Only start the game once the connection is established
                setGameStarted(true);
                setActualPlayerColor('black');
                setGameStatus("Connected to bot. Game started!");
            };

            botWsRef.current.onmessage = (event) => {
                const botData = JSON.parse(event.data);
                console.log("Bot API message received:", botData);

                if (botData.lan) {
                    if (chessGameRef.current && chessGameRef.current.makeMove) {
                        console.log("Bot making move:", botData.lan);
                        chessGameRef.current.makeMove(botData.lan);

                        checkGameStatus();
                    }
                }

                if (botData.variants) {
                    console.log("Bot suggested variants:", botData.variants);
                }
            };

            botWsRef.current.onclose = (event) => {
                console.log("Bot WebSocket connection closed:", event);
                if (event.code !== 1000) {
                    setGameStatus("Bot API connection lost. Please try again.");
                }
            };

            botWsRef.current.onerror = (error) => {
                console.error("Bot WebSocket error:", error);
                setGameStatus("Bot API connection error. Please try again.");
            };

        } catch (error) {
            console.error("Error connecting to bot API:", error);
            setGameStatus("Failed to connect to bot API");
        }
    };

    const sendPositionToBot = (fen) => {
        if (!botWsRef.current || botWsRef.current.readyState !== WebSocket.OPEN) {
            console.error("Bot WebSocket is not connected");
            setGameStatus("Not connected to bot API");
            return;
        }
        const fenParts = fen.split(' ');
        fenParts[3] = '-'; 
        const modifiedFen = fenParts.join(' ');
        try {
            setGameStatus("Bot is thinking...");
            let depth = playerColor === 'both' ? 2 : 12;
            botWsRef.current.send(JSON.stringify({
                fen: modifiedFen,
                variants: 3,
                depth: depth 
            }));
            console.log("Sent position to bot API:", fen);
        } catch (error) {
            console.error("Error sending position to bot:", error);
            setGameStatus("Error communicating with bot");
        }
    };

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
                    case 'mate':
                        setGameStatus(`Game over: ${data.message}`)
                        break;

                    case 'game_status':
                        setGameStatus(data.status);
                        break;
                    case 'opponent_disconnected':
                        setGameStatus(`Game over: opponent disconnected`);
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
        // Use the same bot logic for both 'black' and 'both'
        if (playerColor === 'black' || playerColor === 'both') {
            setGameStatus("Connecting to chess bot API...");
            setupBotWebSocket();
            return;
        }

        setupWebSocket();
    };

    const sendMove = (move, to, promotion = null) => {
        console.log("Move: ");
        console.log(move)

        // Get current game status from the chess game ref
        let chessStatus = null;
        if (chessGameRef.current && chessGameRef.current.getGameStatus) {
            chessStatus = chessGameRef.current.getGameStatus();
            console.log("Current game status:", chessStatus); // Debug log
        }

        // FIXED: Handle bot game differently from online multiplayer game
        if (playerColor === 'black' || playerColor === 'both') {
            // Bot game - use botWsRef
            if (!botWsRef.current || botWsRef.current.readyState !== WebSocket.OPEN) {
                console.error("Bot WebSocket is not connected");
                setGameStatus("Not connected to bot API");
                return;
            }

            try {
                // For bot games, we need to send the FEN position after the player's move
                if (chessGameRef.current) {
                    sendPositionToBot(move.move.after);
                } else {
                    console.error("Cannot get current FEN position");
                }

                // Check if game is over
                if (chessStatus && (chessStatus.type === 'checkmate' || chessStatus.type === 'stalemate' || chessStatus.type === 'draw')) {
                    setGameStatus(`Game over: ${chessStatus.message}`);
                }
            } catch (error) {
                console.error("Error communicating with bot:", error);
                setGameStatus("Error communicating with bot");
            }
        } else {
            // Regular online multiplayer game - use wsRef
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.error("WebSocket is not connected");
                return;
            }

            try {
                wsRef.current.send(JSON.stringify({
                    type: 'move',
                    gameID: gameID,
                    move: move.move.lan,
                    promotion: promotion,
                    gameStatus: chessStatus
                }));

                // If the game is over (checkmate, stalemate), send a separate game_over message
                if (chessStatus && (chessStatus.type === 'checkmate' || chessStatus.type === 'stalemate' || chessStatus.type === 'draw')) {
                    wsRef.current.send(JSON.stringify({
                        type: 'game_over',
                        gameID: gameID,
                        result: chessStatus.type,
                        reason: chessStatus.message,
                        winner: chessStatus.type === 'checkmate' ?
                            (move.move.color === 'w' ? 'white' : 'black') : 'draw'
                    }));

                    // Update local game status display
                    setGameStatus(`Game over: ${chessStatus.message}`);
                }
            } catch (error) {
                console.error("Error sending move:", error);
                setGameStatus("Error sending move");
            }
        }
    };

    const CancelGame = async () => {
        console.log("Cancelling game, gameID: ", gameID)
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                console.log("backing to menu")
                wsRef.current.send(JSON.stringify({
                    type: 'cancel',
                    message: "forfeiting",
                }));

                wsRef.current.close();
            } catch (error) {
                console.error('Error forfeiting game:', error);
            }
        }

        // Close bot WebSocket if it exists
        if (botWsRef.current && botWsRef.current.readyState === WebSocket.OPEN) {
            try {
                botWsRef.current.close();
            } catch (error) {
                console.error('Error closing bot WebSocket:', error);
            }
        }

        setGameStarted(false);
        setWaitingForOpponent(false);
        setGameStatus('');
        setGameID(null);
        wsRef.current = null;
        botWsRef.current = null;
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

        // Close bot WebSocket if it exists
        if (botWsRef.current && botWsRef.current.readyState === WebSocket.OPEN) {
            try {
                botWsRef.current.close();
            } catch (error) {
                console.error('Error closing bot WebSocket:', error);
            }
        }

        // Reset all game state
        setGameStarted(false);
        setWaitingForOpponent(false);
        setGameStatus('');
        setGameID(null);
        wsRef.current = null;
        botWsRef.current = null;
    };

    const resetGame = () => {
        if ((playerColor === 'both' || playerColor === 'black') && chessGameRef.current) {
            // For bot games, just reset the board
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

    // Add a function to check game status periodically or after moves
    const checkGameStatus = () => {
        if (chessGameRef.current && chessGameRef.current.getGameStatus) {
            const status = chessGameRef.current.getGameStatus();
            console.log(status)
            if (status) {
                // Send game status update to server if in online mode
                if (playerColor !== 'both' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    try {
                        wsRef.current.send(JSON.stringify({
                            type: 'game_status_update',
                            gameID: gameID,
                            status: {
                                type: status.type,
                                message: status.message
                            }
                        }));
                    } catch (error) {
                        console.error("Error sending status update:", error);
                    }
                }
            }
        }
    };

    // Use effect to check game status when the game is active
    useEffect(() => {
        if (gameStarted && playerColor !== 'both') {
            // Initial check when game starts
            const timeoutId = setTimeout(checkGameStatus, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [gameStarted]);

    return (
        <div className="chess-page" style={{ minHeight: '100vh', backgroundColor: '#0f1626', color: '#f5f5f5', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <div className="container">
                <header className="text-center mb-5">
                    <h1 style={{ color: '#4e89ae', fontWeight: 'bold', fontSize: '2.5rem' }}>Chess Arena</h1>
                    <p style={{ color: '#8da9c4', fontSize: '1.2rem' }}>Challenge your friends or play against the bot</p>
                </header>

                {!gameStarted && !waitingForOpponent ? (
                    <div className="menu-container" style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(29, 53, 87, 0.8)', borderRadius: '10px', padding: '2rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                        <h2 className="text-center mb-4" style={{ color: '#6cb4ee' }}>New Game</h2>
                        <div className="form-group mb-4">
                            <label className="mb-2">Play Vs</label>
                            <div className="d-flex gap-3">
                                <button onClick={() => setPlayerColor('white')} className="btn" style={{ flex: 1, backgroundColor: playerColor === 'white' ? '#4e89ae' : 'transparent', borderColor: '#4e89ae', color: playerColor === 'white' ? 'white' : '#8da9c4' }}>Player</button>
                                <button onClick={() => setPlayerColor('black')} className="btn" style={{ flex: 1, backgroundColor: playerColor === 'black' ? '#4e89ae' : 'transparent', borderColor: '#4e89ae', color: playerColor === 'black' ? 'white' : '#8da9c4' }}>Hard Bot</button>
                                <button onClick={() => setPlayerColor('both')} className="btn" style={{ flex: 1, backgroundColor: playerColor === 'both' ? '#4e89ae' : 'transparent', borderColor: '#4e89ae', color: playerColor === 'both' ? 'white' : '#8da9c4' }}>Easy Bot</button>
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
                                        <h2 style={{ color: '#6cb4ee', margin: 0 }}>
                                            {playerColor === 'both' ? 'Playing against Bot as black' :
                                                playerColor === 'black' ? `Playing against Bot as ${actualPlayerColor}` :
                                                    `Playing as ${actualPlayerColor}`}
                                        </h2>
                                        <div>
                                            {gameStatus && (<span className="me-3" style={{ color: '#8da9c4' }}>{gameStatus}</span>)}
                                            <button onClick={backToMenu} className="btn btn-outline-light" style={{ borderColor: '#8da9c4', color: '#8da9c4' }}>Back to Menu</button>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-center">
                                        <ChessGame
                                            ref={chessGameRef}
                                            setMate={setMate}
                                            squareSize={60}
                                            onMove={playerColor !== 'both' ? sendMove : sendMove}
                                            playerColor={actualPlayerColor}
                                            orientation={actualPlayerColor === 'both' ? 'black' : actualPlayerColor}
                                        />
                                    </div>

                                    <div className="mt-3 d-flex justify-content-center">
                                        <div style={{ backgroundColor: 'rgba(29, 53, 87, 0.7)', padding: '0.75rem 1.5rem', borderRadius: '5px', fontWeight: 'bold' }}>
                                            {playerColor === 'both' ?
                                                'Playing against the bot as black' :
                                                playerColor === 'black' ?
                                                    `You are playing against the bot as ${actualPlayerColor}` :
                                                    `You are playing as ${actualPlayerColor}`}
                                        </div>
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