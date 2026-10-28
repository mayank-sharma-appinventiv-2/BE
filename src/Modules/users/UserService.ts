import { UserRepository } from "../../Repository/UserRepository.js";
import { AppError } from "../../utils/AppError.js";

export class UserService {
  constructor(private readonly users: UserRepository) {}

  async getProfile(userId: string) {
    const user = await this.users.findPublicById(userId);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  async updateProfile(userId: string, name: string) {
    const user = await this.users.updateName(userId, name);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }
}
