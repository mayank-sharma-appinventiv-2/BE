import { Schema, model } from "mongoose";

const commentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
}, { timestamps: true, collection: "comments" });

commentSchema.index({ postId: 1, createdAt: -1 });

export class CommentModel {
  static readonly model = model("Comment", commentSchema);
}
