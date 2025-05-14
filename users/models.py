from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class UserProfile(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    avatar = models.URLField()
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    password = models.CharField(max_length=255, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self):
        return True
