export type UserRole = "admin" | "manager" | "user";
export type UserStatus = "active" | "blocked" | "disabled";

export type UserEntity = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PublicUser = Omit<UserEntity, "passwordHash" | "deletedAt">;

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
};



export type UpdateUserInput = {
  name?: string | undefined;
  role?: UserRole | undefined;
  status?: UserStatus | undefined;
};


export type UserListQuery = {
  search?: string | undefined;
  role?: UserRole | undefined;
  status?: UserStatus | undefined;
  page: number;
  limit: number;
};

export type PaginatedUsers = {
  users: PublicUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};