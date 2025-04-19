from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model
from .models import ToDo, Group

User = get_user_model()  # Pobieramy nasz niestandardowy model użytkownika

class ToDoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToDo
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    remember_me = serializers.BooleanField(required=False, default=False)
    device_id = serializers.CharField(required=False, allow_blank=True)

class InvitationCreateSerializer(serializers.Serializer):
    group_id = serializers.IntegerField(required=True)
    expiration_days = serializers.IntegerField(required=False, default=7)
    max_uses = serializers.IntegerField(required=False, default=1)
    email = serializers.EmailField(required=True)


class UserSerializer(serializers.ModelSerializer):
    # Dodajemy walidatory unikalności dla username i email
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Username already exists.")]
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Email is already in use.")]
    )
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        # Można tu wstawić dodatkową logikę np. walidację siły hasła
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']  # members nie są wymagani przy tworzeniu grupy

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user:
            group = Group.objects.create(name=validated_data['name'], admin=request.user)
            group.members.add(request.user)
            return group
        raise serializers.ValidationError("Cannot create group without an authenticated user.")

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=8)
    re_new_password = serializers.CharField(min_length=8)

    def validate(self, data):
        if data['new_password'] != data['re_new_password']:
            raise serializers.ValidationError("Hasła muszą być identyczne.")
        return data