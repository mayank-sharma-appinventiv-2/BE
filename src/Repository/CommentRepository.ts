import mongoose from "mongoose";
import { CommentModel } from "../model/CommentModel.js";
import { PostModel } from "../model/PostModel.js";
import { AppError } from "../utils/AppError.js";

type CommentPage = { data: unknown[]; count: { total: number }[] };

export class CommentRepository {
  async create(postId: string, userId: string, userName: string, text: string) {
    return mongoose.connection.transaction(async (session) => {
      const post = await PostModel.model.findOneAndUpdate(
        { _id: postId, status: "published" },
        { $inc: { commentCount: 1 } },
        { new: true, session },
      );
      if (!post) throw new AppError(404, "Published post not found");
      const [comment] = await CommentModel.model.create(
        [{ postId, userId, userName, text }], { session },
      );
      return comment!;
    });
  }

  async list(postId: string, page: number, limit: number) {
    const [result] = await CommentModel.model.aggregate<CommentPage>([
      { $match: { postId: new mongoose.Types.ObjectId(postId) } },
      { $facet: {
        data: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: { __v: 0 } },
        ],
        count: [{ $count: "total" }],
      } },
    ]);
    return { data: result?.data ?? [], total: result?.count[0]?.total ?? 0 };
  }

  async delete(id: string, userId: string) {
    return mongoose.connection.transaction(async (session) => {
      const comment = await CommentModel.model.findById(id).session(session);
      if (!comment) throw new AppError(404, "Comment not found");
      const post = await PostModel.model.findById(comment.postId).session(session);
      if (!post) throw new AppError(404, "Post not found");
      if (String(comment.userId) !== userId && String(post.author) !== userId) {
        throw new AppError(403, "You cannot delete this comment");
      }
      await CommentModel.model.deleteOne({ _id: id }, { session });
      await PostModel.model.updateOne(
        { _id: post._id }, { $inc: { commentCount: -1 } }, { session },
      );
    });
  }
}
