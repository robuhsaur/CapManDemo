import json
from django.core.management.base import BaseCommand
from accel_api.models import Accel_User

class Command(BaseCommand):
    help = 'Load accel users from accel_users.json'

    def handle(self, *args, **kwargs):
        with open('accel_api/management/commands/accel_users.json') as f:
            data = json.load(f)
            for user_data in data:
                Accel_User.objects.create(
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    description=user_data['description'],
                    start_date=user_data['start_date'],
                    email=user_data['email'],
                    role=user_data['role']
                )
        self.stdout.write(self.style.SUCCESS('Successfully loaded accel users'))