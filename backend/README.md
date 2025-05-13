# Backend API Documentation

This document provides information about the backend API routes, authentication, and setup instructions for the application.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database](#database)
  - [Models](#models)
  - [Relationships](#relationships)
- [API Routes](#api-routes)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Subscriptions](#subscriptions)
- [Deployment](#deployment)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite (development) or PostgreSQL (production)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see below)

4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Application
NODE_ENV=development
PORT=5000
APP_NAME=YourAppName

# Database Configuration
DB_SYNC=true  # Set to 'true' for first run, then 'false'

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# For Production Only
DB_HOST=your_db_host
DB_PORT=5432
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

## Database

The application uses Sequelize ORM with SQLite for development and can be configured for PostgreSQL in production.

### Models

The database includes the following models:

- **User**: User accounts and authentication information
- **Server**: Server configuration and details
- **Subscription**: Links users to servers they have subscribed to
- **DiscountCode**: Promotional codes for subscription discounts
- **DiscountCodeUsage**: Tracks usage of discount codes by users

### Relationships

- Users can have multiple Subscriptions
- Servers can have multiple Subscriptions
- Users can create DiscountCodes
- Users can use DiscountCodes (tracked via DiscountCodeUsage)

## API Routes

### Authentication

The authentication system uses JWT tokens with refresh token functionality.

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Create a new user account | `{ username, email, password }` | `{ user, token, refreshToken }` |
| POST | `/api/auth/login` | Authenticate a user | `{ email, password }` | `{ user, token, refreshToken }` |
| POST | `/api/auth/refresh-token` | Get a new access token | `{ refreshToken }` | `{ token, refreshToken }` |
| POST | `/api/auth/logout` | Invalidate tokens | `{ refreshToken }` | `{ message: "Logged out successfully" }` |

#### Register Example

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2023-05-01T12:00:00.000Z",
    "updatedAt": "2023-05-01T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login Example

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Refresh Token Example

```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout Example

```
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

### Users

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|-------------------------|
| GET | `/api/users` | Get all users | Yes (Admin) |
| GET | `/api/users/:id` | Get user by ID | Yes |
| PUT | `/api/users/:id` | Update user | Yes (Owner/Admin) |
| DELETE | `/api/users/:id` | Delete user | Yes (Owner/Admin) |

### Subscriptions

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|-------------------------|
| GET | `/api/subscriptions` | Get all subscriptions for current user | Yes |
| POST | `/api/subscriptions` | Create new subscription | Yes |
| GET | `/api/subscriptions/:id` | Get subscription by ID | Yes (Owner/Admin) |
| PUT | `/api/subscriptions/:id` | Update subscription | Yes (Owner/Admin) |
| DELETE | `/api/subscriptions/:id` | Delete subscription | Yes (Owner/Admin) |

## Deployment

### Database Migration for Production

For production deployment, it's recommended to use PostgreSQL instead of SQLite. The application is configured to use different database settings based on the `NODE_ENV` environment variable.

When deploying to production:

1. Set up a PostgreSQL database
2. Set the appropriate environment variables (DB_HOST, DB_USER, etc.)
3. Set `NODE_ENV=production`
4. For the first deployment, set `DB_SYNC=true` to create tables
5. After first deployment, set `DB_SYNC=false` to prevent accidental data loss

### Hosting Options

The application can be deployed to various platforms:

- **Heroku**: Easy deployment with PostgreSQL add-on
- **Render**: Simple deployment with automatic builds from GitHub
- **AWS**: More control and scalability options
- **Digital Ocean**: Cost-effective VPS solution

Remember to set all required environment variables in your hosting platform.

## License

[MIT](LICENSE)