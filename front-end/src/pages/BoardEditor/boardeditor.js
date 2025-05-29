import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Dropdown, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { Chess } from 'chess.js'; // [4, 13, 6, 7, 8, 14, 15, 16]
import { Chessboard } from 'react-chessboard'; // [5, 6, 7]
import {
  ChevronDown,
  RotateCcw,
  Copy,
  Clipboard,
  CheckSquare,
  Settings,
  Info,
  HelpCircle,
  X,
  ArrowLeftRight
} from 'lucide-react';
import styles from './boardEditor.module.css'; // Make sure this CSS module exists

// --- Constants ---
// Define the pieces available in the palette
const pieces = [
  { id: 'P', name: 'White Pawn', color: 'w', type: 'p' },
  { id: 'N', name: 'White Knight', color: 'w', type: 'n' },
  { id: 'B', name: 'White Bishop', color: 'w', type: 'b' },
  { id: 'R', name: 'White Rook', color: 'w', type: 'r' },
  { id: 'Q', name: 'White Queen', color: 'w', type: 'q' },
  { id: 'K', name: 'White King', color: 'w', type: 'k' },
  { id: 'p', name: 'Black Pawn', color: 'b', type: 'p' },
  { id: 'n', name: 'Black Knight', color: 'b', type: 'n' },
  { id: 'b', name: 'Black Bishop', color: 'b', type: 'b' },
  { id: 'r', name: 'Black Rook', color: 'b', type: 'r' },
  { id: 'q', name: 'Black Queen', color: 'b', type: 'q' },
  { id: 'k', name: 'Black King', color: 'b', type: 'k' },
  // Add the 'delete' tool conceptually to the list for lookups
  { id: 'delete', name: 'Delete Tool', color: null, type: null }
];

// Define some starting positions
const startingPositions = [
    { name: "Standard", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" },
    { name: "Empty", fen: "8/8/8/8/8/8/8/8 w - - 0 1"},
    { name: "Kiwipete", fen: "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1" },
    // Add more common starting positions or famous puzzles if desired
];

const DEFAULT_FEN = startingPositions[0].fen;

// --- Component ---
const BoardEditor = () => {
  // --- State Definitions ---
  const [chess, setChess] = useState(() => new Chess(DEFAULT_FEN)); // Initialize safely [6, 7, 8, 14, 15]
  const [currentFen, setCurrentFen] = useState(DEFAULT_FEN);
  const [displayFen, setDisplayFen] = useState(DEFAULT_FEN); // Value shown in the input field
  const [fenError, setFenError] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null); // e.g., 'P', 'n', 'delete'
  const [turn, setTurn] = useState('w'); // 'w' or 'b'
  const [castlingRights, setCastlingRights] = useState({ K: true, Q: true, k: true, q: true });
  const [isCustomizing, setIsCustomizing] = useState(false); // Toggle for advanced controls
  const [messageVisible, setMessageVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success', 'error', 'info'
  const [squareSize, setSquareSize] = useState(60); // Visual size of board squares

  // --- Effects ---
  // Update chess instance and derived state when currentFen changes (internal canonical FEN)
  useEffect(() => {
    try {
      const newChess = new Chess(currentFen); // Create instance from the validated FEN [4]
      setChess(newChess);
      setTurn(newChess.turn()); // Update turn state [4, 13, 16]

      // Update castling rights state from the FEN
      const fenParts = currentFen.split(' ');
      const castlingFen = fenParts[1] || '-'; // Default to '-' if missing
      setCastlingRights({
        K: castlingFen.includes('K'),
        Q: castlingFen.includes('Q'),
        k: castlingFen.includes('k'),
        q: castlingFen.includes('q'),
      });

      // Ensure displayFen matches if currentFen was updated internally (e.g., by piece placement)
      if (displayFen !== currentFen) {
        setDisplayFen(currentFen);
      }
      setFenError(null); // Clear any previous error if FEN update is successful
    } catch (e) {
      // This should ideally not happen if currentFen is always validated before setting,
      // but acts as a safeguard.
      setFenError("Internal Error: Invalid FEN encountered.");
      console.error("Error initializing Chess instance from currentFen:", e, currentFen);
       // Consider reverting to a known good state? e.g., updateFenStates(DEFAULT_FEN);
    }
  }, [currentFen]); // Rerun whenever the canonical FEN changes

  // --- Helper Functions ---
  const showMessage = (msg, type = 'success', duration = 3000) => {
    setMessage(msg);
    setMessageType(type);
    setMessageVisible(true);
    setTimeout(() => setMessageVisible(false), duration);
  };

  // Helper to update both internal FEN and display FEN consistently
  const updateFenStates = (newFen) => {
    setCurrentFen(newFen); // This will trigger the useEffect
    setDisplayFen(newFen); // Update the input field as well
    setFenError(null); // Clear any previous error state
  };

  // --- Event Handlers ---
  const handleFenChange = (e) => {
    setDisplayFen(e.target.value);
    // Clear error message as soon as user starts typing a correction [2, 9, 17, 10, 18, 11, 12]
    // This improves user experience - they know the error is related to the *previous* input
    if (fenError) {
      setFenError(null);
    }
  };

  const applyFen = () => {
    try {
      // Validate the FEN from the input field using chess.js constructor [4]
      // This is the critical validation step.
      new Chess(displayFen);
      // If valid, update the current FEN which triggers useEffect
      setCurrentFen(displayFen); // Update internal state
      setFenError(null); // Ensure error is cleared on success
      showMessage('FEN applied successfully', 'success');
    } catch (e) {
      // If chess.js constructor throws error, it's an invalid FEN [4]
      setFenError("Invalid FEN string. Please check the format.");
      showMessage('Invalid FEN string provided', 'error');
      // Do NOT update currentFen here - keep the last valid state
    }
  };

  const resetBoard = () => {
    updateFenStates(DEFAULT_FEN);
    setSelectedPiece(null);
    setIsCustomizing(false); // Optionally reset advanced view
    showMessage('Board reset to starting position', 'success');
  };

  const clearBoard = () => {
    const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1';
    updateFenStates(emptyFen);
    setSelectedPiece(null);
    setIsCustomizing(false); // Optionally reset advanced view
    showMessage('Board cleared', 'info');
  };

  const copyFen = () => {
    navigator.clipboard.writeText(currentFen)
      .then(() => showMessage('FEN copied to clipboard', 'success'))
      .catch(err => showMessage('Failed to copy FEN', 'error'));
  };

  const handlePieceClick = (pieceId) => {
    // Toggle selection: if clicked piece is already selected, deselect it. Otherwise, select it.
    setSelectedPiece(prev => (prev === pieceId ? null : pieceId));
  };

  // Handles clicks on the chessboard squares for placing/deleting pieces
  const handleBoardClick = useCallback((square) => {
    // Ensure a piece/tool is selected and the chess instance is ready
    if (!selectedPiece || !chess) return;

    // Use chess.fen() which should be derived from the validated currentFen via useEffect
    const currentBoardFen = chess.fen();
    const gameCopy = new Chess(currentBoardFen); // Work on a copy [8]

    try {
      let messageToShow = '';
      let messageType = 'info';

      if (selectedPiece === 'delete') {
        const pieceOnSquare = gameCopy.get(square); // [4]
        if (pieceOnSquare) {
          gameCopy.remove(square); // [4] (chess.js uses remove)
          messageToShow = `Piece removed from ${square}`;
        } else {
          // No action needed if clicking delete on an empty square
          return;
        }
      } else {
        // Find the details of the piece to place from our constant
        const pieceDetails = pieces.find(p => p.id === selectedPiece);
        if (!pieceDetails) return; // Should not happen if selectedPiece is valid

        // Check if the piece being placed is the same as the one already there
        const existingPiece = gameCopy.get(square); // { type: 'p', color: 'w' }
         if (existingPiece && existingPiece.type === pieceDetails.type && existingPiece.color === pieceDetails.color) {
           // If placing the exact same piece type/color, do nothing (or maybe deselect tool?)
           // This prevents unnecessary FEN updates if user clicks multiple times
           return;
         }

        // Remove existing piece first, if any, before placing the new one
        if (existingPiece) {
          gameCopy.remove(square);
        }

        // Place the new piece using chess.js's put method [4]
        const success = gameCopy.put(
          { type: pieceDetails.type, color: pieceDetails.color },
          square
        );

        if (!success) {
            // This might happen if trying to place invalid things like 2 kings of same color
             throw new Error(`Failed to place ${pieceDetails.name} on ${square}. Ensure board validity (e.g., king count).`);
        }
        messageToShow = `${pieceDetails.name} placed on ${square}`;
        messageType = 'success';
      }

      // Generate the new FEN string from the modified copy [19, 20, 13, 8]
      const newFen = gameCopy.fen();
      updateFenStates(newFen); // Update state, which triggers useEffect
      showMessage(messageToShow, messageType);

    } catch (e) {
      console.error("Error modifying board:", e);
      showMessage(`Error modifying board: ${e.message}`, 'error');
      // Do not update FEN state if an error occurred during modification
    }
  }, [selectedPiece, chess, updateFenStates, showMessage]); // Include chess and state setters

  // Handle changing whose turn it is
  const handleTurnChange = (selectedTurn) => {
    if (turn === selectedTurn) return; // No change needed

    const fenParts = currentFen.split(' ');
    if (fenParts.length >= 2) { // Need at least position and turn fields
      fenParts[1] = selectedTurn; // Update the turn part (index 1)
      const newFen = fenParts.join(' ');
      try {
        new Chess(newFen); // Quick validation to ensure the FEN structure is still okay
        updateFenStates(newFen); // Apply the change
        showMessage(`Turn set to ${selectedTurn === 'w' ? 'White' : 'Black'}`, 'info');
      } catch (e) {
        showMessage('Could not set turn (invalid resulting FEN)', 'error');
        console.error("Error setting turn:", e, newFen);
      }
    } else {
        showMessage('Cannot set turn: FEN string is incomplete.', 'error');
    }
  };

  // Handle changing castling rights via checkboxes
  const handleCastlingChange = (right, value) => {
    // Create the potential new rights state
    const newCastlingRights = { ...castlingRights, [right]: value };

    const fenParts = currentFen.split(' ');
    if (fenParts.length >= 3) { // Need position, turn, and castling fields
      // Construct the castling string based on the new rights state
      let castlingString = '';
      if (newCastlingRights.K) castlingString += 'K';
      if (newCastlingRights.Q) castlingString += 'Q';
      if (newCastlingRights.k) castlingString += 'k';
      if (newCastlingRights.q) castlingString += 'q';
      fenParts[2] = castlingString === '' ? '-' : castlingString; // Use '-' if no rights [21, 22, 23, 24, 25]

      const newFen = fenParts.join(' ');
      try {
        new Chess(newFen); // Quick validation
        // If valid, update the main FEN state (triggers useEffect)
        // No need to call setCastlingRights directly, useEffect will handle it
        updateFenStates(newFen);
        // No message needed here, change is instant via checkbox
      } catch (e) {
        showMessage('Could not set castling rights (invalid resulting FEN)', 'error');
        console.error("Error setting castling:", e, newFen);
        // Revert UI state if FEN update failed? (Checkbox would visually revert on next render)
        // setCastlingRights(castlingRights); // This might cause flicker
      }
    } else {
         showMessage('Cannot set castling rights: FEN string is incomplete.', 'error');
    }
  };

 const flipBoard = () => {
     const fenParts = currentFen.split(' ');
     if (fenParts.length < 6) {
         showMessage('Cannot flip board with incomplete FEN (needs all 6 parts)', 'error');
         return;
     }

     // 1. Flip Position (Part 0)
     const position = fenParts[0];
     const rows = position.split('/');
     const flippedRows = rows.map(row => {
         let flippedRow = '';
         // Reverse the order of pieces/numbers within the row string
         for (let i = row.length - 1; i >= 0; i--) {
             const char = row[i];
             if (isNaN(parseInt(char))) { // It's a piece
                 const isUpperCase = char === char.toUpperCase();
                 flippedRow += isUpperCase ? char.toLowerCase() : char.toUpperCase(); // Swap case
             } else { // It's a number (empty squares)
                 flippedRow += char;
             }
         }
         return flippedRow;
     }).reverse(); // Reverse the order of rows (rank 8 becomes rank 1 etc.)
     fenParts[0] = flippedRows.join('/');

     // 2. Flip Turn (Part 1)
     fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';

     // 3. Flip Castling Rights (Part 2)
     let castling = fenParts[2];
     if (castling !== '-') {
         let newCastling = '';
         // Map K->k, Q->q, k->K, q->Q
         if (castling.includes('k')) newCastling += 'K';
         if (castling.includes('q')) newCastling += 'Q';
         if (castling.includes('K')) newCastling += 'k';
         if (castling.includes('Q')) newCastling += 'q';
         // Ensure canonical order (KQkq) for consistency, though chess.js handles variations
         let orderedCastling = '';
         if (newCastling.includes('K')) orderedCastling += 'K';
         if (newCastling.includes('Q')) orderedCastling += 'Q';
         if (newCastling.includes('k')) orderedCastling += 'k';
         if (newCastling.includes('q')) orderedCastling += 'q';
         fenParts[2] = orderedCastling || '-';
     }

     // 4. Flip En Passant Target Square (Part 3)
     if (fenParts[3] !== '-') {
         const file = fenParts[3][0];
         const rank = fenParts[3][1];
         // If original was rank 3 (white pawn double move), new target is rank 6
         // If original was rank 6 (black pawn double move), new target is rank 3
         fenParts[3] = file + (rank === '3' ? '6' : '3');
     }

     // 5 & 6. Halfmove clock (Part 4) and Fullmove number (Part 5) usually remain unchanged
     // or reset depending on context, but for a simple flip, we leave them.

     const newFen = fenParts.join(' ');

     try {
         new Chess(newFen); // Validate the potentially complex flipped FEN
         updateFenStates(newFen);
         showMessage('Board flipped', 'info');
     } catch (e) {
         console.error("Invalid FEN after flipping:", e, newFen);
         showMessage('Error flipping board (invalid resulting FEN)', 'error');
     }
 };


  // --- Render ---
  return (
    <div className={styles.editorPage}>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className={styles.pageTitle}>
              <Settings className="me-2" size={28}/> Chess Board Editor
            </h1>
            <p className={styles.pageSubtitle}>
              Create, customize, and analyze chess positions using FEN.
            </p>
          </Col>
        </Row>

        <Row>
          {/* Board and Controls Column */}
          <Col lg={8}>
            {/* Chessboard */}
            <Card className={styles.boardCard}>
              <Card.Body>
                <div className={styles.boardContainer}>
                  {/* Ensure chess object is available before rendering */}
                  {chess && (
                     <Chessboard
                        id="BoardEditorInstance" // Required if multiple boards exist [5]
                        position={currentFen} // Drive board directly from validated FEN
                        onSquareClick={handleBoardClick} // Use this for placing/deleting [5]
                        boardWidth={Math.min(560, squareSize * 8)} // Responsive width
                        arePiecesDraggable={false} // Disable default drag for editor mode [5]
                        // Custom styles can be added, e.g., highlighting selected square
                        // customSquareStyles={ getSquareStyles() }
                      />
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Controls Card */}
            <Card className={`${styles.controlsCard} mt-3`}>
              <Card.Body>
                <Row>
                  {/* FEN Input and Load Position */}
                  <Col md={6} className="mb-3 mb-md-0">
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="fenInput" className={styles.controlLabel}>
                        <Clipboard size={16} className="me-2" />
                        FEN String
                      </Form.Label>
                      <div className={styles.fenInputGroup}>
                        <Form.Control
                          id="fenInput"
                          type="text"
                          value={displayFen} // Controlled input field
                          onChange={handleFenChange}
                          isInvalid={!!fenError} // Show red border if fenError is not null
                          className={styles.fenInput}
                          aria-describedby="fenHelpBlock"
                          placeholder="Enter FEN string here..."
                        />
                        <Button
                          onClick={applyFen}
                          variant="primary"
                          className={styles.applyButton}
                          // Disable Apply button if input is empty or known invalid? Optional.
                          // disabled={!displayFen || !!fenError}
                        >
                          Apply
                        </Button>
                         <Button variant="outline-secondary" onClick={copyFen} className={styles.copyButton} title="Copy current FEN">
                            <Copy size={16} />
                        </Button>
                      </div>
                      {fenError && (
                        <Form.Control.Feedback type="invalid" id="fenHelpBlock">
                            {fenError}
                        </Form.Control.Feedback>
                      )}
                       {!fenError && <Form.Text muted>Paste a FEN string and click Apply, or edit the board directly.</Form.Text>}
                    </Form.Group>

                    <Dropdown>
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
                              updateFenStates(pos.fen);
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

                  {/* Action Buttons */}
                  <Col md={6}>
                     <Form.Label className={styles.controlLabel}>Board Actions</Form.Label>
                    <div className={styles.actionButtons}>
                       <OverlayTrigger placement="top" overlay={<Tooltip>Reset to standard starting position</Tooltip>}>
                         <Button variant="outline-secondary" onClick={resetBoard} className={styles.actionButton}>
                           <RotateCcw size={16} className="me-1" /> Reset
                         </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Clear all pieces from the board</Tooltip>}>
                          <Button variant="outline-danger" onClick={clearBoard} className={styles.actionButton}>
                           <X size={16} className="me-1" /> Clear
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Flip board orientation and colors</Tooltip>}>
                          <Button variant="outline-secondary" onClick={flipBoard} className={styles.actionButton}>
                            <ArrowLeftRight size={16} className="me-1" /> Flip
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Show/Hide Advanced Options</Tooltip>}>
                          <Button
                            variant="outline-primary"
                            onClick={() => setIsCustomizing(!isCustomizing)}
                            className={styles.actionButton}
                            active={isCustomizing}
                           >
                            <Settings size={16} className="me-1" /> Advanced
                          </Button>
                        </OverlayTrigger>
                    </div>
                  </Col>
                </Row>

                {/* Advanced Settings Section - Conditionally Rendered */}
                {isCustomizing && (
                  <Row className="mt-4 pt-3 border-top">
                    {/* Turn Selection */}
                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label className={styles.controlLabel}>Turn to Move</Form.Label>
                        <div className={styles.turnButtons + " d-flex"}>
                          <Button
                            variant={turn === 'w' ? "light" : "outline-secondary"}
                            onClick={() => handleTurnChange('w')}
                             className={`${styles.turnButton} flex-grow-1 ${turn === 'w' ? styles.activeTurnWhite : ''}`}
                          >
                            White
                          </Button>
                          <Button
                            variant={turn === 'b' ? "dark" : "outline-secondary"}
                            onClick={() => handleTurnChange('b')}
                             className={`${styles.turnButton} flex-grow-1 ${turn === 'b' ? styles.activeTurnBlack : ''}`}
                          >
                            Black
                          </Button>
                        </div>
                      </Form.Group>
                    </Col>

                    {/* Castling Rights */}
                    <Col md={8} className="mb-3">
                        <Form.Group>
                          <Form.Label className={styles.controlLabel}>Castling Availability</Form.Label>
                          <div className={styles.castlingCheckboxes}>
                            {Object.entries({ K: 'White K', Q: 'White Q', k: 'Black K', q: 'Black Q' }).map(([right, label]) => (
                                <Form.Check
                                    inline
                                    key={right}
                                    type="checkbox"
                                    id={`castling-${right}`}
                                    label={label}
                                    checked={castlingRights[right]}
                                    onChange={(e) => handleCastlingChange(right, e.target.checked)}
                                    className={styles.castlingCheck}
                                />
                             ))}
                          </div>
                        </Form.Group>
                    </Col>

                   {/* Board Size Slider (Visual Only) */}
                    <Col md={12} className="mt-md-2">
                        <Form.Group>
                         <Form.Label className={styles.controlLabel}>Visual Board Size</Form.Label>
                          <Form.Range
                            min={35} max={75} step={5} // Adjusted range slightly
                            value={squareSize}
                            onChange={(e) => setSquareSize(parseInt(e.target.value))}
                            className={styles.sizeSlider}
                          />
                           <div className={styles.sizeLabels}>
                               <span>Small</span><span>Medium</span><span>Large</span>
                          </div>
                        </Form.Group>
                    </Col>

                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Piece Palette and Help Column */}
          <Col lg={4} className="mt-3 mt-lg-0">
            {/* Place Pieces Card */}
            <Card className={styles.piecesCard}>
              <Card.Header className={styles.cardHeader}>
                <h5 className="mb-0 d-flex align-items-center"><Info size={18} className="me-2" /> Place/Remove Pieces</h5>
              </Card.Header>
              <Card.Body>
                <div className={styles.instructions}>
                  Select a piece or tool below, then click on the desired square on the board.
                  {selectedPiece && (
                    <div className="mt-2">
                      <Badge
                         pill
                         bg={selectedPiece === 'delete' ? 'danger' : 'primary'}
                         className={styles.selectedPieceBadge}
                       >
                        Selected: {pieces.find(p => p.id === selectedPiece)?.name || 'None'}
                      </Badge>
                       <Button variant="link" size="sm" onClick={() => setSelectedPiece(null)} className="ms-2 p-0" title="Deselect Tool">Clear Selection</Button>
                     </div>
                  )}
                 </div>

                <div className={styles.pieceSelector}>
                   {/* Tools */}
                   <div className={styles.pieceGroup}>
                    <h6 className={styles.pieceGroupTitle}>Tools</h6>
                     <OverlayTrigger placement="top" overlay={<Tooltip>Remove piece from clicked square</Tooltip>}>
                      <Button
                         className={`${styles.deleteButton} ${selectedPiece === 'delete' ? styles.selected : ''}`}
                         onClick={() => handlePieceClick('delete')}
                         variant={selectedPiece === 'delete' ? 'danger' : 'outline-danger'}
                        >
                         <X size={18} />
                         <span className="visually-hidden">Delete Piece</span>
                       </Button>
                    </OverlayTrigger>
                  </div>
                  {/* White Pieces */}
                  <div className={styles.pieceGroup}>
                    <h6 className={styles.pieceGroupTitle}>White Pieces</h6>
                    <div className={styles.piecesGrid}>
                      {pieces.filter(p => p.color === 'w').map(piece => (
                        <OverlayTrigger key={piece.id} placement="top" overlay={<Tooltip>Place {piece.name}</Tooltip>}>
                          <Button
                            className={`${styles.pieceButton} ${selectedPiece === piece.id ? styles.selected : ''}`}
                            onClick={() => handlePieceClick(piece.id)}
                             variant={selectedPiece === piece.id ? 'light' : 'outline-light'} // Use light variant
                          >
                            {/* This div will show the piece via CSS background */}
                            <div className={styles.pieceSpriteWrap} data-piece={piece.id} />
                             <span className="visually-hidden">{piece.name}</span>
                          </Button>
                        </OverlayTrigger>
                      ))}
                    </div>
                  </div>

                  {/* Black Pieces */}
                  <div className={styles.pieceGroup}>
                    <h6 className={styles.pieceGroupTitle}>Black Pieces</h6>
                    <div className={styles.piecesGrid}>
                      {pieces.filter(p => p.color === 'b').map(piece => (
                        <OverlayTrigger key={piece.id} placement="top" overlay={<Tooltip>Place {piece.name}</Tooltip>}>
                          <Button
                            className={`${styles.pieceButton} ${selectedPiece === piece.id ? styles.selected : ''}`}
                            onClick={() => handlePieceClick(piece.id)}
                             variant={selectedPiece === piece.id ? 'dark' : 'outline-secondary'} // Use darker variant
                          >
                            <div className={styles.pieceSpriteWrap} data-piece={piece.id} />
                            <span className="visually-hidden">{piece.name}</span>
                          </Button>
                        </OverlayTrigger>
                      ))}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Help Card */}
            <Card className={`${styles.helpCard} mt-3`}>
                <Card.Header className={styles.cardHeader}>
                  <h5 className="mb-0 d-flex align-items-center"><HelpCircle size={18} className="me-2" /> Help & FEN Info</h5>
                </Card.Header>
                <Card.Body>
                 <div className={styles.helpSection}>
                    <h6>Editing the Board</h6>
                     <ul className={styles.helpList}>
                      <li><strong>Select Tool:</strong> Click a piece or the <X size={14}/> tool in the panel above.</li>
                      <li><strong>Place/Remove:</strong> Click the target square on the chessboard.</li>
                       <li><strong>Load FEN:</strong> Paste a FEN string into the input field and click 'Apply'.</li>
                       <li><strong>Load Preset:</strong> Use the 'Load Position' dropdown.</li>
                       <li><strong>Advanced:</strong> Click 'Advanced' to set turn and castling rights.</li>
                    </ul>
                  </div>
                  <div className={styles.helpSection}>
                    <h6>What is FEN?</h6>
                    <p>Forsyth-Edwards Notation (FEN) is a standard text format to describe a chess position.[21-25] It includes:</p>
                     <ol className={styles.fenPartsList}>
                       <li>Piece placement (from white's perspective, rank 8 to 1).</li>
                       <li>Active color ('w' or 'b').</li>
                      <li>Castling availability ('KQkq', '-', or subset).</li>
                      <li>En passant target square ('-' or algebraic notation like 'e3').</li>
                       <li>Halfmove clock (moves since last capture or pawn advance).</li>
                       <li>Fullmove number (starts at 1, increments after Black's move).</li>
                     </ol>
                    <small>Example: <code>rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</code></small>
                  </div>
                </Card.Body>
              </Card>
          </Col>
        </Row>
      </Container>

      {/* Notification Toast */}
      {messageVisible && (
        <div className={`${styles.notification} ${styles[messageType]}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default BoardEditor;