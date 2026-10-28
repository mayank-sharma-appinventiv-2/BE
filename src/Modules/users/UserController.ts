import type { RequestHandler } from "express";
import { UserService } from "./UserService.js";
import { AppError } from "../../utils/AppError.js";

export class UserController {
  constructor(private service: UserService) {}

  getMe: RequestHandler = async (req, res) => {
    const user = await this.service.getProfile(req.user!.id);
    res.json({ success: true, data: user });
  };

  updateMe: RequestHandler = async (req, res) => {
    const { name } = req.body ?? {};
    if (typeof name !== "string" || !name.trim()) {
      throw new AppError(400, "Name is required");
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      throw new AppError(400, "Name must have 2 to 50 characters");
    }
    if (Object.keys(req.body).some(key => key !== "name")) {
      throw new AppError(400, "Only name can be updated");
    }
    const user = await this.service.updateProfile(req.user!.id, name.trim());
    res.json({ success: true, data: user });
  };
}
