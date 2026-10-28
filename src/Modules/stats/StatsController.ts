import type { RequestHandler } from "express";
import { StatsService } from "./StatsService.js";

export class StatsController {
  constructor(private service: StatsService) {}

  get: RequestHandler = async (_req, res) => {
    const result = await this.service.get();
    res.setHeader("X-Cache", result.hit ? "HIT" : "MISS");
    res.json(result.body);
  };
}
