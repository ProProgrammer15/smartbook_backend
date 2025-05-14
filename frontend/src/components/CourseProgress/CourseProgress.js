import React, { useState, useEffect } from "react";
import { Card, ProgressBar, Container, Row, Col, Alert, Button, Modal, Form } from "react-bootstrap";
import './CourseProgress.css';

const CourseProgress = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [updatedProgress, setUpdatedProgress] = useState("");
  const [newCourse, setNewCourse] = useState({
    course_name: "",
    percent_completed: 0,
  });

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/course/book-list/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch course progress.");
        }
        setCourses(data?.results);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCourseProgress();
  }, [updatedProgress]);

  const handleOpenModal = (course) => {
    setSelectedCourse(course);
    setUpdatedProgress(course.percent_completed);
    setShowModal(true);
  };

  const handleProgressUpdate = async (e) => {
    e.preventDefault();
    
    if (isNaN(updatedProgress) || updatedProgress < 0 || updatedProgress > 100) {
      setError("Please enter a valid percentage (0-100).");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/course/progress/${selectedCourse.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          percent_completed: updatedProgress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update progress.");
      }

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === selectedCourse.id ? { ...course, progress: updatedProgress } : course
        )
      );

      setShowModal(false);
      setUpdatedProgress("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/course/progress/${courseId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete course.");
      }

      setCourses(courses.filter((course) => course.id !== courseId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/course/book-list/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCourse),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create course.");
      }

      const courseResponse = await fetch("http://localhost:8000/api/course/book-list/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const courseData = await courseResponse.json();

      if (!courseResponse.ok) {
        throw new Error(courseData.message || "Failed to fetch courses.");
      }

      setCourses(courseData);

      setNewCourse({
        course_name: "",
        percent_completed: 0,
      });

      setShowCreateModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Courses Progress</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="btn-row">
      <Button variant="primary" onClick={() => setShowCreateModal(true)} className="create-btn">
        Create New Course
      </Button>
      </Row>
      <Row>
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <Col key={index} md={6} className="mb-4">
              <Card className="course-card">
                <Card.Body>
                  <Card.Title>{course.course_name}</Card.Title>
                  <ProgressBar
                    now={course.percent_completed}
                    label={`${course.percent_completed}%`}
                    animated
                    variant="success"
                  />
                  <p>Last Updated: {new Date(course.last_updated).toLocaleString()}</p>
                  <Button className="btn-form" onClick={() => handleOpenModal(course)} variant="warning">
                    Update Progress
                  </Button>
                  <Button className="ml-2 btn-form" onClick={() => handleDeleteCourse(course.id)} variant="danger">
                    Delete Course
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Alert variant="info">No course progress available.</Alert>
        )}
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleProgressUpdate}>
            <Form.Group className="mb-3" controlId="formProgress">
              <Form.Label>Course Name (Read Only)</Form.Label>
              <Form.Control type="text" value={selectedCourse?.course_name} readOnly />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProgressPercentage">
              <Form.Label>Progress Percentage</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={updatedProgress}
                onChange={(e) => setUpdatedProgress(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Update Progress
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateCourse}>
            <Form.Group className="mb-3" controlId="formCourseName">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course name"
                value={newCourse.course_name}
                onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCourseProgress">
              <Form.Label>Progress Percentage</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newCourse.percent_completed}
                onChange={(e) => setNewCourse({ ...newCourse, percent_completed: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Create Course
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CourseProgress;
