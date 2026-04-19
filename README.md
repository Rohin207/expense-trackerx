

## Stack

- React + Vite frontend
- Node.js + Express API
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing

## Folder Structure

```text
/client   React frontend
/server   Express backend
```

## Local Setup

### 1. Backend

```bash
cd server
npm install
copy .env.example .env
```

Update `.env` with your MongoDB connection string and secrets. For this project, the current development JWT secret is `expense-tracker-x-jwt-secret-2026-dev`, then run:

```bash
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

## API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/transactions/add`
- `GET /api/transactions/get`
- `PUT /api/transactions/update/:id`
- `DELETE /api/transactions/delete/:id`


