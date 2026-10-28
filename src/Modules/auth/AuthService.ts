import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { UserRepository } from "../../Repository/UserRepository.js";
import { SessionRepository } from "../../Repository/SessionRepository.js";
import { AppError } from "../../utils/AppError.js";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export class AuthService {
  constructor(
    private users: UserRepository,
    private sessions: SessionRepository,
  ) {}

  async signup(input: SignupInput) {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.users.findByEmailForLogin(email);
    if (existingUser) throw new AppError(409, "Email already registered");

    const password = await bcrypt.hash(input.password, 12);
    const user = await this.users.create({
      name: input.name,
      email,
      password,
    });

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
  }

  async login(email: string, password: string, userAgent: string) {
    const user = await this.users.findByEmailForLogin(email.trim().toLowerCase());
    if (!user || Buffer.byteLength(password, "utf8") > 72 || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.sessions.create({
      userId: String(user._id),
      token,
      expiresAt,
      userAgent,
    });
    return { token, expiresAt };
  }

  async logout(token: string, userId: string) {
    await this.sessions.deleteByToken(token, userId);
    return { message: "Logged out successfully" };
  }

  async authenticate(token: string) {
    const session = await this.sessions.findValidByToken(token);
    if (!session) throw new AppError(401, "Invalid or expired session");

    const user = await this.users.findPublicById(String(session.userId));
    if (!user) throw new AppError(401, "User not found");
    return user;
  }
}
