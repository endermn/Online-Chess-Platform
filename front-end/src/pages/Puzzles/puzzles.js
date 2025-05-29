import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    // Alert, // Alert wasn't used, removed import
    Card,
    Offcanvas // Import Offcanvas
} from 'react-bootstrap';
import { FaBars } from 'react-icons/fa'; // Import hamburger icon

// Import CSS Modules if you plan to use it for hamburger styling etc.
// import styles from './puzzles.module.css'; // Keep if used, otherwise remove

// Import Components
import NavSidebar from '../../components/navSidebar/navSidebar'; // Verify path
import ChessGame from '../../components/chess/chess';           // Verify path
const { Chess } = require('chess.js'); // Moved require to top level for clarity

// --- Theme Colors (Keep as is) ---
const blueGreyDark = {
    background: { main: '#1e2433', card: '#2a3446', lighter: '#303c52' },
    text: { primary: '#e6eaf0', secondary: '#a3b0c2', muted: '#697891' },
    accent: { primary: '#5a8de5', secondary: '#384f73', success: '#3b7b6b', error: '#8d5151' },
    border: '#3d4a61'
};

// --- Custom Hook for Fetching (Keep as is) ---
const useFetchRandomPuzzle = (refreshTrigger) => {
    const [puzzle, setPuzzle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRandomPuzzle = async () => {
            try {
                // Reset states on new fetch trigger
                setIsLoading(true);
                setError(null);
                setPuzzle(null); // Clear previous puzzle

                const response = await fetch('http://localhost:8080/puzzle/random', {
                    method: 'GET', credentials: 'include'
                });
                if (!response.ok) { throw new Error('Failed to fetch random puzzle'); }
                const puzzleData = await response.json();
                setPuzzle(puzzleData);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };
        fetchRandomPuzzle();
    }, [refreshTrigger]);

    return { puzzle, isLoading, error };
};


// --- Main Puzzles Page Component ---
function PuzzlesPage() {
    // --- State ---
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { puzzle, isLoading, error } = useFetchRandomPuzzle(refreshTrigger);
    const [answer, setAnswer] = useState(false);
    const [puzzleState, setPuzzleState] = useState({ solved: false, attempts: 0 });
    const chessGameRef = useRef(null);
    const [initialFen, setInitialFen] = useState(null);
    const [showMobileNav, setShowMobileNav] = useState(false); // State for mobile nav
    const [mate, setMate] = useState("");

    // --- Effects ---
    useEffect(() => {
        // Process puzzle when loaded
        if (puzzle && puzzle.fen && puzzle.first_move) { // Add checks for puzzle data
            try {
                 const chess = new Chess(puzzle.fen); // Ensure fen is valid
                 const moveResult = chess.move(puzzle.first_move, { sloppy: true }); // Use sloppy for robustness

                 if (moveResult === null) {
                    console.error("Invalid first move in puzzle data:", puzzle.first_move, "FEN:", puzzle.fen);
                    // Handle error, maybe fetch another puzzle or show error message
                    setInitialFen(puzzle.fen); // Show original FEN if first move fails
                 } else {
                    setInitialFen(chess.fen()); // Set FEN after valid first move
                 }
            } catch (e) {
                 console.error("Chess.js error processing puzzle:", e);
                 setInitialFen(puzzle.fen); // Fallback to original FEN
            }

            // Reset puzzle state
            setPuzzleState({ solved: false, attempts: 0 });
            setAnswer(false);
        } else if (puzzle) {
            // If puzzle exists but lacks FEN or first_move, handle it (e.g., show error or original FEN)
            console.warn("Puzzle data might be incomplete:", puzzle);
            setInitialFen(puzzle.fen || null); // Set FEN if available, otherwise null
        }
    }, [puzzle]);

    // --- Handlers ---
    const handleShowMobileNav = () => setShowMobileNav(true);
    const handleCloseMobileNav = () => setShowMobileNav(false);

    const onMove = (move) => {
        // Ensure puzzle and second_move exist before comparing
        console.log(move)
        console.log("move.lan == correct", move?.lan === puzzle.second_move)
        console.log(puzzle.second_move)
        console.log(move.lan)
        if (puzzle && puzzle.second_move && move.move.lan === puzzle.second_move) { // Use optional chaining and check move.lan
            setPuzzleState(prev => ({ ...prev, solved: true }));
            setAnswer(true); // Show solution on solve
            setTimeout(() => { loadNewPuzzle(); }, 1500); // Load next puzzle
            return true; // Indicate correct move
        }
        setPuzzleState(prev => ({ ...prev, attempts: prev.attempts + 1 }));
        return false; // Indicate incorrect move
    };

    const loadNewPuzzle = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // --- Conditional Renders: Loading, Error, No Puzzle ---
    if (isLoading) {
        return ( <div style={{ backgroundColor: blueGreyDark.background.main, color: blueGreyDark.text.primary, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div>Loading puzzle...</div></div> );
    }
    if (error) {
        return ( <div style={{ backgroundColor: blueGreyDark.background.main, color: blueGreyDark.text.primary, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div>Error: {error} <Button variant="warning" onClick={loadNewPuzzle} size="sm" className="ms-2">Retry</Button></div></div> );
    }
    if (!puzzle || !initialFen) { // Also wait for initialFen to be set
        return ( <div style={{ backgroundColor: blueGreyDark.background.main, color: blueGreyDark.text.primary, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div>No puzzle available or failed to process. <Button variant="primary" onClick={loadNewPuzzle} size="sm" className="ms-2">Load New</Button></div></div> );
    }

    // --- Derived State ---
    // Check turn based on the FEN *after* the first move
    const turn = initialFen?.split(' ')[1] === 'w' ? "White to play" : "Black to play";
    const answerButtonName = answer ? 'Hide' : 'Reveal';


    // --- Main Render ---
    return (
        <div style={{ backgroundColor: blueGreyDark.background.main, color: blueGreyDark.text.primary, minHeight: '100vh' }}>

            {/* Hamburger Button: Fixed Position, Mobile Only */}
             <Button
                 variant="dark" // Or choose a variant that fits
                 className="d-md-none" // Show below md
                 onClick={handleShowMobileNav}
                 aria-controls="offcanvasNavbar-puzzle"
                 aria-label="Toggle navigation"
                 style={{ // Basic positioning - use CSS Modules for better management
                     position: 'fixed',
                     top: '15px',
                     left: '15px',
                     zIndex: 1051, // Above Offcanvas backdrop
                     fontSize: '1.25rem',
                     padding: '0.3rem 0.6rem'
                 }}
             >
                 <FaBars />
             </Button>

            <Container fluid>
                {/* Use standard Row */}
                <Row>
                    {/* Sidebar Column: Provides space for Offcanvas content on desktop */}
                    <Col md={3} lg={2} className="p-0">
                         {/* Offcanvas handles BOTH mobile toggle AND direct desktop rendering */}
                         <Offcanvas
                             show={showMobileNav}
                             onHide={handleCloseMobileNav}
                             responsive="md" // Key: Renders content directly in DOM >= md
                             placement="start"
                             // Use inline styles or CSS module for Offcanvas background
                             style={{ backgroundColor: blueGreyDark.background.card, color: blueGreyDark.text.primary }}
                             id="offcanvasNavbar-puzzle"
                             aria-labelledby="offcanvasNavbarLabel-puzzle"
                         >
                             {/* Header only visible when it's an offcanvas (mobile) */}
                             <Offcanvas.Header closeButton closeVariant='white' className="d-md-none" style={{borderBottom: `1px solid ${blueGreyDark.border}`}}>
                                 <Offcanvas.Title id="offcanvasNavbarLabel-puzzle">Menu</Offcanvas.Title>
                             </Offcanvas.Header>
                             {/* Body contains the sidebar content */}
                             <Offcanvas.Body className="p-0">
                                 {/* Pass close handler so links can close the menu */}
                                 <NavSidebar onLinkClick={handleCloseMobileNav} />
                             </Offcanvas.Body>
                         </Offcanvas>
                    </Col>

                    {/* Main Content Column */}
                    {/* Adjusted column props: xs=12, removed sm, keep md/lg */}
                    <Col xs={12} md={9} lg={10} className="py-4">
                        {/* Using a Card for the main puzzle area */}
                        <Card style={{ backgroundColor: blueGreyDark.background.card, borderRadius: '12px', border: `1px solid ${blueGreyDark.border}`, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)', marginBottom: '24px' }}>
                            <Card.Body className="p-4">

                                {/* Puzzle Header */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div>
                                        <h2 style={{ color: blueGreyDark.text.primary, fontWeight: '600', marginBottom: '5px' }}>Puzzle #{puzzle.index}</h2>
                                        <div style={{ width: '60px', height: '3px', backgroundColor: blueGreyDark.accent.primary, borderRadius: '2px', marginBottom: '10px' }}></div>
                                    </div>
                                    <span style={{ backgroundColor: blueGreyDark.accent.secondary, color: blueGreyDark.text.primary, padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500', border: `1px solid ${blueGreyDark.border}` }}>{turn}</span>
                                </div>

                                {/* Chessboard Container */}
                                <Card style={{ backgroundColor: blueGreyDark.background.lighter, borderRadius: '8px', border: `1px solid ${blueGreyDark.border}`, position: 'relative', marginBottom: '20px' }}>
                                    <Card.Body className="p-3 d-flex justify-content-center align-items-center">
                                        {/* Solved Badge */}
                                        {puzzleState.solved && ( <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(59, 123, 107, 0.9)', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500', zIndex: 10, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}><i className="fas fa-check-circle me-2"></i> Solved!</div> )}
                                        {/* Chess Game Component */}
                                        {initialFen && (
                                            <ChessGame
                                                ref={chessGameRef}
                                                // Adjust size dynamically? Example fixed size:
                                                // Consider calculating based on container width
                                                boardWidth={Math.min(560, window.innerWidth - 120)} // Example dynamic width
                                                fen={initialFen}
                                                onMove={onMove}
                                                setMate={setMate}
                                                isPuzzle={true}
                                                // Pass theme colors?
                                                lightSquareColor={blueGreyDark.text.primary}
                                                darkSquareColor={blueGreyDark.accent.secondary}
                                            />
                                        )}
                                    </Card.Body>
                                </Card>

                                {/* Control Buttons & Attempts */}
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2"> {/* Added gap */}
                                    <div>
                                        <Button onClick={() => setAnswer(!answer)} style={{ backgroundColor: answer ? 'transparent' : blueGreyDark.accent.primary, borderColor: blueGreyDark.accent.primary, color: answer ? blueGreyDark.accent.primary : '#ffffff', borderRadius: '6px', padding: '8px 16px', fontSize: '0.95rem', fontWeight: '500', boxShadow: answer ? 'none' : '0 2px 5px rgba(0, 0, 0, 0.2)', transition: 'all 0.2s ease', marginRight: '10px' }}>
                                            <i className={`fas fa-${answer ? 'eye-slash' : 'eye'} me-2`}></i> {answerButtonName} solution
                                        </Button>
                                        <Button onClick={loadNewPuzzle} style={{ backgroundColor: blueGreyDark.background.lighter, borderColor: blueGreyDark.border, color: blueGreyDark.text.primary, borderRadius: '6px', padding: '8px 16px', fontSize: '0.95rem', fontWeight: '500', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', transition: 'all 0.2s ease' }}>
                                            <i className="fas fa-sync-alt me-2"></i> Next puzzle
                                        </Button>
                                    </div>
                                    {/* Attempts Counter */}
                                    {!puzzleState.solved && puzzleState.attempts > 0 && (
                                        <div style={{ backgroundColor: 'rgba(141, 81, 81, 0.2)', border: `1px solid ${blueGreyDark.accent.error}`, color: '#e5a5a5', padding: '6px 14px', borderRadius: '6px', fontSize: '0.9rem' }}>
                                            <i className="fas fa-times-circle me-2"></i> Attempts: <strong>{puzzleState.attempts}</strong>
                                        </div>
                                    )}
                                </div>

                                {/* Revealed Answer Area */}
                                {answer && (
                                    <div style={{ backgroundColor: 'rgba(90, 141, 229, 0.15)', border: `1px solid ${blueGreyDark.accent.primary}`, borderLeft: `4px solid ${blueGreyDark.accent.primary}`, color: blueGreyDark.text.primary, padding: '16px', borderRadius: '6px', marginTop: '20px' }}>
                                        <h5 style={{ marginBottom: '0', fontWeight: '600', color: blueGreyDark.accent.primary }}>
                                            <i className="fas fa-lightbulb me-2"></i> Initial Move: <strong>{puzzle.first_move}</strong> | Solution: <strong>{puzzle.second_move}</strong>
                                        </h5>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* You could add more puzzle-related content here if needed */}

                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default PuzzlesPage;