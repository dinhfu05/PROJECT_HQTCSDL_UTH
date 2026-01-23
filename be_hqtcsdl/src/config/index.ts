import dotenv from "dotenv";

dotenv.config();

export const config = {
  app: {
    port: parseInt(process.env.PORT || "3002", 10),
    env: process.env.NODE_ENV || "development",
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307", 10),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_DATABASE || "hqtcsdl",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-root123-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || "0", 10),
    ttl: {
      default: parseInt(process.env.REDIS_TTL_DEFAULT || "60", 10),
      products: parseInt(process.env.REDIS_TTL_PRODUCTS || "300", 10),
    },
  },
};
