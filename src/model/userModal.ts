import {
    Schema,
    model,
  } from "mongoose";
  
  const userSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
      },
  
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
  
      password: {
        type: String,
        required: true,
        select: false,
      },
    },
    {
      timestamps: true,
      collection: "users",
    },
  );
  
  userSchema.index(
    { email: 1 },
    { unique: true },
  );
  
  export class UserModel {
    static readonly model =
      model("User", userSchema);
  }