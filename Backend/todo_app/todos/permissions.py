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
        # Upewnij się, że użytkownik jest uwierzytelniony (IsAuthenticated powinno to załatwić wcześniej)
        if not request.user or not request.user.is_authenticated:
            return False
        
        if isinstance(obj, Group):
            # Superużytkownik ma pełne uprawnienia do grup
            if request.user.is_superuser: 
                return True
            is_admin = obj.admins.filter(id=request.user.id).exists()
            is_member = obj.members.filter(id=request.user.id).exists()

            # Jeśli metoda HTTP jest bezpieczna (GET, HEAD, OPTIONS - czyli odczyt)
            if request.method in permissions.SAFE_METHODS:
                # Zezwól na dostęp, jeśli użytkownik jest adminem LUB członkiem
                return is_admin or is_member
            else:
                # Jeśli metoda HTTP jest niebezpieczna (PUT, PATCH, DELETE - czyli zapis/edycja/usuwanie)
                # Zezwól na dostęp TYLKO jeśli użytkownik jest adminem
                return is_admin

        # Jeśli obiekt nie jest grupy, odmów dostępu
        return False

class IsTaskOwnerOrGroupMember(permissions.BasePermission):
    """
    Niestandardowe uprawnienie pozwalające na:
    - Odczyt: jeśli obiekt został zwrócony przez get_queryset (domyślne zachowanie).
    - Modyfikację/Usuwanie zadania osobistego: tylko właściciel.
    - Modyfikację/Usuwanie zadania grupowego: każdy członek grupy.
    """

    def has_object_permission(self, request, view, obj):
        # obj to instancja ToDo
        
        # Sprawdzenie, czy użytkownik jest uwierzytelniony (choć IsAuthenticated powinno to już załatwić)
        if not request.user or not request.user.is_authenticated:
            return False

        # Superużytkownik ma pełne uprawnienia do wszystkich operacji na obiekcie, który już widzi
        if request.user.is_superuser:
            return True

        # Uprawnienia do odczytu (GET, HEAD, OPTIONS) są obsługiwane przez get_queryset.
        # Jeśli obiekt został pobrany, użytkownik ma do niego dostęp do odczytu.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Uprawnienia do zapisu (PUT, PATCH, DELETE)
        if obj.user:  # Jeśli to zadanie osobiste (ma przypisanego użytkownika)
            return obj.user == request.user
        elif obj.group:  # Jeśli to zadanie grupowe (ma przypisaną grupę)
            # Każdy członek grupy ma pełne uprawnienia do modyfikacji/usuwania
            return obj.group.members.filter(id=request.user.id).exists()
        
        # W przypadku, gdyby zadanie nie miało ani użytkownika, ani grupy (co nie powinno się zdarzyć)
        return False
    
class IsGroupAdmin(permissions.BasePermission):
    """
    Niestandardowe uprawnienie sprawdzające, czy użytkownik jest administratorem
    grupy, której dotyczy żądanie. Oczekuje, że widok będzie miał w URL 'group_id'.
    """
    message = "You must be an administrator of this group to perform this action."

    def has_permission(self, request, view):
        # Sprawdź, czy użytkownik jest uwierzytelniony
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser ma zawsze dostęp
        if request.user.is_superuser:
            return True

        group_id = view.kwargs.get('group_id')
        if not group_id:
            return False 
        try:
            group = Group.objects.get(id=group_id)
            return group.admins.filter(id=request.user.id).exists()
        except Group.DoesNotExist:
            return False # Grupa nie istnieje, więc brak uprawnień