import { AppError } from "../../core/AppError.js";
import { PasswordUtil } from "../../utils/password.js";
import { UserRepository } from "./UserRepository.js";
import {
  type CreateUserInput,
  type PaginatedUsers,
  type PublicUser,
  type UpdateUserInput,
  type UserListQuery,
} from "./user.types.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(input: CreateUserInput): Promise<PublicUser> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const passwordHash = await PasswordUtil.hash(input.password);

    return this.userRepository.create(input, passwordHash);
  }

  public async getUsers(query: UserListQuery): Promise<PaginatedUsers> {
    const { users, total } = await this.userRepository.findAll(query);

    return {
      users,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  public async getUserById(id: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  public async updateUser(
    id: string,
    input: UpdateUserInput
  ): Promise<PublicUser> {
    const user = await this.userRepository.update(id, input);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  public async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.softDelete(id);

    if (!deleted) {
      throw new AppError("User not found", 404);
    }
  }
}