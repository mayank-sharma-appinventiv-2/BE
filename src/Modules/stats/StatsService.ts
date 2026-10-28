import { StatsRepository } from "../../Repository/StatsRepository.js";
import { RedisProvider } from "../../providers/redis/RedisProvider.js";
import { RedisConstants } from "../../constants/redis.constants.js";

type StatsResult = { body: { success: boolean; data: unknown }; hit: boolean };

export class StatsService {
  private pending?: Promise<StatsResult>;

  constructor(private stats: StatsRepository) {}

  async get(): Promise<StatsResult> {
    const redis = RedisProvider.client;
    try {
      if (redis.status === "ready") {
        const cached = await redis.get(RedisConstants.statsKey);
        if (cached) return { body: JSON.parse(cached), hit: true };
      }
    } catch {
      console.error("Redis read failed; using MongoDB");
    }

    if (!this.pending) this.pending = this.load();
    try {
      return await this.pending;
    } finally {
      this.pending = undefined;
    }
  }

  private async load(): Promise<StatsResult> {
    const body = { success: true, data: await this.stats.get() };
    try {
      if (RedisProvider.client.status === "ready") {
        await RedisProvider.client.set(
          RedisConstants.statsKey, JSON.stringify(body), "EX", RedisConstants.statsTTL,
        );
      }
    } catch {
      console.error("Redis write failed; returning MongoDB result");
    }
    return { body, hit: false };
  }
}
