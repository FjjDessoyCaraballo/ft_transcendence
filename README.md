# ft_transcendence

A multiplayer browser game platform featuring Pong and Block Battle games with user accounts, real-time gameplay, and social features.

## Overview

ft_transcendence is a full-stack web application that allows users to play classic arcade games with modern features. The platform includes user authentication, friend management, real-time multiplayer gaming, and tournament functionality.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Friend System**: Add friends, see online status, and challenge them to games
- **Two Game Modes**: 
  - Classic Pong
  - Block Battle (a platform-based combat game)
- **Real-time Gameplay**: Powered by Socket.IO for instant multiplayer interaction
- **Game Statistics**: Track wins, losses, and ranking points
- **Responsive Design**: Play on desktop or mobile devices
- **GDPR Compliance**: Users can download their data or request deletion

## Tech Stack

### Backend
- Node.js with Fastify framework
- Socket.IO for real-time communication
- SQLite for database storage
- JWT for authentication
- HTTPS with self-signed certificates

### Frontend
- TypeScript
- React
- TailwindCSS
- HTML5 Canvas for game rendering
- WebSockets for real-time game state updates

## Project Structure

```
ft_transcendence/
├── Makefile              # Commands for building and running the project
├── docker-compose.yml    # Docker configuration
├── backend/              # Backend server code
│   ├── Dockerfile        # Backend Docker configuration
│   ├── package.json      # Backend dependencies
│   ├── config.js         # Server configuration
│   ├── src/              # Source code
│   │   ├── middleware/   # Authentication and validation middleware
│   │   ├── plugins/      # Fastify plugins
│   │   ├── repositories/ # Data access layer
│   │   ├── routes/       # API endpoints
│   │   ├── server.js     # Main server file
│   │   └── utils/        # Utility functions
├── frontend/             # Frontend application code
│   ├── Dockerfile        # Frontend Docker configuration
│   ├── package.json      # Frontend dependencies
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── UI/           # User interface components
│   │   ├── components/   # React components
│   │   ├── game/         # Game logic
│   │   ├── services/     # API service layer
│   │   └── styles/       # CSS and Tailwind styles
│   ├── tsconfig.json     # TypeScript configuration
│   └── webpack.config.js # Webpack configuration
└── data/                 # Database files (mounted as volume)
```

## Installation

### Prerequisites
- Docker and Docker Compose
- Node.js (for development outside Docker)
- Make (optional, for using the Makefile commands)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ft_transcendence.git
   cd ft_transcendence
   ```

2. Create an `.env` file with the necessary environment variables.

3. Build and start the containers:
   ```bash
   make build
   make start
   ```

   Alternatively, you can use Docker Compose directly:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: https://localhost:9000
   - Backend API: https://localhost:3443

## Development

### Starting Development Servers

To start the services with logs visible:
```bash
make dev
```

### Useful Commands

- `make start`: Start containers in the background
- `make stop`: Stop containers
- `make restart`: Restart containers
- `make logs`: View logs from all containers
- `make logs-backend`: View only backend logs
- `make logs-frontend`: View only frontend logs
- `make clean`: Clean up Docker resources
- `make fclean`: Remove all Docker resources including images
- `make db`: View SQLite database tables
- `make help`: Show available commands

### Database

The application uses SQLite for data storage. The database file is stored in the `data/` directory, which is mounted as a volume in the Docker containers.

To view the database:
```bash
make db
```

## Game Controls

### Player 1
- **Movement**: W, A, D
- **Shoot**: Spacebar

### Player 2
- **Movement**: I, J, L
- **Shoot**: U

## API Documentation

The API provides endpoints for user management, friend relationships, and game statistics.

### Authentication
- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: Login and receive JWT token

### User Management
- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get user by ID
- `PUT /api/users/profile`: Update user profile
- `PUT /api/users/password`: Change password
- `POST /api/users/avatar`: Upload avatar
- `GET /api/users/stats`: Get user statistics
- `GET /api/users/match-history`: Get user's match history
- `GET /api/users/export-data`: Export user data (GDPR)
- `DELETE /api/users/account`: Delete account (GDPR)

### Friend System
- `GET /api/friends`: Get all friends
- `GET /api/friends/requests`: Get pending friend requests
- `POST /api/friends/request/:friendId`: Send friend request
- `PUT /api/friends/accept/:friendId`: Accept friend request
- `PUT /api/friends/reject/:friendId`: Reject friend request
- `DELETE /api/friends/:friendId`: Remove friend
- `GET /api/friends/search`: Search for users
- `GET /api/friends/online`: Get online friends

### Game System
- `POST /api/games/invite/:friendId`: Invite a friend to play

## Architecture

The application follows a client-server architecture:

- **Backend**: RESTful API with WebSocket support for real-time features
- **Frontend**: Single Page Application (SPA) with React components
- **Database**: SQLite for persistent storage
- **Authentication**: JWT tokens for secure user sessions
- **Real-time Communication**: Socket.IO for game state synchronization

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## Testing

Currently, the project relies on manual testing. Automated tests are planned for future releases.
