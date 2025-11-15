const env = require("./config/env");
const { sequelize } = require("./models");
const seedUsers = require("./seeders/seedUsers");
const seedSampleData = require("./seeders/seedSampleData");
const runSchemaUpgrades = require("./utils/schemaUpgrades");
const app = require("./app");

/**
 * Validates critical environment variables and configuration before server startup
 */
const validateStartupConfig = () => {
  const isProduction = env.nodeEnv === "production";
  const errors = [];
  const warnings = [];

  // Check for missing JWT_SECRET
  if (!process.env.JWT_SECRET) {
    const message = "JWT_SECRET environment variable is not set";
    if (isProduction) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  // Check for insecure JWT_SECRET default value
  if (env.jwtSecret === "dev-secret-key") {
    const message =
      'JWT_SECRET is using insecure default value "dev-secret-key"';
    if (isProduction) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  // Check JWT_SECRET strength (minimum 32 characters for production)
  if (isProduction && env.jwtSecret && env.jwtSecret.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters long in production");
  }

  // Check for missing PORT
  if (!process.env.PORT) {
    const message = "PORT environment variable is not set";
    if (isProduction) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  // Log warnings for development
  if (!isProduction && warnings.length > 0) {
    console.warn("⚠️  Configuration warnings:");
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
    console.warn(
      "   Server will start but consider fixing these issues for security."
    );
  }

  // Throw error for production issues
  if (isProduction && errors.length > 0) {
    console.error("❌ Critical configuration errors in production:");
    errors.forEach((error) => console.error(`   - ${error}`));
    throw new Error(
      "Server startup blocked due to insecure or missing configuration. Please fix the above issues before deploying to production."
    );
  }
};

const start = async () => {
  try {
    // Validate configuration before starting server
    validateStartupConfig();

    await sequelize.authenticate();
    await sequelize.sync();

    const shouldRunSeeding =
      env.nodeEnv === "development" || process.env.RUN_SEEDING === "true";

    if (shouldRunSeeding) {
      console.log("Running database seeding...");
      await runSchemaUpgrades();
      await seedUsers();
      await seedSampleData();
    } else {
      console.log(
        "Skipping database seeding (not in development mode and RUN_SEEDING not set to true)"
      );
    }

    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start API", err);
    process.exit(1);
  }
};

start();
