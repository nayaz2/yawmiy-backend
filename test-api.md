# API Testing Guide

## Base URL
http://localhost:3000

## 1. Register a New User

### Using PowerShell (Invoke-RestMethod - Recommended):
```powershell
Invoke-RestMethod -Uri http://localhost:3000/auth/register -Method Post -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123","username":"testuser"}'
```

### Using curl.exe (PowerShell):
```powershell
curl.exe -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"username\":\"testuser\"}"
```

### Using curl (Command Prompt):
```cmd
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"username\":\"testuser\"}"
```

## 2. Login

### Using PowerShell (Invoke-RestMethod - Recommended):
```powershell
Invoke-RestMethod -Uri http://localhost:3000/auth/login -Method Post -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```

### Using curl.exe (PowerShell):
```powershell
curl.exe -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Using curl (Command Prompt):
```cmd
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

## 3. Using Postman

1. **Download Postman**: https://www.postman.com/downloads/

2. **Register Endpoint**:
   - Method: `POST`
   - URL: `http://localhost:3000/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "username": "testuser"
     }
     ```

3. **Login Endpoint**:
   - Method: `POST`
   - URL: `http://localhost:3000/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```

## Expected Responses

### Register Response:
```json
{
  "id": 1,
  "email": "test@example.com",
  "username": "testuser"
}
```

### Login Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

