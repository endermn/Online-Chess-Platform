import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Alert, Card } from 'react-bootstrap';
import styles from './puzzles.module.css';
import NavSidebar from '../../components/navSidebar/navSidebar';
import ChessGame from '../../components/chess/chess';


const blueGreyDark = {
  background: {
    main: '#1e2433',       // Darker blue-grey
    card: '#2a3446',       // Medium blue-grey
    lighter: '#303c52'     // Lighter blue-grey for contrast
  },
  text: {
    primary: '#e6eaf0',    // Almost white with blue tint
    secondary: '#a3b0c2',  // Lighter blue-grey
    muted: '#697891'       // Muted blue-grey
  },
  accent: {
    primary: '#5a8de5',    // Bright blue accent
    secondary: '#384f73',  // Muted blue accent
    success: '#3b7b6b',    // Success color (teal-ish)
    error: '#8d5151'       // Error color (muted red)
  },
  border: '#3d4a61'        // Border color
};

const useFetchRandomPuzzle = (refreshTrigger) => {
  const [puzzle, setPuzzle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomPuzzle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8080/puzzle/random', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch random puzzle');
        }

        const puzzleData = await response.json();
        setPuzzle(puzzleData);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchRandomPuzzle();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  return { puzzle, isLoading, error };
};

function PuzzlesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { puzzle, isLoading, error } = useFetchRandomPuzzle(refreshTrigger);
  const [answer, setAnswer] = useState(false);
  const [puzzleState, setPuzzleState] = useState({
    solved: false,
    attempts: 0
  });
  const chessGameRef = useRef(null);
  const [initialFen, setInitialFen] = useState(null);
  
  // Effect to make the first move automatically when puzzle is loaded
  useEffect(() => {
    if (puzzle) {
      // Apply the first move and update the FEN to start the puzzle from the second move
      const { Chess } = require('chess.js');
      const chess = new Chess(puzzle.fen);
      chess.move(puzzle.first_move);
      
      // Set the updated FEN after the first move
      setInitialFen(chess.fen());
      
      // Reset puzzle state when a new puzzle is loaded
      setPuzzleState({
        solved: false,
        attempts: 0
      });
      setAnswer(false);
    }
  }, [puzzle]);

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: blueGreyDark.background.main,
        color: blueGreyDark.text.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div>Loading puzzle...</div>
      </div>
    );
  }

  // If there's an error, show error state
  if (error) {
    return (
      <div style={{
        backgroundColor: blueGreyDark.background.main,
        color: blueGreyDark.text.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  // If no puzzle is available
  if (!puzzle) {
    return (
      <div style={{
        backgroundColor: blueGreyDark.background.main,
        color: blueGreyDark.text.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div>No puzzle available</div>
      </div>
    );
  }

  const turn = initialFen?.includes("w") ? "White to play" : "Black to play";
  const answerButtonName = answer ? 'Hide' : 'Reveal';

  const onMove = (move) => {
    // Check if the move matches the solution
    if (move.move.lan === puzzle.second_move) {
      setPuzzleState(prev => ({
        ...prev,
        solved: true
      }));
      setAnswer(true);
      
      // Set a timeout to load a new puzzle after solving the current one
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1); // Change the refreshTrigger to fetch a new puzzle
      }, 1500); // Wait 1.5 seconds before loading a new puzzle
      
      return true;
    }
    // Increment attempts counter
    setPuzzleState(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }));
    return false; // Return false to show incorrect feedback
  };

  const loadNewPuzzle = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{
      backgroundColor: blueGreyDark.background.main,
      color: blueGreyDark.text.primary,
      minHeight: '100vh'
    }}>
      <Container fluid>
        <Row className='align-items-start'>
          <NavSidebar />

          {/* Main Content */}
          <Col sm={7} md={9} className="py-4">
            <Card style={{
              backgroundColor: blueGreyDark.background.card,
              borderRadius: '12px',
              border: `1px solid ${blueGreyDark.border}`,
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
              marginBottom: '24px'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h2 style={{
                      color: blueGreyDark.text.primary,
                      fontWeight: '600',
                      marginBottom: '5px'
                    }}>
                      Puzzle #{puzzle.index}
                    </h2>
                    <div style={{
                      width: '60px',
                      height: '3px',
                      backgroundColor: blueGreyDark.accent.primary,
                      borderRadius: '2px',
                      marginBottom: '10px'
                    }}></div>
                  </div>
                  <span style={{
                    backgroundColor: blueGreyDark.accent.secondary,
                    color: blueGreyDark.text.primary,
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    border: `1px solid ${blueGreyDark.border}`
                  }}>
                    {turn}
                  </span>
                </div>

                <Card style={{
                  backgroundColor: blueGreyDark.background.lighter,
                  borderRadius: '8px',
                  border: `1px solid ${blueGreyDark.border}`,
                  position: 'relative',
                  marginBottom: '20px'
                }}>
                  <Card.Body className="p-3 d-flex justify-content-center align-items-center">
                    {puzzleState.solved && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(59, 123, 107, 0.9)',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                        <i className="fas fa-check-circle mr-2"></i> Solved!
                      </div>
                    )}
                    {initialFen && (
                      <ChessGame
                        ref={chessGameRef}
                        squareSize={80}
                        fen={initialFen}
                        onMove={onMove}
                        isPuzzle={true}
                      />
                    )}
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div>
                    <Button
                      onClick={() => setAnswer(!answer)}
                      style={{
                        backgroundColor: answer ? 'transparent' : blueGreyDark.accent.primary,
                        borderColor: blueGreyDark.accent.primary,
                        color: answer ? blueGreyDark.accent.primary : '#ffffff',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        boxShadow: answer ? 'none' : '0 2px 5px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease',
                        marginRight: '10px'
                      }}
                    >
                      <i className={`fas fa-${answer ? 'eye-slash' : 'eye'} mr-2`}></i>
                      {answerButtonName} solution
                    </Button>
                    
                    <Button
                      onClick={loadNewPuzzle}
                      style={{
                        backgroundColor: blueGreyDark.background.lighter,
                        borderColor: blueGreyDark.border,
                        color: blueGreyDark.text.primary,
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className="fas fa-sync-alt mr-2"></i>
                      Next puzzle
                    </Button>
                  </div>

                  {!puzzleState.solved && puzzleState.attempts > 0 && (
                    <div style={{
                      backgroundColor: 'rgba(141, 81, 81, 0.2)',
                      border: `1px solid ${blueGreyDark.accent.error}`,
                      color: '#e5a5a5',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      marginLeft: '10px'
                    }}>
                      <i className="fas fa-chess-pawn mr-2"></i>
                      Attempts: <strong>{puzzleState.attempts}</strong>
                    </div>
                  )}
                </div>

                {answer && (
                  <div style={{
                    backgroundColor: 'rgba(90, 141, 229, 0.15)',
                    border: `1px solid ${blueGreyDark.accent.primary}`,
                    borderLeft: `4px solid ${blueGreyDark.accent.primary}`,
                    color: blueGreyDark.text.primary,
                    padding: '16px',
                    borderRadius: '6px',
                    marginTop: '20px'
                  }}>
                    <h5 style={{
                      marginBottom: '0',
                      fontWeight: '600',
                      color: blueGreyDark.accent.primary
                    }}>
                      <i className="fas fa-lightbulb mr-2"></i>
                      Initial Move: <strong>{puzzle.first_move}</strong>
                      <br />
                      Solution: <strong>{puzzle.second_move}</strong>
                    </h5>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Rest of the component remains the same */}
            {/* ... */}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PuzzlesPage;