// In-memory rate limiter for API requests
// Tracks requests per user per hour

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  check(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(userId);

    // No entry or expired entry
    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.limits.set(userId, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    this.limits.set(userId, entry);
    return { allowed: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  private cleanup() {
    const now = Date.now();
    for (const [userId, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(userId);
      }
    }
  }

  reset(userId: string) {
    this.limits.delete(userId);
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter(100, 60 * 60 * 1000); // 100 requests per hour
