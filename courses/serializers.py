from rest_framework import serializers

from .models import Progress


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = ["id", "course_name", "percent_completed", "last_updated"]
        read_only_fields = ["id", "last_updated"]


class UserProgressUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = ["id", "percent_completed"]
