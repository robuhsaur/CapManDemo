import json
from faker import Faker

faker = Faker()

data = []
roles = ["STUDENT", "ADMIN"]

for i in range(11, 300):  # Adjust the range for more data
    user = {
        "id": i,
        "user_progress": [],
        "first_name": faker.first_name(),
        "last_name": faker.last_name(),
        "description": faker.job(),
        "start_date": faker.date_this_year().isoformat(),
        "email": faker.email(),
        "role": faker.random.choice(roles)
    }
    data.append(user)

print(user)

with open('accel_users.json', 'w') as f:
    json.dump(data, f, indent=4)
