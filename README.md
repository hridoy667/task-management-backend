# Task Management Backend

This is the backend API for a Kanban-style task management application. Built with **NestJS**, **Prisma ORM**, and **PostgreSQL**, it handles user authentication, board creation, column layouts, and task positioning with high security and stability.

---

## Technical Features

* **Framework:** NestJS (TypeScript) for a clean, modular structure that keeps code readable and easy to maintain.
* **Database & ORM:** NeonDB for cloud data storage, PostgreSQL for reliable relational data storage, managed through Prisma for fully type-safe queries.
* **Dual-Token Auth:** Uses short-lived JWT Access Tokens (15 mins) for route access and long-lived Refresh Tokens (7 days) for session persistence.
* **Security Hardening:** * Refresh tokens are stored in the database as secure **SHA-256 hashes** instead of plain text.
* Integrated **Helmet** to inject secure HTTP headers and custom **CORS** rules to block unauthorized cross-site requests.

* **Rate Limiting:** Protects the `/auth/login` route against brute-force attacks by limiting IP addresses to exactly **7 login attempts per minute**.Also added rate limiting in some heavy/expensive query operations for performance and scalability.

* **Safe Database Actions:** Uses Prisma **Transactions (`$transaction`)** for complex operations like moving tasks or creating logs. If one step fails, the whole operation rolls back instantly to prevent broken data.

---
## Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=3000

# Database Connection
DATABASE_URL="postgresql://neondb_owner:npg_0JN3rxRkslKG@ep-blue-union-adf38fw8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secrets (Use strong random strings)
JWT_SECRET="your-secret-access-key-here"
JWT_REFRESH_SECRET="your-secret-refresh-key-here"
JWT_ACCESS_EXPIRATION="15m"

# Security
FRONTEND_URL="http://localhost:3000"

```
---
## How to Setup and Run

### Prerequisites

* Node.js (v22 or later)
* PostgreSQL running locally or in the cloud
* Yarn installed

### 1. Installation

```bash
yarn install

```

### 2. Database Setups

Run migrations to create the database tables and sync your Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate

```

### 3. Start the Server

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod

```

The server will start running on `http://localhost:3000`.

---

## API Documentation

The complete API documentation is built using Swagger UI.

* **Live URL:** `https://task-management-backend-production-179b.up.railway.app/api/docs`

* **Postman Collection url:** `https://ali-imamhref-4306218.postman.co/workspace/Ali-Imam-Hridoy's-Workspace~ddfc2b7f-226a-44de-81f0-88015eac6d52/collection/48094508-eb551e25-9bd3-48cb-b528-241f4fc2fa0a?action=share&creator=48094508`

You can use this link to check out the expected request bodies, response models, and use the "Try it out" feature to test endpoints directly from your browser. (Note: For protected routes, use the "Authorize" button to paste your JWT access token).

---

## Key Challenges & Solutions

### 1. Task Position Duplications during Drag-and-Drop

* **The Problem:** Multiple tasks could accidentally take up the same position index within a column during changes.

* **The Solution:** Added a strict unique index to ensure no two tasks can ever hold the identical position value within the same column at the same time.

### 2. URL Query Strings Failing Number Validations

* **The Problem:** Express parses incoming URL query data (like pagination limits or filtering priorities) as plain strings. This caused strict `class-validator` rules like `@IsInt()` to throw errors.
* **The Solution:** Enabled `transform: true` globally inside NestJS validation pipes and used class-transformer's `@Type(() => Number)` to clean up and convert data types automatically before they reach our service filters.

---

## Future Improvements

* **Redis Caching:** Cache heavy database reads (like loading an entire dashboard with boards and tasks) to speed up response times.
* **Automated Testing:** Build a full integration test suite with Supertest to check auth guards, validation limits, and edge cases.
* **Detailed Logs:** Track detailed task history by storing the exact changes (old data vs new data) in the activity logs to allow undo/redo features.