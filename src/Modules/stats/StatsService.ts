import { StatsRepository } from "../../Repository/StatsRepository.js";

export class StatsService {
  constructor(private stats: StatsRepository) {}

  get() {
    return this.stats.get();
  }
}
