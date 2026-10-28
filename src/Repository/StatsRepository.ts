import { PostModel } from "../model/PostModel.js";

export class StatsRepository {
  async get() {
    const [result] = await PostModel.model.aggregate([
      { $match: { status: "published" } },
      { $facet: {
        total: [{ $count: "count" }],
        topTags: [
          { $unwind: "$tags" },
          { $group: { _id: "$tags", postCount: { $sum: 1 } } },
          { $sort: { postCount: -1, _id: 1 } },
          { $limit: 10 },
          { $project: { _id: 0, tag: "$_id", postCount: 1 } },
        ],
        topAuthors: [
          { $group: { _id: "$author", postCount: { $sum: 1 } } },
          { $sort: { postCount: -1, _id: 1 } },
          { $limit: 5 },
          { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
          { $unwind: "$user" },
          { $project: { _id: 0, userId: "$_id", name: "$user.name", postCount: 1 } },
        ],
        mostCommentedPosts: [
          { $sort: { commentCount: -1, createdAt: -1, _id: -1 } },
          { $limit: 5 },
          { $project: { title: 1, commentCount: 1 } },
        ],
      } },
      { $project: {
        _id: 0,
        totalPublishedPosts: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        topTags: 1,
        topAuthors: 1,
        mostCommentedPosts: 1,
      } },
    ]);
    return result;
  }
}
