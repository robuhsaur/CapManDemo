from rest_framework import serializers
from .models import *
import logging
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

log = logging.getLogger(__name__)


class AccelCourseSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super(AccelCourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and (request.method == "POST" or request.method == "PUT"):
            self.Meta.depth = 0
        else:
            self.Meta.depth = 1

    class Meta:
        model = Accel_Course
        fields = "__all__"


class AccelCourseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accel_Course_Type
        fields = "__all__"


class AccelCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Accel_Category
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super(AccelCategorySerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and (request.method == "POST" or request.method == "PUT"):
            self.Meta.depth = 0
        else:
            self.Meta.depth = 1

    def update(self, instance, validated_data):
        # get the existing courses
        existing_courses = instance.accel_course.all()

        # get new courses from the request
        new_courses_data = validated_data.pop("accel_course", None)

        if new_courses_data:
            # clear current courses
            instance.accel_course.clear()
            print("cleared instance", instance)
            # add back the courses from the request
            for course_data in new_courses_data:
                instance.accel_course.add(course_data)
                print("replaced courses instance", instance)

        return super().update(instance, validated_data)


class AccelRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accel_Role
        fields = "__all__"


class AccelProgressStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accel_Progress_Status
        fields = ["id", "progress_status"]


class AccelUserProgressSerializer(serializers.ModelSerializer):
    accel_course = AccelCourseSerializer()
    course_progress = AccelProgressStatusSerializer()

    class Meta:
        model = Accel_User_Progress
        fields = "__all__"


class AccelUserSerializer(serializers.ModelSerializer):
    user_progress = AccelUserProgressSerializer(
        many=True, required=False, read_only=True
    )

    def __init__(self, *args, **kwargs):
        super(AccelUserSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and (
            request.method == "POST"
            or request.method == "PUT"
            or request.method == "GET"
        ):
            self.Meta.depth = 0
        else:
            self.Meta.depth = 2

    class Meta:
        model = Accel_User
        fields = "__all__"


class UserCourseProgressSerializer(serializers.ModelSerializer):
    accel_user = AccelUserSerializer(source="accel_user_accel_user_progress.accel_user")
    course_name = serializers.CharField(
        source="accel_course.course_name", allow_null=True
    )
    course_link = serializers.CharField(
        source="accel_course.course_link", allow_null=True
    )
    course_type = serializers.CharField(
        source="accel_course.course_type.accel_course_type", allow_null=True
    )
    progress_status = serializers.CharField(
        source="course_progress.progress_status", allow_null=True
    )

    class Meta:
        model = Accel_User_Progress
        fields = [
            "accel_user",
            "course_name",
            "course_link",
            "course_type",
            "progress_status",
        ]
