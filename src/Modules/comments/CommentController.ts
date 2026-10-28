import type { RequestHandler } from "express";
import { CommentService } from "./CommentService.js";
import { Pagination } from "../../utils/Pagination.js";

export class CommentController {
  constructor(private service: CommentService) {}

  create: RequestHandler = async (req, res) => {
    const comment = await this.service.create(
      String(req.params.id), req.user!.id, req.user!.name, req.body?.text,
    );
    res.status(201).json({ success: true, data: comment });
  };

  list: RequestHandler = async (req, res) => {
    const { page, limit } = Pagination.read(req.query);
    const result = await this.service.list(String(req.params.id), page, limit);
    res.json(Pagination.response(result.data, result.total, page, limit));
  };

  delete: RequestHandler = async (req, res) => {
    const result = await this.service.delete(String(req.params.id), req.user!.id);
    res.json({ success: true, data: result });
  };
}
