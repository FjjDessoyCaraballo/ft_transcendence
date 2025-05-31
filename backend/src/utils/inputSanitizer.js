function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '' };
  }

  // Check for common SQL injection patterns
  const sqlInjectionPatterns = [
    /'/g,                   // Single quotes
    /--/g,                  // SQL comment
    /;/g,                   // SQL statement separator
    /\/\*/g,                // Block comment start
    /\*\//g,                // Block comment end
    /xp_/g,                 // SQL Server stored procedures
    /UNION/gi,              // SQL UNION operator
    /SELECT/gi,             // SQL SELECT statement
    /DROP/gi,               // SQL DROP statement
    /INSERT/gi,             // SQL INSERT statement
    /UPDATE/gi,             // SQL UPDATE statement
    /DELETE/gi,             // SQL DELETE statement
    /ALTER/gi,              // SQL ALTER statement
    /CREATE/gi,             // SQL CREATE statement
    /EXEC/gi,               // SQL EXEC statement
    /DECLARE/gi,            // SQL DECLARE statement
  ];

  // Check if the input contains SQL injection patterns
  const hasSqlInjection = sqlInjectionPatterns.some(pattern => pattern.test(input));
  
  if (hasSqlInjection) {
    return { isValid: false, sanitized: '' };
  }

  // Additional sanitization - replace potentially dangerous characters
  const sanitized = input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');

  return { isValid: true, sanitized };
}

function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { isValid: false, message: 'Username is required' };
  }
  
  // Length check
  if (username.length < 3 || username.length > 20) {
    return { isValid: false, message: 'Username must be between 3 and 20 characters' };
  }
  
  // Check for SQL injection patterns
  const result = sanitizeInput(username);
  if (!result.isValid) {
    return { isValid: false, message: 'Username contains invalid characters' };
  }
  
  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<img/i,
    /<svg/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /<video/i,
    /<audio/i,
    /<link/i,
    /alert\(/i,
    /prompt\(/i,
    /confirm\(/i,
    /eval\(/i,
    /document\./i,
    /\.(get|set|remove)Item/i,
  ];
  
  const hasXssPattern = xssPatterns.some(pattern => pattern.test(username));
  if (hasXssPattern) {
    return { isValid: false, message: 'Username contains invalid characters' };
  }
  
  // Allow only alphanumeric, underscore, hyphen, and period
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return { isValid: false, message: 'Username may only contain letters, numbers, underscore, hyphen, and period' };
  }
  
  return { isValid: true, sanitized: result.sanitized };
}

function escapeHtml(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {
  sanitizeInput,
  validateUsername,
  escapeHtml
};