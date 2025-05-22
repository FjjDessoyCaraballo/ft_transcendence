#!/bin/bash
set -e  

DB_FILE="./data/database.sqlite"

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
  ranking_points INTEGER DEFAULT 1000,              -- User's ranking points
  avatar_url TEXT DEFAULT '/public/avatars/bee.png', -- URL to the user's avatar
  games_played_pong INTEGER DEFAULT 0,           -- Total number of Pong games played
  wins_pong INTEGER DEFAULT 0,                   -- Total number of Pong games won
  losses_pong INTEGER DEFAULT 0,                 -- Total number of Pong games lost
  games_played_blockbattle INTEGER DEFAULT 0,    -- Total number of Block Battle games played
  wins_blockbattle INTEGER DEFAULT 0,            -- Total number of Block Battle games won
  losses_blockbattle INTEGER DEFAULT 0,          -- Total number of Block Battle games lost
  tournaments_played INTEGER DEFAULT 0,          -- Total number of tournaments played
  tournaments_won INTEGER DEFAULT 0,             -- Total number of tournaments won
  tournament_points INTEGER DEFAULT 0,           -- Overall tournament points
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
sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,          -- Unique identifier for each match
  date DATETIME DEFAULT CURRENT_TIMESTAMP,       -- Date when the match took place
  player1_id INTEGER NOT NULL,                   -- ID of player 1
  player2_id INTEGER NOT NULL,                   -- ID of player 2
  p1_ranking_points INTEGER,                     -- Ranking points of player 1 before the match
  p2_ranking_points INTEGER,                     -- Ranking points of player 2 before the match
  p1_new_ranking_points INTEGER,                 -- New ranking points of player 1 after the match
  p2_new_ranking_points INTEGER,                 -- New ranking points of player 2 after the match
  winner_id INTEGER,                             -- ID of the winner (NULL if draw)
  game_duration INTEGER,                         -- Duration of the game in seconds
  game_type TEXT NOT NULL,                       -- Type of game (pong, blockbattle)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the record was created
  FOREIGN KEY (player1_id) REFERENCES users(id), -- Foreign key constraint
  FOREIGN KEY (player2_id) REFERENCES users(id), -- Foreign key constraint
  FOREIGN KEY (winner_id) REFERENCES users(id)   -- Foreign key constraint
);"

# Create the pong_match_stats table for Pong-specific statistics
sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS pong_match_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,          -- Unique identifier for each Pong match stat
  match_id INTEGER NOT NULL,                     -- ID of the match
  longest_rally INTEGER,                         -- Longest ball rally
  avg_rally REAL,                                -- Average ball rally
  player1_points INTEGER,                        -- Points scored by Player1
  player2_points INTEGER,                        -- Points scored by Player2
  FOREIGN KEY (match_id) REFERENCES matches(id)  -- Foreign key constraint
);"

# Create the blockbattle_match_stats table for Block Battle-specific statistics
sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS blockbattle_match_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,          -- Unique identifier for each Block Battle match stat
  match_id INTEGER NOT NULL,                     -- ID of the match
  win_method TEXT,                               -- Win method (KO or Coins collected)
  player1_weapon1 TEXT,                          -- First weapon of Player1
  player1_weapon2 TEXT,                          -- Second weapon of Player1
  player1_damage_taken INTEGER,                  -- Damage taken by Player1
  player1_damage_done INTEGER,                   -- Damage done by Player1
  player1_coins_collected INTEGER,               -- Coins collected by Player1
  player1_shots_fired INTEGER,                   -- Shots fired by Player1
  player2_weapon1 TEXT,                          -- First weapon of Player2
  player2_weapon2 TEXT,                          -- Second weapon of Player2
  player2_damage_taken INTEGER,                  -- Damage taken by Player2
  player2_damage_done INTEGER,                   -- Damage done by Player2
  player2_coins_collected INTEGER,               -- Coins collected by Player2
  player2_shots_fired INTEGER,                   -- Shots fired by Player2
  FOREIGN KEY (match_id) REFERENCES matches(id)  -- Foreign key constraint
);"