import { PostRepository, type PostInput, type PostQuery } from "../../Repository/PostRepository.js";
import { AppError } from "../../utils/AppError.js";

export class PostService {
  constructor(private posts: PostRepository) {}

  async create(input: unknown, author: string, authorName: string) {
    return this.posts.create(this.validate(input), author, authorName);
  }

  async getOne(id: string) {
    const post = await this.posts.findPublished(id);
    if (!post) throw new AppError(404, "Published post not found");
    return post;
  }

  async update(id: string, author: string, input: unknown) {
    const post = await this.posts.findById(id);
    if (!post) throw new AppError(404, "Post not found");
    if (String(post.author) !== author) throw new AppError(403, "You cannot update this post");
    const data = this.validate(input, {
      title: post.title, body: post.body, tags: post.tags, status: post.status!,
    });
    const updated = await this.posts.update(id, author, data);
    if (!updated) throw new AppError(404, "Post not found");
    return updated;
  }

  async delete(id: string, author: string) {
    const post = await this.posts.findById(id);
    if (!post) throw new AppError(404, "Post not found");
    if (String(post.author) !== author) throw new AppError(403, "You cannot delete this post");
    await this.posts.delete(id, author);
    return { message: "Post and its comments deleted successfully" };
  }

  getMine(author: string) {
    return this.posts.findOwn(author);
  }

  list(query: PostQuery) {
    return this.posts.list(query);
  }

  private validate(input: unknown, existing?: PostInput): PostInput {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new AppError(400, "Post details are required");
    }
    const fields = input as Record<string, unknown>;
    const title = fields.title === undefined ? existing?.title : fields.title;
    const body = fields.body === undefined ? existing?.body : fields.body;
    const tags = fields.tags === undefined ? existing?.tags ?? [] : fields.tags;
    const status = fields.status === undefined ? existing?.status ?? "draft" : fields.status;
    if (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 120) {
      throw new AppError(400, "Title must have 5 to 120 characters");
    }
    if (typeof body !== "string" || body.trim().length < 20) {
      throw new AppError(400, "Body must have at least 20 characters");
    }
    if (!Array.isArray(tags) || tags.length > 5 || tags.some(tag => typeof tag !== "string" || !tag.trim())) {
      throw new AppError(400, "Provide up to five non-empty tags");
    }
    if (status !== "draft" && status !== "published") {
      throw new AppError(400, "Status must be draft or published");
    }
    return {
      title: title.trim(), body: body.trim(),
      tags: [...new Set((tags as string[]).map(tag => tag.trim().toLowerCase()))], status,
    };
  }
}
