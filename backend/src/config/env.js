const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 10),
  db: {
    storage: process.env.DB_FILE || path.join(__dirname, '..', '..', 'database', 'app.db'),
    logging: process.env.DB_LOGGING === 'true'
  }
};

module.exports = env;
