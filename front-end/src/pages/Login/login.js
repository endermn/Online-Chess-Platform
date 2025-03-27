import React from 'react';
import { Container, Row, Col, Form, Button, Navbar, Nav } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
                const response = await fetch("http://localhost:8080/login", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password
                    })
                })
                console.log(response);
                if (response.status != 200) {
                    throw new Error("Login failed");
                }

            } catch (err) {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
                console.log(err)
            } finally {
                setLoading(false);
            }
        }

        fetchWithCredentials()
        
        navigate("/home")
    };


    return (
        <div className={styles.main}>
            <Navbar variant='dark' className={styles.navBar}>
                <Nav className="mr-auto">
                    <Nav.Link href="/" className={styles.back}>Back</Nav.Link>
                </Nav>
            </Navbar>
            <div className={styles.mainContainer}>
                <Container>
                    <Row>
                        <Col md={{ span: 6, offset: 3 }}>
                            <div style={{ padding: '2rem', borderRadius: '0.5rem' }}>
                                <h2 style={{ textAlign: 'center', marginBottom: '2em' }}>Login</h2>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control
                                            className={styles.control}
                                            type="email"
                                            placeholder="Enter email"
                                            name="email"
                                            value={credentials.email}
                                            onChange={handleChange}
                                            style={{ backgroundColor: '#333333', borderColor: '#444444' }}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            className={styles.control}
                                            type="password"
                                            placeholder="Password"
                                            name="password"
                                            value={credentials.password}
                                            onChange={handleChange}
                                            style={{ backgroundColor: '#333333', borderColor: '#444444' }}
                                            required
                                        />
                                    </Form.Group>
                                    <div className="d-grid gap-2">
                                        <Button
                                            className={styles.submit}
                                            variant="primary"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Logging in...' : 'Log In'}
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