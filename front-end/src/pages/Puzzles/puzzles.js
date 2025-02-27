import React, { useState } from 'react';
import { Container, Row, Col, Button, Alert, Card } from 'react-bootstrap';
import Chessboard from '../../components/chessboard/chessboard';
import styles from './puzzles.module.css';
import NavSidebar from '../../components/navSidebar/navSidebar';

function PuzzlesPage() {
  const mockProfile = {
    firstName: "Pesho",
    lastName: "Toshev",
    email: "peshotoshev@gmail.com",
    profilePicture: "https://checkshorturl.com/img/long-short-url-pros-cons.jpg",
    history: ["win", "win", "loss", "loss", "win", "win", "win", "win", "win", "win", "win", "win"],
    rating: [1000, 1500, 800, 1000],
    totalGames: 100,
    totalGamesWon: 23,
    totalGamesLost: 72,
  };

  // TODO: GET request for a random puzzle to the backend
  const puzzle = {
    fen: "8/2K5/8/2k5/2b5/2B5/2Q2n2/8 w - - 0 1",
    index: 100,
    solution: "Qa4",
  };

  const turn = puzzle.fen.includes("w") ? "White to play" : "Black to play";
  const [answer, setAnswer] = useState(false);
  const [puzzleState, setPuzzleState] = useState({
    solved: false,
    attempts: 0
  });

  const answerButtonName = answer ? 'Hide' : 'Reveal';

  const onMove = (move) => {
    // Check if the move matches the solution
    if (move.move.san === puzzle.solution) {
      setPuzzleState(prev => ({
        ...prev,
        solved: true
      }));
      setAnswer(true);
      return true;
    }
    // Increment attempts counter
    setPuzzleState(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }));
    return false; // Return false to show incorrect feedback
  };

  // Custom blue-greyish dark theme
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

  return (
    <div style={{ 
      backgroundColor: blueGreyDark.background.main, 
      color: blueGreyDark.text.primary,
      minHeight: '100vh'
    }}>
      <Container fluid>
        <Row className='align-items-start'>
          <NavSidebar profile={mockProfile} />
          
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
                    <Chessboard
                      squareSize={80}
                      fen={puzzle.fen}
                      onMove={onMove}
                      isPuzzle={true}
                    />
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-between align-items-center flex-wrap">
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
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className={`fas fa-${answer ? 'eye-slash' : 'eye'} mr-2`}></i>
                    {answerButtonName} solution
                  </Button>
                  
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
                      Solution: <strong>{puzzle.solution}</strong>
                    </h5>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card style={{ 
              backgroundColor: blueGreyDark.background.card, 
              borderRadius: '12px', 
              border: `1px solid ${blueGreyDark.border}`,
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)'
            }}>
              <Card.Body className="p-4">
                <h4 style={{ 
                  color: blueGreyDark.text.primary,
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  <i className="fas fa-info-circle mr-2" style={{ color: blueGreyDark.accent.primary }}></i>
                  How to solve puzzles
                </h4>
                <p style={{ 
                  color: blueGreyDark.text.secondary,
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  marginBottom: '0'
                }}>
                  Move the pieces on the board to solve the puzzle. Find the best move for {turn.toLowerCase()}.
                  If you get stuck, use the "Reveal solution" button to see the answer.
                </p>
              </Card.Body>
            </Card>

            {/* Puzzle history section */}
            <Card style={{ 
              backgroundColor: blueGreyDark.background.card, 
              borderRadius: '12px', 
              border: `1px solid ${blueGreyDark.border}`,
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
              marginTop: '24px'
            }}>
              <Card.Body className="p-4">
                <h4 style={{ 
                  color: blueGreyDark.text.primary,
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-history mr-2" style={{ color: blueGreyDark.accent.primary }}></i>
                  Recent Puzzles
                </h4>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} style={{
                      backgroundColor: blueGreyDark.background.lighter,
                      border: `1px solid ${blueGreyDark.border}`,
                      borderRadius: '6px',
                      padding: '12px',
                      width: 'calc(20% - 8px)',
                      minWidth: '120px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        color: blueGreyDark.text.muted,
                        fontSize: '0.85rem',
                        marginBottom: '5px'
                      }}>
                        Puzzle #{puzzle.index - i - 1}
                      </div>
                      <div style={{
                        fontWeight: '600',
                        color: i % 2 === 0 ? '#5abe9b' : '#e57373'
                      }}>
                        {i % 2 === 0 ? 'Solved' : 'Failed'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PuzzlesPage;