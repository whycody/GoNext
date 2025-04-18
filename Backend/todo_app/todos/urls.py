from django.urls import path
from .views import *

urlpatterns = [
    # User registration and login
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('token/logout/', LogoutView.as_view(), name='token_logout'),
    # Tasks assigned directly to the user (no group)
    path('todos/user/', ToDoByUserView.as_view(), name='todos-by-user'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
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
    path('invitations/create/', InvitationCreateView.as_view(), name='invitation-create'),
    path('invitations/accept/<str:token>/', AcceptInvitationView.as_view(), name='invitation-accept'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
