COMPOSE_FILE = docker-compose.yml
ENV_FILE = .env

# Colors
RESET = \033[0m
GREEN = \033[32m
YELLOW = \033[33m
RED = \033[31m
BLUE = \033[34m

.PHONY: all build start stop restart clean logs setup db help backend

# Build the Docker images
build:
	@echo "$(BLUE)Building Docker images...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) build

# Start the containers in the background
start:
	@echo "$(GREEN)Starting containers...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Services are running:$(RESET)"
	@echo "$(GREEN)- Frontend: https://localhost:$$(grep FRONTEND_PORT $(ENV_FILE) | cut -d '=' -f2 || echo 8080)$(RESET)"
	@echo "$(GREEN)- Backend API: https://localhost:$$(grep BACKEND_PORT $(ENV_FILE) | cut -d '=' -f2 || echo 3443)$(RESET)"

# Start containers in development mode with logs visible
dev:
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
	docker-compose -f $(COMPOSE_FILE) down -v
	@echo "$(RED)Removing data directory contents...$(RESET)"
	rm -rf data/*
	touch data/.gitkeep
	rm -rf certs/*
	
# Full clean: remove everything, including images and unused volumes
fclean: clean
	@echo "$(RED)Removing all unused Docker volumes...$(RESET)"
	docker volume prune -f
	@echo "$(RED)Removing all Docker images...$(RESET)"
	docker rmi -f $$(docker images -q) || true

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

backend:
	docker-compose -f $(COMPOSE_FILE) up backend

# Show database contents (for SQLite)
db:
	@echo "$(BLUE)SQLite database contents:$(RESET)"
	docker-compose -f $(COMPOSE_FILE) exec backend sqlite3 /app/data/database.sqlite

# Full stop and cleaning for restart
nuke: stop fclean build start

# Full stop and cleaning for restart
nuke: stop fclean build start

# Help command
help:
	@echo "$(BLUE)Available commands:$(RESET)"
	@echo "  going into frontend container		- docker exec -it frontend sh"
	@echo "  going into backend container		- docker exec -it backend sh"
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
