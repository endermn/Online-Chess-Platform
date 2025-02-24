import React from 'react';
import { Container, Row, Col, Form, Button, Navbar, Nav } from 'react-bootstrap';

import styles from './login.module.css';

const LoginPage = () => {

    return (
        <div className={styles.main}>
            <Navbar variant='dark' className={styles.navBar}>
				<Nav className="mr-auto">
					<Nav.Link href="/" className={styles.back}>Back</Nav.Link>
				</Nav>
            </Navbar>
            <div className={styles.mainContainer} >
                <Container>
                    <Row>
                        <Col md={{ span: 6, offset: 3 }}>
                            <div style={{ padding: '2rem', borderRadius: '0.5rem' }}>
                                <h2 style={{ textAlign: 'center', marginBottom: '2em' }}>Login</h2>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label >Email address</Form.Label>
                                        <Form.Control className={styles.control} type="email" placeholder="Enter email" style={{ backgroundColor: '#333333', borderColor: '#444444' }} />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label >Password</Form.Label>
                                        <Form.Control className={styles.control} type="password" placeholder="Password" style={{ backgroundColor: '#333333', borderColor: '#444444' }} />
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button className={styles.submit} variant="primary" type="submit" >
                                            Log In
                                        </Button>
                                    </div>
                                </Form>
                                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    Don't have an account? <a href="/signup" style={{ textDecoration: 'none' }}>Sign Up</a>
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default LoginPage;