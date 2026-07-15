import { AppError } from "../../core/AppError.js";
import { type AppRequest, type AppResponse } from "../../core/HttpTypes.js";
import { RequestParser } from "../../core/RequestParser.js";
import { ResponseHelper, type JsonValue } from "../../core/Response.js";
import {
  createUserSchema,
  updateUserSchema,
  userListQuerySchema,
} from "./user.schema.js";
import { UserService } from "./UserService.js";

export class UserController {
  constructor(private readonly userService: UserService) {}

  public getUsers = async (req: AppRequest, res: AppResponse): Promise<void> => {
    const query = userListQuerySchema.parse({
      search: this.getSingleQueryValue(req.query.search),
      role: this.getSingleQueryValue(req.query.role),
      status: this.getSingleQueryValue(req.query.status),
      page: this.getSingleQueryValue(req.query.page),
      limit: this.getSingleQueryValue(req.query.limit),
    });

    const result = await this.userService.getUsers(query);

    return ResponseHelper.success(res, "Users loaded successfully", result.users, 200);
  };

  public getUserById = async (
    req: AppRequest,
    res: AppResponse
  ): Promise<void> => {
    const userId = req.params.id;

    if (!userId) {
      throw new AppError("User id is required", 400);
    }

    const user = await this.userService.getUserById(userId);

    return ResponseHelper.success(res, "User loaded successfully", user);
  };

  public createUser = async (
    req: AppRequest,
    res: AppResponse
  ): Promise<void> => {
    const body = await RequestParser.parseJsonBody(req);
    const input = createUserSchema.parse(body);

    const user = await this.userService.createUser(input);

    return ResponseHelper.created(res, "User created successfully", user);
  };

  public updateUser = async (
    req: AppRequest,
    res: AppResponse
  ): Promise<void> => {
    const userId = req.params.id;

    if (!userId) {
      throw new AppError("User id is required", 400);
    }

    const body = await RequestParser.parseJsonBody(req);
    const input = updateUserSchema.parse(body);

    const user = await this.userService.updateUser(userId, input);

    return ResponseHelper.success(res, "User updated successfully", user);
  };

  public deleteUser = async (
    req: AppRequest,
    res: AppResponse
  ): Promise<void> => {
    const userId = req.params.id;

    if (!userId) {
      throw new AppError("User id is required", 400);
    }

    await this.userService.deleteUser(userId);

    return ResponseHelper.success(res, "User deleted successfully", null);
  };

  private getSingleQueryValue(value: string | string[] | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  public static formatValidationError(error: unknown): JsonValue {
    if (
      typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as { issues: unknown }).issues)
    ) {
      return (error as { issues: Array<{ path: unknown[]; message: string }> }).issues.map(
        (issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })
      );
    }

    return null;
  }
}