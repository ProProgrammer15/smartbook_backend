import requests
from django.core.cache import cache
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from users.views import PlatziTokenAuthentication

from .models import Progress
from .serializers import UserProgressSerializer, UserProgressUpdateSerializer


class ProgressListCreateView(generics.ListCreateAPIView):
    authentication_classes = [PlatziTokenAuthentication]
    serializer_class = UserProgressSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        return Progress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProgressRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [PlatziTokenAuthentication]

    def get_queryset(self):
        return Progress.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return UserProgressSerializer

        return UserProgressUpdateSerializer

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class BookRecommendations(generics.ListAPIView):
    authentication_classes = [PlatziTokenAuthentication]
    pagination_class = PageNumberPagination

    def list(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        cache_key = f"recommendations_{user.id}"
        cached_books = cache.get(cache_key)

        if cached_books:
            return Response(cached_books)

        user_courses = Progress.objects.filter(user=user)
        keywords = [course.course_name for course in user_courses]

        books = []
        for kw in keywords:
            try:
                res = requests.get(
                    f"https://openlibrary.org/search.json?q={kw}&limit=2", timeout=30
                )
                if res.status_code == 200:
                    docs = res.json().get("docs", [])
                    for doc in docs:
                        authors = ", ".join(doc.get("author_name", ["Unknown"]))
                        image_id = doc.get("cover_i")
                        image_url = (
                            f"https://covers.openlibrary.org/b/id/{image_id}-L.jpg"
                            if image_id
                            else None
                        )
                        book_data = {
                            "authors": authors,
                            "image": image_url,
                            "title": doc.get("title"),
                        }
                        books.append(book_data)
            except requests.RequestException as e:
                print(f"Error fetching books for keyword '{kw}': {e}")
                continue

        cache.set(cache_key, books, timeout=3600)
        
        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(books, request)
        return paginator.get_paginated_response(result_page)


class CourseProgress(APIView):
    authentication_classes = [PlatziTokenAuthentication]

    def get(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user_courses = Progress.objects.filter(user=user)
        courses = [
            {
                "course": course.course_name,
                "progress": course.percent_completed,
            }
            for course in user_courses
        ]

        return Response(courses)
