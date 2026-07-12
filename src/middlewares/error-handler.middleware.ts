import { AppError } from "../core/AppError";
import { AppResponse } from "../core/HttpTypes";
import { ResponseHelper } from "../core/Response";

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
        error.details,
      );
    }

    if (error instanceof SyntaxError) {
      return ResponseHelper.badRequest(res, "Invalid request syntax");
    }

    console.error("Unexpected error:", error);

    return ResponseHelper.error(res, "Internal server error", 500);
  }
}
