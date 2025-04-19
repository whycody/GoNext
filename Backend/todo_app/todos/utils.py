from rest_framework.response import Response
from rest_framework import status

def lockout_response(request, credentials, *args, **kwargs):
    """
    Custom Axes response when lockout is triggered.
    """
    return Response({
        "detail": "Too many failed login attempts. Please try again in 30 minutes."
    }, status=status.HTTP_429_TOO_MANY_REQUESTS)