import React, { useState, useEffect } from 'react';
// Make sure Bootstrap CSS is imported, typically in index.js or App.js
// import 'bootstrap/dist/css/bootstrap.min.css';
// If using Bootstrap Icons, ensure they are linked or imported
import { Container, Row, Col, Image, Card } from 'react-bootstrap';
// Assuming styles.module.css is mostly for non-layout styles now
// import styles from './profile.module.css';
import NavSidebar from '../../components/navSidebar/navSidebar.js';
import defaultPfp from '../../assets/default_pfp.jpg';

function ProfilePage() {
    // Get profile data from localStorage
    const profile = JSON.parse(localStorage.getItem("profile")) || {
        FullName: "User",
        Email: "user@example.com",
        BulletRating: 1200, // Added sample values
        BlitzRating: 1500,
        RapidRating: 1800,
        ClassicalRating: 2000,
        TotalGames: 150,
        GamesWon: 80,
        GamesLost: 60,
        PictureFileName: null // Example
    };

    const ratingArr = [profile.BulletRating, profile.BlitzRating, profile.RapidRating, profile.ClassicalRating];

    // State hooks for hover effects (these are fine)
    const [activeRatingCard, setActiveRatingCard] = useState(null);
    const [statCardHover, setStatCardHover] = useState(null);
    const [sectionTitleHover, setSectionTitleHover] = useState({
        profile: false, // Note: Profile title hover wasn't used, but kept state structure
        rating: false,
        stats: false
    });

    // Removed isMobile state and useEffect for resize handling

    // Dark theme color palette (remains the same)
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

    // CSS for custom components - Simplified, removing isMobile dependencies
    // Consider moving more of these to a CSS/SCSS module for better separation
    const customStyles = {
        mainContainer: {
            backgroundColor: darkTheme.background.main,
            color: darkTheme.text.primary,
            minHeight: '100vh',
            paddingTop: '10px', // Removed horizontal padding, handled by Container/Col
            paddingBottom: '10px'
        },
        // content padding handled by Col className below
        profileCard: {
            backgroundColor: darkTheme.background.card,
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            // marginBottom handled by Row/Col spacing (gy prop on Row)
            marginBottom: '30px',
            transition: 'box-shadow 0.3s ease'
            // Padding handled by Bootstrap classes or Card.Body
        },
        profileImage: {
            // Responsive size could be handled via CSS classes/media queries if needed
            width: '120px', // Use larger size as base
            height: '120px',
            border: `4px solid ${darkTheme.border}`,
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        },
        userName: { // Base styles
            color: darkTheme.text.primary,
            fontWeight: '600',
            marginBottom: '5px',
            // Alignment handled by className
            // Font size handled by responsive Bootstrap classes (e.g., fs-*)
        },
        userEmail: { // Base styles
            color: darkTheme.text.secondary,
            // Alignment handled by className
            // Font size handled by responsive Bootstrap classes
        },
        sectionTitle: {
            color: darkTheme.text.accent,
            // fontSize: isMobile ? '18px' : '22px', // Use Bootstrap fs-* classes
            fontWeight: '600',
            marginBottom: '12px', // Can use Bootstrap mb-*
            position: 'relative',
            paddingBottom: '8px',
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
        ratingCard: { // Base card styles
            backgroundColor: darkTheme.background.accent,
            border: 'none',
            borderRadius: '12px',
            textAlign: 'center', // Center text in rating cards
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            height: '100%' // Make cards in a row equal height
        },
        ratingCardActive: {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
        },
        statCard: { // Base card styles
            backgroundColor: darkTheme.background.accent,
            border: 'none',
            borderRadius: '12px',
            height: '100%', // Make cards in a row equal height
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            display: 'flex', // Use flex to help center content vertically
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
            // marginBottom handled by Col spacing
        },
        statCardHover: {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
        },
        // Removed cardBody as padding can be done via className
        statIcon: {
            // fontSize: isMobile ? '20px' : '32px', // Use Bootstrap fs-*
            // color: stat.color, // Applied directly
            // marginBottom: isMobile ? '5px' : '10px', // Use Bootstrap mb-*
        },
        statValue: {
            // fontSize: isMobile ? '18px' : '32px', // Use Bootstrap fs-*
            fontWeight: 'bold',
            color: darkTheme.text.primary,
            // marginBottom: isMobile ? '2px' : '5px', // Use Bootstrap mb-*
            textAlign: 'center'
        },
        statTitle: {
            color: darkTheme.text.secondary,
            // fontSize: isMobile ? '12px' : '16px', // Use Bootstrap fs-*
            textAlign: 'center',
            margin: 0
        },
        ratingTitle: {
             color: darkTheme.text.accent,
             // fontSize: isMobile ? '14px' : '16px', // Use Bootstrap fs-*
             marginBottom: '5px' // Use Bootstrap mb-*
        },
        ratingValue: {
             color: darkTheme.text.primary,
             // fontSize: isMobile ? '20px' : '28px', // Use Bootstrap fs-*
             margin: 0
        }
    };

    return (
        <div style={customStyles.mainContainer}>
            {/* Use fluid container for full width, or remove fluid for fixed width */}
            <Container fluid>
                {/* Add gutter spacing (gy for vertical) between rows/cards */}
                <Row className="gy-3">
                    {/* Sidebar: Hidden on xs/sm, visible on md and up */}
                    {/* Takes 3 cols on md, 2 on lg */}
                    <Col md={3} lg={2} className="d-none d-md-block">
                        <NavSidebar />
                    </Col>

                    {/* Main Content Area */}
                    {/* Takes full width on xs/sm, remaining width on md and up */}
                    <Col xs={12} md={9} lg={10}>
                        {/* Profile Card */}
                        <Card style={customStyles.profileCard} className="p-3 p-md-4">
                             {/* Use Bootstrap Card classes for padding */}
                            <Card.Body className="p-0"> {/* Reset Card.Body padding if Card has it */}
                                {/* Use Bootstrap flex utilities for layout */}
                                <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start text-center text-md-start gap-3">
                                    <Image
                                        src={profile.PictureFileName || defaultPfp}
                                        roundedCircle
                                        style={customStyles.profileImage}
                                        // className="mb-3 mb-md-0" // Add margin if needed
                                    />
                                    <div>
                                        {/* Use responsive font size classes */}
                                        <h2 style={customStyles.userName} className="fs-4 fs-md-2">
                                            {profile.FullName}
                                        </h2>
                                        <p style={customStyles.userEmail} className="fs-6 fs-md-5">
                                            {profile.Email}
                                        </p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Rating Card */}
                        <Card style={customStyles.profileCard} className="p-3 p-md-4">
                            <Card.Body className="p-0">
                                <h3
                                    style={customStyles.sectionTitle}
                                    className="fs-5 fs-md-4 mb-3" // Responsive font size and margin
                                    onMouseEnter={() => setSectionTitleHover({ ...sectionTitleHover, rating: true })}
                                    onMouseLeave={() => setSectionTitleHover({ ...sectionTitleHover, rating: false })}
                                >
                                    Rating
                                    <div style={{
                                        ...customStyles.titleBar,
                                        ...(sectionTitleHover.rating ? customStyles.titleBarHover : {})
                                    }}></div>
                                </h3>
                                {/* Row for Rating Cards - Use gy/gx for spacing */}
                                <Row xs={1} sm={2} lg={4} className="g-2 g-md-3">
                                    {[
                                        { title: "Bullet", index: 0 },
                                        { title: "Blitz", index: 1 },
                                        { title: "Rapid", index: 2 },
                                        { title: "Classical", index: 3 }
                                    ].map((item) => (
                                        // Each rating is a Col
                                        <Col key={item.title}>
                                            <Card
                                                style={{
                                                    ...customStyles.ratingCard,
                                                    ...(activeRatingCard === item.index ? customStyles.ratingCardActive : {})
                                                }}
                                                // Use Bootstrap padding classes
                                                className="p-2 p-md-3"
                                                onMouseEnter={() => setActiveRatingCard(item.index)}
                                                onMouseLeave={() => setActiveRatingCard(null)}
                                            >
                                                {/* No Card.Body needed if Card has padding */}
                                                <h4 style={customStyles.ratingTitle} className="fs-6 mb-1">
                                                    {item.title}
                                                </h4>
                                                <h2 style={customStyles.ratingValue} className="fs-4 fs-md-3">
                                                    {ratingArr[item.index]}
                                                </h2>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Statistics Card */}
                        <Card style={customStyles.profileCard} className="p-3 p-md-4">
                            <Card.Body className="p-0">
                                <h3
                                    style={customStyles.sectionTitle}
                                    className="fs-5 fs-md-4 mb-3" // Responsive font size and margin
                                    onMouseEnter={() => setSectionTitleHover({ ...sectionTitleHover, stats: true })}
                                    onMouseLeave={() => setSectionTitleHover({ ...sectionTitleHover, stats: false })}
                                >
                                    Total Statistics
                                    <div style={{
                                        ...customStyles.titleBar,
                                        ...(sectionTitleHover.stats ? customStyles.titleBarHover : {})
                                    }}></div>
                                </h3>
                                {/* Row for Stats Cards */}
                                <Row xs={1} sm={3} className="g-2 g-md-3">
                                    {[
                                        { title: "Total Games", value: profile.TotalGames, icon: "bi-controller", color: darkTheme.text.accent, index: 0 },
                                        { title: "Games Won", value: profile.GamesWon, icon: "bi-trophy-fill", color: "#5cb85c", index: 1 }, // Green for won
                                        { title: "Games Lost", value: profile.GamesLost, icon: "bi-heartbreak-fill", color: "#d9534f", index: 2 } // Red for lost
                                    ].map((stat) => (
                                        // Each stat is a Col
                                        <Col key={stat.index}>
                                            <Card
                                                style={{
                                                    ...customStyles.statCard,
                                                    ...(statCardHover === stat.index ? customStyles.statCardHover : {})
                                                }}
                                                // Use Bootstrap padding classes
                                                className="p-2 p-md-3"
                                                onMouseEnter={() => setStatCardHover(stat.index)}
                                                onMouseLeave={() => setStatCardHover(null)}
                                            >
                                                {/* No Card.Body needed */}
                                                <div style={{ color: stat.color }} className="fs-3 fs-md-1 mb-1 mb-md-2">
                                                    {/* Ensure you have bootstrap-icons linked/installed */}
                                                    <i className={`bi ${stat.icon}`}></i>
                                                </div>
                                                <h3 style={customStyles.statValue} className="fs-4 fs-md-2 mb-1">
                                                    {stat.value}
                                                </h3>
                                                <p style={customStyles.statTitle} className="fs-6">
                                                    {stat.title}
                                                </p>
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