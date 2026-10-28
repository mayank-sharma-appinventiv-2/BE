import { Config } from "./config.js";

export class RedisConstants {
  static readonly statsKey = `${Config.env.DB_NAME}:stats`;
  static readonly statsTTL = 5 * 60;
}
