# Generated by Django 5.1.1 on 2024-09-09 04:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accel_api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='accel_user',
            name='role',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
