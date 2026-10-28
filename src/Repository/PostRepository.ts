import mongoose, { type PipelineStage } from "mongoose";
import { PostModel } from "../model/PostModel.js";
import { CommentModel } from "../model/CommentModel.js";
import { AppError } from "../utils/AppError.js";

export type PostInput = {
  title: string;
  body: string;
  tags: string[];
  status: "draft" | "published";
};

export type PostQuery = {
  page: number;
  limit: number;
  search: string;
  tag: string;
  sort: "newest" | "oldest" | "mostCommented";
};

type PostPage = { data: unknown[]; count: { total: number }[] };

export class PostRepository {
  create(input: PostInput, author: string, authorName: string) {
    return PostModel.model.create({ ...input, author, authorName });
  }

  findById(id: string) {
    return PostModel.model.findById(id).select("-__v").lean();
  }

  findPublished(id: string) {
    return PostModel.model.findOne({ _id: id, status: "published" }).select("-__v").lean();
  }

  update(id: string, author: string, input: PostInput) {
    return PostModel.model.findOneAndUpdate(
      { _id: id, author }, { $set: input }, { new: true, runValidators: true },
    ).select("-__v").lean();
  }

  findOwn(author: string) {
    return PostModel.model.find({ author }).select("-__v").sort({ createdAt: -1, _id: -1 }).lean();
  }

  async delete(id: string, author: string) {
    return mongoose.connection.transaction(async (session) => {
      const post = await PostModel.model.findOneAndDelete({ _id: id, author }, { session });
      if (!post) throw new AppError(404, "Post not found");
      await CommentModel.model.deleteMany({ postId: id }, { session });
    });
  }

  async list(query: PostQuery) {
    const match: Record<string, unknown> = { status: "published" };
    if (query.search) {
      match.title = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }
    if (query.tag) match.tags = query.tag;
    const sort: Record<string, 1 | -1> = query.sort === "oldest"
      ? { createdAt: 1, _id: 1 }
      : query.sort === "mostCommented"
        ? { commentCount: -1, createdAt: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $facet: {
        data: [
          { $sort: sort },
          { $skip: (query.page - 1) * query.limit },
          { $limit: query.limit },
          { $project: { body: 0, __v: 0 } },
        ],
        count: [{ $count: "total" }],
      } },
    ];
    const [result] = await PostModel.model.aggregate<PostPage>(pipeline);
    return { data: result?.data ?? [], total: result?.count[0]?.total ?? 0 };
  }
}
