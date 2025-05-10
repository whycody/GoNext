# todos/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # Pole email jako unikalne

    is_verified = models.BooleanField(
            default=False,
            help_text='Designates whether the user has verified their email address.'
        )
    USERNAME_FIELD = 'username'  # Możliwość logowania za pomocą nazwy użytkownika
    REQUIRED_FIELDS = ['email']  # Email jest wymagany podczas tworzenia użytkownika, ale logować się można także za pomocą username

    def __str__(self):
        return f"{self.username} ({self.email})"


class Group(models.Model):
    name = models.CharField(max_length=100, unique=True)
    members = models.ManyToManyField(get_user_model(), related_name='custom_groups')
    admins = models.ManyToManyField( # Zamiana na ManyToManyField
        get_user_model(),
        related_name='administered_groups', # Nazwa relacji zwrotnej może pozostać
        blank=True # Pozwala grupie istnieć bez żadnych adminów (opcjonalne, ale często przydatne)
    )


    def __str__(self):
        return self.name


class ToDo(models.Model):
    # Pole priority jako IntegerField bez choices
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='todos', null=True, blank=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='todos', null=True, blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.IntegerField(default=2)
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
        


class Invitation(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True)  # Unikalny token
    group = models.ForeignKey(Group, on_delete=models.CASCADE)  # Grupa, do której zapraszamy
    inviter = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)  # Osoba, która zaprasza
    expiration_date = models.DateTimeField()  # Data wygaśnięcia zaproszenia
    max_uses = models.PositiveIntegerField(default=1)  # Maksymalna liczba użyć zaproszenia
    uses = models.PositiveIntegerField(default=0)  # Liczba użyć zaproszenia

    def is_valid(self):
        """Sprawdza, czy zaproszenie jest ważne (nie wygasło i nie zostało przekroczona liczba użyć)."""
        return self.uses < self.max_uses and timezone.now() < self.expiration_date

    def __str__(self):
        return f"Invitation to {self.group.name} by {self.inviter.username}"
    
class Device(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    device_id = models.CharField(max_length=255)  # hashed or UUID string
    refresh_token = models.CharField(max_length=500)  # JWT token string
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()         
    remember_me = models.BooleanField(default=False)