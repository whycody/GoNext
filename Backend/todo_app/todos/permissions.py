from rest_framework import permissions
from .models import Group 

class IsGroupAdminOrMemberReadOnly(permissions.BasePermission):
    """
    Niestandardowe uprawnienie, które:
    - Zezwala administratorowi grupy na pełny dostęp (odczyt/zapis).
    - Zezwala członkom grupy (niebędącym adminem) tylko na odczyt.
    - Odmawia dostępu innym uwierzytelnionym użytkownikom.
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Group):
            is_admin = obj.admins.filter(pk=request.user.pk).exists()
            is_member = obj.members.filter(pk=request.user.pk).exists()

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