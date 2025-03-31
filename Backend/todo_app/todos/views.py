from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import ToDo, Group
from .serializers import InvitationCreateSerializer, LoginSerializer, ToDoSerializer, UserSerializer, GroupSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from datetime import timedelta
from .models import Invitation
from django.conf import settings
from rest_framework import status

# User registration
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = get_user_model().objects.all()  # Using the custom user model
    serializer_class = UserSerializer

# Login – JWT token generation
class LoginView(APIView):
    permission_classes = [AllowAny]  # Allow any user to access this view, even if not authenticated
    
    # Define the expected input parameters using the `swagger_auto_schema` decorator
    @swagger_auto_schema(
        operation_description="Login and generate JWT tokens.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description='The username of the user'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='The password of the user')
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

        # Authenticate the user using Django's built-in authenticate function
        user = authenticate(username=username, password=password)

        if user:
            # If authentication is successful, generate the JWT token pair
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Filtering tasks assigned directly to the user (i.e., without a group)
        todos = get_filtered_todos(request)
        todos_without_group = todos.filter(group=None)

        # Returning tasks that are not assigned to a group
        return Response(ToDoSerializer(todos_without_group, many=True).data)

# Returning tasks assigned to the user, grouped by their respective groups
class ToDoByGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
    serializer_class = ToDoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return ToDo.objects.all()  # Admin can view all tasks
        return ToDo.objects.filter(user=self.request.user)  # Other users can view only their tasks

# User creates a task only for themselves (no group assignment)
class ToDoListCreateView(generics.ListCreateAPIView):
    serializer_class = ToDoSerializer
    permission_classes = [permissions.IsAuthenticated]

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
    queryset = Group.objects.all()  # Retrieve all groups
    serializer_class = GroupSerializer  # Use the Group serializer to format the response
    permission_classes = [permissions.IsAuthenticated]  # Only accessible to admins
    

# View for admins – group detail view
class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]  # Only accessible to admins
    def get_queryset(self):
        queryset = super().get_queryset()
        print(queryset)  # Debug: Sprawdź zawartość queryset
        return queryset

# View for admins – create a new group
class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        group = serializer.save(admin=self.request.user)
        # Automatycznie dodaj twórcę do członków grupy
        group.members.add(self.request.user)
        group.members.add(self.request.user)

class InvitationCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Tylko administratorzy mogą generować zaproszenia
    
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
    permission_classes = [permissions.IsAuthenticated]  # Tylko zalogowani użytkownicy mogą zaakceptować zaproszenie

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
        group.members.add(user)  # Dodajemy użytkownika do grupy (zakładając, że jest relacja m:n między Group a User)

        # Zwiększamy liczbę użyć zaproszenia
        invitation.uses += 1
        invitation.save()

        return Response({
            "message": "Invitation accepted successfully. User: "+user.username+" added to group: "+group.name,
        }, status=status.HTTP_200_OK)