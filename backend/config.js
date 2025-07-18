	require('dotenv').config({ path: '../.env' });

  const config = {
	port: process.env.BACKEND_PORT || 3443,
	
	jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
	cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret',
	
	dbPath: process.env.DB_PATH || '/app/data/database.sqlite',
	
	corsOrigin: process.env.FRONTEND_URL || 'https://localhost:9000'
};

	
  module.exports = config;