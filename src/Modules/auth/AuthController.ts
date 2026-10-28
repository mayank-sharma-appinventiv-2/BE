import type { RequestHandler } from "express";
import { AuthService } from "./AuthService.js";
import { AppError } from "../../utils/AppError.js";

export class AuthController {
  constructor(private service: AuthService) {}

  signup: RequestHandler = async (req, res) => {
    const { name, email, password } = req.body ?? {};
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      throw new AppError(400, "Name, email and password are required");
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      throw new AppError(400, "Name must have 2 to 50 characters");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new AppError(400, "A valid email is required");
    }
    if (Buffer.byteLength(password, "utf8") > 72) {
      throw new AppError(400, "Password must be at most 72 UTF-8 bytes");
    }
    if (password.length < 8) {
      throw new AppError(400, "Password must have at least 8 characters");
    }
    const user = await this.service.signup({ name, email, password });
    res.status(201).json({ success: true, data: user });
  };

  login: RequestHandler = async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      throw new AppError(400, "Email and password are required");
    }
    const result = await this.service.login(email, password, req.get("user-agent") ?? "");
    res.json({ success: true, data: result });
  };

  logout: RequestHandler = async (req, res) => {
    const result = await this.service.logout(req.auth!.token, req.user!.id);
    res.json({ success: true, data: result });
  };
}
