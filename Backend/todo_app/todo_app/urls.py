from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include  # Upewnij się, że 'include' jest zaimportowane

urlpatterns = [
    path('admin/', admin.site.urls),  # Standardowy URL dla panelu admina Django
    path('', include('todos.urls')),  # Zawiera URL'e aplikacji 'todos'
]