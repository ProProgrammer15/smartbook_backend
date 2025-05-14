import React, { useContext, useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import "../css/FormWrapper.css";
import "../css/Buttons.css"
import { alertContext } from "../context/context";
import { useNavigate } from "react-router-dom";


const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState(null);
  const navigator = useNavigate('')

  const alertCtx = useContext(alertContext)

  const signupUser = async () => {
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/api/user/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          avatar,
        }),
      });

      const data = await response.json();
      
      console.log(`JSON response ${data}`)

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      alertCtx.showAlert("User signup successful!", "success");
      navigator("/login");

    } catch (err) {
      setError(err.message);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    signupUser();
  };

  return (
    <div className="event-form-wrapper">
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={5} className="py-2 px-5 position-absolute top-50 start-50 translate-middle">
        <div className="event-form-container">
          <h3 className="text-center my-3">Register</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Name</Form.Label>
              <Form.Control
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAvatar">
                  <Form.Label>Avatar URL</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="Enter avatar URL"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    required
                  />
            </Form.Group>
            <Button variant="primary" type="submit" className="login-btn">
              Register
            </Button>
          </Form>
          
          <div className="text-center mt-3 my-3">
            <a href="/login">Already have an account? Login here</a>
          </div>
          </div>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default Register;
