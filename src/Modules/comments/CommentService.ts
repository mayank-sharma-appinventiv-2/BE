import { CommentRepository } from "../../Repository/CommentRepository.js";
import { PostRepository } from "../../Repository/PostRepository.js";
import { AppError } from "../../utils/AppError.js";

export class CommentService {
  constructor(private comments: CommentRepository, private posts: PostRepository) {}

  create(postId: string, userId: string, userName: string, text: unknown) {
    if (typeof text !== "string" || !text.trim() || text.trim().length > 500) {
      throw new AppError(400, "Comment must have 1 to 500 characters");
    }
    return this.comments.create(postId, userId, userName, text.trim());
  }

  async list(postId: string, page: number, limit: number) {
    const post = await this.posts.findPublished(postId);
    if (!post) throw new AppError(404, "Published post not found");
    return this.comments.list(postId, page, limit);
  }

  async delete(id: string, userId: string) {
    await this.comments.delete(id, userId);
    return { message: "Comment deleted successfully" };
  }
}
