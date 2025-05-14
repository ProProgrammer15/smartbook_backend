import React, { useEffect, useState } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/course/recommendations/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch course recommendations.");
        }
        setRecommendations(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching recommendations.');
        setLoading(false);
      }
    };

    fetchCourseProgress();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container>
      <h2 className="text-center my-4">Course Recommendations</h2>
      <Row className="d-flex justify-content-center">
        {recommendations.map((recommendation, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card style={{ width: '100%' }}>
                <Card.Img
                  variant="top"
                  src={recommendation.image ? recommendation.image : 'https://gravatar.com/avatar/8e3a96cb1fb1edaa44920349ccda0bc4?s=400&d=identicon&r=x'}
                  alt={recommendation.title}
                  style={{ height: '15rem', objectFit: 'cover' }}
                />
              <Card.Body>
                <Card.Title>{recommendation.title}</Card.Title>
                <Card.Text>
                  <strong>Author:</strong> {recommendation.authors}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Recommendations;
