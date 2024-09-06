from django.db import models


# Create your models here.
class Accel_Course_Type(models.Model):
    course_type = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.course_type


class Accel_Course(models.Model):
    course_name = models.CharField(max_length=200, blank=True, null=True)
    course_link = models.CharField(max_length=500, blank=True, null=True)
    course_type = models.ForeignKey(
        Accel_Course_Type,
        related_name="accel_course_type",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.course_name


class Accel_Category(models.Model):
    category_name = models.CharField(max_length=200, blank=True, null=True)
    accel_course = models.ManyToManyField(Accel_Course, related_name="accel_course")

    def __str__(self):
        return self.category_name


class Accel_Role(models.Model):
    role_name = models.CharField(max_length=255)
    accel_category = models.ManyToManyField(
        Accel_Category, related_name="accel_category"
    )

    def __str__(self):
        return self.role_name


class Accel_Progress_Status(models.Model):
    progress_status = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.progress_status


class Accel_User_Progress(models.Model):
    accel_course = models.ForeignKey(
        Accel_Course,
        related_name="accel_user_progress_accel_course",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    course_progress = models.ForeignKey(
        Accel_Progress_Status,
        related_name="accel_user_progress_accel_progress_status",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    complete_date = models.DateField(blank=True, null=True)
    approve_date = models.DateField(blank=True, null=True)
    comment = models.CharField(max_length=1000, blank=True, null=True)
    rating = models.DecimalField(
        max_digits=5, decimal_places=0, blank=True, null=True, default=0
    )


class Accel_User(models.Model):
    first_name = models.CharField(max_length=200, blank=True, null=True)
    last_name = models.CharField(max_length=200, blank=True, null=True)
    description = models.CharField(max_length=200, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    user_progress = models.ManyToManyField(
        Accel_User_Progress,
        related_name="accel_user_accel_user_progress",
        blank=True,
    )

    def __str__(self):
        return self.last_name + ", " + self.first_name
