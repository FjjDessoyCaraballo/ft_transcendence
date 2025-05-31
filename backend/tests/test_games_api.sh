#!/bin/bash
# filepath: /home/lauri/projects/pong/test_game_api.sh

set -e  # Exit on error

# Backend URL
API_URL="https://localhost:3443/api"

# Skip SSL verification for local testing
CURL_OPTS="-s -k"  # -s for silent, -k to ignore SSL certificate issues

# Color outputs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Test user credentials
USER1_USERNAME="gametest1"
USER1_PASSWORD="password123"
USER1_EMAIL="gametest1@example.com"

USER2_USERNAME="gametest2"
USER2_PASSWORD="password123"
USER2_EMAIL="gametest2@example.com"

# Stored tokens and IDs
USER1_TOKEN=""
USER2_TOKEN=""
USER1_ID=""
USER2_ID=""

# Test match ID
TEST_MATCH_ID=""

# Helper function to print messages
print_message() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

# Helper function to print success messages
print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Helper function to print error messages
print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Helper function to print warnings
print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Helper function to parse JSON with error handling
parse_json() {
  python3 -c "import sys, json; print(json.load(sys.stdin)$1)" 2>/dev/null || echo ""
}

# Check if database file exists
check_database() {
  print_message "Checking database file..."
  if [ ! -f "./data/database.sqlite" ]; then
    print_warning "Database file not found. Running initialization script..."
    (cd ./backend && ./init_sqlite.sh)
    print_success "Database initialized"
  else
    print_success "Database file exists"
  fi
}

# Clean up users if they exist
cleanup_users() {
  print_message "Cleaning up previous test users if they exist..."
  
  # Login as user1 and delete account
  local response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER1_USERNAME\", \"password\":\"$USER1_PASSWORD\"}" \
    $API_URL/users/login)
    
  local token=$(echo $response | parse_json "['token']")
  if [ ! -z "$token" ]; then
    curl $CURL_OPTS -X DELETE -H "Authorization: Bearer $token" $API_URL/users/account > /dev/null
    print_message "User1 deleted."
  fi
  
  # Login as user2 and delete account
  local response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER2_USERNAME\", \"password\":\"$USER2_PASSWORD\"}" \
    $API_URL/users/login)
    
  local token=$(echo $response | parse_json "['token']")
  if [ ! -z "$token" ]; then
    curl $CURL_OPTS -X DELETE -H "Authorization: Bearer $token" $API_URL/users/account > /dev/null
    print_message "User2 deleted."
  fi
  
  sleep 1  # Wait for deletion to complete
}

# Register two test users
register_users() {
  print_message "Registering test user 1..."
  local response1=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER1_USERNAME\", \"password\":\"$USER1_PASSWORD\", \"email\":\"$USER1_EMAIL\"}" \
    $API_URL/users/register)
  
  echo "User 1 registration response: $response1"
  
  sleep 1  # Give time for the registration to complete
  
  print_message "Registering test user 2..."
  local response2=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER2_USERNAME\", \"password\":\"$USER2_PASSWORD\", \"email\":\"$USER2_EMAIL\"}" \
    $API_URL/users/register)
  
  echo "User 2 registration response: $response2"
  
  sleep 1  # Give time for the registration to complete
}

# Login users and save their tokens
login_users() {
  print_message "Logging in as user 1..."
  
  local response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER1_USERNAME\", \"password\":\"$USER1_PASSWORD\"}" \
    $API_URL/users/login)
  
  USER1_TOKEN=$(echo $response | parse_json "['token']")
  USER1_ID=$(echo $response | parse_json "['user']['id']")
  
  if [ -z "$USER1_TOKEN" ]; then
    print_error "Failed to login as user 1"
    echo $response
    exit 1
  else
    print_success "User 1 logged in successfully"
  fi
  
  print_message "Logging in as user 2..."
  
  local response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER2_USERNAME\", \"password\":\"$USER2_PASSWORD\"}" \
    $API_URL/users/login)
  
  USER2_TOKEN=$(echo $response | parse_json "['token']")
  USER2_ID=$(echo $response | parse_json "['user']['id']")
  
  if [ -z "$USER2_TOKEN" ]; then
    print_error "Failed to login as user 2"
    echo $response
    exit 1
  else
    print_success "User 2 logged in successfully"
  fi
  
  print_message "User 1 ID: $USER1_ID, User 2 ID: $USER2_ID"
}

# Make the two users friends (needed for game invitation test)
make_friends() {
  print_message "Making users friends (needed for game invitation)..."
  
  # User 1 sends friend request to user 2
  local response=$(curl $CURL_OPTS -X POST -H "Authorization: Bearer $USER1_TOKEN" \
    $API_URL/friends/request/$USER2_ID)
  
  if echo $response | grep -q "success"; then
    print_success "Friend request sent"
  else
    print_warning "Friend request issue: $response" 
  fi
  
  # User 2 accepts the friend request
  local response=$(curl $CURL_OPTS -X PUT -H "Authorization: Bearer $USER2_TOKEN" \
    $API_URL/friends/accept/$USER1_ID)
  
  if echo $response | grep -q "success"; then
    print_success "Friend request accepted"
  else
    print_warning "Accept request issue: $response"
  fi
  
  # Verify they are friends
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/friends)
  
  if echo $response | grep -q "$USER2_USERNAME"; then
    print_success "Users are now friends"
  else
    print_warning "Users may not be friends yet: $response"
  fi
}

# Test creating a new pong match record
test_record_pong_match() {
  print_message "Testing match recording (pong game)..."
  
  # Calculate mock ranking points
  local player1_old_points=1000
  local player2_old_points=1000
  local player1_new_points=1010  # Winner gets 10 points
  local player2_new_points=990   # Loser loses 10 points
  
  # Use a variable for the JSON payload to avoid string interpolation issues
  local payload="{\"player1_id\":${USER1_ID},\"player2_id\":${USER2_ID},\"winner_id\":${USER1_ID},\"game_duration\":180,\"game_type\":\"pong\",\"p1_new_ranking_points\":${player1_new_points},\"p2_new_ranking_points\":${player2_new_points},\"game_stats\":{\"longest_rally\":12,\"avg_rally\":5.2,\"player1_points\":11,\"player2_points\":7}}"
  
  local response=$(curl $CURL_OPTS -X POST -H "Authorization: Bearer $USER1_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    $API_URL/games/record-match)
  
  echo "Response: $response"
  
  if echo $response | grep -q "success"; then
    print_success "Pong match recorded successfully"
    TEST_MATCH_ID=$(echo $response | parse_json "['matchId']")
    print_message "Created pong match with ID: $TEST_MATCH_ID"
  else
    print_error "Failed to record pong match"
  fi
}

# Test creating a new blockbattle match record
test_record_blockbattle_match() {
  print_message "Testing match recording (blockbattle game)..."
  
  # Calculate mock ranking points (User2 wins, User1 loses)
  local player1_old_points=1000  # User2's starting points
  local player2_old_points=990   # User1's points after losing the pong match
  local player1_new_points=1015  # User2 wins and gets 15 points
  local player2_new_points=975   # User1 loses and loses 15 more points
  
  # Use a variable for the JSON payload to avoid string interpolation issues
  local payload="{\"player1_id\":${USER2_ID},\"player2_id\":${USER1_ID},\"winner_id\":${USER2_ID},\"game_duration\":240,\"game_type\":\"blockbattle\",\"p1_new_ranking_points\":${player1_new_points},\"p2_new_ranking_points\":${player2_new_points},\"game_stats\":{\"win_method\":\"KO\"}}"
  
  local response=$(curl $CURL_OPTS -X POST -H "Authorization: Bearer $USER2_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    $API_URL/games/record-match)
  
  echo "Response: $response"
  
  if echo $response | grep -q "success"; then
    print_success "BlockBattle match recorded successfully"
    local second_match_id=$(echo $response | parse_json "['matchId']")
    print_message "Created blockbattle match with ID: $second_match_id"
  else
    print_error "Failed to record BlockBattle match"
  fi
}

# Test getting all matches
test_get_all_matches() {
  print_message "Testing getting all matches..."
  
  local response=$(curl $CURL_OPTS $API_URL/games/matches)
  
  if echo $response | grep -q "\"matches\""; then
    print_success "Successfully retrieved matches list"
    local count=$(echo $response | python3 -c "import sys, json; print(len(json.load(sys.stdin)['matches']))" 2>/dev/null || echo "0")
    print_message "Found $count matches in the database"
  else
    print_error "Failed to retrieve matches"
    echo $response
  fi
}

# Test getting a specific match by ID
test_get_match_by_id() {
  print_message "Testing getting match by ID..."
  
  if [ -z "$TEST_MATCH_ID" ]; then
    print_warning "No test match ID available, skipping this test"
    return
  fi
  
  local response=$(curl $CURL_OPTS $API_URL/games/match/$TEST_MATCH_ID)
  
  if echo $response | grep -q "\"match\""; then
    print_success "Successfully retrieved match details"
    echo "Match type: $(echo $response | parse_json "['match']['game_type']")"
    echo "Winner: $(echo $response | parse_json "['match']['winner_name']")"
  else
    print_error "Failed to retrieve match details"
    echo $response
  fi
}

# Test getting matches for a specific player
test_get_player_matches() {
  print_message "Testing getting matches for player $USER1_ID ($USER1_USERNAME)..."
  
  local response=$(curl $CURL_OPTS $API_URL/games/matches/player/$USER1_ID)
  
  if echo $response | grep -q "\"matches\""; then
    print_success "Successfully retrieved player matches"
    local count=$(echo $response | python3 -c "import sys, json; print(len(json.load(sys.stdin)['matches']))" 2>/dev/null || echo "0")
    print_message "Found $count matches for player $USER1_ID"
  else
    print_error "Failed to retrieve player matches"
    echo $response
  fi
}

# Test getting current user's matches
test_get_my_matches() {
  print_message "Testing getting authenticated user's matches..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/games/my-matches)
  
  if echo $response | grep -q "\"matches\""; then
    print_success "Successfully retrieved user's matches"
    local count=$(echo $response | python3 -c "import sys, json; print(len(json.load(sys.stdin)['matches']))" 2>/dev/null || echo "0")
    print_message "Found $count matches for current user"
  else
    print_error "Failed to retrieve user's matches"
    echo $response
  fi
}

# Test user match history endpoint
test_user_match_history() {
  print_message "Testing user match history endpoint..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/match-history)
  
  if echo $response | grep -q "\"matches\""; then
    print_success "Successfully retrieved user match history"
    local count=$(echo $response | python3 -c "import sys, json; print(len(json.load(sys.stdin)['matches']))" 2>/dev/null || echo "0")
    print_message "Found $count matches in user's history"
  else
    print_error "Failed to retrieve user match history"
    echo $response
  fi
}

# Test user statistics
test_user_stats() {
  print_message "Testing user stats after matches..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/stats)
  
  echo $response
  
  if [ ! -z "$response" ]; then
    print_success "Successfully retrieved user stats"
    
    # Extract and check stats
    local games_played_pong=$(echo $response | parse_json "['games_played_pong']")
    local wins_pong=$(echo $response | parse_json "['wins_pong']")
    local ranking_points=$(echo $response | parse_json "['ranking_points']")
    
    print_message "User stats - Ranking: $ranking_points, Pong games: $games_played_pong, Wins: $wins_pong"
    
    if [ "$games_played_pong" -gt "0" ]; then
      print_success "User statistics updated correctly"
    else
      print_warning "User statistics may not have updated correctly"
    fi
  else
    print_error "Failed to retrieve user stats"
  fi
}

# Test GDPR data export
test_data_export() {
  print_message "Testing GDPR data export..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/export-data)
  
  if echo $response | grep -q "\"matches\""; then
    print_success "Successfully exported user data"
    local match_count=$(echo $response | python3 -c "import sys, json; print(len(json.load(sys.stdin)['matches']))" 2>/dev/null || echo "0")
    print_message "Export contains $match_count matches"
  else
    print_error "Failed to export user data"
    echo $response
  fi
}

# Test game invitation
test_game_invitation() {
  print_message "Testing game invitation API..."
  print_warning "Note: This test will succeed API-wise but may not send real socket events unless both users are online"
  
  local response=$(curl $CURL_OPTS -X POST \
    -H "Authorization: Bearer $USER1_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"gameType\": \"pong\"}" \
    $API_URL/games/invite/$USER2_ID)
  
  echo $response
  
  if echo $response | grep -q "success"; then
    print_success "Game invitation sent successfully"
  elif echo $response | grep -q "not online"; then
    print_warning "Game invitation failed because user is not online (expected in test environment)"
  else
    print_error "Game invitation failed unexpectedly"
  fi
}

# Run tests
print_message "Starting Game API tests..."
echo "============================================="

#First check database
check_database

# Clean up previous test users if they exist
cleanup_users
sleep 1

#Setup test users
register_users
sleep 2  # Added extra delay
login_users
sleep 1
make_friends
sleep 1

# Test match recording and retrieval
test_record_pong_match
sleep 1
test_record_blockbattle_match
sleep 1
test_get_all_matches
sleep 1
test_get_match_by_id
sleep 1
test_get_player_matches
sleep 1
test_get_my_matches
sleep 1
test_user_match_history
sleep 1
test_user_stats
sleep 1

# Test data export
test_data_export
sleep 1

# Test game invitation
test_game_invitation

echo "============================================="
print_message "Game API tests completed."