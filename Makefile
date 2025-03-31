COMPOSE_FILE = docker-compose.yml
ENV_FILE = .env

# Colors
RESET = \033[0m
GREEN = \033[32m
YELLOW = \033[33m
RED = \033[31m
BLUE = \033[34m

.PHONY: all build start stop restart clean logs setup db help

# Build the Docker images
build: setup
	@echo "$(BLUE)Building Docker images...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) build

# Start the containers in the background
start: setup
	@echo "$(GREEN)Starting containers...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Services are running:$(RESET)"
	@echo "$(GREEN)- Frontend: http://localhost:$$(grep FRONTEND_PORT $(ENV_FILE) | cut -d '=' -f2 || echo 8080)$(RESET)"
	@echo "$(GREEN)- Backend API: http://localhost:$$(grep BACKEND_PORT $(ENV_FILE) | cut -d '=' -f2 || echo 3000)$(RESET)"

# Start containers in development mode with logs visible
dev: setup
	@echo "$(GREEN)Starting containers in development mode...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) up

# Stop the containers
stop:
	@echo "$(YELLOW)Stopping containers...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down

# Restart the containers
restart: stop start

# Clean up containers, images, and volumes
clean:
	@echo "$(RED)Cleaning up Docker resources...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	@echo "$(RED)Removing data directory contents...$(RESET)"
	rm -rf data/*
	touch data/.gitkeep

# Show container logs
logs:
	@echo "$(BLUE)Showing logs...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) logs -f

# Show logs for a specific service
logs-backend:
	@echo "$(BLUE)Showing backend logs...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend:
	@echo "$(BLUE)Showing frontend logs...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

# Show database contents (for SQLite)
db:
	@echo "$(BLUE)SQLite database contents:$(RESET)"
	docker-compose -f $(COMPOSE_FILE) exec backend sqlite3 /app/data/database.sqlite .tables

# Help command
help:
	@echo "$(BLUE)Available commands:$(RESET)"
	@echo "  make setup    - Create initial .env file and data directory"
	@echo "  make build    - Build Docker images"
	@echo "  make start    - Start containers in detached mode"
	@echo "  make dev      - Start containers in foreground (with logs visible)"
	@echo "  make stop     - Stop containers"
	@echo "  make restart  - Restart containers"
	@echo "  make clean    - Clean up all Docker resources"
	@echo "  make logs     - View all container logs"
	@echo "  make logs-backend - View backend logs"
	@echo "  make logs-frontend - View frontend logs"
	@echo "  make db       - View database tables"
	@echo "  make help     - Show this help message"