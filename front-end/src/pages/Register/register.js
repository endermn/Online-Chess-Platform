import React from 'react';
import { Container, Row, Col, Form, Button, Navbar, Nav } from 'react-bootstrap';

import styles from './register.module.css';

const RegisterPage = () => {

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
                                <h2 style={{ textAlign: 'center', marginBottom: '2em' }}>Register</h2>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formBasicFirstName">
                                        <Form.Label >Full Name</Form.Label>
                                        <Form.Control className={styles.control} type="text" placeholder="e.g John Doe" style={{ backgroundColor: '#333333', borderColor: '#444444' }} />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label >Email address</Form.Label>
                                        <Form.Control className={styles.control} type="email" placeholder="e.g coolemail101@gmail.com" style={{ backgroundColor: '#333333', borderColor: '#444444' }} />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label >Password</Form.Label>
                                        <Form.Control className={styles.control} type="password" placeholder="e.g ilovemyapples1234" style={{ backgroundColor: '#333333', borderColor: '#444444' }} />
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button className={styles.submit} variant="primary" type="submit" >
                                            Sign up
                                        </Button>
                                    </div>
                                </Form>
                                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    Already have an account? <a href="/login" style={{ textDecoration: 'none' }}>Sign in</a>
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default RegisterPage;