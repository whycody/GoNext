from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ToDo, Group

User = get_user_model()  # Pobieramy nasz niestandardowy model użytkownika

class ToDoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToDo
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Hasło tylko do zapisu

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class GroupSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'members']
