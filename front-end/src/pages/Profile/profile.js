import React, { useState } from 'react';
import { Container, Row, Col, Image, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './profile.module.css';
import StatisticsCard from '../../components/statisticsCard/statisticsCard.js';
import RatingCard from '../../components/ratingCard/ratingCard.js';
import NavSidebar from '../../components/navSidebar/navSidebar.js';
import defaultPfp from '../../assets/default_pfp.webp'

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
  };

  const profile = JSON.parse(localStorage.getItem("profile"))
  const ratingArr = [profile.BulletRating, profile.BlitzRating, profile.RapidRating, profile.ClassicalRating]

  const [activeRatingCard, setActiveRatingCard] = useState(null);
  const [historyHover, setHistoryHover] = useState(null);
  const [expandedStats, setExpandedStats] = useState(false);

  // Dark theme color palette (unchanged)
  const darkTheme = {
    background: {
      main: '#1a1e2e',
      card: '#252a3a',
      accent: '#2c3347'
    },
    text: {
      primary: '#e6e9f0',
      secondary: '#a0aabe',
      accent: '#4dabff'
    },
    border: '#3a4359',
    gradient: 'linear-gradient(135deg, #2b3653, #1c2538)'
  };

  // CSS for custom components with added interactivity
  const customStyles = {
    mainContainer: {
      backgroundColor: darkTheme.background.main,
      color: darkTheme.text.primary,
      minHeight: '100vh',
      padding: '20px 0'
    },
    content: {
      paddingTop: '20px',
      paddingLeft: '30px'
    },
    profileCard: {
      backgroundColor: darkTheme.background.card,
      borderRadius: '15px',
      border: 'none',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
      padding: '25px',
      marginBottom: '25px',
      transition: 'box-shadow 0.3s ease'
    },
    profileCardHover: {
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.25)'
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    profileImage: {
      width: '120px',
      height: '120px',
      border: `4px solid ${darkTheme.border}`,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    profileImageHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
    },
    userName: {
      color: darkTheme.text.primary,
      fontSize: '28px',
      fontWeight: '600',
      marginBottom: '5px'
    },
    sectionTitle: {
      color: darkTheme.text.accent,
      fontSize: '22px',
      fontWeight: '600',
      marginBottom: '20px',
      position: 'relative',
      paddingBottom: '10px',
      cursor: 'pointer',
      display: 'inline-block'
    },
    titleBar: {
      content: '""',
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '50px',
      height: '3px',
      background: darkTheme.text.accent,
      borderRadius: '3px',
      transition: 'width 0.3s ease'
    },
    titleBarHover: {
      width: '100%'
    },
    ratingContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px'
    },
    statsRow: {
      marginTop: '15px'
    },
    ratingCard: {
      backgroundColor: darkTheme.background.accent,
      border: 'none',
      borderRadius: '12px',
      flex: '1',
      minWidth: '200px',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    ratingCardActive: {
      transform: 'translateY(-10px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
    },
    statCard: {
      backgroundColor: darkTheme.background.accent,
      border: 'none',
      borderRadius: '12px',
      height: '100%',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    statCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
    },
    historyBubble: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    historyBubbleHover: {
      transform: 'scale(1.15)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
    },
    winRateBar: {
      height: '10px', 
      backgroundColor: darkTheme.background.accent,
      borderRadius: '5px',
      overflow: 'hidden',
      position: 'relative',
      transition: 'height 0.3s ease',
      cursor: 'pointer'
    },
    winRateBarHover: {
      height: '15px'
    },
    winRateFill: {
      height: '100%',
      background: 'linear-gradient(to right, #3a7bd5, #3498db)',
      borderRadius: '5px',
      transition: 'transform 0.5s ease-out',
      transformOrigin: 'left'
    }
  };

  // Function to toggle section expansion
  const toggleStatsExpansion = () => {
    setExpandedStats(!expandedStats);
  };

  const [profileCardHover, setProfileCardHover] = useState(false);
  const [profileImageHover, setProfileImageHover] = useState(false);
  const [sectionTitleHover, setSectionTitleHover] = useState({
    profile: false,
    rating: false,
    stats: false
  });
  const [winRateHover, setWinRateHover] = useState(false);
  const [showWinRate, setShowWinRate] = useState(false);
  const [statCardHover, setStatCardHover] = useState(null);

  // Animation for win rate fill
  React.useEffect(() => {
    if (showWinRate) {
      const winRateFill = document.getElementById('winRateFill');
      if (winRateFill) {
        winRateFill.style.transform = `scaleX(1)`;
      }
    }
  }, [showWinRate]);

  return (
    <div style={customStyles.mainContainer}>
      <Container fluid>
        <Row>
          {/* Sidebar */}
          <NavSidebar />
          
          {/* Main Content */}
          <Col xs={10} style={customStyles.content}>
            {/* Profile Card */}
            <Card 
              style={{
                ...customStyles.profileCard,
                ...(profileCardHover ? customStyles.profileCardHover : {})
              }}
              onMouseEnter={() => setProfileCardHover(true)}
              onMouseLeave={() => setProfileCardHover(false)}
            >
              <Card.Body>
                <Row>
                  <Col lg={4}>
                    <div style={customStyles.profileHeader}>
                      <Image 
                        src={profile.PictureFileName || defaultPfp} 
                        roundedCircle 
                        style={{
                          ...customStyles.profileImage,
                          ...(profileImageHover ? customStyles.profileImageHover : {})
                        }}
                        onMouseEnter={() => setProfileImageHover(true)}
                        onMouseLeave={() => setProfileImageHover(false)}
                      />
                      <div>
                        <h2 style={customStyles.userName}>
                          {profile.FullName}
                        </h2>
                        <p style={{ color: darkTheme.text.secondary }}>
                          {profile.Email}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          gap: '5px', 
                          marginTop: '10px',
                          color: darkTheme.text.secondary
                        }}>
                          <i className="bi bi-geo-alt"></i>
                        </div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col lg={8}>
                    <h3 
                      style={{
                        ...customStyles.sectionTitle,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={() => setSectionTitleHover({...sectionTitleHover, profile: true})}
                      onMouseLeave={() => setSectionTitleHover({...sectionTitleHover, profile: false})}
                    >
                      Game History
                      <div style={{
                        ...customStyles.titleBar,
                        ...(sectionTitleHover.profile ? customStyles.titleBarHover : {})
                      }}></div>
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      flexWrap: 'wrap',
                      marginBottom: '20px'
                    }}>
                      {mockProfile.history.map((result, index) => (
                        <OverlayTrigger
                          key={index}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-${index}`}>
                              Game {index + 1}: {result === 'win' ? 'Victory' : 'Defeat'}
                            </Tooltip>
                          }
                        >
                          <div 
                            style={{
                              ...customStyles.historyBubble,
                              backgroundColor: result === 'win' ? '#2a623d' : '#733a3a',
                              ...(historyHover === index ? customStyles.historyBubbleHover : {})
                            }}
                            onMouseEnter={() => setHistoryHover(index)}
                            onMouseLeave={() => setHistoryHover(null)}
                          >
                            {result === 'win' ? 'W' : 'L'}
                          </div>
                        </OverlayTrigger>
                      ))}
                    </div>
                    
                    <div>
                      <h4 style={{ 
                        fontSize: '16px', 
                        color: darkTheme.text.secondary,
                        marginBottom: '10px' 
                      }}>
                        Win rate
                      </h4>
                      <div 
                        style={{ 
                          ...customStyles.winRateBar,
                          ...(winRateHover ? customStyles.winRateBarHover : {})
                        }}
                        onMouseEnter={() => {
                          setWinRateHover(true);
                          setShowWinRate(true);
                        }}
                        onMouseLeave={() => setWinRateHover(false)}
                      >
                        <div 
                          id="winRateFill"
                          style={{ 
                            ...customStyles.winRateFill,
                            width: `${(profile.GamesWon / profile.TotalGames) * 100 || 0}%`,
                            transform: showWinRate ? 'scaleX(1)' : 'scaleX(0)'
                          }}
                        ></div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginTop: '5px',
                        fontSize: '14px',
                        color: darkTheme.text.secondary
                      }}>
                        <span>{Math.round((profile.GamesWon / profile.TotalGames) * 100) || 0}%</span>
                        <span>{profile.GamesWon} wins / {profile.GamesLost} losses</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            {/* Rating Card */}
            <Card style={customStyles.profileCard}>
              <Card.Body>
                <h3 
                  style={customStyles.sectionTitle}
                  onMouseEnter={() => setSectionTitleHover({...sectionTitleHover, rating: true})}
                  onMouseLeave={() => setSectionTitleHover({...sectionTitleHover, rating: false})}
                >
                  Rating
                  <div style={{
                    ...customStyles.titleBar,
                    ...(sectionTitleHover.rating ? customStyles.titleBarHover : {})
                  }}></div>
                </h3>
                <div style={customStyles.ratingContainer}>
                  {[
                    {title: "Bullet", index: 0},
                    {title: "Blitz", index: 1},
                    {title: "Rapid", index: 2},
                    {title: "Classical", index: 3}
                  ].map((item) => (
                    <Card 
                      key={item.title}
                      style={{ 
                        ...customStyles.ratingCard,
                        ...(activeRatingCard === item.index ? customStyles.ratingCardActive : {})
                      }}
                      onMouseEnter={() => setActiveRatingCard(item.index)}
                      onMouseLeave={() => setActiveRatingCard(null)}
                    >
                      <Card.Body>
                        <h4 style={{ color: darkTheme.text.accent }}>{item.title}</h4>
                        <h2 style={{ color: darkTheme.text.primary, fontSize: '32px' }}>
                          {ratingArr[item.index]}
                        </h2>
                        <RatingCard title={item.title} rating={ratingArr[item.index]/30} />
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
            
            {/* Statistics Card */}
            <Card style={customStyles.profileCard}>
              <Card.Body>
                <h3 
                  style={customStyles.sectionTitle}
                  onClick={toggleStatsExpansion}
                  onMouseEnter={() => setSectionTitleHover({...sectionTitleHover, stats: true})}
                  onMouseLeave={() => setSectionTitleHover({...sectionTitleHover, stats: false})}
                >
                  Total Statistics
                  <div style={{
                    ...customStyles.titleBar,
                    ...(sectionTitleHover.stats ? customStyles.titleBarHover : {})
                  }}></div>
                </h3>
                <Row style={customStyles.statsRow}>
                  {[
                    {title: "Total Games Played", value: profile.TotalGames, icon: "bi-check-lg", color: darkTheme.text.accent, index: 0},
                    {title: "Games Won", value: profile.GamesWon, icon: "bi-trophy-fill", color: "#3a7bd5", index: 1},
                    {title: "Games Lost", value: profile.GamesLost, icon: "bi-x-lg", color: "#e74c3c", index: 2}
                  ].map((stat) => (
                    <Col md={4} key={stat.index}>
                      <Card 
                        style={{ 
                          ...customStyles.statCard,
                          ...(statCardHover === stat.index ? customStyles.statCardHover : {})
                        }}
                        onMouseEnter={() => setStatCardHover(stat.index)}
                        onMouseLeave={() => setStatCardHover(null)}
                      >
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                          <div style={{ 
                            fontSize: '36px', 
                            color: stat.color,
                            marginBottom: '15px',
                            transition: 'transform 0.3s ease',
                            transform: statCardHover === stat.index ? 'scale(1.2)' : 'scale(1)'
                          }}>
                            <i className={`bi ${stat.icon}`}></i>
                          </div>
                          <h3 style={{ 
                            fontSize: '42px', 
                            fontWeight: 'bold',
                            color: darkTheme.text.primary,
                            marginBottom: '10px'
                          }}>
                            {stat.value}
                          </h3>
                          <p style={{ 
                            color: darkTheme.text.secondary,
                            fontSize: '16px',
                            textAlign: 'center',
                            margin: 0
                          }}>
                            {stat.title}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProfilePage;