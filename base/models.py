from django.db import models

# Create your models here.

class Room(models.Model):
    username = models.CharField(max_length=10)
    uid = models.CharField(max_length=500)
    room_name = models.CharField(max_length=150)

    def __str__(self):
        return self.username