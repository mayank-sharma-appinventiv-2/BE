import type { RequestHandler } from "express";
import { StatsService } from "./StatsService.js";

export class StatsController {
  constructor(private service: StatsService) {}

  get: RequestHandler = async (_req, res) => {
    res.json({ success: true, data: await this.service.get() });
  };
}
