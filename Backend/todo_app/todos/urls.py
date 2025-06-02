from django.urls import path
from .views import *

urlpatterns = [
    path('info/',UserInfoView.as_view(), name='userinfo'),
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
    path('groups/admin/', GroupListView.as_view(), name='admin-group-list'),
    path('groups/', MyGroupsListView.as_view(), name='group-list'),
    path('groups/<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('groups/create/', GroupCreateView.as_view(), name='group-create'),
    path('invitations/create/', InvitationCreateView.as_view(), name='invitation-create'),
    path('invitations/<str:token>/accept', AcceptInvitationView.as_view(), name='invitation-accept'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('groups/<int:group_id>/members/<int:user_id>/', ManageGroupMemberView.as_view(), name='group-manage-member'), # DELETE to remove
    path('groups/<int:group_id>/admins/<int:user_id>/', ManageGroupAdminView.as_view(), name='group-manage-admin'),    # POST to promote, DELETE to demote
    path('password/change/', ChangePasswordView.as_view(), name='auth-password-change'),
    path('groups/<int:group_id>/leave/', LeaveGroupView.as_view(), name='group-leave'),
    path('reset-password/<str:uidb64>/<str:token>/', password_reset_form_render_view, name='password_reset_form_page'),
]
