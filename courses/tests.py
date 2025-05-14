from unittest.mock import patch

from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import UserProfile

from .models import Progress


class CourseAPITests(APITestCase):
    def setUp(self):
        self.user = UserProfile.objects.create(
            email="testuser@example.com",
            name="Test User",
            avatar="https://example.com/avatar.jpg",
        )
        self.client.force_authenticate(user=self.user)

        self.progress_url = reverse("progress")
        self.recommendations_url = reverse("recommendations")
        self.book_list_url = reverse("book-list")

    def test_create_user_progress(self):
        data = {"course_name": "Django Basics", "percent_completed": 40.0}
        response = self.client.post(self.book_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Progress.objects.count(), 1)

    def test_list_user_progress(self):
        Progress.objects.create(
            user=self.user, course_name="Data Science", percent_completed=80.0
        )
        Progress.objects.create(
            user=self.user, course_name="Machine Learning", percent_completed=90.0
        )

        response = self.client.get(self.book_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data.get("results")), 2)

    @patch("requests.get")
    def test_book_recommendations_success(self, mock_get):
        Progress.objects.create(
            user=self.user, course_name="Python", percent_completed=60.0
        )

        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "docs": [
                {
                    "title": "Learn Python",
                    "author_name": ["Guido van Rossum"],
                    "cover_i": 12345,
                },
                {
                    "title": "Python Advanced",
                    "author_name": ["Someone Else"],
                    "cover_i": None,
                },
            ]
        }

        response = self.client.get(self.recommendations_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_book_recommendations_from_cache(self):
        cached_books = [
            {
                "title": "Cached Book",
                "authors": "Author Name",
                "image": "http://image.com/book.jpg",
            }
        ]
        cache.set(f"recommendations_{self.user.id}", cached_books, timeout=3600)

        response = self.client.get(self.recommendations_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, cached_books)

    def test_book_recommendations_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.recommendations_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_course_progress(self):
        Progress.objects.create(
            user=self.user, course_name="Node.js", percent_completed=75.0
        )
        Progress.objects.create(
            user=self.user, course_name="Docker", percent_completed=85.0
        )

        response = self.client.get(self.progress_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_course_progress_empty(self):
        response = self.client.get(self.progress_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_course_progress_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.progress_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
