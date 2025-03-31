// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config({ path: '../.env' });
  }
  
  // Default config with environment variable fallbacks
  const config = {
	port: process.env.BACKEND_PORT || 3000,
	nodeEnv: process.env.NODE_ENV || 'development',
	
	jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
	cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret',
	
	dbPath: process.env.DB_PATH || '/app/data/database.sqlite',
	
	corsOrigin: process.env.REACT_APP_API_URL || 'http://localhost:9000'
  };
  
  module.exports = config;