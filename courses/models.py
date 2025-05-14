from django.db import models
from users.models import UserProfile


class Progress(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    course_name = models.CharField(max_length=255)
    percent_completed = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.course_name}"
