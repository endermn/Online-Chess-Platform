import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Badge,
    ProgressBar,
    Offcanvas, // Keep Offcanvas
} from 'react-bootstrap';
import { FaBars } from 'react-icons/fa'; // Keep hamburger icon

// Import CSS Modules
import styles from './home.module.css'; // Assuming this path is correct

// Import Assets
import bulletImage from "../../assets/bullet.jpg"; // Verify paths
import blitzImage from "../../assets/blitz.png";
import rapidImage from "../../assets/rapid.webp";
import classicalImage from "../../assets/classical.jpeg";

// Import Components
import HistoryCard from '../../components/historyCard/historyCard'; // Verify path
import NavSidebar from '../../components/navSidebar/navSidebar';   // Verify path

function HomePage() {
    // --- State Variables ---
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showMobileNav, setShowMobileNav] = useState(false); // State for mobile nav visibility

    // --- Fetching Logic ---
    const fetchWithRetry = async (url, options, maxRetries = 5, delay = 2000) => {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return await response.json();
            }
            throw new Error(`Request Failed: ${response.status} ${response.statusText} (${url})`);
        } catch (error) {
            if (maxRetries <= 0) {
                throw error;
            }
            console.log(`Retrying fetch to ${url} in ${Math.round(delay / 1000)}s... (${maxRetries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            const nextDelay = Math.min(delay * 1.5, 30000);
            return fetchWithRetry(url, options, maxRetries - 1, nextDelay);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            if (retryCount === 0 && !profile) setIsLoading(true); // More robust loading state check
            setError(null);

            try {
                const [profileData, statsData, historyData] = await Promise.all([
                    fetchWithRetry('http://localhost:8080/profile', { method: 'GET', credentials: 'include' }),
                    fetchWithRetry('http://localhost:8080/user/stats', { method: 'GET', credentials: 'include' }),
                    fetchWithRetry('http://localhost:8080/user/recent', { method: 'GET', credentials: 'include' })
                ]);

                const fullProfile = {
                    ...(profileData || {}),
                    ...(statsData || {}),
                    historyData: Array.isArray(historyData) ? historyData : [],
                    maxRating: Math.max(
                        profileData?.BulletRating || 0, profileData?.BlitzRating || 0,
                        profileData?.RapidRating || 0, profileData?.ClassicalRating || 0
                    )
                };

                localStorage.setItem("profile", JSON.stringify(fullProfile));
                setProfile(fullProfile);
                setIsLoading(false);
                setRetryCount(0); // Reset on success
            } catch (error) {
                console.error("Failed after multiple retries:", error);
                // Only set error if we don't already have profile data (avoid flashing error on background retry)
                if (!profile) {
                     setError(error.message || "An unknown error occurred.");
                }
                setIsLoading(false); // Stop loading indicator regardless

                const retryDelay = Math.min(30000, 1000 * Math.pow(1.5, retryCount + 1));
                console.log(`Scheduling retry attempt ${retryCount + 2} in ${Math.round(retryDelay / 1000)}s...`);
                const timerId = setTimeout(() => { setRetryCount(prev => prev + 1); }, retryDelay);
                return () => clearTimeout(timerId);
            }
        };
        fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [retryCount]); // Rerun effect when retryCount changes

    // --- Conditional Rendering ---
    if (isLoading && !profile) {
        return ( <div className={styles.loadingContainer}><div className={styles.loadingSpinner}></div><p>Loading profile...</p></div> );
    }
    if (error && !profile) { // Only show full error screen if profile is not loaded at all
        return ( <div className={styles.errorContainer}><h3>Connection Error</h3><p>{error}</p><Button onClick={() => { setIsLoading(true); setRetryCount(prev => prev + 1); }}>Retry Now</Button></div> );
    }
    if (!profile && !isLoading) { // Catch case where loading finished, no error, but still no profile
        return ( <div className={styles.errorContainer}><h3>Profile Unavailable</h3><p>Could not load data after retries.</p><Button onClick={() => { setIsLoading(true); setRetryCount(0); }} variant="warning">Try Again</Button></div> );
    }
    // If profile exists, proceed to render, even if there was a background retry error
    if (!profile) return null; // Should not happen if logic above is correct, but safe fallback

    // --- Data Preparation ---
    const winPercentage = (profile.TotalGames || 0) > 0 ? Math.round(((profile.GamesWon || 0) / profile.TotalGames) * 100) : 0;
    const ratingArr = [ profile.BulletRating || 0, profile.BlitzRating || 0, profile.RapidRating || 0, profile.ClassicalRating || 0 ];
    const maxRating = profile.maxRating || Math.max(...ratingArr);
    const gameTypes = [
        { name: 'Bullet', image: bulletImage, color: '#f05454', description: '1 min/player', path: '/game/bullet', ratingIndex: 0 },
        { name: 'Blitz', image: blitzImage, color: '#5485f0', description: '3-5 min/player', path: '/game/blitz', ratingIndex: 1 },
        { name: 'Rapid', image: rapidImage, color: '#54c0f0', description: '10 min/player', path: '/game/rapid', ratingIndex: 2 },
        { name: 'Classical', image: classicalImage, color: '#a554f0', description: '15+ min/player', path: '/game/classical', ratingIndex: 3 }
    ];
    const historyItems = Array.isArray(profile.historyData) ? profile.historyData : [];

    // --- Handlers ---
    const handleShowMobileNav = () => setShowMobileNav(true);
    const handleCloseMobileNav = () => setShowMobileNav(false);

    // --- Main Render ---
    return (
        // Using a wrapper div allows the fixed hamburger button to be positioned relative to the viewport easily
        <div className={styles.homePageWrapper ?? 'home-page-wrapper'}> {/* Use optional chaining or provide fallback class */}

            {/* Hamburger Button: Fixed Position, Mobile Only (shown below 'md') */}
            <Button
                variant="dark" // Or choose a variant that fits your theme
                className={`d-md-none ${styles.mobileNavToggle}`} // Show below md breakpoint
                onClick={handleShowMobileNav}
                aria-controls="offcanvasNavbar-md" // Ensure ID matches Offcanvas
                aria-label="Toggle navigation"
                style={{ // Example inline styles for fixed positioning
                    position: 'fixed',
                    top: '15px',
                    left: '15px',
                    zIndex: 1040 // Ensure it's above other content but below Offcanvas backdrop
                }}
            >
                <FaBars />
            </Button>

            {/* Container for the layout */}
            <Container fluid>
                <Row>
                    {/* ======== Sidebar Area (Managed entirely by Offcanvas) ======== */}

                    {/* REMOVED the explicit Desktop Sidebar Column */}
                    {/* <Col md={3} lg={2} className="p-0 d-none d-md-block">...</Col> */}

                    {/* Offcanvas handles BOTH mobile slide-out AND static desktop display */}
                    <Offcanvas
                        show={showMobileNav}         // Controls visibility on mobile
                        onHide={handleCloseMobileNav} // Allows closing on mobile
                        responsive="md"             // ** CRITICAL: Becomes static sidebar at 'md' breakpoint **
                        placement="start"
                        // Apply necessary styling for when it's static (desktop view)
                        // This might involve setting width, height, background, etc.
                        // You might need Bootstrap utility classes or custom CSS via styles.offcanvasStaticDesktop
                        className={`${styles.mobileOffcanvas} ${styles.offcanvasStaticDesktop}`} // Add a class for desktop static styles
                        id="offcanvasNavbar-md"
                        aria-labelledby="offcanvasNavbarLabel-md"
                        style={{
                            // Ensure it doesn't interfere when hidden on mobile unless 'show' is true
                            // The 'responsive' prop handles display change, but width/height might need CSS
                        }}
                    >
                        <Offcanvas.Header closeButton closeVariant='white' className="d-md-none"> {/* Hide header on desktop */}
                            <Offcanvas.Title id="offcanvasNavbarLabel-md">Menu</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className={styles.mobileOffcanvasBody}>
                            {/* NavSidebar content goes here */}
                            {/* Pass close handler so clicking links can close the mobile menu */}
                            <NavSidebar onLinkClick={handleCloseMobileNav} />
                        </Offcanvas.Body>
                    </Offcanvas>

                    {/* ======== Main Content Area ======== */}
                    {/* Adjust Col props if needed based on how Offcanvas renders statically */}
                    {/* Usually, Offcanvas doesn't participate in Col grid directly when static unless wrapped. */}
                    {/* We might need CSS to push this content over, or adjust its margin */}
                    <Col
                        xs={12} // Full width on mobile
                        // md={9} lg={10} // Keep these if your CSS makes the static Offcanvas occupy md={3}/lg={2} space
                        className={`${styles.mainContent} ${styles.mainContentAdjusted}`} // Add class for potential margin adjustment
                    >

                        {/* Header Section */}
                        <div className={styles.headerSection}>
                            <h1>Welcome back, {profile.FullName || "Player"}!</h1>
                             {/* Display background error discreetly if profile is already loaded */}
                            {error && profile && <p className="text-danger small">Couldn't refresh data in background: {error}</p>}
                            <Row className={`g-3 ${styles.statsCards}`}>
                                <Col xs={12} sm={6} lg={3}> {/* Adjusted lg breakpoint for 3 cards */}
                                    <Card className={styles.statCard}>
                                        <Card.Body>
                                            <div className={styles.statInfo}>
                                                <h3>Highest Rating</h3>
                                                <h2>{maxRating}</h2>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={12} sm={6} lg={4}>
                                    <Card className={styles.statCard}>
                                        <Card.Body>
                                            <div className={styles.statInfo}>
                                                <h3>Win Rate</h3>
                                                <h2>{winPercentage}%</h2>
                                                <ProgressBar now={winPercentage} variant={winPercentage >= 50 ? "success" : "warning"} className={styles.winRateProgress} style={{ height: '8px' }}/>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={12} sm={12} lg={4}> {/* Full width on sm, last item */}
                                    <Card className={styles.statCard}>
                                        <Card.Body>
                                            <div className={styles.statInfo}>
                                                <h3>Total Games</h3>
                                                <h2>{profile.TotalGames || 0}</h2>
                                                <div className={styles.miniStats}>
                                                    <Badge pill bg="success">{profile.GamesWon || 0} W</Badge>
                                                    <Badge pill bg="danger">{profile.GamesLost || 0} L</Badge>
                                                    <Badge pill bg="secondary">{(profile.TotalGames || 0) - (profile.GamesWon || 0) - (profile.GamesLost || 0)} D</Badge>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>

                        {/* Game Modes Section */}
                        <div className={styles.gameModes}>
                            <h2>Play Chess</h2>
                            <Row className="g-3">
                                {gameTypes.map((game) => (
                                    <Col xs={12} sm={6} md={6} lg={3} key={game.name} className="d-flex"> {/* Adjusted breakpoints */}
                                        <Card className={`${styles.gameCard} ${styles.equalHeightCard}`}>
                                            <div className={styles.gameCardImageContainer}>
                                                <Card.Img variant="top" src={game.image} alt={game.name} className={styles.gameCardImage}/>
                                                <div className={styles.gameCardOverlay} style={{ backgroundColor: `rgba(0, 0, 0, 0.4)` }}></div> {/* Example overlay */}
                                                <Card.ImgOverlay className={styles.cardImgOverlayCustom}>
                                                    <Card.Title className={styles.gameCardTitle}>{game.name}</Card.Title>
                                                </Card.ImgOverlay>
                                            </div>
                                            <Card.Body className={styles.gameCardBody}>
                                                <Card.Text className={styles.gameTypeDescription}>{game.description}</Card.Text>
                                                <div className={styles.ratingBadge} style={{ color: game.color, borderColor: game.color }}>Rating: {ratingArr[game.ratingIndex]}</div>
                                                <Button href={game.path} variant="primary" className={styles.playButton} style={{ backgroundColor: game.color, borderColor: game.color }}>Play Now</Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>

                        {/* History Section */}
                        <div className={styles.historySection}>
                            <div className={styles.historyHeader}>
                                <h2>Recent Games</h2>
                            </div>
                            <div className={styles.historyContainer}>
                                {historyItems.length > 0 ? (
                                    historyItems.slice(0, 5).map((item, index) => (
                                        <HistoryCard
                                            key={item.GameId || `history-${index}`}
                                            item={item} // Pass whole item
                                            // Extract specific props if HistoryCard needs them explicitly
                                            opponent={item.OpponentUsername || "Opponent"}
                                            rating={item.OpponentRating || "?"}
                                            date={item.Timestamp ? new Date(item.Timestamp).toLocaleDateString() : "N/A"}
                                            result={item.Result || "N/A"}
                                            gameType={item.GameType || ""}
                                        />
                                    ))
                                ) : (
                                    <p className={styles.noHistory}>No recent games found.</p>
                                )}
                            </div>
                        </div>

                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default HomePage;