/**
 * Simple in-memory rate limiting middleware
 * Limits: 3 requests per 10 seconds, 5 per 30 minutes, 15 per 1 minute
 */

type RateLimitWindow = {
  count: number;
  resetAt: number;
  ruleKey: string; // Unique identifier for the rule
};

type RateLimitRule = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

const RATE_LIMIT_RULES: RateLimitRule[] = [
  { key: "1min", maxRequests: 15, windowMs: 60 * 1000 },           // 15 per 1 minute
  { key: "10sec", maxRequests: 3, windowMs: 10 * 1000 },            // 3 per 10 seconds
  { key: "30min", maxRequests: 5, windowMs: 30 * 60 * 1000 },      // 5 per 30 minutes
];

// In-memory store: IP -> Map<ruleKey, window>
const rateLimitStore = new Map<string, Map<string, RateLimitWindow>>();

function getClientId(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map(s => s.trim());
    return ips[0] || "unknown";
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  
  // Fallback to a default identifier (for development)
  return "default";
}

function cleanupExpiredWindows(clientId: string) {
  const windows = rateLimitStore.get(clientId);
  if (!windows) return;
  
  const now = Date.now();
  for (const [ruleKey, window] of windows.entries()) {
    if (window.resetAt <= now) {
      windows.delete(ruleKey);
    }
  }
  
  if (windows.size === 0) {
    rateLimitStore.delete(clientId);
  }
}

export function checkRateLimit(request: Request): { allowed: boolean; retryAfter?: number } {
  const clientId = getClientId(request);
  const now = Date.now();
  
  // Cleanup expired windows for this client
  cleanupExpiredWindows(clientId);
  
  let windows = rateLimitStore.get(clientId);
  if (!windows) {
    windows = new Map();
    rateLimitStore.set(clientId, windows);
  }
  
  // Check each rate limit rule BEFORE incrementing
  for (const rule of RATE_LIMIT_RULES) {
    let window = windows.get(rule.key);
    
    if (!window) {
      // Create new window
      window = { count: 0, resetAt: now + rule.windowMs, ruleKey: rule.key };
      windows.set(rule.key, window);
    } else if (window.resetAt <= now) {
      // Window expired, reset it
      window = { count: 0, resetAt: now + rule.windowMs, ruleKey: rule.key };
      windows.set(rule.key, window);
    }
    
    // Check if limit exceeded (before incrementing)
    if (window.count >= rule.maxRequests) {
      const retryAfter = Math.ceil((window.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }
  }
  
  // All checks passed, now increment all windows
  for (const rule of RATE_LIMIT_RULES) {
    const window = windows.get(rule.key)!;
    window.count++;
  }
  
  return { allowed: true };
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [clientId, windows] of rateLimitStore.entries()) {
      for (const [ruleKey, window] of windows.entries()) {
        if (window.resetAt <= now) {
          windows.delete(ruleKey);
        }
      }
      if (windows.size === 0) {
        rateLimitStore.delete(clientId);
      }
    }
  }, 5 * 60 * 1000);
}

