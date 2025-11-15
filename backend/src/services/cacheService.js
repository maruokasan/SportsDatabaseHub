const Redis = require("ioredis");
const { logger } = require("../utils/logger") || console;

/**
 * Redis-based caching service for application data
 * Handles connection management, key generation, and TTL-based operations
 */

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  /**
   * Initialize Redis connection
   */
  async init() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true, // Connect on first command
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        logger.info("Redis cache service connected");
      });

      this.client.on("error", (err) => {
        this.isConnected = false;
        logger.error("Redis cache service error:", err.message);
      });

      this.client.on("close", () => {
        this.isConnected = false;
        logger.warn("Redis cache service connection closed");
      });
    } catch (error) {
      logger.error("Failed to initialize Redis cache service:", error.message);
      this.isConnected = false;
    }
  }

  /**
   * Generate cache key from request parameters
   * @param {string} prefix - Cache key prefix (e.g., 'analytics', 'standings')
   * @param {Object} params - Request parameters
   * @returns {string} Generated cache key
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join("|");

    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null if not found
   */
  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = 300) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete cached value
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete multiple cached values by pattern
   * @param {string} pattern - Key pattern (e.g., 'analytics:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  async delByPattern(pattern) {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(
          `Deleted ${keys.length} cache keys matching pattern: ${pattern}`
        );
        return keys.length;
      }
      return 0;
    } catch (error) {
      logger.error(
        `Cache delete by pattern error for ${pattern}:`,
        error.message
      );
      return 0;
    }
  }

  /**
   * Clear all cached values
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushdb();
      logger.info("Cache cleared");
      return true;
    } catch (error) {
      logger.error("Cache clear error:", error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache stats
   */
  async getStats() {
    if (!this.isConnected || !this.client) {
      return { connected: false };
    }

    try {
      const info = await this.client.info();
      const dbSize = await this.client.dbsize();

      return {
        connected: true,
        dbSize,
        info: info.split("\n").reduce((acc, line) => {
          const [key, value] = line.split(":");
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error("Cache stats error:", error.message);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info("Redis cache service disconnected");
    }
  }

  /**
   * Check if cache is available
   * @returns {boolean} Connection status
   */
  isAvailable() {
    return this.isConnected;
  }
}

// Export singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
