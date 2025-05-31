#!/bin/bash
# filepath: /home/lauri/projects/wknd/backend/tests/test_rate_limits.sh

set -e  # Exit on error

API_URL="https://localhost:3443/api"
CURL_OPTS="-s -k"

# Color outputs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test credentials
USERNAME="ratelimituser"
PASSWORD="Password123"
TOKEN=""

# Helper functions
print_message() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Set up test user
setup_user() {
  print_message "Creating test user..."
  curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\", \"password\":\"$PASSWORD\"}" \
    $API_URL/users/register > /dev/null

  print_message "Logging in..."
  TOKEN=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\", \"password\":\"$PASSWORD\"}" \
    $API_URL/users/login | grep -o '"token":"[^"]*' | sed 's/"token":"//')
}

# Test endpoint rate limit
test_endpoint() {
  local endpoint=$1
  local method=${2:-GET}
  local data=${3:-"{}"}
  local requests=${4:-110}
  local expected_fail=${5:-100}
  
  print_message "Testing rate limit on $method $endpoint..."
  print_message "Making $requests requests, expecting to hit limit after $expected_fail"
  
  local success_count=0
  local fail_count=0
  
  for ((i=1; i<=$requests; i++)); do
    local response=""
    
    if [ "$method" == "GET" ]; then
      response=$(curl $CURL_OPTS -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL$endpoint")
    else
      response=$(curl $CURL_OPTS -w "%{http_code}" -o /dev/null \
        -X $method \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$data" \
        "$API_URL$endpoint")
    fi
    
    if [ "$response" == "200" ] || [ "$response" == "201" ]; then
      success_count=$((success_count + 1))
    elif [ "$response" == "429" ]; then
      fail_count=$((fail_count + 1))
      # Print first failure
      if [ $fail_count -eq 1 ]; then
        print_message "Rate limit reached after $success_count requests!"
      fi
    else
      print_error "Unexpected response code: $response"
    fi
  done
  
  print_message "Results: $success_count successful, $fail_count rate limited"
  
  if [ $fail_count -gt 0 ] && [ $success_count -le $expected_fail ]; then
    print_success "Rate limiting is working correctly!"
  elif [ $fail_count -eq 0 ]; then
    print_error "Rate limiting didn't trigger after $requests requests"
  else
    print_message "Rate limiting triggered but allowed more requests than expected"
  fi
}

# Clean up
cleanup() {
  print_message "Cleaning up test user..."
  if [ ! -z "$TOKEN" ]; then
    curl $CURL_OPTS -X DELETE -H "Authorization: Bearer $TOKEN" \
      $API_URL/users/account > /dev/null
  fi
}

# Run tests
print_message "Starting rate limit testing..."

setup_user

# Test general endpoint
test_endpoint "/users/stats"

# Test login endpoint (should have stricter limits)
print_message "Testing stricter limits on login..."
for ((i=1; i<=15; i++)); do
  response=$(curl $CURL_OPTS -w "%{http_code}" -o /dev/null \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\", \"password\":\"wrong-password\"}" \
    "$API_URL/users/login")
  
  if [ "$response" == "429" ]; then
    print_success "Login rate limiting triggered after $i attempts!"
    break
  fi
  
  if [ $i -eq 15 ] && [ "$response" != "429" ]; then
    print_error "Login rate limiting not triggered after 15 attempts"
  fi
done

cleanup

print_message "Rate limit testing completed."