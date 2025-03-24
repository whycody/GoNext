from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import ToDo, Group
from .serializers import ToDoSerializer, UserSerializer, GroupSerializer

# User registration
class RegisterView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()  # Using the custom user model
    serializer_class = UserSerializer

# Login – JWT token generation
class LoginView(APIView):
    def post(self, request):
        from django.contrib.auth import authenticate
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
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
        # Pobranie zalogowanego użytkownika
        user = request.user
        
        # Filtrowanie zadań, które są przypisane do tego użytkownika i mają przypisaną grupę
        todos = ToDo.objects.filter(user=user, group__isnull=False)
        
        # Serializacja danych
        serializer = ToDoSerializer(todos, many=True)
        
        # Zwrócenie danych w odpowiedzi
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

        # For admin – full control (optional)
        if user.is_superuser:
            if group_id:
                group_instance = Group.objects.get(id=group_id)
                for member in group_instance.members.all():
                    ToDo.objects.create(
                        user=member,
                        group=group_instance,
                        title=data['title'],
                        description=data.get('description', ''),
                        priority=data.get('priority', 'Medium'),
                        due_date=data.get('due_date', None)
                    )
                return
            elif user_id:
                target_user = get_user_model().objects.get(id=user_id)
                serializer.save(user=target_user)
                return

        # For regular users – no group or assignment to other users allowed
        if group_id or user_id:
            raise PermissionError("You cannot assign tasks to others or to a group.")
        
        serializer.save(user=user)  # Task assigned to the user

# View for admin - list of groups
class GroupListView(generics.ListAPIView):
    queryset = Group.objects.all()  # Retrieve all groups
    serializer_class = GroupSerializer  # Use the Group serializer to format the response
    permission_classes = [permissions.IsAdminUser]  # Only accessible to admins

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]

class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]  # Only accesible for admins


