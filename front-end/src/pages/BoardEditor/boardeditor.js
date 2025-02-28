import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Dropdown, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { Chess } from 'chess.js';
import { 
  ChevronDown, 
  RotateCcw, 
  Copy, 
  Save, 
  Share2, 
  Clipboard, 
  CheckSquare,
  Settings, 
  Info,
  HelpCircle,
  X,
  ArrowLeftRight
} from 'lucide-react';
import Chessboard from '../../components/chessboard/chessboard';
import styles from './boardEditor.module.css';

const pieces = [
  { id: 'K', name: 'White King', color: 'w' },
  { id: 'Q', name: 'White Queen', color: 'w' },
  { id: 'R', name: 'White Rook', color: 'w' },
  { id: 'B', name: 'White Bishop', color: 'w' },
  { id: 'N', name: 'White Knight', color: 'w' },
  { id: 'P', name: 'White Pawn', color: 'w' },
  { id: 'k', name: 'Black King', color: 'b' },
  { id: 'q', name: 'Black Queen', color: 'b' },
  { id: 'r', name: 'Black Rook', color: 'b' },
  { id: 'b', name: 'Black Bishop', color: 'b' },
  { id: 'n', name: 'Black Knight', color: 'b' },
  { id: 'p', name: 'Black Pawn', color: 'b' },
  { id: 'delete', name: 'Delete Piece', color: 'none' },
];

const startingPositions = [
  { 
    name: 'Starting Position', 
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' 
  },
  { 
    name: 'Empty Board', 
    fen: '8/8/8/8/8/8/8/8 w - - 0 1' 
  },
  { 
    name: 'King & Pawn vs King', 
    fen: '8/8/8/8/8/8/4P3/4K1k1 w - - 0 1' 
  },
  { 
    name: 'Rook Endgame', 
    fen: '8/8/8/8/8/8/4K3/4R1k1 w - - 0 1' 
  },
  { 
    name: 'Queen Endgame', 
    fen: '8/8/8/8/8/8/4K3/4Q1k1 w - - 0 1' 
  },
  { 
    name: 'Italian Game', 
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3' 
  },
  { 
    name: 'Sicilian Defense', 
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2' 
  },
];

const BoardEditor = () => {
  const [currentFen, setCurrentFen] = useState(startingPositions[0].fen);
  const [displayFen, setDisplayFen] = useState(startingPositions[0].fen);
  const [fenError, setFenError] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState('w');
  const [castlingRights, setCastlingRights] = useState({ K: true, Q: true, k: true, q: true });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [squareSize, setSquareSize] = useState(60);
  
  useEffect(() => {
    try {
      const chess = new Chess(currentFen);
      setTurn(chess.turn());
      
      // Update castling rights
      const fenParts = currentFen.split(' ');
      if (fenParts.length > 2) {
        const castling = fenParts[2];
        setCastlingRights({
          K: castling.includes('K'),
          Q: castling.includes('Q'),
          k: castling.includes('k'),
          q: castling.includes('q'),
        });
      }
      
      setFenError(null);
    } catch (e) {
      setFenError("Invalid FEN string");
    }
  }, [currentFen]);
  
  const handleFenChange = (e) => {
    setDisplayFen(e.target.value);
  };
  
  const applyFen = () => {
    try {
      new Chess(displayFen); // Validate FEN
      setCurrentFen(displayFen);
      setFenError(null);
      showMessage('FEN applied successfully', 'success');
    } catch (e) {
      setFenError("Invalid FEN string");
      showMessage('Invalid FEN string', 'error');
    }
  };
  
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setMessageVisible(true);
    
    setTimeout(() => {
      setMessageVisible(false);
    }, 3000);
  };
  
  const resetBoard = () => {
    setCurrentFen(startingPositions[0].fen);
    setDisplayFen(startingPositions[0].fen);
    setSelectedPiece(null);
    showMessage('Board reset to starting position', 'success');
  };
  
  const clearBoard = () => {
    const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1';
    setCurrentFen(emptyFen);
    setDisplayFen(emptyFen);
    setSelectedPiece(null);
    showMessage('Board cleared', 'info');
  };
  
  const copyFen = () => {
    navigator.clipboard.writeText(currentFen);
    showMessage('FEN copied to clipboard', 'success');
  };
  
  const handlePieceClick = (piece) => {
    if (piece === selectedPiece) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece(piece);
    }
  };
  
  const handleBoardClick = (square) => {
    if (!selectedPiece) return;
    
    try {
      const chess = new Chess(currentFen);
      
      if (selectedPiece === 'delete') {
        // Check if there's a piece at the square
        const piece = chess.get(square);
        if (piece) {
          chess.remove(square);
          const newFen = chess.fen();
          setCurrentFen(newFen);
          setDisplayFen(newFen);
        }
      } else {
        // Place piece
        // First remove any existing piece at that square
        const existingPiece = chess.get(square);
        if (existingPiece) {
          chess.remove(square);
        }
        
        // Set the new piece
        const pieceColor = selectedPiece === selectedPiece.toUpperCase() ? 'w' : 'b';
        const pieceType = selectedPiece.toLowerCase();
        
        chess.put({ type: pieceType, color: pieceColor }, square);
        
        const newFen = chess.fen();
        setCurrentFen(newFen);
        setDisplayFen(newFen);
      }
    } catch (e) {
      console.error("Error handling board click:", e);
      showMessage('Error placing piece', 'error');
    }
  };
  
  const handleTurnChange = (selectedTurn) => {
    const fenParts = currentFen.split(' ');
    fenParts[1] = selectedTurn;
    const newFen = fenParts.join(' ');
    
    setCurrentFen(newFen);
    setDisplayFen(newFen);
    setTurn(selectedTurn);
    showMessage(`Turn set to ${selectedTurn === 'w' ? 'White' : 'Black'}`, 'info');
  };
  
  const handleCastlingChange = (right, value) => {
    const newCastlingRights = {
      ...castlingRights,
      [right]: value
    };
    
    setCastlingRights(newCastlingRights);
    
    // Update the FEN string
    const fenParts = currentFen.split(' ');
    let castlingString = '';
    
    if (newCastlingRights.K) castlingString += 'K';
    if (newCastlingRights.Q) castlingString += 'Q';
    if (newCastlingRights.k) castlingString += 'k';
    if (newCastlingRights.q) castlingString += 'q';
    
    if (castlingString === '') castlingString = '-';
    
    fenParts[2] = castlingString;
    const newFen = fenParts.join(' ');
    
    setCurrentFen(newFen);
    setDisplayFen(newFen);
  };
  
  const flipBoard = () => {
    // Get the current position part of FEN
    const fenParts = currentFen.split(' ');
    const position = fenParts[0];
    
    // Split the position into rows and reverse them
    const rows = position.split('/');
    const flippedRows = rows.map(row => {
      // For each row, flip the characters
      let flippedRow = '';
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (isNaN(char)) {
          // It's a piece, so we need to swap its case
          const isUpperCase = char === char.toUpperCase();
          flippedRow += isUpperCase ? char.toLowerCase() : char.toUpperCase();
        } else {
          // It's a number, leave it as is
          flippedRow += char;
        }
      }
      return flippedRow;
    }).reverse();
    
    // Put the flipped position back together
    fenParts[0] = flippedRows.join('/');
    
    // Swap the turn
    fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
    
    // Swap castling rights
    let castling = fenParts[2];
    if (castling !== '-') {
      let newCastling = '';
      if (castling.includes('K')) newCastling += 'k';
      if (castling.includes('Q')) newCastling += 'q';
      if (castling.includes('k')) newCastling += 'K';
      if (castling.includes('q')) newCastling += 'Q';
      fenParts[2] = newCastling || '-';
    }
    
    // Create the new FEN
    const newFen = fenParts.join(' ');
    
    try {
      // Validate the FEN
      new Chess(newFen);
      setCurrentFen(newFen);
      setDisplayFen(newFen);
      showMessage('Board flipped', 'info');
    } catch (e) {
      console.error("Invalid FEN after flipping:", e);
    }
  };
  
  return (
    <div className={styles.editorPage}>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className={styles.pageTitle}>
              <Settings className="me-2" /> Chess Board Editor
            </h1>
            <p className={styles.pageSubtitle}>
              Create and customize chess positions
            </p>
          </Col>
        </Row>
        
        <Row>
          <Col lg={8}>
            <Card className={styles.boardCard}>
              <Card.Body>
                <div className={styles.boardContainer}>
                  <Chessboard 
                    fen={currentFen} 
                    squareSize={squareSize}
                    onSquareClick={handleBoardClick}
                  />
                </div>
              </Card.Body>
            </Card>
            
            <Card className={`${styles.controlsCard} mt-3`}>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.controlLabel}>
                        <Clipboard size={16} className="me-2" />
                        FEN String
                      </Form.Label>
                      <div className={styles.fenInputGroup}>
                        <Form.Control
                          type="text"
                          value={displayFen}
                          onChange={handleFenChange}
                          isInvalid={fenError}
                          className={styles.fenInput}
                        />
                        <Button 
                          onClick={applyFen} 
                          variant="primary" 
                          className={styles.applyButton}
                          disabled={!!fenError}
                        >
                          Apply
                        </Button>
                      </div>
                      {fenError && (
                        <Form.Text className="text-danger">
                          {fenError}
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    <Dropdown className="mb-3">
                      <Dropdown.Toggle variant="secondary" className={styles.dropdownToggle}>
                        <CheckSquare size={16} className="me-2" />
                        Load Position
                        <ChevronDown size={16} className="ms-2" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className={styles.dropdownMenu}>
                        {startingPositions.map((pos, index) => (
                          <Dropdown.Item 
                            key={index} 
                            onClick={() => {
                              setCurrentFen(pos.fen);
                              setDisplayFen(pos.fen);
                              showMessage(`Loaded: ${pos.name}`, 'success');
                            }}
                            className={styles.dropdownItem}
                          >
                            {pos.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                  
                  <Col md={6}>
                    <div className={styles.actionButtons}>
                      <Button 
                        variant="outline-secondary" 
                        onClick={resetBoard}
                        className={styles.actionButton}
                      >
                        <RotateCcw size={16} className="me-2" />
                        Reset
                      </Button>
                      
                      <Button 
                        variant="outline-secondary" 
                        onClick={clearBoard}
                        className={styles.actionButton}
                      >
                        <X size={16} className="me-2" />
                        Clear
                      </Button>
                      
                      <Button 
                        variant="outline-secondary" 
                        onClick={copyFen}
                        className={styles.actionButton}
                      >
                        <Copy size={16} className="me-2" />
                        Copy FEN
                      </Button>
                      
                      <Button 
                        variant="outline-secondary" 
                        onClick={flipBoard}
                        className={styles.actionButton}
                      >
                        <ArrowLeftRight size={16} className="me-2" />
                        Flip Board
                      </Button>
                      
                      <Button 
                        variant="outline-primary" 
                        onClick={() => setIsCustomizing(!isCustomizing)}
                        className={styles.actionButton}
                        active={isCustomizing}
                      >
                        <Settings size={16} className="me-2" />
                        Advanced Settings
                      </Button>
                    </div>
                  </Col>
                </Row>
                
                {isCustomizing && (
                  <Row className="mt-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.controlLabel}>
                          Turn
                        </Form.Label>
                        <div className={styles.turnButtons}>
                          <Button 
                            variant={turn === 'w' ? "primary" : "outline-secondary"}
                            onClick={() => handleTurnChange('w')}
                            className={styles.turnButton}
                          >
                            White
                          </Button>
                          <Button 
                            variant={turn === 'b' ? "primary" : "outline-secondary"}
                            onClick={() => handleTurnChange('b')}
                            className={styles.turnButton}
                          >
                            Black
                          </Button>
                        </div>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3" style={{color: 'white'}}>
                        <Form.Label className={styles.controlLabel}>
                          Castling Rights
                        </Form.Label>
                        <div className={styles.castlingCheckboxes}>
                          <Form.Check
                            type="checkbox"
                            id="castling-K"
                            label="White K-side"
                            checked={castlingRights.K}
                            onChange={(e) => handleCastlingChange('K', e.target.checked)}
                            className={styles.castlingCheck}
                          />
                          <Form.Check
                            type="checkbox"
                            id="castling-Q"
                            label="White Q-side"
                            checked={castlingRights.Q}
                            onChange={(e) => handleCastlingChange('Q', e.target.checked)}
                            className={styles.castlingCheck}
                          />
                          <Form.Check
                            type="checkbox"
                            id="castling-k"
                            label="Black K-side"
                            checked={castlingRights.k}
                            onChange={(e) => handleCastlingChange('k', e.target.checked)}
                            className={styles.castlingCheck}
                          />
                          <Form.Check
                            type="checkbox"
                            id="castling-q"
                            label="Black Q-side"
                            checked={castlingRights.q}
                            onChange={(e) => handleCastlingChange('q', e.target.checked)}
                            className={styles.castlingCheck}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6} className="mt-3">
                      <Form.Group>
                        <Form.Label className={styles.controlLabel}>
                          Board Size
                        </Form.Label>
                        <Form.Range
                          min={40}
                          max={80}
                          step={5}
                          value={squareSize}
                          onChange={(e) => setSquareSize(parseInt(e.target.value))}
                          className={styles.sizeSlider}
                        />
                        <div className={styles.sizeLabels}>
                          <span>Small</span>
                          <span>Medium</span>
                          <span>Large</span>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} >
            <Card className={styles.piecesCard} style={{color: 'white'}}>
              <Card.Header className={styles.cardHeader}>
                <h5 className="mb-0">
                  <Info size={18} className="me-2" />
                  Place Pieces
                </h5>
              </Card.Header>
              <Card.Body>
                <p className={styles.instructions}>
                  Select a piece and click on the board to place it.
                </p>
                
                <div className={styles.pieceSelector}>
                  <div className={styles.pieceGroup}>
                    <h6 className={styles.pieceGroupTitle}>White Pieces</h6>
                    <div className={styles.piecesGrid}>
                      {pieces.filter(p => p.color === 'w').map(piece => (
                        <OverlayTrigger
                          key={piece.id}
                          placement="top"
                          overlay={<Tooltip>{piece.name}</Tooltip>}
                        >
                          <Button 
                            className={`${styles.pieceButton} ${selectedPiece === piece.id ? styles.selected : ''}`}
                            onClick={() => handlePieceClick(piece.id)}
                            variant="outline-secondary"
                          >
                            <div
                              className={styles.pieceSpriteWrap}
                              data-piece={piece.id}
                            />
                          </Button>
                        </OverlayTrigger>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.pieceGroup}>
                    <h6 className={styles.pieceGroupTitle}>Black Pieces</h6>
                    <div className={styles.piecesGrid}>
                      {pieces.filter(p => p.color === 'b').map(piece => (
                        <OverlayTrigger
                          key={piece.id}
                          placement="top"
                          overlay={<Tooltip>{piece.name}</Tooltip>}
                        >
                          <Button 
                            className={`${styles.pieceButton} ${selectedPiece === piece.id ? styles.selected : ''}`}
                            onClick={() => handlePieceClick(piece.id)}
                            variant="outline-secondary"
                          >
                            <div
                              className={styles.pieceSpriteWrap}
                              data-piece={piece.id}
                            />
                          </Button>
                        </OverlayTrigger>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.pieceGroup}>
                    <h6 className={styles.pieceGroupTitle}>Tools</h6>
                    <Button 
                      className={`${styles.deleteButton} ${selectedPiece === 'delete' ? styles.selected : ''}`}
                      onClick={() => handlePieceClick('delete')}
                      variant="outline-danger"
                    >
                      <X size={18} className="me-2" />
                      Delete Piece
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            <Card className={`${styles.helpCard} mt-3`} style={{color: 'white'}}>
              <Card.Header className={styles.cardHeader}>
                <h5 className="mb-0">
                  <HelpCircle size={18} className="me-2" />
                  Help & Tips
                </h5>
              </Card.Header>
              <Card.Body>
                <div className={styles.helpSection}>
                  <h6>What is FEN?</h6>
                  <p>
                    FEN (Forsyth-Edwards Notation) is a standard notation for describing chess positions.
                  </p>
                </div>
                
                <div className={styles.helpSection}>
                  <h6>Editor Controls</h6>
                  <ul className={styles.helpList}>
                    <li>
                      <Badge bg="primary" className="me-2">Select</Badge>
                      Choose a piece from the panel
                    </li>
                    <li>
                      <Badge bg="primary" className="me-2">Place</Badge>
                      Click on the board to place selected piece
                    </li>
                    <li>
                      <Badge bg="primary" className="me-2">Delete</Badge>
                      Use the delete tool to remove pieces
                    </li>
                    <li>
                      <Badge bg="primary" className="me-2">Advanced</Badge>
                      Set turn, castling rights and other options
                    </li>
                  </ul>
                </div>
                
                <div className={styles.helpSection}>
                  <h6>Common Use Cases</h6>
                  <ul className={styles.helpList}>
                    <li>Creating custom puzzles</li>
                    <li>Analyzing specific positions</li>
                    <li>Setting up practice scenarios</li>
                    <li>Sharing interesting board states</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {messageVisible && (
        <div 
          className={`${styles.notification} ${styles[messageType]}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default BoardEditor;