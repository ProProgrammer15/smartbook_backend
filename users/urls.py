from django.urls import path

from .views import ProfileView, RefreshTokenView, RegisterView, SignInView, SignOutView

urlpatterns = [
    path("signin/", SignInView.as_view(), name="signin"),
    path("signout/", SignOutView.as_view(), name="signout"),
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("refresh/", RefreshTokenView.as_view(), name="refresh_token"),
]
