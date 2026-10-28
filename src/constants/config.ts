import "dotenv/config";

export class Config {
  static readonly env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 3000),
    MONGODB_URI: process.env.MONGODB_URI || "",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    DB_NAME: process.env.DB_NAME || "",
  };
}