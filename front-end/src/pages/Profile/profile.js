import React from 'react';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';
import styles from './profile.module.css';
import StatisticsCard from '../../components/statisticsCard/statisticsCard.js';
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
  };

  // Dark theme color palette
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

  // CSS for custom components
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
      marginBottom: '25px'
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
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
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
      paddingBottom: '10px'
    },
    titleBar: {
      content: '""',
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '50px',
      height: '3px',
      background: darkTheme.text.accent,
      borderRadius: '3px'
    },
    ratingContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px'
    },
    statsRow: {
      marginTop: '15px'
    }
  };

  return (
    <div style={customStyles.mainContainer}>
      <Container fluid>
        <Row>
          {/* Sidebar */}
          <NavSidebar profile={mockProfile} />
          
          {/* Main Content */}
          <Col xs={10} style={customStyles.content}>
            {/* Profile Card */}
            <Card style={customStyles.profileCard}>
              <Card.Body>
                <Row>
                  <Col lg={4}>
                    <div style={customStyles.profileHeader}>
                      <Image 
                        src={mockProfile.profilePicture} 
                        roundedCircle 
                        style={customStyles.profileImage} 
                      />
                      <div>
                        <h2 style={customStyles.userName}>
                          {mockProfile.firstName} {mockProfile.lastName}
                        </h2>
                        <p style={{ color: darkTheme.text.secondary }}>
                          {mockProfile.email}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          gap: '5px', 
                          marginTop: '10px',
                          color: darkTheme.text.secondary
                        }}>
                          <i className="bi bi-geo-alt"></i>
                          <span>Chess Master</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col lg={8}>
                    <h3 style={customStyles.sectionTitle}>
                      Game History
                      <div style={customStyles.titleBar}></div>
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      flexWrap: 'wrap',
                      marginBottom: '20px'
                    }}>
                      {mockProfile.history.map((result, index) => (
                        <div 
                          key={index} 
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: result === 'win' ? '#2a623d' : '#733a3a',
                            color: 'white',
                            fontSize: '14px'
                          }}
                        >
                          {result === 'win' ? 'W' : 'L'}
                        </div>
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
                      <div style={{ 
                        height: '10px', 
                        backgroundColor: darkTheme.background.accent,
                        borderRadius: '5px',
                        overflow: 'hidden',
                        position: 'relative' 
                      }}>
                        <div style={{ 
                          width: `${(mockProfile.totalGamesWon / mockProfile.totalGames) * 100}%`, 
                          height: '100%',
                          background: 'linear-gradient(to right, #3a7bd5, #3498db)',
                          borderRadius: '5px'
                        }}></div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginTop: '5px',
                        fontSize: '14px',
                        color: darkTheme.text.secondary
                      }}>
                        <span>{Math.round((mockProfile.totalGamesWon / mockProfile.totalGames) * 100)}%</span>
                        <span>{mockProfile.totalGamesWon} wins / {mockProfile.totalGamesLost} losses</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            {/* Rating Card */}
            <Card style={customStyles.profileCard}>
              <Card.Body>
                <h3 style={customStyles.sectionTitle}>
                  Rating
                  <div style={customStyles.titleBar}></div>
                </h3>
                <div style={customStyles.ratingContainer}>
                  <Card style={{ 
                    backgroundColor: darkTheme.background.accent,
                    border: 'none',
                    borderRadius: '12px',
                    flex: '1',
                    minWidth: '200px'
                  }}>
                    <Card.Body>
                      <h4 style={{ color: darkTheme.text.accent }}>Bullet</h4>
                      <h2 style={{ color: darkTheme.text.primary, fontSize: '32px' }}>
                        {mockProfile.rating[0]}
                      </h2>
                      <RatingCard title="Bullet" rating={mockProfile.rating[0]/30} />
                    </Card.Body>
                  </Card>
                  
                  <Card style={{ 
                    backgroundColor: darkTheme.background.accent,
                    border: 'none',
                    borderRadius: '12px',
                    flex: '1',
                    minWidth: '200px'
                  }}>
                    <Card.Body>
                      <h4 style={{ color: darkTheme.text.accent }}>Blitz</h4>
                      <h2 style={{ color: darkTheme.text.primary, fontSize: '32px' }}>
                        {mockProfile.rating[1]}
                      </h2>
                      <RatingCard title="Blitz" rating={mockProfile.rating[1]/30} />
                    </Card.Body>
                  </Card>
                  
                  <Card style={{ 
                    backgroundColor: darkTheme.background.accent,
                    border: 'none',
                    borderRadius: '12px',
                    flex: '1',
                    minWidth: '200px'
                  }}>
                    <Card.Body>
                      <h4 style={{ color: darkTheme.text.accent }}>Rapid</h4>
                      <h2 style={{ color: darkTheme.text.primary, fontSize: '32px' }}>
                        {mockProfile.rating[2]}
                      </h2>
                      <RatingCard title="Rapid" rating={mockProfile.rating[2]/30} />
                    </Card.Body>
                  </Card>
                  
                  <Card style={{ 
                    backgroundColor: darkTheme.background.accent,
                    border: 'none',
                    borderRadius: '12px',
                    flex: '1',
                    minWidth: '200px'
                  }}>
                    <Card.Body>
                      <h4 style={{ color: darkTheme.text.accent }}>Classical</h4>
                      <h2 style={{ color: darkTheme.text.primary, fontSize: '32px' }}>
                        {mockProfile.rating[3]}
                      </h2>
                      <RatingCard title="Classical" rating={mockProfile.rating[3]/30} />
                    </Card.Body>
                  </Card>
                </div>
              </Card.Body>
            </Card>
            
            {/* Statistics Card */}
            <Card style={customStyles.profileCard}>
              <Card.Body>
                <h3 style={customStyles.sectionTitle}>
                  Total Statistics
                  <div style={customStyles.titleBar}></div>
                </h3>
                <Row style={customStyles.statsRow}>
                  <Col md={4}>
                    <Card style={{ 
                      backgroundColor: darkTheme.background.accent,
                      border: 'none',
                      borderRadius: '12px',
                      height: '100%',
                      transition: 'transform 0.2s',
                      ':hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                        <div style={{ 
                          fontSize: '36px', 
                          color: darkTheme.text.accent,
                          marginBottom: '15px'
                        }}>
                          <i className="bi bi-check-lg"></i>
                        </div>
                        <h3 style={{ 
                          fontSize: '42px', 
                          fontWeight: 'bold',
                          color: darkTheme.text.primary,
                          marginBottom: '10px'
                        }}>
                          {mockProfile.totalGames}
                        </h3>
                        <p style={{ 
                          color: darkTheme.text.secondary,
                          fontSize: '16px',
                          textAlign: 'center',
                          margin: 0
                        }}>
                          Total Games Played
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={4}>
                    <Card style={{ 
                      backgroundColor: darkTheme.background.accent,
                      border: 'none',
                      borderRadius: '12px',
                      height: '100%',
                      transition: 'transform 0.2s',
                      ':hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                        <div style={{ 
                          fontSize: '36px', 
                          color: '#3a7bd5',
                          marginBottom: '15px'
                        }}>
                          <i className="bi bi-trophy-fill"></i>
                        </div>
                        <h3 style={{ 
                          fontSize: '42px', 
                          fontWeight: 'bold',
                          color: darkTheme.text.primary,
                          marginBottom: '10px'
                        }}>
                          {mockProfile.totalGamesWon}
                        </h3>
                        <p style={{ 
                          color: darkTheme.text.secondary,
                          fontSize: '16px',
                          textAlign: 'center',
                          margin: 0
                        }}>
                          Games Won
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={4}>
                    <Card style={{ 
                      backgroundColor: darkTheme.background.accent,
                      border: 'none',
                      borderRadius: '12px',
                      height: '100%',
                      transition: 'transform 0.2s',
                      ':hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                        <div style={{ 
                          fontSize: '36px', 
                          color: '#e74c3c',
                          marginBottom: '15px'
                        }}>
                          <i className="bi bi-x-lg"></i>
                        </div>
                        <h3 style={{ 
                          fontSize: '42px', 
                          fontWeight: 'bold',
                          color: darkTheme.text.primary,
                          marginBottom: '10px'
                        }}>
                          {mockProfile.totalGamesLost}
                        </h3>
                        <p style={{ 
                          color: darkTheme.text.secondary,
                          fontSize: '16px',
                          textAlign: 'center',
                          margin: 0
                        }}>
                          Games Lost
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
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