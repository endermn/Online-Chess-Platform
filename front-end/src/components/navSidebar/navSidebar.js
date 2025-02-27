import React, { useState, useEffect } from 'react';
import {
    FaHome,
    FaUserCircle,
    FaPuzzlePiece,
    FaNewspaper,
    FaSignOutAlt,
    FaEdit,
    FaTrophy,
    FaChessKnight
} from 'react-icons/fa';
import { Col, Navbar, Nav, Image, Badge, ProgressBar } from "react-bootstrap";
import styles from "./navSidebar.module.css";

export default function NavSidebar({ profile }) {
    // Get current path from window location
    const [currentPath, setCurrentPath] = useState('');
    
    useEffect(() => {
        // Set the current path based on the URL
        const path = window.location.pathname;
        setCurrentPath(path);
    }, []);
    
    // Calculate win rate percentage
    const winRate = Math.round((profile.totalGamesWon / profile.totalGames) * 100);
    
    // Get last 5 games for compact history display
    const recentGames = profile.history.slice(0, 5);
    
    // Determine player status based on rating
    const getPlayerStatus = (rating) => {
        const currentRating = rating[rating.length - 1];
        if (currentRating >= 1400) return { text: "Advanced", color: "#198754" };
        if (currentRating >= 1000) return { text: "Intermediate", color: "#0d6efd" };
        return { text: "Beginner", color: "#6c757d" };
    };
    
    const playerStatus = getPlayerStatus(profile.rating);

    // Navigation links with their paths
    const navLinks = [
        { path: "/home", icon: FaHome, text: "Home" },
        { path: "/profile", icon: FaUserCircle, text: "Profile" },
        { path: "/puzzles", icon: FaPuzzlePiece, text: "Puzzles" },
        { path: "/news", icon: FaNewspaper, text: "News" },
        { path: "/boardeditor", icon: FaEdit, text: "Board Editor" }
    ];
    
    return (
        <Col sm={3} md={2} className={`d-none d-sm-block ${styles.sidebar}`}>
            <Navbar variant="dark" expand="sm" className={`${styles.profileSidebar} flex-column`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.profileImageContainer}>
                        <Image
                            src={profile.profilePicture}
                            roundedCircle
                            className={styles.profileImage}
                        />
                        <div className={styles.statusIndicator}></div>
                    </div>
                    
                    <div className={styles.profileInfo}>
                        <div className={styles.profileName}>
                            {profile.firstName} {profile.lastName}
                        </div>
                        <Badge 
                            bg="transparent" 
                            pill
                            className={styles.playerStatusBadge}
                            style={{ color: playerStatus.color, border: `1px solid ${playerStatus.color}` }}
                        >
                            {playerStatus.text}
                        </Badge>
                    </div>
                </div>
                
                <div className={styles.statsContainer}>
                    <div className={styles.ratingContainer}>
                        <div className={styles.ratingLabel}>Rating</div>
                        <div className={styles.ratingValue}>{profile.rating[profile.rating.length - 1]}</div>
                    </div>
                    
                    <div className={styles.winRateContainer}>
                        <div className={styles.winRateHeader}>
                            <span className={styles.winRateLabel}>Win Rate</span>
                            <span className={styles.winRateValue}>{winRate}%</span>
                        </div>
                        <ProgressBar 
                            now={winRate} 
                            variant={winRate > 50 ? "success" : "warning"} 
                            className={styles.winRateProgress}
                        />
                    </div>
                    
                    <div className={styles.gameHistoryContainer}>
                        <div className={styles.gameHistoryLabel}>Recent Games</div>
                        <div className={styles.gameHistoryItems}>
                            {recentGames.map((result, index) => (
                                <div 
                                    key={index} 
                                    className={`${styles.gameHistoryItem} ${
                                        result === "win" ? styles.gameWin : styles.gameLoss
                                    }`}
                                    title={result === "win" ? "Victory" : "Defeat"}
                                >
                                    {result === "win" ? "W" : "L"}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className={styles.navigationContainer}>
                    <div className={styles.navLabel}>Main Menu</div>
                    <Nav className={`flex-column ${styles.navLinks}`}>
                        {navLinks.map((link, index) => {
                            const Icon = link.icon;
                            const isActive = currentPath === link.path;
                            
                            return (
                                <Nav.Link 
                                    key={index}
                                    href={link.path} 
                                    className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                                >
                                    <Icon className={styles.navIcon} />
                                    <span>{link.text}</span>
                                    {link.badge && (
                                        <Badge 
                                            bg={link.badge.variant} 
                                            pill 
                                            className={styles.navBadge}
                                        >
                                            {link.badge.text}
                                        </Badge>
                                    )}
                                </Nav.Link>
                            );
                        })}
                    </Nav>
                </div>
                
                <div className={styles.footerContainer}>
                    <Nav.Link href="/" className={styles.logoutLink}>
                        <FaSignOutAlt className={styles.logoutIcon} />
                        <span>Log out</span>
                    </Nav.Link>
                </div>
            </Navbar>
        </Col>
    );
}