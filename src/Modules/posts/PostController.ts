import type { RequestHandler } from "express";
import { PostService } from "./PostService.js";
import { Pagination } from "../../utils/Pagination.js";
import { AppError } from "../../utils/AppError.js";

export class PostController {
  constructor(private service: PostService) {}

  create: RequestHandler = async (req, res) => {
    const post = await this.service.create(req.body, req.user!.id, req.user!.name);
    res.status(201).json({ success: true, data: post });
  };

  getOne: RequestHandler = async (req, res) => {
    const post = await this.service.getOne(String(req.params.id));
    res.json({ success: true, data: post });
  };

  update: RequestHandler = async (req, res) => {
    const post = await this.service.update(String(req.params.id), req.user!.id, req.body);
    res.json({ success: true, data: post });
  };

  delete: RequestHandler = async (req, res) => {
    const result = await this.service.delete(String(req.params.id), req.user!.id);
    res.json({ success: true, data: result });
  };

  getMine: RequestHandler = async (req, res) => {
    res.json({ success: true, data: await this.service.getMine(req.user!.id) });
  };

  list: RequestHandler = async (req, res) => {
    const { page, limit } = Pagination.read(req.query);
    const search = req.query.search ?? "";
    const tag = req.query.tag ?? "";
    const sort = req.query.sort ?? "newest";
    if (typeof search !== "string" || typeof tag !== "string" ||
        (sort !== "newest" && sort !== "oldest" && sort !== "mostCommented")) {
      throw new AppError(400, "Invalid search, tag or sort");
    }
    const result = await this.service.list({
      page, limit, search: search.trim(), tag: tag.trim().toLowerCase(), sort,
    });
    res.json(Pagination.response(result.data, result.total, page, limit));
  };
}
