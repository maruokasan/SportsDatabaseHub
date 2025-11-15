const crypto = require("crypto");

/**
 * Cache middleware for HTTP caching with ETags and Cache-Control headers
 * Implements conditional requests and tiered caching based on endpoint volatility
 */

// Volatility tiers with TTL values (in seconds)
const CACHE_TIERS = {
  HIGH_VOLATILITY: 300, // 5 minutes - frequently changing data
  MEDIUM_VOLATILITY: 900, // 15 minutes - moderately changing data
  LOW_VOLATILITY: 3600, // 1 hour - rarely changing data
};

/**
 * Generate ETag from response body using SHA-1 hash
 * @param {string|Buffer} body - Response body content
 * @returns {string} ETag value
 */
function generateETag(body) {
  const hash = crypto.createHash("sha1");
  hash.update(typeof body === "string" ? body : JSON.stringify(body));
  return `"${hash.digest("hex")}"`;
}

/**
 * Determine cache tier based on endpoint path
 * @param {string} path - Request path
 * @returns {number} TTL in seconds
 */
function getCacheTier(path) {
  // High volatility endpoints (frequent updates)
  if (path.includes("/matches") && path.includes("/live")) {
    return CACHE_TIERS.HIGH_VOLATILITY;
  }

  // Medium volatility endpoints (moderate updates)
  if (path.includes("/standings") || path.includes("/leaderboards")) {
    return CACHE_TIERS.MEDIUM_VOLATILITY;
  }

  // Low volatility endpoints (rare updates)
  if (
    path.includes("/analytics") ||
    path.includes("/seasonal") ||
    path.includes("/nationality") ||
    path.includes("/career") ||
    path.includes("/consistency")
  ) {
    return CACHE_TIERS.LOW_VOLATILITY;
  }

  // Default to medium volatility for unknown endpoints
  return CACHE_TIERS.MEDIUM_VOLATILITY;
}

/**
 * Cache middleware factory
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableETag - Enable ETag generation (default: true)
 * @param {boolean} options.enableConditional - Enable conditional requests (default: true)
 * @param {number} options.customTTL - Override TTL in seconds
 * @returns {Function} Express middleware function
 */
function cacheMiddleware(options = {}) {
  const { enableETag = true, enableConditional = true, customTTL } = options;

  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to intercept response
    res.json = function (body) {
      const responseBody = body;

      // Generate ETag if enabled
      if (enableETag) {
        const etag = generateETag(responseBody);
        res.set("ETag", etag);

        // Handle conditional requests
        if (enableConditional && req.headers["if-none-match"] === etag) {
          res.status(304).end();
          return res;
        }
      }

      // Set Cache-Control header
      const ttl = customTTL || getCacheTier(req.path);
      res.set("Cache-Control", `public, max-age=${ttl}`);

      // Call original json method
      return originalJson.call(this, responseBody);
    };

    next();
  };
}

module.exports = {
  cacheMiddleware,
  CACHE_TIERS,
  generateETag,
  getCacheTier,
};
