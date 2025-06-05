import logging
import random
import uuid
from django.contrib.auth import get_user_model, authenticate, update_session_auth_hash 
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils import timezone
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from datetime import timedelta

from rest_framework import generics, status, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken as SimpleJWTRefreshToken 
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from todo_app.settings import EMAIL_HOST_USER
from .models import ToDo, Group, Invitation, Device
from .serializers import ChangePasswordSerializer, InvitationCreateSerializer, LoginSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer, ToDoSerializer, UserSerializer, GroupSerializer
from axes.handlers.proxy import AxesProxyHandler
from axes.helpers import get_client_username, get_client_ip_address
from todos.utils import lockout_response 
from .permissions import IsGroupAdmin, IsGroupAdminOrMemberReadOnly, IsTaskOwnerOrGroupMember 
from django.db.models import Q

from rest_framework.exceptions import PermissionDenied

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class UserInfoView(APIView):
    permission_classes = [AllowAny]  
    @swagger_auto_schema(
        operation_description=(
            "Zwraca nazwę użytkownika (username) oraz status weryfikacji jego adresu email "
            "('verified' lub 'not_verified'), jeśli użytkownik jest uwierzytelniony. "
            "Jeśli użytkownik nie jest uwierzytelniony, zwraca błąd 401."
        ),
    )
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "username": request.user.username,
                "user_id": request.user.id,
                "status": "verified" if request.user.is_verified else "not_verified"
            }, status=status.HTTP_200_OK)
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save(is_verified=False)  
        self.send_verification_email(user)

    def send_verification_email(self, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.id))
        verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"

        subject = "Verify your email"
        message = f"Click the link to verify: {verify_url}"
        recipient_list = [user.email]
        send_mail(subject, message, EMAIL_HOST_USER, recipient_list, fail_silently=False)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(id=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]  

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
        device_id_from_client = validated_data.get('device_id') or None

        if AxesProxyHandler.is_locked(request):
            return lockout_response(request, credentials={"username": username})

        generated_device_id_on_server = None 
        device_id_to_store = None
        
        if remember_me:
            if not device_id_from_client:
                generated_device_id_on_server = str(uuid.uuid4())
                device_id_to_store = generated_device_id_on_server
            else:
                device_id_to_store = device_id_from_client

        user = authenticate(request=request, username=username, password=password)
        if user:
            if user.is_superuser:
                logger = logging.getLogger(__name__)
                logger.warning(f"Superuser '{user.username}' attempt to login via API blocked.")
                raise PermissionDenied(
                    ("Superadministratorzy mogą logować się tylko przez panel administracyjny Django.")
                )
            username_for_axes = get_client_username(request, credentials={'username': username})
            ip_address = get_client_ip_address(request)

            handler = AxesProxyHandler()
            handler.reset_attempts(
                ip_address=ip_address,
                username=username_for_axes,
            )
            refresh, access_token = create_new_tokens(user, remember_me)

            response_data = {
                                'access': str(access_token),
                                'refresh': str(refresh),
                            }

            if device_id_to_store:
                 refresh_lifetime_setting = settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME', timedelta(days=30))
                 short_lifetime = timedelta(days=1)

                 session_duration = refresh_lifetime_setting if remember_me else short_lifetime

                 Device.objects.update_or_create(
                     user=user,
                     device_id=device_id_to_store,
                     defaults={
                         'refresh_token': str(refresh),
                         'expires_at': timezone.now() + session_duration,
                         'remember_me': remember_me 
                     }
                 )
                 if generated_device_id_on_server:
                    response_data['device_id'] = generated_device_id_on_server
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)


def get_filtered_todos(request, requesting_user=None):
    if not requesting_user:
        requesting_user = request.user

    if not requesting_user or not requesting_user.is_authenticated:
        return ToDo.objects.none()

    base_queryset = ToDo.objects.all()

    if not requesting_user.is_superuser:
        base_queryset = base_queryset.filter(
            Q(user=requesting_user) | 
            (Q(group__members=requesting_user) & Q(user__isnull=True))
        ).distinct()

    group_id_param = request.query_params.get('group_id')
    if group_id_param:
        try:
            base_queryset = base_queryset.filter(group_id=int(group_id_param))
        except ValueError:
            return ToDo.objects.none()

    priority_param = request.query_params.get('priority')
    if priority_param:
        try:
            base_queryset = base_queryset.filter(priority=int(priority_param))
        except ValueError:
            pass 

    ordering_param = request.query_params.get('ordering')
    if ordering_param:
        allowed_ordering = ['title', '-title', 'priority', '-priority', 'created_at', '-created_at', 'is_completed', '-is_completed']
        if ordering_param in allowed_ordering:
            base_queryset = base_queryset.order_by(ordering_param)
    else:
        base_queryset = base_queryset.order_by('-created_at')

    return base_queryset

class ToDoByUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        todos = get_filtered_todos(request)
        serializer = ToDoSerializer(todos, many=True) 
        return Response(serializer.data, status=status.HTTP_200_OK)


# Returning tasks assigned to the user, grouped by their respective groups
class ToDoByGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        todos = ToDo.objects.filter(
            group__members=user, 
            user__isnull=True
        ).distinct()
        
        group_id_param = request.query_params.get('group_id')
        if group_id_param:
            try:
                todos = todos.filter(group_id=int(group_id_param))
            except ValueError:
                todos = ToDo.objects.none()

        priority_param = request.query_params.get('priority')
        if priority_param:
            try:
                todos = todos.filter(priority=int(priority_param))
            except ValueError:
                pass

        ordering_param = request.query_params.get('ordering')
        if ordering_param:
            allowed_ordering = ['title', '-title', 'priority', '-priority', 'created_at', '-created_at', 'is_completed', '-is_completed']
            if ordering_param in allowed_ordering:
                todos = todos.order_by(ordering_param)
        else:
            todos = todos.order_by('-created_at')


        serializer = ToDoSerializer(todos, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ToDoDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsTaskOwnerOrGroupMember] 
    serializer_class = ToDoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ToDo.objects.none()
        if user.is_superuser:
            return ToDo.objects.all()
        return ToDo.objects.filter(
            Q(user=user) | (Q(group__members=user) & Q(user__isnull=True))
        ).distinct()

class ToDoListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ToDoSerializer

    def get_queryset(self):
        """
        Zwraca listę zadań dla zalogowanego użytkownika.
        Obejmuje zadania osobiste użytkownika oraz zadania współdzielone
        z grup, do których użytkownik należy.
        """
        return get_filtered_todos(self.request)

    def perform_create(self, serializer):
        """
        Tworzy nowe zadanie.
        - Jeśli w żądaniu podano 'group_id', tworzy jedno współdzielone zadanie dla tej grupy.
        - W przeciwnym razie tworzy zadanie osobiste dla zalogowanego użytkownika.
        """
        requesting_user = self.request.user
    
        group_instance = serializer.validated_data.get('group') 

        final_user_to_assign = None
        final_group_to_assign = None

        if group_instance:
            if not group_instance.members.filter(id=requesting_user.id).exists():
                raise exceptions.PermissionDenied(
                    "Nie należysz do tej grupy lub nie masz uprawnień do tworzenia dla niej zadań."
                )
            final_group_to_assign = group_instance
        else:
            final_user_to_assign = requesting_user

        serializer.save(user=final_user_to_assign, group=final_group_to_assign)



class GroupListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class MyGroupsListView(generics.ListAPIView):
    """
    Widok API zwracający listę grup, do których należy
    aktualnie uwierzytelniony użytkownik (jako członek lub administrator grupy).
    """
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        """
        Ta metoda zwraca queryset grup przefiltrowany dla aktualnego użytkownika.
        Użytkownik zobaczy grupy, w których jest członkiem ('members')
        lub administratorem ('admins').
        """
        user = self.request.user
        if user.is_authenticated:
            return Group.objects.filter(Q(members=user) | Q(admins=user)).distinct()
        return Group.objects.none()

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsGroupAdminOrMemberReadOnly] 
    serializer_class = GroupSerializer 

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Group.objects.none()
            
        if user.is_superuser:
            return Group.objects.all()
        return Group.objects.filter(Q(members=user) | Q(admins=user)).distinct()

class GroupCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def perform_create(self, serializer):
        group = serializer.save() 
        group.members.add(self.request.user)
        group.admins.add(self.request.user)     

class InvitationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=InvitationCreateSerializer,
        responses={
            201: "Invitation created successfully",
            400: "Bad Request",
            403: "Forbidden"    
        }
    )
    def post(self, request):
        serializer = InvitationCreateSerializer(data=request.data)
        if serializer.is_valid():
            group_id = serializer.validated_data['group_id']
            expiration_days = serializer.validated_data.get('expiration_days', 7)
            max_uses = serializer.validated_data.get('max_uses', 1)
            email = serializer.validated_data.get('email')

            try:
                group = Group.objects.get(id=group_id)
            except Group.DoesNotExist:
                return Response({"error": "Group not found"}, status=status.HTTP_400_BAD_REQUEST)
            
            is_group_admin = group.admins.filter(id=request.user.id).exists()

            if not (request.user.is_superuser or is_group_admin):
                return Response(
                    {"error": "Tylko administrator tej grupy lub superużytkownik może tworzyć zaproszenia."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            expiration_date = timezone.now() + timedelta(days=expiration_days)
            invitation = Invitation.objects.create(
                group=group,
                inviter=request.user,
                expiration_date=expiration_date,
                max_uses=max_uses
            )

            if email:
                subject = f"Zaproszenie do grupy: {group.name}"
                message = (
                    f"Cześć!\n\n"
                    f"{request.user.username} zaprosił(a) Cię do dołączenia do grupy \"{group.name}\".\n\n"
                    f"Aby dołączyć, wpisz poniższy kod zaproszenia w aplikacji:\n"
                    f"{invitation.token}\n\n" 
                    f"Kod wygaśnie za {expiration_days} dni.\n"
                )
                try:
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                except Exception as e:
                    logger = logging.getLogger(__name__) 
                    logger.error(f"Nie udało się wysłać emaila z zaproszeniem do {email} dla grupy {group.name}: {e}")


            return Response({
                "message": "Invitation created successfully" + (", email sent" if email else ""),
                "token": invitation.token
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcceptInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={
            200: 'Invitation accepted successfully',
            400: 'Bad Request',
            404: 'Invitation not found'
        },
    )
    def post(self, request, token):
        try:
            invitation = Invitation.objects.get(token=token)
        except Invitation.DoesNotExist:
            return Response({"error": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not invitation.is_valid():
            return Response({"error": "Invitation is invalid, expired, or has reached its maximum use limit."},
                            status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        group = invitation.group

        if group.members.filter(id=user.id).exists():
            return Response({"message": "User is already a member of the group"}, status=status.HTTP_200_OK)

        if invitation.uses >= invitation.max_uses:
            return Response({"error": "Invitation has already been used the maximum number of times"},
                            status=status.HTTP_400_BAD_REQUEST)

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
            return Response({"detail": "Successfully logged out (session was not persistent or already ended)."}, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
     permission_classes = [AllowAny]
     authentication_classes = []

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
         refresh_token_str = request.data.get('refresh_token')

         if not device_id or not refresh_token_str:
             return Response({"detail": "device_id and refresh_token are required"}, status=status.HTTP_400_BAD_REQUEST)

         try:
             token = SimpleJWTRefreshToken(refresh_token_str)
             user_id = token.get('user_id')
             user = get_user_model().objects.get(id=user_id) 

             device = Device.objects.get(user=user, device_id=device_id, refresh_token=refresh_token_str)

             if device.expires_at < timezone.now():
                 return Response({"detail": "Refresh token has expired (session inactive)."}, status=status.HTTP_401_UNAUTHORIZED)

             new_refresh_token_str, new_access_token_str = create_new_tokens(user, device.remember_me)

             device.refresh_token = new_refresh_token_str

             if device.remember_me:
                sliding_window_duration = timedelta(days=settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME', 30))
                new_db_expires_at = timezone.now() + sliding_window_duration
                device.expires_at = new_db_expires_at
             
             device.save()

             return Response({
                 'access': new_access_token_str,
                 'refresh': new_refresh_token_str,
             }, status=status.HTTP_200_OK)

         except (Device.DoesNotExist):
             return Response({"detail": "Invalid refresh token or device ID association."}, status=status.HTTP_401_UNAUTHORIZED)
         except (get_user_model().DoesNotExist):
              return Response({"detail": "User associated with token not found."}, status=status.HTTP_401_UNAUTHORIZED)
         except (TokenError, InvalidToken) as e:
              return Response({"detail": f"Refresh token is invalid or expired: {e}"}, status=status.HTTP_401_UNAUTHORIZED)
         except Exception as e:
              print(f"Unexpected error during token refresh: {e}")
              return Response({"detail": "An internal error occurred during token refresh."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def create_new_tokens(user, remember_me):
     refresh = SimpleJWTRefreshToken.for_user(user)
     refresh_lifetime = settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME',timedelta(days=30))
     if remember_me:
         refresh.set_exp(lifetime=refresh_lifetime)
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
            user = User.objects.get(email=email, is_active=True, is_verified=True)
        except User.DoesNotExist:
            return Response({"message": "Jeśli konto istnieje, otrzymasz wiadomość e‑mail."})

        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.id))
        relative_url_path = reverse('password_reset_form_page', kwargs={'uidb64': uidb64, 'token': token})
        reset_url = request.build_absolute_uri(relative_url_path)

        subject = "Resetowanie Hasła dla Twojego Konta"
        message = (
            f"Witaj {user.username},\n\n"
            f"Otrzymaliśmy prośbę o zresetowanie hasła dla Twojego konta w naszej aplikacji.\n"
            f"Aby ustawić nowe hasło, kliknij w poniższy link:\n\n"
            f"{reset_url}\n\n"
            f"Jeśli to nie Ty prosiłeś/aś o zresetowanie hasła, zignoruj tę wiadomość. Twoje hasło pozostanie niezmienione.\n\n"
            f"Link będzie aktywny przez określony czas .\n\n"
            f"Pozdrawiamy,\nZespół Aplikacji GoNext"
        )

        try:
            send_mail(subject, message, EMAIL_HOST_USER, [email], fail_silently=False)
        except Exception as e:
            logger = logging.getLogger(__name__) 
            logger.error(f"Nie udało się wysłać emaila resetującego hasło do {email}: {e}")
            return Response({"message": "Jeśli konto powiązane z tym adresem email istnieje i jest aktywne, otrzymasz wiadomość e-mail z instrukcjami dotyczącymi resetowania hasła."}, status=status.HTTP_200_OK)


        return Response({"message": "Link do resetu hasła został wysłany na Twój adres email (jeśli konto istnieje i jest aktywne)."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        """
        # Verifies UID and token. 
        # The front-end can display the password reset form upon receiving a 200 response.

        """
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(id=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({'error': 'Invalid link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Token is valid.'}, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=PasswordResetConfirmSerializer)
    def post(self, request, uidb64, token):
        data = {
            'uidb64': uidb64,
            'token': token,
            **request.data
        }
        serializer = PasswordResetConfirmSerializer(data=request.data) 
        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data['new_password']

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = get_user_model().objects.get(id=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({"error": "Link jest nieprawidłowy."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token jest nieprawidłowy lub wygasł."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            return Response({"new_password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user) 
        return Response({"message": "Hasło zostało zmienione pomyślnie."}, status=status.HTTP_200_OK)
    
User = get_user_model()

class ManageGroupMemberView(APIView):
    permission_classes = [IsAuthenticated, IsGroupAdmin]
    @swagger_auto_schema(
        tags=['Groups Management'],
        operation_description="Remove a member from the group. Group admins cannot remove themselves if they are the last admin.",
        responses={
            200: "Member removed successfully.",
            403: "Forbidden - Not a group admin or trying to remove last admin.",
            404: "Not Found - Group or User not found, or User not a member."
        }
    )
    def delete(self, request, group_id, user_id):
        group = get_object_or_404(Group, id=group_id)
        user_to_remove = get_object_or_404(User, id=user_id)

        if not group.members.filter(id=user_to_remove.id).exists():
            return Response({"error": "User is not a member of this group."}, status=status.HTTP_404_NOT_FOUND)

        if user_to_remove == request.user and group.admins.count() == 1 and group.admins.filter(id=request.user.id).exists():
            return Response({"error": "You cannot remove yourself as the last administrator of the group."}, status=status.HTTP_403_FORBIDDEN)
        
        if group.admins.filter(id=user_to_remove.id).exists():
            if group.admins.count() == 1: 
                 return Response({"error": "Cannot remove the only administrator of the group. Promote another admin first."}, status=status.HTTP_403_FORBIDDEN)
            group.admins.remove(user_to_remove)
        
        group.members.remove(user_to_remove)
        return Response({"message": f"User {user_to_remove.username} removed from group {group.name}."}, status=status.HTTP_200_OK)


class ManageGroupAdminView(APIView):
    permission_classes = [IsAuthenticated, IsGroupAdmin]

    @swagger_auto_schema(
        tags=['Groups Management'],
        operation_description="Promote a group member to be an administrator.",
        responses={
            200: "User promoted to administrator.",
            403: "Forbidden - Not a group admin.",
            404: "Not Found - Group or User not found, or User not a member.",
            409: "Conflict - User is already an administrator."
        }
    )
    def post(self, request, group_id, user_id): 
        group = get_object_or_404(Group, id=group_id)
        user_to_promote = get_object_or_404(User, id=user_id)

        if not group.members.filter(id=user_to_promote.id).exists():
            return Response({"error": "User is not a member of this group and cannot be promoted."}, status=status.HTTP_404_NOT_FOUND)
        
        if group.admins.filter(id=user_to_promote.id).exists():
            return Response({"error": "User is already an administrator of this group."}, status=status.HTTP_409_CONFLICT)

        group.admins.add(user_to_promote)
        if not group.members.filter(id=user_to_promote.id).exists():
            group.members.add(user_to_promote) 

        return Response({"message": f"User {user_to_promote.username} promoted to administrator in group {group.name}."}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        tags=['Groups Management'],
        operation_description="Demote a group administrator to a regular member. Group admins cannot demote themselves if they are the last admin.",
        responses={
            200: "Administrator demoted successfully.",
            403: "Forbidden - Not a group admin or trying to demote last admin.",
            404: "Not Found - Group or User not found, or User not an admin."
        }
    )
    def delete(self, request, group_id, user_id): 
        group = get_object_or_404(Group, id=group_id)
        admin_to_demote = get_object_or_404(User, id=user_id)

        if not group.admins.filter(id=admin_to_demote.id).exists():
            return Response({"error": "User is not an administrator of this group."}, status=status.HTTP_404_NOT_FOUND)

        if admin_to_demote == request.user and group.admins.count() == 1:
            return Response({"error": "You cannot demote yourself as the last administrator. Promote another admin first or delete the group."}, status=status.HTTP_403_FORBIDDEN)
        
        if group.admins.count() == 1 and not request.user.is_superuser:
             return Response({"error": "Cannot demote the only administrator of the group unless you are a superuser. Promote another admin first."}, status=status.HTTP_403_FORBIDDEN)


        group.admins.remove(admin_to_demote)
        return Response({"message": f"Administrator {admin_to_demote.username} demoted to member in group {group.name}."}, status=status.HTTP_200_OK)

class ChangePasswordView(generics.GenericAPIView): 
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @swagger_auto_schema(
        operation_description=(
            "Pozwala zalogowanemu użytkownikowi na zmianę swojego hasła. "
            "Wymagane jest podanie starego hasła oraz dwukrotnie nowego hasła. "
            "Nowe hasło musi być różne od starego hasła. "
            "Opcjonalnie można podać 'current_device_id', aby zachować bieżącą sesję 'zapamiętaj mnie'; "
            "w przeciwnym razie wszystkie inne sesje 'zapamiętaj mnie' tego użytkownika zostaną unieważnione."
        ),
        request_body=ChangePasswordSerializer,
        responses={
            status.HTTP_200_OK: openapi.Response("Hasło zostało pomyślnie zmienione."),
            status.HTTP_400_BAD_REQUEST: openapi.Response("Błąd walidacji danych (np. stare hasło nie pasuje, nowe hasła się nie zgadzają, nowe hasło jest za słabe)."),
            status.HTTP_401_UNAUTHORIZED: openapi.Response("Brak uwierzytelnienia.")
        }
    )
    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data, context={'request': request}) 
        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data.get('new_password1')
        current_device_id = serializer.validated_data.get('current_device_id')

        user.set_password(new_password)
        user.save()

        update_session_auth_hash(request, user)

        devices_query = Device.objects.filter(user=user)
        if current_device_id:
            devices_query = devices_query.exclude(device_id=current_device_id)
        
        devices_query.delete()

        return Response({"detail": "Hasło zostało pomyślnie zmienione. Wylogowano z pozostałych, zapamiętanych urządzeń."}, status=status.HTTP_200_OK)

class LeaveGroupView(APIView):
    """
    Pozwala uwierzytelnionemu użytkownikowi opuścić grupę, której jest członkiem.
    """
    permission_classes = [IsAuthenticated] 

    @swagger_auto_schema(
        tags=['Groups Management'], 
        operation_id='group_leave',
        operation_description="Pozwala uwierzytelnionemu użytkownikowi opuścić grupę, której jest członkiem.",
        responses={
            200: "Pomyślnie opuszczono grupę.",
            403: "Zabronione - np. próba opuszczenia grupy jako ostatni administrator.",
            404: "Nie znaleziono - Grupa nie istnieje lub użytkownik nie jest jej członkiem."
        }
    )
    def delete(self, request, group_id):
        user_to_leave = request.user
        group = get_object_or_404(Group, id=group_id)

        if not group.members.filter(id=user_to_leave.id).exists():
            return Response(
                {"error": "Nie jesteś członkiem tej grupy."},
                status=status.HTTP_404_NOT_FOUND
            )

        is_admin = group.admins.filter(id=user_to_leave.id).exists()

        if is_admin and group.admins.count() == 1:
            return Response(
                {"error": "Nie możesz opuścić grupy, ponieważ jesteś jej ostatnim administratorem. "
                          "Najpierw mianuj innego administratora lub usuń grupę."},
                status=status.HTTP_403_FORBIDDEN
            )

        group.members.remove(user_to_leave)

        if is_admin:
            group.admins.remove(user_to_leave)

        return Response(
            {"message": f"Pomyślnie opuściłeś grupę '{group.name}'."},
            status=status.HTTP_200_OK
        )

def password_reset_form_render_view(request, uidb64=None, token=None):
    User = get_user_model()
    error_message = None
    user = None 

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        error_message = "Link do resetowania hasła jest nieprawidłowy lub użytkownik nie istnieje."
        user = None 

    if user is not None and not default_token_generator.check_token(user, token):
        error_message = "Link do resetowania hasła jest nieprawidłowy lub wygasł. Spróbuj ponownie poprosić o reset."

    context = {
        'uidb64': uidb64,
        'token': token,
        'error_message': error_message 
    }
    return render(request, 'todos/password_reset_form_page.html', context)