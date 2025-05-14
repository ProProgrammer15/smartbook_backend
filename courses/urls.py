from django.urls import path

from .views import BookRecommendations, CourseProgress, ProgressListCreateView, ProgressRetrieveUpdateDestroyAPIView

urlpatterns = [
    path("progress/", CourseProgress.as_view(), name="progress"),
    path("progress/<int:pk>/", ProgressRetrieveUpdateDestroyAPIView.as_view(), name="progress_retrieve_update_destroy"),
    path("recommendations/", BookRecommendations.as_view(), name="recommendations"),
    path("book-list/", ProgressListCreateView.as_view(), name="book-list"),
]
