# todos/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # Pole email jako unikalne

    USERNAME_FIELD = 'username'  # Możliwość logowania za pomocą nazwy użytkownika
    REQUIRED_FIELDS = ['email']  # Email jest wymagany podczas tworzenia użytkownika, ale logować się można także za pomocą username

    def __str__(self):
        return f"{self.username} ({self.email})"
class Group(models.Model):
    name = models.CharField(max_length=100, unique=True)
    members = models.ManyToManyField(get_user_model(), related_name='custom_groups')

    def __str__(self):
        return self.name

class ToDo(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
    ]
    
    # Jedno pole assigned_to, które może być albo użytkownikiem, albo grupą
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='todos', null=True, blank=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='todos', null=True, blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    category = models.CharField(max_length=100, blank=True)
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.priority})"

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.user and not self.group:
            raise ValidationError('Zadanie musi być przypisane do użytkownika lub grupy.')
        if self.user and self.group:
            raise ValidationError('Zadanie nie może być przypisane zarówno do użytkownika, jak i do grupy.')
