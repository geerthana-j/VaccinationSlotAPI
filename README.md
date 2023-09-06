# VaccinationSlotAPI
Vaccination camp is available from 01-06-2023 to 31-06-2023

```markdown
# Vaccine Slot Registration System

This is a simple Node.js application for managing vaccine slot registrations and checking available slots. It includes user registration, login, and admin functionalities.

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js
- MongoDB

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/geerthana-j/VaccinationSlotAPI.git
   cd VaccinationSlotAPI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up MongoDB: Ensure you have a MongoDB database running, and update the MongoDB connection URI in `app.js` to point to your MongoDB instance.

## Usage

### Register User (POST)

Register a new user by sending a POST request to `/api/register`.

```bash
POST http://localhost:8884/api/register

Request Body:
{
  "name": "Jeya Kumar",
  "phoneNumber": "99876543210",
  "age": 43,
  "pincode": "56011",
  "aadharNo": "987065434321",
  "password": "paruthi@123"
}
```

### Login User (POST)

Log in as a user by sending a POST request to `/api/login`.

```bash
POST http://localhost:8884/api/login

Request Body:
{
  "phoneNumber": "99876543210",
  "password": "paruthi@123"
}
```

### Check Available Slots (GET)

Check available vaccine slots for a specific date by sending a GET request to `/slots/:date`.

```bash
GET http://localhost:8884/slots/2023-06-06
```

### Register Vaccine Slot (POST)

Register a vaccine slot by sending a POST request to `/slot/register`.

```bash
POST http://localhost:8884/slot/register

Request Body:
{
  "phoneNumber": "99876543210",
  "slotDate": "2023-06-02",
  "slotTime": "10:00",
  "vaccineStatus": 1
}
```

### Update Vaccine Slot (PATCH)

Update a vaccine slot by sending a PATCH request to `/slot/update`.

```bash
PATCH http://localhost:8884/slot/update

Request Body:
{
  "phoneNumber": "99876543210",
  "newSlotDate": "2023-06-02T14:30:00Z",
  "newSlotTime": "14:30",
  "vaccineStatus": 1
}
```

### Admin Login (POST)

Log in as an admin by sending a POST request to `/api/admin/login`.

```bash
POST http://localhost:8884/api/admin/login

Request Body:
{
  "username": "admin_user",
  "password": "admin_password"
}
```

### Admin Registered Slots (GET)

Retrieve registered slots based on query parameters by sending a GET request to `/admin/registered-slots`.

```bash
GET http://localhost:8884/admin/registered-slots?age=42&pincode=56011&vaccination_status=1
```

### Admin Check Slots on a Date (GET)

Check registered slots for a specific date by sending a GET request to `/admin/slots/:date`.

```bash
GET http://localhost:8884/admin/slots/2023-06-02
```
