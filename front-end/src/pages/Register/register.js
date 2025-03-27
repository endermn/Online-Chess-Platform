import React from 'react';
import { Container, Row, Col, Form, Button, Navbar, Nav } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';

import styles from './register.module.css';

const RegisterPage = () => {
    const [credentials, setCredentials] = useState({
        fullname: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

    const fetchWithCredentials = async () => {
        try {
            const response = await fetch("http://localhost:8080/signup", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    fullname: credentials.fullname,
                    email: credentials.email,
                    password: credentials.password
                })
            })
            console.log(response);
            if (response.status != 201) {
                throw new Error("Signup failed");
            }

            window.location.href = '/home';
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
            console.log(err)
        } finally {
            setLoading(false);
        }
    }

    fetchWithCredentials()
};

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
                                <Form onSubmit={handleSubmit}> {/* Add onSubmit handler */}
                                    <Form.Group className="mb-3" controlId="formBasicFirstName">
                                        <Form.Label >Full Name</Form.Label>
                                        <Form.Control
                                            onChange={handleChange}
                                            value={credentials.fullname}
                                            className={styles.control}
                                            type="text"
                                            placeholder="e.g John Doe"
                                            style={{ backgroundColor: '#333333', borderColor: '#444444' }}
                                            name="fullname" 
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label >Email address</Form.Label>
                                        <Form.Control
                                            onChange={handleChange}
                                            value={credentials.email}
                                            className={styles.control}
                                            type="email"
                                            placeholder="e.g coolemail101@gmail.com"
                                            style={{ backgroundColor: '#333333', borderColor: '#444444' }}
                                            name="email" 
                                            required 
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label >Password</Form.Label>
                                        <Form.Control
                                            className={styles.control}
                                            type="password"
                                            placeholder="e.g ilovemyapples1234"
                                            value={credentials.password}
                                            onChange={handleChange}
                                            style={{ backgroundColor: '#333333', borderColor: '#444444' }}
                                            name="password"
                                            required 
                                        />
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button className={styles.submit} variant="primary" type="submit">
                                            Sign up
                                        </Button>
                                    </div>
                                    {error && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
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