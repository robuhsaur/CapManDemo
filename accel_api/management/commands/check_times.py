from django.db import connection
from accel_api.models import Accel_User
from django.core.management.base import BaseCommand
from accel_api.models import Accel_User  # Import your model
import time

class Command(BaseCommand):
    help = 'Checks the time taken for some queries'

    def handle(self, *args, **kwargs):
        # Your logic here
        users = Accel_User.objects.all()  # Example query
        self.stdout.write(self.style.SUCCESS(f'Found {users.count()} users.'))


        # Optionally, loop through and print out user details
        for user in users[:50]:  # Limit to first 10 users to avoid flooding the console
            self.stdout.write(self.style.SUCCESS(f'User: {user.first_name} {user.last_name} - {user.email}'))
        
        # Start time
        start_time = time.perf_counter()  # Higher precision timing

        # Your query
        users = Accel_User.objects.all()

        # End time
        end_time = time.perf_counter()

        # Calculate time taken
        query_time = end_time - start_time

        # Print out the number of users and the time taken
        self.stdout.write(self.style.SUCCESS(f'Found {users.count()} users in {query_time:.6f} seconds'))


