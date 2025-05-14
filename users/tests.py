import pytest
from rest_framework import status
from rest_framework.test import APIClient, APIRequestFactory, force_authenticate

from users.models import UserProfile
from users.views import ProfileView


@pytest.mark.django_db
def test_register_user_success(requests_mock):
    url = "https://api.escuelajs.co/api/v1/users/"
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "securepass123",
        "avatar": "https://example.com/avatar.jpg",
    }

    # Mock Platzi registration
    requests_mock.post(url, status_code=201, json={**payload, "id": 123})

    client = APIClient()
    response = client.post("/api/user/register/", payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["detail"] == "User registered successfully"
    assert UserProfile.objects.filter(email=payload["email"]).exists()


@pytest.mark.django_db
def test_signin_success(requests_mock):
    login_url = "https://api.escuelajs.co/api/v1/auth/login"
    profile_url = "https://api.escuelajs.co/api/v1/auth/profile"

    email = "jane@example.com"
    password = "securepass123"
    access_token = "fake-access"
    refresh_token = "fake-refresh"

    requests_mock.post(
        login_url,
        status_code=201,
        json={"access_token": access_token, "refresh_token": refresh_token},
    )

    requests_mock.get(
        profile_url,
        status_code=200,
        json={
            "name": "Jane Doe",
            "email": email,
            "avatar": "https://example.com/avatar.jpg",
        },
    )

    client = APIClient()
    response = client.post(
        "/api/user/signin/", {"email": email, "password": password}, format="json"
    )

    assert response.status_code == 200
    assert response.data["email"] == email
    assert response.data["name"] == "Jane Doe"
    assert response.data["avatar"] == "https://example.com/avatar.jpg"


@pytest.mark.django_db
def test_signout_user():
    user = UserProfile.objects.create(
        email="jane@example.com",
        name="Jane",
        access_token="tok123",
        refresh_token="ref123",
    )

    client = APIClient()
    response = client.post("/api/user/signout/", {"email": user.email}, format="json")

    user.refresh_from_db()
    assert response.status_code == 200
    assert user.access_token == ""
    assert user.refresh_token == ""


@pytest.mark.django_db
def test_profile_view_authenticated():
    user = UserProfile.objects.create(
        email="jane@example.com", name="Jane", avatar="url"
    )

    factory = APIRequestFactory()
    request = factory.get("/api/user/profile/")
    force_authenticate(request, user=user)
    response = ProfileView.as_view()(request)

    assert response.status_code == 200
    assert response.data["email"] == user.email


@pytest.mark.django_db
def test_refresh_token_success(requests_mock):
    login_url = "https://api.escuelajs.co/api/v1/auth/login"

    user = UserProfile.objects.create(
        email="jane@example.com", name="Jane", avatar="https://example.com/avatar.jpg"
    )
    user.set_password("securepass123")
    user.save()

    requests_mock.post(
        login_url,
        status_code=201,
        json={"access_token": "new-access", "refresh_token": "new-refresh"},
    )

    client = APIClient()
    response = client.post(
        "/api/user/refresh/",
        {"email": user.email, "password": "securepass123"},
        format="json",
    )

    user.refresh_from_db()
    assert response.status_code == 200
    assert user.access_token == "new-access"
    assert user.refresh_token == "new-refresh"
