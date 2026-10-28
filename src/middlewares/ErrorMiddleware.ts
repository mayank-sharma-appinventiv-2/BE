import type {
    ErrorRequestHandler,
  } from "express";
  
  import { AppError } from "../utils/AppError.js";
  
  export class ErrorMiddleware {
    handle: ErrorRequestHandler = (
      error: unknown,
      _req,
      res,
      next,
    ) => {
      if (res.headersSent) {
        next(error);
        return;
      }
  
      let statusCode = 500;
      let message = "Internal server error";
  
      if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
      } else if (
        error instanceof SyntaxError &&
        "status" in error &&
        error.status === 400
      ) {
        statusCode = 400;
        message = "Invalid JSON request body";
      } else if (
        typeof error === "object" &&
        error !== null &&
        "type" in error &&
        error.type === "entity.too.large"
      ) {
        statusCode = 400;
        message = "Request body is too large";
      }
  
      if (statusCode === 500) {
        console.error("Unhandled server error", {
          name:
            error instanceof Error
              ? error.name
              : "UnknownError",
        });
      }
  
      res.status(statusCode).json({
        success: false,
        message,
      });
    };
  }