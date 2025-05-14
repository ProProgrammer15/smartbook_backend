import React, { useState, useContext } from "react";
import { Form, Button, Container, Row, Col, Alert, InputGroup } from "react-bootstrap";
import "../css/Buttons.css"
import "../css/FormWrapper.css";
import { alertContext } from "../context/context";
import { useNavigate } from "react-router-dom";
import {Link} from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const alertCtx = useContext(alertContext)
  const navigator = useNavigate("")

  const loginUser = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/user/signin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.message || "Something went wrong during sign-in");
      }

      const refreshResponse = await fetch("http://localhost:8000/api/user/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok) {
        throw new Error(refreshData.message || "Error getting refresh token");
      }
      
      localStorage.setItem("access_token", refreshData.access_token);
      localStorage.setItem("refresh_token", refreshData.refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));

    alertCtx.showAlert('Login successful', 'success')
    navigator('/courses')
  } catch (err) {
    setError(err.message);
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    loginUser();
  };

  return (
    <div className="event-form-wrapper">
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={4} className="py-2 px-5 position-absolute top-50 start-50 translate-middle">
          <div className="event-form-container">
          <h2 className="text-center mb-3">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
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
              <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
              </InputGroup>
            </Form.Group>

            <Button variant="primary" type="submit" className="login-btn">
              Login
            </Button>
          </Form>
          <Link to="/signup">
          <div className="text-center my-3">
            <p>Don't have an account? Register here</p>
          </div>
          </Link>
          </div>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default Login;
