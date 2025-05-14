import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Container, Row, Col, Alert } from "react-bootstrap";
import './UserProfile.css';
import "../../css/FormWrapper.css";
import "../../css/Buttons.css";

export default function ProfileUpdateForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const accessToken = localStorage.getItem("access_token");

    if (!user || !accessToken) {
      navigate("/login");
    } else {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || ""
      });
      setLoading(false)
    };
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="event-form-wrapper">
      <Container className="my-5">
        <Row className="justify-content-md-center">
          <Col md={8}>
            <div className="md-6 profile-form position-absolute top-50 start-50 translate-middle">
              <h2 className="text-center my-4">Profile Details</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form>
                    <Form.Group controlId="formUsername" className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.name}
                        disabled
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formEmail" className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="formAvatar" className="mb-3">
                      <Form.Label>Avatar</Form.Label>
                      <Form.Control
                        type="text"
                        name="avatar"
                        value={formData.avatar}
                        disabled
                        required
                      />
                    </Form.Group>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
