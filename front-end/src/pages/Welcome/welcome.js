import React, { useEffect } from 'react';
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
  // Animation effect when component mounts
  useEffect(() => {
    const animateElements = () => {
      document.querySelector(`.${styles.navBar}`).classList.add(styles.fadeInDown);
      document.querySelector(`.${styles.contentLeft}`).classList.add(styles.slideInLeft);
      document.querySelector(`.${styles.contentRight}`).classList.add(styles.slideInRight);
    };
    
    // Small delay for animation to start after page load
    setTimeout(animateElements, 300);
  }, []);
  
  return (
    <div className={styles.main}>
      {/* Navigation Bar */}
      <Navbar variant="dark" className={styles.navBar}>
        <Navbar.Brand className={styles.name}>
          <span className={styles.logoText}>C</span>hesster
        </Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="home" className={styles.navLink}>Home</Nav.Link>
          <Nav.Link href="news" className={styles.navLink}>News</Nav.Link>
          <Nav.Link href="home" className={styles.navLink}>Play</Nav.Link>
          <Nav.Link href="puzzles" className={styles.navLink}>Puzzles</Nav.Link>
        </Nav>
        <Nav className="ms-auto">
          <Button variant="outline-light" href='login' className={styles.login}>
            Log in
          </Button>
          <Button href='signup' variant="primary" className={styles.register}>
            Sign up
          </Button>
        </Nav>
      </Navbar>
      
      {/* Main Content */}
      <Container fluid className={`${styles.mainContainer} d-flex align-items-center justify-content-around`}>
        <Row className="w-100">
          <Col md={6} className={`text-left ${styles.contentLeft}`}>
            <h1 className={styles.discoverHeader}>
              Discover chess tactics & strategies for 
              <span className={styles.victoryText}> victory!</span>
            </h1>
            <p className={styles.subtitle}>Start your chess journey now.</p>
            <Button href='login' variant="primary" className={styles.start}>
              <span className={styles.btnContent}>
                Start playing
                <span className={styles.chessPiece}>♞</span>
              </span>
            </Button>
          </Col>
          <Col md={6} className={`text-right ${styles.contentRight}`}>
            <div className={styles.imageContainer}>
              <Image
                src={discoveryImage}
                alt="Chess Pieces"
                className={styles.mainImage}
                fluid
              />
              <div className={styles.imageShadow}></div>
            </div>
            <p className={styles.imageCaption}>Chess, Strategy, Pieces</p>
          </Col>
        </Row>
      </Container>
      
      {/* Animated Background Elements */}
      <div className={styles.chessPiece1}>♜</div>
      <div className={styles.chessPiece2}>♝</div>
      <div className={styles.chessPiece3}>♚</div>
    </div>
  );
};

export default Welcome;