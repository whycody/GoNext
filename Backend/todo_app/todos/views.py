from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from datetime import timedelta

from rest_framework import generics, status, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from todo_app.settings import EMAIL_HOST_USER
from .models import ToDo, Group, Invitation, Device
from .serializers import InvitationCreateSerializer, LoginSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer, ToDoSerializer, UserSerializer, GroupSerializer

# Endpoint user-info
class UserInfoView(APIView):
    permission_classes = [AllowAny]  # Dostęp dla wszystkich

    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "username": request.user.username,
                "status": "verified" if request.user.is_verified else "not_verified"
            }, status=status.HTTP_200_OK)
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)


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
        # Użycie zmiennej z settings zamiast hardcodowanego localhosta byłoby lepsze w produkcji
        verify_url = f"http://localhost:8000/verify-email/{uid}/{token}/"

        subject = "Verify your email"
        message = f"Click the link to verify: {verify_url}"
        recipient_list = [user.email]
        send_mail(subject, message, EMAIL_HOST_USER, recipient_list, fail_silently=False)


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
            return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


# Login – JWT token generation
class LoginView(APIView):
    permission_classes = [AllowAny]  # Allow any user to access this view, even if not authenticated

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
        validated_data = serializer.validated_data

        username = validated_data.get('username')
        password = validated_data.get('password')
        remember_me = validated_data.get('remember_me', False)
        device_id = validated_data.get('device_id') or None

        if remember_me and not device_id:
            # Domyślny identyfikator, warto podmienić na generowanie unikalnego identyfikatora
            device_id = "test-device-id-6ba7b810-9dad-11d1-80b4-00c04fd430c8"

        user = authenticate(username=username, password=password)
        if user:
            # Generowanie tokenów przy użyciu dedykowanej funkcji
            refresh, access_token = create_new_tokens(user, remember_me)

            if remember_me and device_id:
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
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)


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

    group_id = request.query_params.get('group_id')
    if group_id:
        queryset = queryset.filter(group_id=group_id)

    priority = request.query_params.get('priority')
    if priority:
        queryset = queryset.filter(priority=priority)

    ordering = request.query_params.get('ordering')
    if ordering:
        queryset = queryset.order_by(ordering)

    return queryset


# Returning tasks assigned directly to the user (not belonging to any group)
class ToDoByUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        todos = get_filtered_todos(request)
        todos_without_group = todos.filter(group=None)
        return Response(ToDoSerializer(todos_without_group, many=True).data, status=status.HTTP_200_OK)


# Returning tasks assigned to the user, grouped by their respective groups
class ToDoByGroupView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        todos = ToDo.objects.filter(user=user, group__isnull=False)
        serializer = ToDoSerializer(todos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Task detail view – allows updating and deleting a task
class ToDoDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ToDoSerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return ToDo.objects.all()
        return ToDo.objects.filter(user=self.request.user)


# User creates a task only for themselves (no group assignment)
class ToDoListCreateView(generics.ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ToDoSerializer

    def get_queryset(self):
        if self.request.user.is_superuser:
            return ToDo.objects.all()
        return ToDo.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        data = self.request.data
        group_id = data.get('group')
        user_id = data.get('user')

        # Admin users have full control
        if user.is_superuser:
            if group_id:
                try:
                    group_instance = Group.objects.get(id=group_id)
                except Group.DoesNotExist:
                    raise exceptions.NotFound("Group not found")
                for member in group_instance.members.all():
                    ToDo.objects.create(
                        user=member,
                        group=group_instance,
                        title=data['title'],
                        description=data.get('description', ''),
                        priority=int(data.get('priority', 2)),
                        due_date=data.get('due_date')
                    )
                return
            elif user_id:
                try:
                    target_user = get_user_model().objects.get(id=user_id)
                except get_user_model().DoesNotExist:
                    raise exceptions.NotFound("User not found")
                serializer.save(user=target_user)
                return

        # Regular users cannot assign tasks to others or to a group.
        if group_id or user_id:
            raise exceptions.PermissionDenied("You cannot assign tasks to others or to a group.")

        serializer.save(user=user)


# View for admins – list of groups
class GroupListView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


# View for admins – group detail view
class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # Debug: możesz usunąć poniższy print w produkcji
        print(queryset)
        return queryset


# View for admins – create a new group
class GroupCreateView(generics.CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def perform_create(self, serializer):
        group = serializer.save(admin=self.request.user)
        group.members.add(self.request.user)


class InvitationCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=InvitationCreateSerializer,
        responses={201: 'Invitation created successfully', 400: 'Bad Request'},
    )
    def post(self, request):
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
            invitation = Invitation.objects.create(
                group=group,
                inviter=request.user,
                expiration_date=expiration_date,
                max_uses=max_uses
            )
            invite_link = f"{settings.FRONTEND_URL}/accept-invitation/{invitation.token}/"
            return Response({
                "message": "Invitation created successfully",
                "invite_link": invite_link
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcceptInvitationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: 'Invitation accepted successfully', 400: 'Bad Request', 404: 'Invitation not found'},
    )
    def post(self, request, token):
        try:
            invitation = Invitation.objects.get(token=token)
        except Invitation.DoesNotExist:
            return Response({"error": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)

        if invitation.expiration_date < timezone.now():
            return Response({"error": "Invitation has expired"}, status=status.HTTP_400_BAD_REQUEST)

        if invitation.uses >= invitation.max_uses:
            return Response({"error": "Invitation has already been used the maximum number of times"},
                            status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        group = invitation.group
        group.members.add(user)
        invitation.uses += 1
        invitation.save()

        return Response({
            "message": f"Invitation accepted successfully. User: {user.username} added to group: {group.name}"
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Logs out the user from a specific device by removing the refresh token.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'device_id': openapi.Schema(type=openapi.TYPE_STRING, description='The ID of the device', default=''),
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
            return Response({"detail": "device_id and refresh_token are required"},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            device = Device.objects.get(user=request.user, device_id=device_id, refresh_token=refresh_token)
            device.delete()
            return Response({"detail": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Device.DoesNotExist:
            return Response({"detail": "Token not found"}, status=status.HTTP_404_NOT_FOUND)


class RefreshTokenView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

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
            return Response({"detail": "device_id and refresh_token are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            device = Device.objects.get(user=request.user, device_id=device_id, refresh_token=refresh_token)
            if device.expires_at < timezone.now():
                return Response({"detail": "Refresh token expired"}, status=status.HTTP_400_BAD_REQUEST)
            new_refresh_token, new_access_token = create_new_tokens(request.user, True)
            old_expiration = device.expires_at
            device.refresh_token = new_refresh_token
            device.expires_at = old_expiration  # zachowujemy datę wygaśnięcia
            device.save()
            return Response({
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
            }, status=status.HTTP_200_OK)
        except Device.DoesNotExist:
            return Response({"detail": "Invalid refresh token or device_id"}, status=status.HTTP_404_NOT_FOUND)


def create_new_tokens(user, remember_me):
    refresh = RefreshToken.for_user(user)
    if remember_me:
        refresh.set_exp(lifetime=timedelta(days=7))
    else:
        refresh.set_exp(lifetime=timedelta(days=1))
    access_token = refresh.access_token
    return str(refresh), str(access_token)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=PasswordResetRequestSerializer)
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Nie ujawniamy, że e‑mail nie istnieje
            return Response({"message": "Jeśli konto istnieje, otrzymasz wiadomość e‑mail."})

        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/password-reset-confirm/{uidb64}/{token}/"

        subject = "Reset hasła"
        message = f"Clique w link, aby zresetować hasło: {reset_url}"
        send_mail(subject, message, EMAIL_HOST_USER, [email], fail_silently=False)

        return Response({"message": "Link do resetu hasła został wysłany."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        """
        # Verifies UID and token. 
        # The front-end can display the password reset form upon receiving a 200 response.

        """
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({'error': 'Invalid link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Token is valid.'}, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=PasswordResetConfirmSerializer)
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({"error": "Link jest nieprawidłowy."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token jest nieprawidłowy lub wygasł."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Hasło zostało zmienione pomyślnie."}, status=status.HTTP_200_OK)