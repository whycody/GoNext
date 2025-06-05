# todos/models.py
import random
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True) 

    is_verified = models.BooleanField(
            default=False,
            help_text='Designates whether the user has verified their email address.'
        )
    USERNAME_FIELD = 'username'  
    REQUIRED_FIELDS = ['email']  

    def __str__(self):
        return f"{self.username} ({self.email})"


class Group(models.Model):
    name = models.CharField(max_length=100, unique=False)
    members = models.ManyToManyField(get_user_model(), related_name='custom_groups')
    icon = models.CharField(max_length=100, blank=True, default='')
    color = models.CharField(max_length=50, blank=True, default='')
    admins = models.ManyToManyField( 
        get_user_model(),
        related_name='administered_groups', 
        blank=True 
    )

    def __str__(self):
        return self.name


class ToDo(models.Model):
    
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='todos', null=True, blank=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='todos', null=True, blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.IntegerField(default=2)
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
    token = models.CharField(max_length=6, unique=True, blank=True)  
    group = models.ForeignKey(Group, on_delete=models.CASCADE)  
    inviter = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)  
    expiration_date = models.DateTimeField()  
    max_uses = models.PositiveIntegerField(default=1)  
    uses = models.PositiveIntegerField(default=0)  

    def _generate_short_token(self):
        return ''.join(random.choices('0123456789', k=6))

    def save(self, *args, **kwargs):
        if not self.token: 
            while True:
                potential_token = self._generate_short_token()
                if not Invitation.objects.filter(token=potential_token).exists():
                    self.token = potential_token
                    break
        super().save(*args, **kwargs) 

    def is_valid(self):
        """Sprawdza, czy zaproszenie jest ważne (nie wygasło i nie zostało przekroczona liczba użyć)."""
        return self.uses < self.max_uses and timezone.now() < self.expiration_date

    def __str__(self):
        return f"Invitation to {self.group.name} by {self.inviter.username}"
    
class Device(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    device_id = models.CharField(max_length=255)  
    refresh_token = models.CharField(max_length=500)  
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()         
    remember_me = models.BooleanField(default=False)