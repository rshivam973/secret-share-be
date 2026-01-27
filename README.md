# Sayout Backend Server

A secure Node.js/Express backend for anonymous messaging with end-to-end encryption.

## Features

- **User Authentication**: Secure registration and login with bcrypt password hashing
- **JWT Authentication**: Access tokens (30min) and refresh tokens (1day) for secure API access
- **Message Encryption**: Fernet symmetric encryption for all messages
- **Anonymous Messaging**: Send encrypted messages to users by username
- **Auto Keep-Alive**: Prevents server sleep on free-tier hosting platforms
- **Health Monitoring**: Built-in health check endpoint

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: 
  - `bcryptjs` for password hashing
  - `fernet` for message encryption
- **Architecture**: MVC pattern (Models, Controllers, Routes)

## Project Structure

```
server/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js  # Registration & login logic
│   └── userController.js  # User & message operations
├── models/
│   └── User.js           # User schema with password hashing
├── routes/
│   ├── authRoutes.js     # Auth endpoints
│   └── userRoutes.js     # User endpoints
├── utils/
│   ├── generateKey.js    # Fernet key generator
│   └── keepAlive.js      # Auto-ping script
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── index.js              # Server entry point
└── package.json
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=5000
MESSAGE_SECRET_KEY=your-fernet-encryption-key-here
DEPLOYED_BACKEND_URL=https://your-deployed-backend-url.com

# JWT Configuration
JWT_ACCESS_SECRET=your-jwt-access-secret-here
JWT_REFRESH_SECRET=your-jwt-refresh-secret-here
JWT_ACCESS_EXPIRY=30m
JWT_REFRESH_EXPIRY=1d
```

### JWT Secrets

The `.env.example` file includes pre-generated JWT secrets. For production, generate your own using:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this command twice to generate both `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

### Generating Encryption Key

Run the key generator to create a secure Fernet encryption key:

```bash
node utils/generateKey.js
```

Copy the generated key to your `.env` file as `MESSAGE_SECRET_KEY`.

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update with your MongoDB connection string
   - Generate and add your `MESSAGE_SECRET_KEY`
   - (Optional) Add `DEPLOYED_BACKEND_URL` for production

3. **Start the server**:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000` (or your specified PORT).

## API Endpoints

### Authentication

- **POST** `/register` - Register a new user
  ```json
  {
    "Name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```

- **POST** `/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
  **Response**:
  ```json
  {
    "message": "Login successful",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "Name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
  ```

- **POST** `/refresh-token` - Refresh access token
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
  **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### User Operations

- **GET** `/get-details?email=user@example.com` - Get user details with decrypted messages

- **POST** `/send-message/:username` - Send encrypted message to user
  ```json
  {
    "content": "Your secret message here"
  }
  ```

- **GET** `/check-user/:username` - Check if username exists

### Health Check

- **GET** `/health` - Server health status

## Security Features

### Password Security
- Passwords are hashed using `bcrypt` with salt rounds before storage
- Plain text passwords are never stored in the database
- Login uses secure password comparison

### Message Encryption
- All message content is encrypted using Fernet symmetric encryption
- Messages are encrypted before saving to database
- Messages are automatically decrypted when retrieved
- Encryption key is stored securely in environment variables

## Keep-Alive Mechanism

The server includes an automatic keep-alive feature that:
- Pings the `/health` endpoint every 30 seconds
- Prevents server sleep on free-tier hosting (Render, Heroku, etc.)
- Automatically uses deployment URL when `DEPLOYED_BACKEND_URL` is set
- Falls back to localhost for local development

## Development

### Running Locally
```bash
npm start
```

### Testing Endpoints
Use the included `verify_backend.js` script to test core functionality:
```bash
node verify_backend.js
```

## Deployment

1. Set up your MongoDB cluster and get the connection string
2. Generate a new encryption key using `generateKey.js`
3. Set all environment variables in your hosting platform
4. Deploy the server
5. Add `DEPLOYED_BACKEND_URL` to enable keep-alive for your deployment

## Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "fernet": "^0.4.0",
  "mongoose": "^7.2.2"
}
```

## License

ISC
