import requests
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializers import UserProfileSerializer

PLATZI_LOGIN_URL = "https://api.escuelajs.co/api/v1/auth/login"
PLATZI_PROFILE_URL = "https://api.escuelajs.co/api/v1/auth/profile"
PLATZI_REGISTER_URL = "https://api.escuelajs.co/api/v1/users/"


class RegisterView(APIView):
    def post(self, request):
        name = request.data.get("name")
        email = request.data.get("email")
        password = request.data.get("password")
        avatar = request.data.get("avatar", "https://i.imgur.com/mEyP5cC.jpeg")

        if not all([name, email, password]):
            return Response(
                {"detail": "Name, email, and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            response = requests.post(
                PLATZI_REGISTER_URL,
                json={
                    "name": name,
                    "email": email,
                    "password": password,
                    "avatar": avatar,
                },
            )

            if response.status_code != 201:
                return Response(
                    {"detail": "Registration failed", "errors": response.json()},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user, _ = UserProfile.objects.get_or_create(email=email)
            user.name = name
            user.avatar = avatar
            user.set_password(password)
            user.save()

            return Response(
                {"detail": "User registered successfully"},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            print(f"Error during registration: {e}")
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SignInView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            response = requests.post(
                PLATZI_LOGIN_URL, json={"email": email, "password": password}
            )
            if response.status_code != 201:
                return Response(
                    {"detail": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            tokens = response.json()
            access_token = tokens.get("access_token")
            refresh_token = tokens.get("refresh_token")

            user_response = requests.get(
                PLATZI_PROFILE_URL, headers={"Authorization": f"Bearer {access_token}"}
            )
            if user_response.status_code != 200:
                return Response(
                    {"detail": "Failed to fetch profile"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            profile_data = user_response.json()

            user, _ = UserProfile.objects.update_or_create(
                email=profile_data["email"],
                defaults={
                    "name": profile_data["name"],
                    "avatar": profile_data["avatar"],
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                },
            )
            user.set_password(password)
            user.save()

            serializer = UserProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SignOutView(APIView):
    def post(self, request):
        email = request.data.get("email")

        try:
            user = get_object_or_404(UserProfile, email=email)
            user.access_token = ""
            user.refresh_token = ""
            user.save()
            return Response({"detail": "Logged out"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PlatziTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None
        parts = auth_header.strip().split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None
        token = parts[1]

        try:
            user = UserProfile.objects.get(access_token=token)
            return (user, None)
        except UserProfile.DoesNotExist:
            raise AuthenticationFailed("Invalid or expired token")


class ProfileView(APIView):
    authentication_classes = [PlatziTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    def post(self, request):
        email = request.data.get("email")

        try:
            user = get_object_or_404(UserProfile, email=email)

            if not user.password:
                return Response(
                    {"detail": "Password not stored. Cannot refresh token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            raw_password = request.data.get("password")
            if raw_password and user.check_password(raw_password):
                password_to_use = raw_password
            elif user.password:
                password_to_use = raw_password if raw_password else None
                if password_to_use is None:
                    return Response(
                        {"detail": "Password not provided or stored."}, status=400
                    )
            else:
                return Response(
                    {"detail": "Password not available for refresh."}, status=400
                )

            response = requests.post(
                PLATZI_LOGIN_URL,
                json={"email": user.email, "password": password_to_use},
            )

            if response.status_code != 201:
                return Response(
                    {"detail": "Token refresh failed"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            tokens = response.json()
            user.access_token = tokens.get("access_token")
            user.refresh_token = tokens.get("refresh_token")
            user.save()

            return Response(
                {
                    "access_token": user.access_token,
                    "refresh_token": user.refresh_token,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
