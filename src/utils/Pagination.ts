import { AppError } from "./AppError.js";

export class Pagination {
  static read(query: Record<string, unknown>) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    if (!Number.isSafeInteger(page) || page < 1 ||
        !Number.isSafeInteger(limit) || limit < 1 || limit > 50 ||
        !Number.isSafeInteger((page - 1) * limit)) {
      throw new AppError(400, "Page must be positive and limit must be between 1 and 50");
    }
    return { page, limit };
  }

  static response(data: unknown[], total: number, page: number, limit: number) {
    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
