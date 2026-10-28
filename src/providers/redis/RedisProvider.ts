import { Redis } from "ioredis";
import { Config } from "../../constants/config.js";

export class RedisProvider {
  static readonly client = new Redis(Config.env.REDIS_URL, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    commandTimeout: 2000,
  });

  static async connect(): Promise<void> {
    this.client.on("error", () => console.error("Redis connection error"));
    await this.client.connect();
    await this.client.ping();
    console.log("Redis connected");
  }
}
