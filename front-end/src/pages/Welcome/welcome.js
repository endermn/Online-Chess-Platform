import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';

import discoveryImage from '../../assets/discoverImage.jpeg';

import styles from "./welcome.module.css";

const Welcome = () => {
	return (
		<div className={styles.main} >
			{/* Navigation Bar */}
			<Navbar variant="dark" className={styles.navBar} >
				<Navbar.Brand className={styles.name}>Chesster</Navbar.Brand>
				<Nav className="mr-auto">
					<Nav.Link href="home">Home</Nav.Link>
					<Nav.Link href="news">News</Nav.Link>
					<Nav.Link href="play">Play</Nav.Link>
					<Nav.Link href="puzzles">Puzzles</Nav.Link>
				</Nav>
				<Nav className="ms-auto">
					<Button variant="outline-light" href='login' className={styles.login} >Log in</Button>
					<Button href='signup' variant="danger" className={styles.register}>Sign up</Button>
				</Nav>
			</Navbar>

			{/* Main Content */}
			<Container fluid className={`${styles.mainContainer} d-flex align-items-center justify-content-around`} >
				<Row>
					<Col md={6} className="text-left">
						<h1 className={styles.discoverHeader} >
							Discover chess tactics & strategies for victory!
						</h1>
						<p style={{ fontSize: '1.1em', marginBottom: '30px' }}>Start your chess journey now.</p>
						<Button href='login' variant="danger" className={styles.start} >
							Start playing
						</Button>
					</Col>
					<Col md={6} className="text-right">
						<Image
							src={discoveryImage}
							alt="Chess Pieces"
							style={{ width: '80%', borderRadius: '15px' }}
							fluid
						/>
						<p style={{ fontSize: '0.8em', marginTop: '10px', textAlign: 'center' }}>Chess, Strategy, Pieces</p>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default Welcome;