import mongoose from "mongoose";

import { Config } from "../../constants/config.js";

export class DatabaseProvider {
  static async connect(): Promise<void> {
    await mongoose.connect(
      Config.env.MONGODB_URI,
      {
        dbName: Config.env.DB_NAME,
        serverSelectionTimeoutMS: 10_000,
      },
    );

    console.log(
      `MongoDB connected: ${Config.env.DB_NAME}`,
    );
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }
}