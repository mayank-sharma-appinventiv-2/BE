import type { RequestHandler } from "express";
import { AuthService } from "../Modules/auth/AuthService.js";
import { AppError } from "../utils/AppError.js";

export class AuthMiddleware {
  constructor(private service: AuthService) {}

  handle: RequestHandler = async (req, _res, next) => {
    const authorization = req.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : undefined;
    if (!token) throw new AppError(401, "Authentication required");

    const user = await this.service.authenticate(token);
    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
    };
    req.auth = { token };
    next();
  };
}
