import {
    Schema,
    model,
  } from "mongoose";
  
  const sessionSchema = new Schema(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
  
      token: {
        type: String,
        required: true,
      },
  
      userAgent: {
        type: String,
        default: "",
      },

      expiresAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
      collection: "sessions",
    },
  );
  
  sessionSchema.index(
    { token: 1 },
    { unique: true },
  );
  
  sessionSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 },
  );
  
  export class SessionModel {
    static readonly model =
      model("Session", sessionSchema);
  }