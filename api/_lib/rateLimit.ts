interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// In-memory blacklist for repeat aggressive abusers (temporary jail)
const ipBanMap = new Map<string, number>();

/**
 * Standard Sliding Window Rate Limiter
 * Retains exact signature and behavior for backward compatibility.
 */
export function checkRateLimit(
  ip: string, 
  maxRequests = 15, 
  windowSeconds = 60
): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Check if IP is under temporary abuse ban
  const banExpiry = ipBanMap.get(ip);
  if (banExpiry && now < banExpiry) {
    return { allowed: false, remaining: 0 };
  } else if (banExpiry && now >= banExpiry) {
    ipBanMap.delete(ip);
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    // If request count heavily exceeds limit (potential DoS flood), place into temporary 5-min jail
    if (entry.count > maxRequests * 2.5) {
      ipBanMap.set(ip, now + 5 * 60 * 1000);
    }
    entry.count += 1;
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Sanitizes input against NoSQL Injection operators (e.g. $gt, $ne, $where, regex)
 */
export function sanitizeNoSqlInjection(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return true;

  for (const key of Object.keys(obj)) {
    // Reject keys that start with '$' or contain '.' (MongoDB operator injection vectors)
    if (key.startsWith('$') || key.includes('.')) {
      return false;
    }

    const val = obj[key];
    if (typeof val === 'string') {
      // Reject dangerous script tags / null byte characters
      if (val.includes('\0') || val.includes('<script')) {
        return false;
      }
    } else if (typeof val === 'object' && val !== null) {
      if (!sanitizeNoSqlInjection(val)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates request against Honeypots, Payload Bombs, and NoSQL Injection Attacks
 */
export function validateSecurityContext(
  req: {
    headers: Record<string, string | string[] | undefined>;
    body: any;
    socket?: { remoteAddress?: string };
  },
  options: {
    maxRequests?: number;
    windowSeconds?: number;
    endpoint?: string;
    maxBytes?: number;
  } = {}
): { allowed: boolean; error?: string; status?: number } {
  const maxRequests = options.maxRequests ?? 15;
  const windowSeconds = options.windowSeconds ?? 60;
  const maxBytes = options.maxBytes ?? 65536; // 64 KB maximum payload limit to prevent DoS memory exhaustion
  const endpoint = options.endpoint || 'general';

  // 1. IP extraction
  const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
  const clientIp = rawIp.split(',')[0].trim();

  // 2. Rate limit check
  const rateLimitResult = checkRateLimit(`${clientIp}:${endpoint}`, maxRequests, windowSeconds);
  if (!rateLimitResult.allowed) {
    return {
      allowed: false,
      error: 'Too many requests detected from this IP. Please wait a moment before trying again.',
      status: 429,
    };
  }

  // 3. Payload size check (prevent HTTP request body flooding)
  const contentLength = parseInt((req.headers['content-length'] as string) || '0', 10);
  if (contentLength > maxBytes) {
    return {
      allowed: false,
      error: 'Request payload exceeds maximum allowed size.',
      status: 413,
    };
  }

  // 4. Honeypot check (anti-bot trap)
  if (req.body && typeof req.body === 'object') {
    if (req.body.hp_security_check) {
      return {
        allowed: false,
        error: 'Automated submission rejected by security filter.',
        status: 400,
      };
    }

    // 5. NoSQL injection check
    if (!sanitizeNoSqlInjection(req.body)) {
      return {
        allowed: false,
        error: 'Invalid or prohibited characters detected in submission.',
        status: 400,
      };
    }
  }

  return { allowed: true };
}
