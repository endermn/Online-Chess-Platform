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
import { Navbar, Nav, Image, Badge, ProgressBar } from "react-bootstrap";
import styles from "./navSidebar.module.css";
import { useNavigate } from "react-router-dom"; 
import defaultImage from '../../assets/default_pfp.jpg'

export default function NavSidebar({ onLinkClick }) {
    const navigate = useNavigate();
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                localStorage.removeItem("profile");
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        } catch (err) {
            console.error('Error during logout:', err);
        }
    };
    console.log("NavSidebar component mounted");

    const profile = JSON.parse(localStorage.getItem("profile")) || {
        FullName: "Guest", BulletRating: 0, BlitzRating: 0, RapidRating: 0,
        ClassicalRating: 0, TotalGames: 0, GamesWon: 0, PictureFileName: null
    };

    const currentPath = window.location.pathname; // Or use React Router's useLocation hook
    const winRate = profile.TotalGames > 0
        ? Math.round((profile.GamesWon / profile.TotalGames) * 100)
        : 0;

    const getPlayerStatus = (rating) => {
        if (rating >= 1400) return { text: "Advanced", color: "#198754" };
        if (rating >= 1000) return { text: "Intermediate", color: "#0d6efd" };
        return { text: "Beginner", color: "#6c757d" };
    };

    const maxRating = Math.max(
        profile.BulletRating || 0, profile.BlitzRating || 0,
        profile.RapidRating || 0, profile.ClassicalRating || 0
    );
    const playerStatus = getPlayerStatus(maxRating);

    const navLinks = [
        { path: "/home", icon: FaHome, text: "Home" },
        { path: "/profile", icon: FaUserCircle, text: "Profile" },
        { path: "/puzzles", icon: FaPuzzlePiece, text: "Puzzles" },
        { path: "/news", icon: FaNewspaper, text: "News" },
        { path: "/boardeditor", icon: FaEdit, text: "Board Editor" }
    ];

    return (
        <Navbar variant="dark" className={`${styles.profileSidebar} flex-column`}>
            <div className={styles.sidebarHeader}>
                <div className={styles.profileImageContainer}>
                    <Image
                        src={profile.PictureFileName || defaultImage}
                        roundedCircle
                        className={styles.profileImage}
                    />
                    <div className={styles.statusIndicator}></div>
                </div>

                <div className={styles.profileInfo}>
                    <div className={styles.profileName}>
                        {profile.FullName}
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
                    <div className={styles.ratingValue}>{maxRating}</div>
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
                                // Call onLinkClick when a link is clicked
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(link.path);
                                    if (onLinkClick) {
                                        onLinkClick(); // Call the function passed from the parent
                                    }
                                }}
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
                <Nav.Link
                    href="#"
                    className={styles.logoutLink}
                    onClick={handleLogout}
                >
                    <FaSignOutAlt className={styles.logoutIcon} />
                    <span>Log out</span>
                </Nav.Link>
            </div>
        </Navbar>
    );
}

// Add default prop for safety
NavSidebar.defaultProps = {
    onLinkClick: null,
};