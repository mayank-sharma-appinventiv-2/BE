import { AppError } from "../utils/AppError.js";
import { UserModel } from "../model/userModal.js";

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

export class UserRepository {
  async create(input: CreateUserInput) {
    await UserModel.model.init();
    try {
      return await UserModel.model.create(input);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        throw new AppError(409, "Email already registered");
      }
      throw error;
    }
  }

  findByEmailForLogin(email: string) {
    return UserModel.model.findOne({ email }).select("+password");
  }

  findPublicById(id: string) {
    return UserModel.model.findById(id).select("-password -__v").lean();
  }

  updateName(id: string, name: string) {
    return UserModel.model.findByIdAndUpdate(
      id,
      { $set: { name } },
      { new: true, runValidators: true },
    ).select("-password -__v").lean();
  }
}
