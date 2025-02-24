import React, { useState } from 'react';
import { Container, Row, Col} from 'react-bootstrap';
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

  return (

		<div className={styles.homeContainer}>
			<Container fluid>
				<Row>
					<NavSidebar profile={mockProfile}/>
					{/* Main Content */}
					<Col sm={9} md={10} className={styles.mainContent}>
						<Chessboard initialFen={"1r2r2k/1p1n3R/p1qp2pB/6Pn/P1Pp/3B4/1P2PQ1K/5R b - - 0 1"}/>
					</Col>
				</Row>
			</Container>
		</div>

  );
}

export default PuzzlesPage;