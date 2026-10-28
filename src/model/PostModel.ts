import { Schema, model } from "mongoose";

const postSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
  body: { type: String, required: true, trim: true, minlength: 20 },
  tags: {
    type: [{ type: String, trim: true, lowercase: true }],
    default: [],
    validate: { validator: (tags: string[]) => tags.length <= 5, message: "Maximum five tags allowed" },
  },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  authorName: { type: String, required: true },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  commentCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true, collection: "posts" });

postSchema.index({ tags: 1 });
postSchema.index({ status: 1, createdAt: -1 });

export class PostModel {
  static readonly model = model("Post", postSchema);
}
