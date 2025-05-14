# SmartBook Backend

SmartBook Backend is a Django REST Framework-based API for handling user authentication, course progress tracking, and personalized book recommendations. It integrates with the Platzi Fake Store API to authenticate users and store their profile data, including name, email, and avatar. The API provides JWT-based authentication with token expiry and refresh logic to maintain secure access.

Users can register, sign in, and sign out through API endpoints, and their data is securely stored in the database. The system issues both access and refresh tokens on login. If an access token expires, the user can request a new access token using the refresh token, ensuring continuous authenticated access without re-entering credentials.

The project includes endpoints for:

- User registration, signin, signup, and profile retrieval.
- Tracking course progress for authenticated users.
- Fetching personalized book recommendations based on user activity.

The backend supports token expiry and refresh logic, allowing access tokens to expire after a set time while maintaining user sessions through refresh tokens. A dedicated endpoint returns all courses a user is currently taking, in a structure compatible with a provided test frontend.

# Docker and Docker Compose Setup

This project is fully containerized using Docker and managed with docker-compose. It simplifies local development, testing, and deployment.

For project execution, use the following command:

```bash
docker-compose up --build
```

To execute the test suite, use the following command:

```bash
docker-compose run web pytest
```

# Access the Application

- **Frontend**: http://localhost:3000 (default React port)
- **Backend**: http://localhost:8000 (Django port)

# Demo

File name: Smartbook_recommendation.mov

<video controls src="Smartbook_recommendation.mov" title="Title"></video>
