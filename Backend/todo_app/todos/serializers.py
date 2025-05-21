from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model
from .models import ToDo, Group

User = get_user_model()  # Pobieramy nasz niestandardowy model użytkownika

class ToDoSerializer(serializers.ModelSerializer):
    group_id = serializers.PrimaryKeyRelatedField(
        source='group',  # Nazwa pola ForeignKey w modelu ToDo
        queryset=Group.objects.all(), # Queryset dla modelu Group
        allow_null=True,  # Pozwala na brak grupy
        required=False    # Pole nie jest wymagane przy wysyłaniu danych
    )
    class Meta:
        model = ToDo
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'is_completed',
            'group_id',                
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    remember_me = serializers.BooleanField(required=False, default=False)
    device_id = serializers.CharField(required=False, allow_blank=True)

class InvitationCreateSerializer(serializers.Serializer):
    group_id = serializers.IntegerField(required=True)
    expiration_days = serializers.IntegerField(required=False, default=7)
    max_uses = serializers.IntegerField(required=False, default=1)
    email = serializers.EmailField(
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="Opcjonalnie: adres e-mail osoby zapraszanej. Jeśli nie podano, link zostanie zwrócony w odpowiedzi i można go przesłać samodzielnie."
    )
    
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

# Serializator dla członka grupy z przypisaną rolą
class GroupMemberSerializer(serializers.ModelSerializer): 
    role = serializers.SerializerMethodField()

    class Meta:
        model = User 
        fields = ['id', 'username', 'role'] 

    def get_role(self, obj):
        """
        Określa rolę użytkownika w kontekście grupy.
        'obj' to instancja User.
        Kontekst 'group' jest przekazywany z GroupSerializer.
        """
        group = self.context.get('group')
        if group and group.admins.filter(id=obj.id).exists(): 
            return 'admin'
        return 'user'


class GroupSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField() 

    class Meta:
        model = Group
        fields = ['id', 'name','icon','color', 'members'] 

    def get_members(self, obj): 
        """
        Pobiera wszystkich członków grupy i serializuje ich za pomocą GroupMemberSerializer.
        'obj' to instancja Group.
        """
        queryset = obj.members.all() 
        
        serializer_context = {'group': obj, 'request': self.context.get('request')}
        # Używamy zaktualizowanej nazwy GroupMemberSerializer
        return GroupMemberSerializer(queryset, many=True, context=serializer_context).data

    def create(self, validated_data):
        request = self.context.get('request')
        
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Nie można utworzyć grupy: Wymagany jest kontekst uwierzytelnionego użytkownika."
            )
        
        current_user = request.user
        
        group = Group.objects.create(**validated_data)
        
        group.admins.add(current_user)
        group.members.add(current_user)
        
        return group


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=8)
    re_new_password = serializers.CharField(min_length=8)

    def validate(self, data):
        if data['new_password'] != data['re_new_password']:
            raise serializers.ValidationError("Hasła muszą być identyczne.")
        return data