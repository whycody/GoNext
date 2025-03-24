from django.contrib import admin
from .models import ToDo, Group

class ToDoAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'user', 'group', 'is_completed', 'due_date')
    list_filter = ('priority', 'is_completed', 'group')
    search_fields = ('title', 'description')

admin.site.register(ToDo, ToDoAdmin)
admin.site.register(Group)