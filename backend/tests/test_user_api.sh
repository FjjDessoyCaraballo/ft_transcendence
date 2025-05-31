#!/bin/bash
# filepath: test_user_api.sh

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
USER1_USERNAME="usertest1"
USER1_PASSWORD="Password123"  # Must have uppercase, lowercase, and digit
USER1_LANGUAGE="English"      # Default language option

USER2_USERNAME="usertest2"
USER2_PASSWORD="Password123"  # Must have uppercase, lowercase, and digit
USER2_LANGUAGE="Finnish"      # Alternative language option

# Stored tokens and IDs
USER1_TOKEN=""
USER2_TOKEN=""
USER1_ID=""
USER2_ID=""

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

# Register test users
register_users() {
  print_message "Registering test user 1 with language '$USER1_LANGUAGE'..."
  local response1=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER1_USERNAME\", \"password\":\"$USER1_PASSWORD\", \"language\":\"$USER1_LANGUAGE\"}" \
    $API_URL/users/register)
  
  if echo $response1 | grep -q "error"; then
    print_error "User 1 registration failed"
  else
    print_success "User 1 registered successfully"
  fi
  echo "User 1 registration response: $response1"
  
  sleep 1  # Give time for the registration to complete
  
  print_message "Registering test user 2 with language '$USER2_LANGUAGE'..."
  local response2=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER2_USERNAME\", \"password\":\"$USER2_PASSWORD\", \"language\":\"$USER2_LANGUAGE\"}" \
    $API_URL/users/register)
  
  if echo $response2 | grep -q "error"; then
    print_error "User 2 registration failed"
  else
    print_success "User 2 registered successfully"
  fi
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

# Test is-logged-in endpoint
test_is_logged_in() {
  print_message "Testing is-logged-in endpoint..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/is-logged-in)
  
  if echo $response | grep -q "status"; then
    print_success "Successfully verified login status"
  else
    print_error "Failed to verify login status"
    echo $response
  fi
}

# Test getting all users
test_get_all_users() {
  print_message "Testing getting all users..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/)
  
  if echo $response | grep -q "$USER1_USERNAME\|$USER2_USERNAME"; then
    print_success "Successfully retrieved users list"
    local count=$(echo $response | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    print_message "Found $count users in the database"
  else
    print_error "Failed to retrieve users"
    echo $response
  fi
}

# Test getting logged-in user data
test_logged_in_user_data() {
  print_message "Testing getting logged-in user data..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/logged-in-user-data)
  
  if echo $response | grep -q "$USER1_USERNAME"; then
    print_success "Successfully retrieved logged in user data"
    echo "Username: $(echo $response | parse_json "['username']")"
    echo "Preferred language: $(echo $response | parse_json "['pref_lang']")"
  else
    print_error "Failed to retrieve logged in user data"
    echo $response
  fi
}

# Test getting user by ID
test_get_user_by_id() {
  print_message "Testing getting user by ID ($USER2_ID)..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/$USER2_ID)
  
  if echo $response | grep -q "$USER2_USERNAME"; then
    print_success "Successfully retrieved user by ID"
    echo "Username: $(echo $response | parse_json "['username']")"
    echo "Preferred language: $(echo $response | parse_json "['pref_lang']")"
  else
    print_error "Failed to retrieve user by ID"
    echo $response
  fi
}

# Test getting user by username
test_get_user_by_username() {
  print_message "Testing getting user by username ($USER2_USERNAME)..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" \
    $API_URL/users/by-username/$USER2_USERNAME)
  
  if echo $response | grep -q "$USER2_USERNAME"; then
    print_success "Successfully retrieved user by username"
    echo "ID: $(echo $response | parse_json "['id']")"
    echo "Preferred language: $(echo $response | parse_json "['pref_lang']")"
  else
    print_error "Failed to retrieve user by username"
    echo $response
  fi
}

# Test getting user's preferred language
test_get_language() {
  print_message "Testing getting user's preferred language..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/language)
  
  if echo $response | grep -q "language"; then
    print_success "Successfully retrieved user's language preference"
    echo "Language: $(echo $response | parse_json "['language']")"
    
    # Verify the language matches what was set during registration
    local language=$(echo $response | parse_json "['language']")
    if [ "$language" == "$USER1_LANGUAGE" ]; then
      print_success "Language matches the registered preference"
    else
      print_warning "Language doesn't match registered preference"
    fi
  else
    print_error "Failed to retrieve language preference"
    echo $response
  fi
}

# Test updating user's preferred language
test_update_language() {
  print_message "Testing updating user's preferred language..."
  
  local new_language="Portuguese"  # Different from both initial languages
  
  local response=$(curl $CURL_OPTS -X PUT -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER1_TOKEN" \
    -d "{\"language\":\"$new_language\"}" \
    $API_URL/users/language)
  
  if echo $response | grep -q "success"; then
    print_success "Successfully updated language preference"
    echo "New language: $(echo $response | parse_json "['language']")"
    
    # Verify the update by fetching it again
    local verify_response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/language)
    local updated_language=$(echo $verify_response | parse_json "['language']")
    
    if [ "$updated_language" == "$new_language" ]; then
      print_success "Language was successfully updated to $new_language"
    else
      print_warning "Language update verification failed. Got: $updated_language"
    fi
  else
    print_error "Failed to update language preference"
    echo $response
  fi
}

# Test updating user profile
test_update_profile() {
  print_message "Testing updating user profile..."
  
  local new_username="${USER1_USERNAME}_updated"
  
  local response=$(curl $CURL_OPTS -X PUT -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER1_TOKEN" \
    -d "{\"username\":\"$new_username\"}" \
    $API_URL/users/profile)
  
  if echo $response | grep -q "$new_username"; then
    print_success "Successfully updated user profile"
    echo "New username: $(echo $response | parse_json "['username']")"
    
    # Update our variable to use the new username
    USER1_USERNAME=$new_username
  else
    print_error "Failed to update user profile"
    echo $response
  fi
}

# Test changing password
test_change_password() {
  print_message "Testing changing password..."
  
  local old_password=$USER1_PASSWORD
  local new_password="UpdatedPassword123"  # Still meets requirements
  
  local response=$(curl $CURL_OPTS -X PUT -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER1_TOKEN" \
    -d "{\"currentPassword\":\"$old_password\",\"newPassword\":\"$new_password\"}" \
    $API_URL/users/password)
  
  if echo $response | grep -q "success"; then
    print_success "Successfully changed password"
    
    # Try logging in with the new password
    print_message "Verifying new password by logging in again..."
    
    local login_response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
      -d "{\"username\":\"$USER1_USERNAME\", \"password\":\"$new_password\"}" \
      $API_URL/users/login)
    
    local new_token=$(echo $login_response | parse_json "['token']")
    
    if [ ! -z "$new_token" ]; then
      print_success "Successfully logged in with new password"
      USER1_TOKEN=$new_token  # Update the token
      USER1_PASSWORD=$new_password  # Update our variable
    else
      print_error "Failed to log in with new password"
      echo $login_response
    fi
  else
    print_error "Failed to change password"
    echo $response
  fi
}

# Test getting user statistics
test_get_stats() {
  print_message "Testing getting user statistics..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/stats)
  
  if [ ! -z "$response" ]; then
    print_success "Successfully retrieved user stats"
    echo "Ranking points: $(echo $response | parse_json "['ranking_points']")"
    echo "Pong games: $(echo $response | parse_json "['games_played_pong']")"
    echo "Block Battle games: $(echo $response | parse_json "['games_played_blockbattle']")"
    echo "Tournament points: $(echo $response | parse_json "['tournament_points']")"
  else
    print_error "Failed to retrieve user stats"
  fi
}

# Test getting user's match history
test_match_history() {
  print_message "Testing getting user's match history..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/match-history)
  
  if echo $response | grep -q "matches"; then
    print_success "Successfully retrieved match history"
    local count=$(echo $response | python3 -c "import sys, json; print(len(json.load(sys.stdin)['matches']))" 2>/dev/null || echo "0")
    print_message "Found $count matches in user's history"
  else
    print_error "Failed to retrieve match history"
    echo $response
  fi
}

# Test getting user's friends
test_get_friends() {
  print_message "Testing getting user's friends..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/friends)
  
  if echo $response | grep -q "friends"; then
    print_success "Successfully retrieved friends list"
    local count=$(echo $response | python3 -c "import sys, json; print(len(json.load(sys.stdin)['friends']))" 2>/dev/null || echo "0")
    print_message "Found $count friends"
  else
    print_error "Failed to retrieve friends list"
    echo $response
  fi
}

# Test GDPR data export
test_export_data() {
  print_message "Testing GDPR data export..."
  
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $USER1_TOKEN" $API_URL/users/export-data)
  
  if echo $response | grep -q "\"user\""; then
    print_success "Successfully exported user data"
    echo "Export contains user record: Yes"
    echo "Export contains matches: $(echo $response | grep -q "\"matches\"" && echo "Yes" || echo "No")"
    echo "Export contains friends: $(echo $response | grep -q "\"friends\"" && echo "Yes" || echo "No")"
    
    # Verify language is included in the export
    local exported_language=$(echo $response | parse_json "['user']['pref_lang']")
    echo "Exported language preference: $exported_language"
  else
    print_error "Failed to export user data"
    echo $response
  fi
}

# Test account deletion
test_delete_account() {
  print_message "Testing account deletion (user 2)..."
  
  local response=$(curl $CURL_OPTS -X DELETE -H "Authorization: Bearer $USER2_TOKEN" $API_URL/users/account)
  
  if echo $response | grep -q "success"; then
    print_success "Successfully deleted account"
    
    # Try to login to verify it's really deleted
    sleep 1
    local login_response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
      -d "{\"username\":\"$USER2_USERNAME\", \"password\":\"$USER2_PASSWORD\"}" \
      $API_URL/users/login)
    
    if echo $login_response | grep -q "error"; then
      print_success "Verified account deletion - cannot login"
    else
      print_warning "Account may not be fully deleted - login still works"
    fi
  else
    print_error "Failed to delete account"
    echo $response
  fi
}

# Test invalid language value
test_invalid_language() {
  print_message "Testing invalid language value..."
  
  local invalid_language="German" # Not in the allowed list
  
  local response=$(curl $CURL_OPTS -X PUT -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER1_TOKEN" \
    -d "{\"language\":\"$invalid_language\"}" \
    $API_URL/users/language)
  
  if echo $response | grep -q "error"; then
    print_success "Server correctly rejected invalid language"
    echo "Error message: $(echo $response | parse_json "['error']")"
  else
    print_error "Server accepted invalid language"
    echo $response
  fi
}

# Run tests
print_message "Starting User API tests..."
echo "============================================="

# First check database
check_database

# Clean up previous test users if they exist
cleanup_users
sleep 1

# Setup test users
register_users
sleep 2  # Added extra delay
login_users
sleep 1

# Test general user endpoints
test_is_logged_in
sleep 1
test_get_all_users
sleep 1
test_logged_in_user_data
sleep 1
test_get_user_by_id
sleep 1
test_get_user_by_username
sleep 1

# Test language-specific endpoints
test_get_language
sleep 1
test_update_language
sleep 1
test_invalid_language
sleep 1

# Test other user profile operations
test_update_profile
sleep 1
test_change_password
sleep 1

# Test statistics and data endpoints
test_get_stats
sleep 1
test_match_history
sleep 1
test_get_friends
sleep 1
test_export_data
sleep 1

# Test account deletion (last test since it invalidates user2)
test_delete_account

echo "============================================="
print_message "User API tests completed."