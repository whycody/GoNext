from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from todo_app.settings import EMAIL_HOST_USER
from .models import ToDo, Group
from .serializers import InvitationCreateSerializer, LoginSerializer, ToDoSerializer, UserSerializer, GroupSerializer
from django.contrib.auth import authenticate
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import timedelta
from .models import Invitation, Device
from django.conf import settings
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_str, force_bytes
from django.core.mail import send_mail

# Endpoint user-info
class UserInfoView(APIView):
    permission_classes = [AllowAny]  # Dostęp dla wszystkich
    
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "username": request.user.username,
                "status": "verified" if request.user.is_verified else "not_verified"
            }, status=200)
        return Response({"error": "Unauthorized"}, status=401)

# Rozszerzenie modelu użytkownika
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save(is_verified=False)  # Domyślnie niezweryfikowany
        self.send_verification_email(user)

    def send_verification_email(self, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verify_url = f"http://localhost:8000/api/verify-email/{uid}/{token}/"

        subject = "Verify your email"
        message = f"Click the link to verify: {verify_url}"
        from_email = EMAIL_HOST_USER  # Pobiera z settings.py
        recipient_list = [user.email]

        send_mail(subject, message, from_email, recipient_list, fail_silently=False)


# Endpoint do potwierdzania emaila
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)
        
        if default_token_generator.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({"message": "Email verified successfully"}, status=200)
        else:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


# Login – JWT token generation
class LoginView(APIView):
    permission_classes = [AllowAny]  # Allow any user to access this view, even if not authenticated
    # Define the expected input parameters using the `swagger_auto_schema` decorator
    @swagger_auto_schema(
        operation_description="Login and generate JWT tokens.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='The username of the user'
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='The password of the user'
                ),
                'remember_me': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description='Whether to stay logged in (optional)',
                    default=False
                ),
                'device_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Unique identifier for the device (required if remember_me is true)',
                    default=''
                )
            },
            required=['username', 'password']
        ),
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Retrieve the username and password from the request
        username = request.data.get('username')
        password = request.data.get('password')

        remember_me = request.data.get('remember_me', False)
        device_id = request.data.get('device_id', None)

        if remember_me and not device_id:
            device_id = "test-device-id-6ba7b810-9dad-11d1-80b4-00c04fd430c8"

        # Authenticate the user using Django's built-in authenticate function
        user = authenticate(username=username, password=password)

        if user:
            # If authentication is successful, generate the JWT token pair
            refresh = RefreshToken.for_user(user)
            refresh, access_token = create_new_tokens(user, remember_me)

            if remember_me and device_id:
                # Zapisujemy refresh token wraz z identyfikatorem urządzenia do bazy
                Device.objects.update_or_create(
                    user=user,
                    device_id=device_id,
                    defaults={
                        'refresh_token': str(refresh),
                        'created_at': timezone.now(),
                        'expires_at': timezone.now() + timedelta(days=7)  # lub inna logika wygaśnięcia
                    }
                )
            return Response({
                'access': str(access_token),
                'refresh': str(refresh),
            })
        else:
            # If authentication fails, return an error response
            return Response({'error': 'Invalid Credentials'}, status=400)
        

# Filtering tasks by user, group, and priority
def get_filtered_todos(request, user=None):
    """
    Filters tasks based on the user, group, and priority.
    """
    queryset = ToDo.objects.all()

    if user:
        queryset = queryset.filter(user=user)
    else:
        if not request.user.is_superuser:
            queryset = queryset.filter(user=request.user)

    # Filter by group
    group_id = request.query_params.get('group_id', None)
    if group_id:
        queryset = queryset.filter(group_id=group_id)

    # Filter by priority
    priority = request.query_params.get('priority', None)
    if priority:
        queryset = queryset.filter(priority=priority)

    # Ordering by priority
    ordering = request.query_params.get('ordering', None)
    if ordering:
        queryset = queryset.order_by(ordering)

    return queryset

# Returning tasks assigned directly to the user (not belonging to any group)
class ToDoByUserView(APIView):
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filtering tasks assigned directly to the user (i.e., without a group)
        todos = get_filtered_todos(request)
        todos_without_group = todos.filter(group=None)

        # Returning tasks that are not assigned to a group
        return Response(ToDoSerializer(todos_without_group, many=True).data)

# Returning tasks assigned to the user, grouped by their respective groups
class ToDoByGroupView(APIView):
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve the logged-in user
        user = request.user

        # Filter tasks assigned to this user and belonging to a group
        todos = ToDo.objects.filter(user=user, group__isnull=False)

        # Serialize the data
        serializer = ToDoSerializer(todos, many=True)

        # Return the response
        return Response(serializer.data)

# Task detail view – allows updating and deleting a task
class ToDoDetailView(generics.RetrieveUpdateDestroyAPIView):   
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]
    serializer_class = ToDoSerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return ToDo.objects.all()  # Admin can view all tasks
        return ToDo.objects.filter(user=self.request.user)  # Other users can view only their tasks

# User creates a task only for themselves (no group assignment)
class ToDoListCreateView(generics.ListCreateAPIView):  
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]
    
    serializer_class = ToDoSerializer
    def get_queryset(self):
        if self.request.user.is_superuser:
            return ToDo.objects.all()  # Admin sees all tasks
        return ToDo.objects.filter(user=self.request.user)  # Regular users can only see their tasks

    def perform_create(self, serializer):
        user = self.request.user
        data = self.request.data
        group_id = data.get('group')
        user_id = data.get('user')

        # Admin users have full control
        if user.is_superuser:
            if group_id:
                group_instance = Group.objects.get(id=group_id)
                for member in group_instance.members.all():
                    ToDo.objects.create(
                        user=member,
                        group=group_instance,
                        title=data['title'],
                        description=data.get('description', ''),
                        priority=int(data.get('priority', 2)),
                        due_date=data.get('due_date', None)
                    )
                return
            elif user_id:
                target_user = get_user_model().objects.get(id=user_id)
                serializer.save(user=target_user)
                return

        # Regular users cannot assign tasks to others or to a group
        if group_id or user_id:
            raise PermissionError("You cannot assign tasks to others or to a group.")

        serializer.save(user=user)  # Task is assigned to the current user

# View for admins – list of groups
class GroupListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]  # Only accessible to admins
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    
    queryset = Group.objects.all()  # Retrieve all groups
    serializer_class = GroupSerializer  # Use the Group serializer to format the response 

# View for admins – group detail view
class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]  # Only accessible to admins

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        print(queryset)  # Debug: Sprawdź zawartość queryset
        return queryset

# View for admins – create a new group
class GroupCreateView(generics.CreateAPIView):
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAdminUser]

    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def perform_create(self, serializer):
        # Automatycznie dodaj twórcę do członków grupy
        group = serializer.save(admin=self.request.user)  
        group.members.add(self.request.user)

class InvitationCreateView(APIView):
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]  # Tylko zalogowani użytkownicy mogą zaakceptować zaproszenie
    
    @swagger_auto_schema(
        request_body=InvitationCreateSerializer,  # Używamy serializatora jako body
        responses={201: 'Invitation created successfully', 400: 'Bad Request'},
    )
    def post(self, request):
        # Używamy serializera do walidacji danych
        serializer = InvitationCreateSerializer(data=request.data)
        if serializer.is_valid():
            group_id = serializer.validated_data['group_id']
            expiration_days = serializer.validated_data.get('expiration_days', 7)
            max_uses = serializer.validated_data.get('max_uses', 1)
            email = serializer.validated_data['email']

            try:
                group = Group.objects.get(id=group_id)
            except Group.DoesNotExist:
                return Response({"error": "Group not found"}, status=status.HTTP_400_BAD_REQUEST)

            expiration_date = timezone.now() + timedelta(days=expiration_days)

            # Tworzymy zaproszenie
            invitation = Invitation.objects.create(
                group=group,
                inviter=request.user,
                expiration_date=expiration_date,
                max_uses=max_uses
            )

            # Generujemy link zapraszający
            invite_link = f"{settings.FRONTEND_URL}/accept-invitation/{invitation.token}/"

            # Zwracamy link zaproszenia w odpowiedzi, nie wysyłając e-maila
            return Response({
                "message": "Invitation created successfully",
                "invite_link": invite_link
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AcceptInvitationView(APIView):
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]  # Tylko zalogowani użytkownicy mogą zaakceptować zaproszenie

    @swagger_auto_schema(
        responses={200: 'Invitation accepted successfully', 400: 'Bad Request', 404: 'Invitation not found'},
    )
    def post(self, request, token):
        try:
            invitation = Invitation.objects.get(token=token)
        except Invitation.DoesNotExist:
            return Response({"error": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)

        # Sprawdzamy, czy zaproszenie nie wygasło
        if invitation.expiration_date < timezone.now():
            return Response({"error": "Invitation has expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Sprawdzamy, czy zaproszenie ma jeszcze dostępne użycia
        if invitation.uses >= invitation.max_uses:
            return Response({"error": "Invitation has already been used the maximum number of times"}, status=status.HTTP_400_BAD_REQUEST)

        # Dodajemy użytkownika do grupy
        user = request.user
        group = invitation.group
        group.members.add(user)  # Doda
        # Zwiększamy liczbę użyć zaproszenia
        invitation.uses += 1
        invitation.save()

        return Response({
            "message": "Invitation accepted successfully. User: "+user.username+" added to group: "+group.name,
        }, status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]  # Sprawdza, czy użytkownik jest uwierzytelniony
    @swagger_auto_schema(
        operation_description="Logs out the user from a specific device by removing the refresh token.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'device_id': openapi.Schema(type=openapi.TYPE_STRING, description='The ID of the device',default=''),
                'refresh_token': openapi.Schema(type=openapi.TYPE_STRING, description='The refresh token to remove'),
            },
        ),
        responses={
            200: openapi.Response(description="Successfully logged out"),
            400: openapi.Response(description="Missing device_id or refresh_token"),
            404: openapi.Response(description="Token not found")
        }
    )
    def post(self, request):
        device_id = request.data.get('device_id')
        refresh_token = request.data.get('refresh_token')

        if not device_id or not refresh_token:
            return Response({"detail": "device_id and refresh_token are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            device = Device.objects.get(user=request.user, device_id=device_id, refresh_token=refresh_token)
            device.delete()  # Usuwamy token z bazy
            return Response({"detail": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Device.DoesNotExist:
            return Response({"detail": "Token not found"}, status=status.HTTP_404_NOT_FOUND)
        
    # Endpoint do odświeżania tokenu
class RefreshTokenView(APIView):
    authentication_classes = [JWTAuthentication]  # Sprawdza, czy użytkownik ma poprawny token
    permission_classes = [IsAuthenticated]  # Sprawdza, czy użytkownik jest uwierzytelniony
    
    @swagger_auto_schema(
        operation_description="Refreshes the access token using a valid refresh token.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'device_id': openapi.Schema(type=openapi.TYPE_STRING, description='The ID of the device', default=''),
                'refresh_token': openapi.Schema(type=openapi.TYPE_STRING, description='The refresh token to refresh'),
            },
        ),
        responses={
            200: openapi.Response(description="Successfully refreshed token"),
            400: openapi.Response(description="Refresh token expired"),
            404: openapi.Response(description="Invalid refresh token"),
        }
    )
    def post(self, request):
        device_id = request.data.get('device_id')
        refresh_token = request.data.get('refresh_token')

        if not device_id or not refresh_token:
            return Response({"detail": "device_id and refresh_token are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Sprawdzamy, czy istnieje urządzenie z odpowiednim device_id i refresh_token
            device = Device.objects.get(user=request.user, device_id=device_id, refresh_token=refresh_token)

            # Sprawdzamy, czy token wygasł
            if device.expires_at < timezone.now():
                return Response({"detail": "Refresh token expired"}, status=status.HTTP_400_BAD_REQUEST)

            # Generowanie nowych tokenów
            new_refresh_token, new_access_token = create_new_tokens(request.user,True)

            # Pobieramy datę wygaśnięcia starego refresh tokenu
            old_expiration = device.expires_at

            # Aktualizowanie refresh_token i expires_at w bazie
            device.refresh_token = new_refresh_token
            device.expires_at = old_expiration  # Ustawiamy na tę samą datę wygaśnięcia
            device.save()

            return Response({
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
            }, status=status.HTTP_200_OK)

        except Device.DoesNotExist:
            return Response({"detail": "Invalid refresh token or device_id"}, status=status.HTTP_404_NOT_FOUND)

def create_new_tokens(user, remember_me):
    # Generowanie refresh tokenu
    refresh = RefreshToken.for_user(user)
    
    # Ustawienie czasu wygaśnięcia na podstawie 'remember_me'
    if remember_me:
        refresh.set_exp(lifetime=timedelta(days=7))  # Jeśli 'remember_me' jest True, token ważny przez 7 dni
    else:
        refresh.set_exp(lifetime=timedelta(days=1))  # Jeśli 'remember_me' jest False, token ważny przez 1 dzień

    # Generowanie access tokenu z refresh tokenu
    access_token = refresh.access_token

    # Zwróć oba tokeny
    return str(refresh), str(access_token)