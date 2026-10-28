import { SessionModel } from "../model/SessionModel.js";

type CreateSessionInput = {
  userId: string;
  token: string;
  expiresAt: Date;
  userAgent: string;
};

export class SessionRepository {
  create(input: CreateSessionInput) {
    return SessionModel.model.create(input);
  }

  findValidByToken(token: string) {
    return SessionModel.model.findOne({
      token,
      expiresAt: { $gt: new Date() },
    }).lean();
  }

  deleteByToken(token: string, userId: string) {
    return SessionModel.model.deleteOne({ token, userId });
  }
}
