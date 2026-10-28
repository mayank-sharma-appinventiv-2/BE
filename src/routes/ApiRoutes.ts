import { Router } from "express";
import { AuthController } from "../Modules/auth/AuthController.js";
import { AuthService } from "../Modules/auth/AuthService.js";
import { UserController } from "../Modules/users/UserController.js";
import { UserService } from "../Modules/users/UserService.js";
import { AuthMiddleware } from "../middlewares/AuthMiddleware.js";
import { UserRepository } from "../Repository/UserRepository.js";
import { SessionRepository } from "../Repository/SessionRepository.js";

import { PostRepository } from "../Repository/PostRepository.js";
import { CommentRepository } from "../Repository/CommentRepository.js";
import { StatsRepository } from "../Repository/StatsRepository.js";
import { PostService } from "../Modules/posts/PostService.js";
import { PostController } from "../Modules/posts/PostController.js";
import { CommentService } from "../Modules/comments/CommentService.js";
import { CommentController } from "../Modules/comments/CommentController.js";
import { StatsService } from "../Modules/stats/StatsService.js";
import { StatsController } from "../Modules/stats/StatsController.js";
import { AppError } from "../utils/AppError.js";

export class ApiRoutes {
  readonly router = Router();

  constructor() {
    const users = new UserRepository();
    const sessions = new SessionRepository();
    const authService = new AuthService(users, sessions);
    const auth = new AuthController(authService);
    const profile = new UserController(new UserService(users));
    const authMiddleware = new AuthMiddleware(authService);

    const posts = new PostRepository();
    const post = new PostController(new PostService(posts));
    const comment = new CommentController(new CommentService(new CommentRepository(), posts));
    const stats = new StatsController(new StatsService(new StatsRepository()));

    this.router.param("id", (_req, _res, next, id: string) => {
      if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        next(new AppError(400, "Invalid ObjectId"));
        return;
      }
      next();
    });

    this.router.get("/health", (_req, res) => {
      res.json({ status: "ok" });
    });
    this.router.post("/auth/signup", auth.signup);
    this.router.post("/auth/login", auth.login);
    this.router.post("/auth/logout", authMiddleware.handle, auth.logout);
    this.router.get("/users/me", authMiddleware.handle, profile.getMe);
    this.router.patch("/users/me", authMiddleware.handle, profile.updateMe);
    this.router.get("/users/me/posts", authMiddleware.handle, post.getMine);

    this.router.post("/posts", authMiddleware.handle, post.create);
    this.router.get("/posts", post.list);
    this.router.get("/posts/:id", post.getOne);
    this.router.patch("/posts/:id", authMiddleware.handle, post.update);
    this.router.delete("/posts/:id", authMiddleware.handle, post.delete);

    this.router.post("/posts/:id/comments", authMiddleware.handle, comment.create);
    this.router.get("/posts/:id/comments", comment.list);
    this.router.delete("/comments/:id", authMiddleware.handle, comment.delete);

    this.router.get("/stats", stats.get);
    this.router.use((_req, _res, next) => {
      next(new AppError(404, "Route not found"));
    });
  }
}
