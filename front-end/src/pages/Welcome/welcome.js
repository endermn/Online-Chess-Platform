import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import discoveryImage from '../../assets/discoverImage.jpeg'; // Verify path
import styles from "./welcome.module.css"; // Verify path

const Welcome = () => {
  // Original Animation effect when component mounts
  useEffect(() => {
    function deleteAllCookies() {
      document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      });
    }
  
    deleteAllCookies();
    const animateElements = () => {
      try {
        // Use querySelector safely
        const navBar = document.querySelector(`.${styles.navBar}`);
        const contentLeft = document.querySelector(`.${styles.contentLeft}`);
        const contentRight = document.querySelector(`.${styles.contentRight}`);

        // Apply original entrance animations
        if (navBar) navBar.classList.add(styles.fadeInDown);
        if (contentLeft) contentLeft.classList.add(styles.slideInLeft);
        if (contentRight) contentRight.classList.add(styles.slideInRight);
      } catch (error) {
        console.error("Animation failed:", error);
      }
    };

    // Small delay for animation to start after page load
    const timerId = setTimeout(animateElements, 300);
    return () => clearTimeout(timerId); // Cleanup timeout

  }, []);

  return (
    // Added overflow-hidden as a precaution for animations
    <div className={`${styles.main} overflow-hidden`}>
      {/* Navigation Bar: Now collapsible on mobile (below md) */}
      <Navbar variant="dark" className={styles.navBar} expand="md">
        <Container fluid>
          <Navbar.Brand href="/" className={styles.name}> {/* Link brand to home */}
            <span className={styles.logoText}>C</span>hesster
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="welcome-navbar-nav" />
          <Navbar.Collapse id="welcome-navbar-nav">
            {/* Original Nav buttons, now inside Collapse */}
            <Nav className="ms-auto align-items-center">
              <Button variant="outline-light" href='login' className={`${styles.login} me-2 mb-2 mb-md-0`}>
                Log in
              </Button>
              <Button href='signup' variant="primary" className={`${styles.register} mb-2 mb-md-0`}>
                Sign up
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      {/* Container uses flex for alignment, adjusts direction for mobile */}
      {/* Added vertical padding py-5 */}
      <Container fluid className={`${styles.mainContainer} d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-around py-5`}>
        {/* Row uses align-items-center for vertical centering */}
        <Row className="align-items-center w-100">
          {/* Left Column: Stacks first on mobile */}
          {/* Added responsive text alignment & mobile margin */}
          <Col md={6} className={`${styles.contentLeft} text-center text-md-start mb-5 mb-md-0`}>
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

          {/* Right Column: Stacks second on mobile */}
          {/* Added responsive text alignment */}
          <Col md={6} className={`${styles.contentRight} text-center text-md-end`}>
            <div className={styles.imageContainer}>
              <Image
                src={discoveryImage}
                alt="Chess board with pieces" // Updated alt text
                className={styles.mainImage}
                fluid // Crucial for responsiveness
              />
              <div className={styles.imageShadow}></div>
            </div>
            <p className={`${styles.imageCaption} mt-2`}>Chess, Strategy, Pieces</p>
          </Col>
        </Row>
      </Container>

      {/* Animated Background Elements - Responsiveness handled in CSS */}
      <div className={styles.chessPiece1}>♜</div>
      <div className={styles.chessPiece2}>♝</div>
      <div className={styles.chessPiece3}>♚</div>
    </div>
  );
};

export default Welcome;