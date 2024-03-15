"""swoops URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import os

from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework import permissions

urlpatterns = [
    path("secret-room/", admin.site.urls),
    path("api/", include("api.urls")),
    path("accounts/", include("accounts.urls")),
]

if settings.DJANGO_OTP_ENABLED:
    from django_otp.admin import OTPAdminSite

    admin.site.__class__ = OTPAdminSite

if settings.DEBUG:
    from drf_yasg import openapi
    from drf_yasg.views import get_schema_view

    api_info = openapi.Info(title="Swoops API", default_version="v1")

    schema_view = get_schema_view(
        api_info,
        patterns=[
            path("api/", include("api.urls", namespace="api")),
            path("accounts/", include("accounts.urls")),
        ],
        public=True,
        permission_classes=(permissions.AllowAny,),
    )

    urlpatterns.append(
        re_path(
            r"^swagger(?P<format>\.json|\.yaml)$",
            schema_view.without_ui(cache_timeout=0),
            name="schema-json",
        )
    )

if os.environ["DJANGO_CONFIGURATION"] in ["Development", "Staging"]:
    urlpatterns.append(path("__debug__/", include("debug_toolbar.urls")))

    admin.site.index_title = "Welcome to the Swoops Admin Portal"
    admin.site.site_header = "Swoops"
