"""
URL configuration for accel_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from accel_api.accel_views import accel_views
from django.conf import settings



router = routers.DefaultRouter()
router.register(
    r"accel_course_type", accel_views.AccelCourseTypeView, "accel_course_type"
)
router.register(
    r"accel_progress_status",
    accel_views.AccelProgressStatusView,
    "accel_progress_status",
)
router.register(r"accel_course", accel_views.AccelCourseView, "accel_course")
router.register(r"accel_category", accel_views.AccelCategoryView, "accel_category")
router.register(r"accel_role", accel_views.AccelRoleView, "accel_role")
router.register(r"accel_user", accel_views.AccelUserView, "accel_user")
router.register(
    r"accel_user_progress", accel_views.AccelUserProgressView, "accel_user_progress"
)

urlpatterns = [path("admin/", admin.site.urls), path("api/", include(router.urls)), path("accel_login/", accel_views.ldap_login, name="ldap_login"), path("accel_logout/", accel_views.logout_view, name="ldap_logout")]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns




