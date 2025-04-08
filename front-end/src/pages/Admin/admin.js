import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Navbar, Nav, Card, Badge, Spinner } from 'react-bootstrap';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:8080/admin/users", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users. ' + (err.message || 'Unknown error'));
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }
      
      // Remove user from state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to delete user. ' + (err.message || 'Unknown error'));
      console.log(err);
    }
  };

  const toggleAdminStatus = async (user) => {
    setAdminActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/admin/users/${user.id}/toggle-admin`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update admin status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update user in state
      setUsers(users.map(u => 
        u.id === user.id ? {...u, isAdmin: data.isAdmin} : u
      ));
    } catch (err) {
      setError('Failed to update admin status. ' + (err.message || 'Unknown error'));
      console.log(err);
    } finally {
      setAdminActionLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <Navbar variant="dark" className="admin-navbar">
        <Container>
          <Navbar.Brand>Admin Dashboard</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link className="active">Users</Nav.Link>
          </Nav>
          <Navbar.Text>
            Signed in as: <strong>Admin</strong>
          </Navbar.Text>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Row>
          <Col>
            <Card className="admin-card mb-4">
              <Card.Header as="h5">User Management</Card.Header>
              <Card.Body>
                {error && <div className="alert alert-danger">{error}</div>}
                
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="mb-0">
                    <Badge bg="info" className="me-2">{users.length}</Badge>
                    Total Users
                  </h6>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={fetchUsers}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner 
                          as="span" 
                          animation="border" 
                          size="sm" 
                          role="status" 
                          aria-hidden="true" 
                          className="me-1"
                        />
                        Loading...
                      </>
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center p-4">
                    <Spinner animation="border" variant="info" />
                  </div>
                ) : (
                  <Table responsive hover variant="dark" className="admin-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.ID}</td>
                          <td>{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>
                            {user.isActive ? (
                              <Badge bg="success">Active</Badge>
                            ) : (
                              <Badge bg="secondary">Inactive</Badge>
                            )}
                          </td>
                          <td>
                            {user.isAdmin ? (
                              <Badge bg="warning">Admin</Badge>
                            ) : (
                              <Badge bg="info">User</Badge>
                            )}
                          </td>
                          <td>{new Date(user.createdAt).toDateString()}</td>
                          <td>{new Date(user.lastLogin).toDateString()}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant={user.isAdmin ? "outline-warning" : "outline-info"} 
                                size="sm" 
                                onClick={() => toggleAdminStatus(user)}
                                disabled={adminActionLoading}
                              >
                                {user.isAdmin ? "Remove Admin" : "Make Admin"}
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDeleteClick(user)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm User Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email})?
          <p className="text-danger mt-2">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPanel;