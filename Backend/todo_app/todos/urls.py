from django.urls import path
from .views import (
    GroupCreateView,
    RegisterView,
    LoginView,
    ToDoByUserView,
    ToDoByGroupView,
    ToDoDetailView,
    ToDoListCreateView,
    GroupListView,  
    GroupDetailView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # User registration and login
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Token refresh

    # Tasks assigned directly to the user (no group)
    path('todos/user/', ToDoByUserView.as_view(), name='todos-by-user'),

    # Tasks assigned to the user, grouped by groups
    path('todos/groups/', ToDoByGroupView.as_view(), name='todos-by-group'),

    # Task details (view, edit, delete)
    path('todos/<int:pk>/', ToDoDetailView.as_view(), name='todo-detail'),

    # Creating a task only for the user (no group assignment)
    path('todos/', ToDoListCreateView.as_view(), name='todo-list-create'),

    # CRUD for groups – available only for admin
    path('groups/', GroupListView.as_view(), name='group-list'),
    path('groups/<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('groups/create/', GroupCreateView.as_view(), name='group-create'),
    
]
