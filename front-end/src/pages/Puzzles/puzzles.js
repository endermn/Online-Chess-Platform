import React, { useState } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import Chessboard from '../../components/chessboard/chessboard';
import styles from './puzzles.module.css'
import NavSidebar from '../../components/navSidebar/navSidebar';

function PuzzlesPage() {
	const mockProfile = {
		firstName: "Pesho",
		lastName: "Toshev",
		email: "peshotoshev@gmail.com",
		profilePicture: "https://checkshorturl.com/img/long-short-url-pros-cons.jpg",
		history: ["win", "win", "loss", "loss", "win", "win", "win", "win", "win", "win", "win", "win"],
		rating: [1000, 1500, 800, 100],
	}
	
	// TODO: GET request for a random puzzle to the backend
	const puzzle = {
		fen: "8/2K5/8/2k5/2b5/2B5/2Q2n2/8 w - - 0 1",
		index: 100,
		solution: "Qa4",
	}
	
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
	}
	
	return (
		<div className={styles.homeContainer}>
			<Container fluid>
				<Row className='align-items-center'>
					<NavSidebar profile={mockProfile} />
					{/* Main Content */}
					<Col sm={7} md={9} className={`${styles.mainContent} align-self-start`}>
						<h1 className='pt-3'>Puzzle {puzzle.index} - {turn}</h1>
						<div className="d-flex justify-content-between align-items-center mb-3">
							<Button variant='danger' onClick={() => setAnswer(!answer)}>
								{answerButtonName} answer
							</Button>
							
							{puzzleState.solved && (
								<Alert variant="success" className="mb-0 ms-3">
									Puzzle solved correctly!
								</Alert>
							)}
							
							{puzzleState.attempts > 0 && !puzzleState.solved && (
								<div className="ms-3">
									<span>Attempts: {puzzleState.attempts}</span>
								</div>
							)}
						</div>
						
						<Chessboard 
							squareSize={80} 
							fen={puzzle.fen} 
							onMove={onMove} 
							isPuzzle={true}
						/>
						
						{answer && (
							<Alert variant="info" className="mt-3">
								Solution: <strong>{puzzle.solution}</strong>
							</Alert>
						)}
					</Col>
				</Row>
			</Container>
		</div>
	);
}

export default PuzzlesPage;