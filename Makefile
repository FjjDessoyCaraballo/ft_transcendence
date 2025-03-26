# Makefile for ft_transcendence

# Variables
COMPOSE_FILE = docker-compose.yml
ENV_FILE = .env

# Colors
RESET = \033[0m
GREEN = \033[32m
YELLOW = \033[33m
RED = \033[31m
BLUE = \033[34m

# Main commands
.PHONY: all build start stop restart clean logs help

all: build start

# Build the Docker images
build:
	@echo "$(BLUE)Building Docker images...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) build

# Start the containers
start:
	@echo "$(GREEN)Starting containers...$(RESET)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Services are running:$(RESET)"
	@echo "$(GREEN)- Frontend: http://localhost:8080$(RESET)"
	@echo "$(GREEN)- Backend API: http://localhost:3000$(RESET)"

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

# Show database contents (for SQLite)
db:
	@echo "$(BLUE)SQLite database contents:$(RESET)"
	docker-compose -f $(COMPOSE_FILE) exec backend sqlite3 /app/data/database.sqlite .tables

# Help command
help:
	@echo "$(BLUE)Available commands:$(RESET)"
	@echo "  make build    - Build Docker images"
	@echo "  make start    - Start containers"
	@echo "  make stop     - Stop containers"
	@echo "  make restart  - Restart containers"
	@echo "  make clean    - Clean up all Docker resources"
	@echo "  make logs     - View container logs"
	@echo "  make db       - View database tables"
	@echo "  make help     - Show this help message"