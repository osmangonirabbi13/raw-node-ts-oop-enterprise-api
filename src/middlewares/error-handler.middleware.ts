import { ZodError } from "zod";
import { AppError } from "../core/AppError.js";
import { type AppResponse } from "../core/HttpTypes.js";
import { ResponseHelper } from "../core/Response.js";

export class ErrorHandler {
  public static handle(error: unknown, res: AppResponse): void {
    if (res.headersSent) {
      res.end();
      return;
    }

    if (error instanceof AppError) {
      return ResponseHelper.error(
        res,
        error.message,
        error.statusCode,
        error.details
      );
    }

    if (error instanceof ZodError) {
      return ResponseHelper.badRequest(
        res,
        "Validation failed",
        error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    if (error instanceof SyntaxError) {
      return ResponseHelper.badRequest(res, "Invalid request syntax");
    }

    console.error("Unexpected error:", error);

    return ResponseHelper.error(res, "Internal server error", 500);
  }
}