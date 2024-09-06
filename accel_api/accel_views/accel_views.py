from rest_framework import viewsets
from ..serializers import *
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
import json
import datetime
from ldap3 import Server, Connection, ALL, SIMPLE, SUBTREE
from django.http import JsonResponse
from django.core import serializers
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.conf import settings
from django.contrib.auth import logout as django_logout


class AccelCourseTypeView(viewsets.ModelViewSet):
    serializer_class = AccelCourseTypeSerializer
    queryset = Accel_Course_Type.objects.all()


class AccelCourseView(viewsets.ModelViewSet):
    serializer_class = AccelCourseSerializer
    queryset = Accel_Course.objects.all()


class AccelCategoryView(viewsets.ModelViewSet):
    serializer_class = AccelCategorySerializer
    queryset = Accel_Category.objects.all()

    def perform_destroy(self, instance):
        print("Deleting entry:", instance)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        print("SERIALIZER ~~~~~~~~~", serializer)
        if serializer.is_valid():
            self.perform_update(serializer)
            print("YES UPDATED!!!")
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Could not update")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        print("IN THE PATCH")
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            print("updating course in skill")
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Could not update")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AccelRoleView(viewsets.ModelViewSet):
    serializer_class = AccelRoleSerializer
    queryset = Accel_Role.objects.all()


class AccelUserView(viewsets.ModelViewSet):
    serializer_class = AccelUserSerializer
    queryset = Accel_User.objects.all()

    # @action(detail=True, methods=["patch"])
    def update(self, request, *args, **kwargs):
        # getting the right accel user object back now
        print("~~~~~~DIS THE REQUEST~~~~~", request.body)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        print("SERIALIZER ~~~~~~~~~", serializer)
        if serializer.is_valid():
            self.perform_update(serializer)
            print("YES UPDATED!!!")
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Could not update")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AccelProgressStatusView(viewsets.ModelViewSet):
    serializer_class = AccelProgressStatusSerializer
    queryset = Accel_Progress_Status.objects.all()


class AccelUserProgressView(viewsets.ModelViewSet):
    serializer_class = AccelUserProgressSerializer
    queryset = Accel_User_Progress.objects.all()


class AccelUserProgressView(viewsets.ModelViewSet):
    serializer_class = AccelUserProgressSerializer
    queryset = Accel_User_Progress.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        instance.complete_date = serializer.validated_data.get(
            "complete_date", instance.complete_date
        )
        instance.approve_date = serializer.validated_data.get(
            "approve_date", instance.approve_date
        )
        instance.comment = serializer.validated_data.get("comment", instance.comment)
        instance.rating = serializer.validated_data.get("rating", instance.rating)
        access_progress_status_instance = Accel_Progress_Status.objects.get(
            id=request.data.get("course_progress").get("id")
        )

        instance.course_progress = access_progress_status_instance

        if (
            access_progress_status_instance.progress_status == "Completed"
            and not instance.complete_date
        ):
            instance.complete_date = datetime.date.today()

        if (
            access_progress_status_instance.progress_status == "Approved"
            and not instance.approve_date
        ):
            instance.approve_date = datetime.date.today()

        instance.save()

        return Response(
            AccelUserProgressSerializer(instance).data, status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        courses = request.data["accel_course"]
        accelUser = Accel_User.objects.get(id=request.data["user_id"])
        courseProgress = Accel_Progress_Status.objects.get(progress_status="New")
        accelCourse = Accel_Course.objects.all()
        userProgressObjects = accelUser.user_progress.all()

        for course in courses:
            accelCourseObj = accelCourse.get(id=course["id"])
            if userProgressObjects.filter(accel_course=accelCourseObj):
                continue
            progressObj = Accel_User_Progress.objects.create(
                accel_course=accelCourseObj,
                course_progress=courseProgress,
            )

            accelUser.user_progress.add(progressObj)

        return Response(status=status.HTTP_200_OK)


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


@ensure_csrf_cookie
def ldap_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data["email"]
        password = data["password"]

        # LDAP check
        address = "FHB.NET"
        username = f"{email}@fhb.com"
        print("USER NAME APPENDED @FHB.COM", username)
        password = password

        server = Server(address)
        conn = Connection(
            server, user=username, password=password, authentication=SIMPLE
        )
        conn.bind()

        if not conn.bind():
            print("failed to bind")
            print(conn.result)
            return JsonResponse({"message": "Incorrect email or password"}, status=401)
        else:
            print("server bind!")
        try:
            accel_user = Accel_User.objects.get(email=username)
            # generate tokens
            access_token = "mock generate access token"
            refresh_token = "mock generate refresh token"
            serializer = AccelUserSerializer(accel_user)
            user_progress_qs = accel_user.user_progress.all()
            progress_serializer = AccelUserProgressSerializer(
                user_progress_qs, many=True
            )
            response_data = {
                "message": "Login successful",
                "user": serializer.data,
                "courses_progress": progress_serializer.data,
                "access": str(access_token),
                "refresh": str(refresh_token),
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)
        except Accel_User.DoesNotExist:
            return JsonResponse({"error": "User not found"})

    return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def logout_view(request):
    response = JsonResponse({"message": "Logged out successfully"})
    response.delete_cookie("refresh")
    django_logout(request)
    return response
