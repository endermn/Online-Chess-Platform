import React from 'react';
import { Container, Navbar, Nav, Row, Col, Image} from 'react-bootstrap';
import styles from './profile.module.css'; // Import the CSS module
import StatisticsCard from '../../components/statisticsCard/statisticsCard.js'
import RatingCard from '../../components/ratingCard/ratingCard.js';
import NavSidebar from '../../components/navSidebar/navSidebar.js';


function ProfilePage() {
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
	}

  return (
    <Container fluid className={styles.mainContainer}>
      <Row>
        {/* Sidebar */}
        <NavSidebar profile={mockProfile}/>
        {/* Main Content */}
        <Col xs={10} className={styles.content}>
          <Row className="mb-4">
            {/* Profile Header */}
            <Col xs={4} className={styles.profileHeader}>
              <Image src={mockProfile.profilePicture} roundedCircle className={styles.profileImage} />
              <div>
                <h2 className={styles.userName}>{mockProfile.firstName + " " + mockProfile.lastName}</h2>
                <p className={styles.location}>
                </p>
              </div>
            </Col>

            {/* Rating */}
            <Col xs={8} className={styles.ratingSection}>
              <h2>Rating</h2>
              <RatingCard title="Bullet" rating={mockProfile.rating[0]/30} />
              <RatingCard title="Blitz" rating={mockProfile.rating[1]/30} />
              <RatingCard title="Rapid" rating={mockProfile.rating[2]/30} />
              <RatingCard title="Classical" rating={mockProfile.rating[3]/30} />
            </Col>
          </Row>

          <Row>
            {/* Total Statistics */}
            <Col xs={12}>
              <h2>Total Statistics</h2>
              <Row>
                <Col md={4}>
                  <StatisticsCard title="Total Games Played" value={mockProfile.totalGames} icon="bi bi-check-lg" />
                </Col>
                <Col md={4}>
                  <StatisticsCard title="Games Won" value={mockProfile.totalGamesWon} icon="bi bi-hourglass-split" />
                </Col>
                <Col md={4}>
                  <StatisticsCard title="Games Lost" value={mockProfile.totalGamesLost} icon="bi bi-trophy-fill" />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}


export default ProfilePage;