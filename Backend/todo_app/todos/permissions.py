from rest_framework import permissions
from .models import Group, ToDo 

class IsGroupAdminOrMemberReadOnly(permissions.BasePermission):
    """
    Niestandardowe uprawnienie, które:
    - Zezwala administratorowi grupy na pełny dostęp (odczyt/zapis).
    - Zezwala członkom grupy (niebędącym adminem) tylko na odczyt.
    - Odmawia dostępu innym uwierzytelnionym użytkownikom.
    """

    def has_object_permission(self, request, view, obj):
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if isinstance(obj, Group):
           
            if request.user.is_superuser: 
                return True
            is_admin = obj.admins.filter(id=request.user.id).exists()
            is_member = obj.members.filter(id=request.user.id).exists()

            
            if request.method in permissions.SAFE_METHODS:
                return is_admin or is_member
            else:
                return is_admin

        return False

class IsTaskOwnerOrGroupMember(permissions.BasePermission):
    """
    Niestandardowe uprawnienie pozwalające na:
    - Odczyt: jeśli obiekt został zwrócony przez get_queryset (domyślne zachowanie).
    - Modyfikację/Usuwanie zadania osobistego: tylko właściciel.
    - Modyfikację/Usuwanie zadania grupowego: każdy członek grupy.
    """

    def has_object_permission(self, request, view, obj):
        
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True

        if obj.user:  
            return obj.user == request.user
        elif obj.group:  
            return obj.group.members.filter(id=request.user.id).exists()
        
        return False
    
class IsGroupAdmin(permissions.BasePermission):
    """
    Niestandardowe uprawnienie sprawdzające, czy użytkownik jest administratorem
    grupy, której dotyczy żądanie. Oczekuje, że widok będzie miał w URL 'group_id'.
    """
    message = "You must be an administrator of this group to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True

        group_id = view.kwargs.get('group_id')
        if not group_id:
            return False 
        try:
            group = Group.objects.get(id=group_id)
            return group.admins.filter(id=request.user.id).exists()
        except Group.DoesNotExist:
            return False 