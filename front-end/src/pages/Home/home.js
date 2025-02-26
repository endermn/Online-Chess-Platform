import React from 'react';
import {
	Container,
	Row,
	Col,
	Navbar,
	Nav,
	Card,
	Image,
	Button,
} from 'react-bootstrap';


import styles from './home.module.css'; 
import bulletImage from "../../assets/bullet.jpg"
import blitzImage from "../../assets/blitz.png"
import rapidImage from "../../assets/rapid.webp"
import classicalImage from "../../assets/classical.jpeg"
import HistoryCard from '../../components/historyCard/historyCard';
import NavSidebar from '../../components/navSidebar/navSidebar';

function HomePage() {
	const mockProfile = {
		firstName: "Pesho",
		lastName: "Toshev",
		email: "peshotoshev@gmail.com",
		profilePicture: "https://checkshorturl.com/img/long-short-url-pros-cons.jpg",
		history: ["win", "win", "loss", "loss", "win", "win", "win", "win", "win", "win", "win", "win"],
		rating: [1000, 1500, 800, 100],
	}

	const historyElements = [];
	for(let i = 0; i < mockProfile.history.length; i++) {
		const item = mockProfile.history[i];
		historyElements.push(<HistoryCard key={i} index={i} item={item}/>);
	}
	return (
		<div className={styles.homeContainer}>
			<Container fluid>
				<Row>
					<NavSidebar profile={mockProfile}/>
					{/* Main Content */}
					<Col sm={9} md={10} className={styles.mainContent}>
						<h1 style={{fontSize: "32px"}}>Home</h1>

						<Row className={styles.cardRow}>
							<Col >
								{/* Bullet Card */}
								<Card className={`bg-dark text-white mb-3 ${styles.gameCard}`}>
									<Card.Img
										src={bulletImage}
										alt="Bullet"
										style={{ height: '150px', objectFit: 'cover' }}
									/>
									<Card.ImgOverlay>
										<Card.Title className={styles.playCardTitle} >Bullet</Card.Title>
										<Button href="play/bullet" variant="danger" className={styles.playButton}>Play</Button>
									</Card.ImgOverlay>
								</Card>

								{/* Blitz Card */}
								<Card className={`bg-dark text-white mb-3 ${styles.gameCard}`}>
									<Card.Img
										src={blitzImage}
										alt="Blitz"
										style={{ height: '150px', objectFit: 'cover' }}
									/>
									<Card.ImgOverlay>
										<Card.Title className={styles.playCardTitle} >Blitz</Card.Title>
										<Button href="play/blitz" variant="danger" className={styles.playButton}>Play</Button>
									</Card.ImgOverlay>
								</Card>
							</Col>
							<Col>
								{/* Rapid Card */}
								<Card className={`bg-dark text-white mb-3 ${styles.gameCard}`}>
									<Card.Img
										src={rapidImage}
										alt="Rapid"
										style={{ height: '150px', objectFit: 'cover' }}
									/>
									<Card.ImgOverlay>
										<Card.Title className={styles.playCardTitle} >Rapid</Card.Title>
										<Button href="play/rapid" variant="danger" className={styles.playButton}>Play</Button>
									</Card.ImgOverlay>
								</Card>

								{/* Classical Card */}
								<Card className={`bg-dark text-white mb-3 ${styles.gameCard}`}>
									<Card.Img
										src={classicalImage}
										alt="Classical"
										style={{ height: '150px', objectFit: 'cover' }}
									/>
									<Card.ImgOverlay>
										<Card.Title className={styles.playCardTitle} >Classical</Card.Title>
										<Button href="play/classical" variant="danger" className={styles.playButton}>Play</Button>
									</Card.ImgOverlay>
								</Card>

							</Col>
						</Row>
						<h2 style={{fontSize: '24px'}}>History</h2>
						<Container>
							<Row>
								<Col>
									<div style={{overflowY: 'scroll', maxHeight: '400px'}}>
										{historyElements}
									</div>
								</Col>
							</Row>
						</Container>
					</Col>
				</Row>
			</Container>
		</div>
	);
}

export default HomePage;