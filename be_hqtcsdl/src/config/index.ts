import dotenv from "dotenv";

dotenv.config();

export const config = {
  app: {
    port: parseInt(process.env.PORT || "3002", 10),
    env: process.env.NODE_ENV || "development",
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "11082005",
    database: process.env.DB_DATABASE || "hqtcsdl",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-root123-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
};
