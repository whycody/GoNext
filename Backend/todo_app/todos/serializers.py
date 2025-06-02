from rest_framework import serializers, exceptions as drf_exceptions
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model
from .models import ToDo, Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError 
User = get_user_model()  # Pobieramy nasz niestandardowy model użytkownika

from django.core.exceptions import ValidationError as DjangoValidationError

class ToDoSerializer(serializers.ModelSerializer):
    group_id = serializers.PrimaryKeyRelatedField(
        source='group',  # Nazwa pola ForeignKey w modelu ToDo
        queryset=Group.objects.all(), # Queryset dla modelu Group
        allow_null=True,  # Pozwala na brak grupy
        required=False    # Pole nie jest wymagane przy wysyłaniu danych
    )

    group_name = serializers.CharField(source='group.name', read_only=True, allow_null=True)

    class Meta:
        model = ToDo
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'is_completed',
            'group_id',
            'group_name',               
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
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}}
        }

    def validate_password(self, value):
        # Ta metoda jest automatycznie wywoływana dla pola 'password'
        # Tutaj wywołujemy skonfigurowane globalnie walidatory
        try:
            validate_password(value, user=None) # Dla nowo tworzonego użytkownika, user=None jest OK
                                                # (UserAttributeSimilarityValidator nie zadziała bez obiektu user)
                                                # Można by przekazać tymczasowy obiekt User z danymi z validated_data
                                                # aby UserAttributeSimilarityValidator miał co porównywać, ale to bardziej zaawansowane.
                                                # Dla prostoty, user=None.
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

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
    new_password = serializers.CharField(write_only=True, required=True, min_length=8, style={'input_type': 'password'})
    re_new_password = serializers.CharField(write_only=True, required=True, min_length=8, style={'input_type': 'password'})

    def validate(self, data):
        if data['new_password'] != data['re_new_password']:
            raise serializers.ValidationError("Hasła muszą być identyczne.")
        return data
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password1 = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'}) 
    new_password2 = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    current_device_id = serializers.CharField(
        required=False, 
        allow_blank=True, 
        allow_null=True, # Pozwól na null, jeśli klient nie wysyła tego pola
        write_only=True,
        help_text="Opcjonalne ID bieżącego urządzenia, aby zachować jego sesję 'zapamiętaj mnie'."
    )

    def validate_old_password(self, value):
        user = self.context.get('request').user
        if not user or not user.check_password(value):
            raise serializers.ValidationError("Podane stare hasło jest nieprawidłowe.")
        return value

    def validate_new_password1(self, value): # Zmieniono nazwę metody na validate_NAZWA_POLA
        user = self.context.get('request').user
        # Sprawdzenie, czy nowe hasło różni się od starego
        if user and user.check_password(value):
            raise serializers.ValidationError("Nowe hasło musi być inne niż stare hasło.")
        
        # Walidacja siły nowego hasła przy użyciu walidatorów Django
        if user:
            try:
                validate_password(value, user=user)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages)) # Przekształć na ValidationError z DRF
        else:
            # To nie powinno się zdarzyć, jeśli widok ma IsAuthenticated
            raise drf_exceptions.AuthenticationFailed("Użytkownik nie jest dostępny w kontekście serializatora.")
        return value

    def validate(self, data):
        # Sprawdzenie, czy nowe hasła są zgodne
        if data['new_password1'] != data['new_password2']:
            raise serializers.ValidationError({"new_password2": "Podane nowe hasła nie są identyczne."})
        return data