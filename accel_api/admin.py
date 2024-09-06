from django.contrib import admin
from .models import *


# Register your models here.
class AccelCourseTypeAdmin(admin.ModelAdmin):
    list = "AccelCourseType"


class AccelCourseAdmin(admin.ModelAdmin):
    list = "AccelCourse"


class AccelCategoryAdmin(admin.ModelAdmin):
    list = "AccelCategory"


class AccelRoleAdmin(admin.ModelAdmin):
    list = "AccelRole"


class AccelUserAdmin(admin.ModelAdmin):
    list = "AccelUser"


class AccelProgressStatusAdmin(admin.ModelAdmin):
    list = "AccelProgressStatus"


class AccelUserProgressAdmin(admin.ModelAdmin):
    list = "AccelUserProgress"


admin.site.register(Accel_Course_Type, AccelCourseTypeAdmin)
admin.site.register(Accel_Course, AccelCourseAdmin)
admin.site.register(Accel_Category, AccelCategoryAdmin)
admin.site.register(Accel_Role, AccelRoleAdmin)
admin.site.register(Accel_User, AccelUserAdmin)
admin.site.register(Accel_Progress_Status, AccelProgressStatusAdmin)
admin.site.register(Accel_User_Progress, AccelUserProgressAdmin)
