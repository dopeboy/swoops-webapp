from django.core.exceptions import BadRequest, ObjectDoesNotExist, PermissionDenied
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exception, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exception, context)

    if isinstance(exception, BadRequest):
        response = Response(
            data={"detail": str(exception)}, status=status.HTTP_400_BAD_REQUEST
        )

    if isinstance(exception, ObjectDoesNotExist):
        response = Response(
            data={"detail": str(exception)}, status=status.HTTP_404_NOT_FOUND
        )

    if isinstance(exception, PermissionDenied):
        response = Response(
            data={"detail": str(exception)}, status=status.HTTP_403_FORBIDDEN
        )

    return response
