import React from 'react'
import {
    FaHome,
    FaUserCircle,
    FaPuzzlePiece,
    FaNewspaper,
    FaSignOutAlt,
    FaEdit,
} from 'react-icons/fa';

import { Col, Navbar, Nav, Image } from "react-bootstrap"

import styles from "./navSidebar.module.css"

export default function NavSidebar({ profile }) {

    return (
        <Col sm={3} md={2} className={`d-none d-sm-block ${styles.sidebar}`}>
            <Navbar variant="dark" expand="sm" className={`${styles.profileSidebar} flex-column`} >
                <Navbar.Brand href="/profile" className='m-0 d-flex flex-column'>
                    <Image
                        src={profile.profilePicture}
                        roundedCircle
                        className={`${styles.profileImage}`}
                    />
                    <span className={styles.profileName}>
                        {profile.firstName + " " + profile.lastName}
                    </span>
                </Navbar.Brand>
                <Nav className="flex-column flex-grow-1">
                    <Nav.Link href="/home" >
                        <FaHome style={{ marginRight: '8px' }} />Home
                    </Nav.Link>
                    <Nav.Link href="/profile">
                        <FaUserCircle style={{ marginRight: '8px' }} />Profile
                    </Nav.Link>
                    <Nav.Link href="/puzzles">
                        <FaPuzzlePiece style={{ marginRight: '8px' }} />Puzzles
                    </Nav.Link>
                    <Nav.Link href="/news">
                        <FaNewspaper style={{ marginRight: '8px' }} />News
                    </Nav.Link>
                    <Nav.Link href="/boardeditor">
                        <FaEdit style={{ marginRight: '8px' }} />Board Editor
                    </Nav.Link>
                    <Nav.Link href="/" className={styles.logOut}>
                        <hr className={styles.sidebarDivider} />
                        <div style={{ flex: '1' }}></div>
                        <FaSignOutAlt style={{ marginRight: '8px' }} />Log out
                    </Nav.Link>
                </Nav>
            </Navbar>
        </Col>
    );
}