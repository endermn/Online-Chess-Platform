import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
} from 'react-bootstrap';

import styles from './home.module.css';
import bulletImage from "../../assets/bullet.jpg";
import blitzImage from "../../assets/blitz.png";
import rapidImage from "../../assets/rapid.webp";
import classicalImage from "../../assets/classical.jpeg";
import HistoryCard from '../../components/historyCard/historyCard';
import NavSidebar from '../../components/navSidebar/navSidebar';

function HomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Function to fetch with retry logic
  const fetchWithRetry = async (url, options, maxRetries = 5, delay = 2000) => {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Failed to fetch from ${url}, status: ${response.status}`);
    } catch (error) {
      if (maxRetries <= 0) {
        throw error;
      }
      console.log(`Retrying fetch to ${url} in ${delay}ms... (${maxRetries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, maxRetries - 1, delay * 1.5);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch both resources with retry logic
        const profileData = await fetchWithRetry(
          'http://localhost:8080/profile', 
          { method: 'GET', credentials: 'include' }
        );
        
        const statsData = await fetchWithRetry(
          'http://localhost:8080/user/stats', 
          { method: 'GET', credentials: 'include' }
        );

        const fullProfile = { 
          ...profileData, 
          ...statsData, 
          maxRating: Math.max(
            profileData.BulletRating, 
            profileData.BlitzRating, 
            profileData.RapidRating, 
            profileData.ClassicalRating
          )
        };
        
        localStorage.setItem("profile", JSON.stringify(fullProfile));
        setProfile(fullProfile);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed after multiple retries:", error);
        setError(error.message);
        
        // Schedule another retry after a longer delay
        const retryDelay = Math.min(30000, 1000 * Math.pow(1.5, retryCount));
        console.log(`Scheduling complete retry in ${retryDelay}ms...`);
        
        setTimeout(() => {
          setRetryCount(prevCount => prevCount + 1);
        }, retryDelay);
      }
    };

    fetchProfileData();
  }, [retryCount]); // Depend on retryCount to trigger new attempts

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your profile... {retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Having trouble connecting to the server</h3>
        <p>{error}</p>
        <p>Automatically retrying in a few seconds...</p>
        <Button 
          onClick={() => setRetryCount(prev => prev + 1)}
          variant="primary"
        >
          Retry Now
        </Button>
      </div>
    );
  }

  profile.maxRating = Math.max(profile.BulletRating, profile.BlitzRating, profile.RapidRating, profile.ClassicalRating);

  console.log(profile)

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
    totalGamesDrawn: 5
  };

  let winPercentage = 0;
  if (profile.TotalGames != 0) {
    winPercentage = Math.round((profile.GamesWon / profile.TotalGames) * 100);
  }
  const ratingArr = [profile.BulletRating, profile.BlitzRating, profile.RapidRating, profile.ClassicalRating];

  const gameTypes = [
    {
      name: 'Bullet',
      image: bulletImage,
      color: '#f05454',
      description: '1 min per player',
      path: 'game/bullet'
    },
    {
      name: 'Blitz',
      image: blitzImage,
      color: '#5485f0',
      description: '3-5 min per player',
      path: 'game/blitz'
    },
    {
      name: 'Rapid',
      image: rapidImage,
      color: '#54c0f0',
      description: '10 min per player',
      path: 'game/rapid'
    },
    {
      name: 'Classical',
      image: classicalImage,
      color: '#a554f0',
      description: '15+ min per player',
      path: 'game/classical'
    }
  ];

  return (
    <div className={styles.homeContainer}>
      <Container fluid>
        <Row>
          <NavSidebar profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content */}
          <Col sm={9} md={10} className={styles.mainContent}>
            <div className={styles.headerSection}>
              <h1>Welcome back, {mockProfile.firstName}!</h1>
              <div className={styles.statsCards}>
                <Card className={styles.statCard}>
                  <Card.Body>
                    <div className={styles.statInfo}>
                      <h3>Highest Rating</h3>
                      <h2>{profile.maxRating}</h2>
                    </div>
                  </Card.Body>
                </Card>

                <Card className={styles.statCard}>
                  <Card.Body>
                    <div className={styles.statInfo}>
                      <h3>Win Rate</h3>
                      <h2>{winPercentage}%</h2>
                      <ProgressBar
                        now={winPercentage}
                        variant="success"
                        className={styles.winRateProgress}
                      />
                    </div>
                  </Card.Body>
                </Card>

                <Card className={styles.statCard}>
                  <Card.Body>
                    <div className={styles.statInfo}>
                      <h3>Total Games</h3>
                      <h2>{profile.TotalGames}</h2>
                      <div className={styles.miniStats}>
                        <Badge bg="success">{profile.GamesWon} W</Badge>{' '}
                        <Badge bg="danger">{profile.GamesLost} L</Badge>{' '}
                        <Badge bg="secondary">{profile.TotalGames - profile.GamesLost - profile.GamesWon} D</Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            <div className={styles.gameModes}>
              <h2>Play Chess</h2>
              <Row>
                {gameTypes.map((game, index) => (
                  <Col md={6} lg={3} key={index} >
                    <Card className={styles.gameCard} style={{ color: 'white' }} >
                      <div className={styles.gameCardImageContainer}>
                        <Card.Img
                          src={game.image}
                          alt={game.name}
                          className={styles.gameCardImage}
                        />
                        <div className={styles.gameCardOverlay} style={{ backgroundColor: `${game.color}66` }}></div>
                      </div>
                      <Card.Body>
                        <div className={styles.gameCardHeader}>
                          <Card.Title>{game.name}</Card.Title>
                        </div>
                        <Card.Text className={styles.gameTypeDescription}>
                          {game.description}
                        </Card.Text>
                        <div className={styles.ratingBadge}>
                          Rating: {ratingArr[index] || 500}
                        </div>
                        <Button
                          href={game.path}
                          variant="primary"
                          className={styles.playButton}
                          style={{ backgroundColor: game.color, borderColor: game.color }}
                        >
                          Play Now
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <div className={styles.historySection}>
              <div className={styles.historyHeader}>
                <h2>Recent Games</h2>
              </div>
              <div className={styles.historyContainer}>
                {mockProfile.history.map((item, index) => (
                  <HistoryCard
                    key={index}
                    index={index}
                    item={item}
                    gameType={gameTypes[index % 4].name}
                    opponent="Opponent Player"
                    rating={mockProfile.rating[index % 4]}
                    date={new Date(Date.now() - (index * 86400000)).toLocaleDateString()}
                  />
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default HomePage;