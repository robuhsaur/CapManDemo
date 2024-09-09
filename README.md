# Mock Accel Program


## What does it do?

The Accel Program application is designed to streamline the process for students and administrators participating in the bank's internal career development program. 

It allows administrators to create and manage courses, track student progress, and assign courses based on student goals. Students can view their assigned courses, track their progress, and access resources.

This project includes a React frontend and a Django backend, connected through Django REST Framework (DRF). The frontend is built using Vite for optimized performance, while the backend is set up with an API to manage the database and user interactions.

## Features

- User management with different roles.
- CRUD operations for courses, users, and progress tracking.
- API integration between the frontend (React) and backend (Django with DRF).
- Implementation of data query optimization for efficient data fetching.

### Setup Instructions

## Backend Setup 

1. Clone the repository:


  ```git clone https://github.com/robuhsaur/CapManDemo.git```
  
  ```cd CapManDemo```

2. Set up virtual environment & install dependencies:


  ```python3 -m venv .venv```
   
  ```source ./.venv/bin/activate  # macOS```
  
  ```./.venv/Scripts/Activate.ps1 # Windows```
  
  ```pip install -r requirements.txt```

4. Apply Django migrations


   ```python manage.py migrate```

5. Start server


   ```python manage.py runserver```


## Frontend Setup 

1. Navigate to the front-end


    ```cd accelMock```

2. Install dependencies


   ```npm install```

3. Start frontend server


   ```npm run dev```



### URLS: 

## Login as Student

1. Navigate to:

   http://localhost:5173/login

4. Login using these credentials:

   **Username**: luffy@onepiece.com
   
   **Password**: no password required for demo, type any string into the field


## Login as Admin

1. Navigate to:

   http://localhost:5173/login

4. Login using these credentials:

   **Username**: rnacario@gmail.com
   
   **Password**: no password required for demo, type any string into the field

   










   
