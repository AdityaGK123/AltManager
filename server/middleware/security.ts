import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// HTTPS enforcement middleware
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  // Skip HTTPS enforcement in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if request is secure
  if (!req.secure && req.get('X-Forwarded-Proto') !== 'https') {
    // Redirect to HTTPS
    return res.redirect(301, `https://${req.get('Host')}${req.url}`);
  }

  next();
};

// Generate nonce for CSP
const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('base64');
};

// Content Security Policy (CSP) middleware
export const contentSecurityPolicy = (req: Request, res: Response, next: NextFunction): void => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const nonce = generateNonce();
  
  // Store nonce for use in templates if needed
  res.locals.nonce = nonce;
  
  let scriptSrc = "script-src 'self'";
  let styleSrc = "style-src 'self'";
  
  if (isDevelopment) {
    // Allow unsafe-inline and unsafe-eval only in development for HMR
    scriptSrc += " 'unsafe-inline' 'unsafe-eval'";
    styleSrc += " 'unsafe-inline'";
  } else {
    // Production: use nonces and specific domains only
    scriptSrc += ` 'nonce-${nonce}'`;
    styleSrc += " 'unsafe-inline'"; // Temporarily allow for Google Fonts, remove when possible
  }
  
  // Add trusted domains
  scriptSrc += " https://www.googletagmanager.com https://www.google-analytics.com";
  styleSrc += " https://fonts.googleapis.com";
  
  const cspDirectives = [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://www.google-analytics.com",
    "media-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ];
  
  // Only add upgrade-insecure-requests in production
  if (!isDevelopment) {
    cspDirectives.push("upgrade-insecure-requests");
  }

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  next();
};

// Comprehensive security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // HSTS (HTTP Strict Transport Security) - Force HTTPS for 1 year
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // X-Frame-Options - Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options - Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection - Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy - Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy - Control browser features
  res.setHeader('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', '));

  // Remove X-Powered-By header to hide server information
  res.removeHeader('X-Powered-By');

  // Cross-Origin policies - conditionally applied to avoid breaking third-party scripts
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (!isDevelopment) {
    // Only apply in production and allow for third-party integrations
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // Skip COOP and COEP to prevent breaking Google Analytics and other third-party scripts
  }

  next();
};

// Input validation middleware - validates instead of mutating
export const inputValidation = (req: Request, res: Response, next: NextFunction): void => {
  // Validate common injection patterns without mutating the request
  const validateString = (str: string): boolean => {
    // Check for common XSS patterns
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(str));
  };
  
  // Validate query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        if (!validateString(req.query[key] as string)) {
          res.status(400).json({ error: 'Invalid input detected' });
          return;
        }
      }
    }
  }
  
  // Validate URL parameters
  if (req.params) {
    for (const key in req.params) {
      if (!validateString(req.params[key])) {
        res.status(400).json({ error: 'Invalid input detected' });
        return;
      }
    }
  }
  
  next();
};

// Global rate limiter for API endpoints
const globalRateLimit = new Map<string, { count: number; resetTime: number }>();

export const apiRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip || 'unknown'}-global`;
    const now = Date.now();
    
    const attempts = globalRateLimit.get(key);
    
    if (!attempts || now > attempts.resetTime) {
      // First request or window expired
      globalRateLimit.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (attempts.count >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetTime: new Date(attempts.resetTime).toISOString(),
      });
      return;
    }
    
    // Increment count
    attempts.count++;
    globalRateLimit.set(key, attempts);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - attempts.count));
    res.setHeader('X-RateLimit-Reset', new Date(attempts.resetTime).toISOString());
    
    next();
  };
};

// Enhanced file upload security middleware
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction): void => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = req.get('content-length');
  const contentType = req.get('content-type');
  
  // Check content length
  if (contentLength && parseInt(contentLength) > maxSize) {
    res.status(413).json({ 
      error: 'Request too large',
      maxSize: '10MB'
    });
    return;
  }
  
  // Validate content type for file uploads
  if (req.path.includes('/upload') || req.path.includes('/file')) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json'
    ];
    
    if (contentType && !allowedMimeTypes.some(type => contentType.includes(type))) {
      res.status(415).json({ 
        error: 'Unsupported media type',
        allowed: allowedMimeTypes
      });
      return;
    }
  }
  
  // Check for suspicious file patterns in multipart uploads
  if (contentType?.includes('multipart/form-data')) {
    // Basic validation - more comprehensive validation should be done at upload time
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const userAgent = req.get('user-agent') || '';
    
    // Block requests with suspicious user agents
    if (userAgent.length > 512 || /[<>"']/g.test(userAgent)) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
  }
  
  next();
};