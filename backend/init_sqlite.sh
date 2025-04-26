#!/bin/bash
set -e  

DB_FILE="./data/trancendence.db"

# Ensure the data directory exists
DATA_DIR="./data"
if [ ! -d "$DATA_DIR" ]; then
  echo "Creating data directory at $DATA_DIR..."
  mkdir -p "$DATA_DIR"
  chmod 700 "$DATA_DIR"  # Restrict access to the directory
fi

# Create the database file if it doesn't exist
if [ ! -f "$DB_FILE" ]; then
  echo "Creating SQLite database at $DB_FILE..."
  touch "$DB_FILE"
  chmod 600 "$DB_FILE"
fi

# Execute the SQL commands to create the users table
echo "Initializing SQLite tables..."
sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,          -- Unique identifier for each user
  username TEXT NOT NULL UNIQUE,                 -- Unique username of the user
  password TEXT NOT NULL,                        -- Hashed password of the user
  email TEXT NOT NULL UNIQUE,                    -- Unique mail address of the user
  avatar_url TEXT DEFAULT '/public/avatars/bee.png', -- URL to the user's avatar
  color TEXT DEFAULT 'blue',                     -- User's preferred color
  games_played INTEGER DEFAULT 0,                -- Total number of games played by the user
  games_won INTEGER DEFAULT 0,                   -- Total number of games won by the user
  games_lost INTEGER DEFAULT 0,                  -- Total number of games lost by the user
  elo_rank INTEGER DEFAULT 1000,                 -- ELO ranking of the user (default is 1000)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the user was created
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the user was last updated
  deleted_at DATETIME DEFAULT NULL               -- Timestamp for soft deletion (NULL if not deleted)
);"

# Execute the SQL commands to create the friends table
sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,          -- Unique identifier for each friendship
  user_id INTEGER NOT NULL,                      -- ID of the user who initiated the friendship
  friend_id INTEGER NOT NULL,                    -- ID of the friend
  status TEXT NOT NULL DEFAULT 'pending',        -- Status of the friendship (pending, accepted, blocked)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the friendship was created
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the friendship was last updated
  deleted_at DATETIME DEFAULT NULL,              -- Timestamp for soft deletion (NULL if not deleted)
  FOREIGN KEY (user_id) REFERENCES users(id),    -- Foreign key constraint referencing users table
  FOREIGN KEY (friend_id) REFERENCES users(id)   -- Foreign key constraint referencing users table
  UNIQUE (user_id, friend_id)                  -- Ensure that each user can only have one friendship with another user
);"

# Create the games table to track game history
sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,          -- Unique identifier for each game
  game_type TEXT NOT NULL,                       -- Type of game (pong, other_game)
  player1_id INTEGER NOT NULL,                   -- ID of player 1
  player2_id INTEGER NOT NULL,                   -- ID of player 2
  winner_id INTEGER,                             -- ID of the winner (NULL if draw)
  player1_score INTEGER DEFAULT 0,               -- Score of player 1
  player2_score INTEGER DEFAULT 0,               -- Score of player 2
  duration_seconds INTEGER,                      -- Duration of the game in seconds
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the game was created
  FOREIGN KEY (player1_id) REFERENCES users(id), -- Foreign key constraint
  FOREIGN KEY (player2_id) REFERENCES users(id), -- Foreign key constraint
  FOREIGN KEY (winner_id) REFERENCES users(id)   -- Foreign key constraint
);"