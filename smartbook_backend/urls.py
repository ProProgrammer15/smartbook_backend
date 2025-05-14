from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/", include("users.urls")),
    path("api/course/", include("courses.urls")),
]
