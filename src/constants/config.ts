import "dotenv/config";

export class Config {
  static readonly env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 3000),
    MONGODB_URI: process.env.MONGODB_URI || "",
    DB_NAME: process.env.DB_NAME || "",
  };
}