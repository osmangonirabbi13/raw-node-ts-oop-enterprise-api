import { db } from "../../database/Database.js";
import {
  type CreateUserInput,
  type PublicUser,
  type UpdateUserInput,
  type UserListQuery,
  type UserRole,
  type UserStatus,
} from "./user.types.js";

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

type UserPublicRow = Omit<UserRow, "password_hash" | "deleted_at">;

export class UserRepository {
  public async create(
    input: CreateUserInput,
    passwordHash: string
  ): Promise<PublicUser> {
    const result = await db.query<UserPublicRow>(
      `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, status, created_at, updated_at
      `,
      [
        input.name,
        input.email.toLowerCase(),
        passwordHash,
        input.role ?? "user",
        input.status ?? "active",
      ]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("User creation failed");
    }

    return this.toPublicUser(row);
  }

  public async findByEmail(email: string): Promise<UserRow | null> {
    const result = await db.query<UserRow>(
      `
      SELECT id, name, email, password_hash, role, status, created_at, updated_at, deleted_at
      FROM users
      WHERE email = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [email.toLowerCase()]
    );

    return result.rows[0] ?? null;
  }

  public async findById(id: string): Promise<PublicUser | null> {
    const result = await db.query<UserPublicRow>(
      `
      SELECT id, name, email, role, status, created_at, updated_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [id]
    );

    const row = result.rows[0];

    return row ? this.toPublicUser(row) : null;
  }

  public async findAll(query: UserListQuery): Promise<{
    users: PublicUser[];
    total: number;
  }> {
    const where: string[] = ["deleted_at IS NULL"];
    const values: unknown[] = [];

    if (query.search) {
      values.push(`%${query.search}%`);
      where.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length})`);
    }

    if (query.role) {
      values.push(query.role);
      where.push(`role = $${values.length}`);
    }

    if (query.status) {
      values.push(query.status);
      where.push(`status = $${values.length}`);
    }

    const whereSql = where.join(" AND ");

    const countResult = await db.query<{ total: string }>(
      `
      SELECT COUNT(*) as total
      FROM users
      WHERE ${whereSql}
      `,
      values
    );

    const total = Number(countResult.rows[0]?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    values.push(query.limit);
    const limitParam = values.length;

    values.push(offset);
    const offsetParam = values.length;

    const result = await db.query<UserPublicRow>(
      `
      SELECT id, name, email, role, status, created_at, updated_at
      FROM users
      WHERE ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
      `,
      values
    );

    return {
      users: result.rows.map((row) => this.toPublicUser(row)),
      total,
    };
  }

  public async update(
    id: string,
    input: UpdateUserInput
  ): Promise<PublicUser | null> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      values.push(input.name);
      updates.push(`name = $${values.length}`);
    }

    if (input.role !== undefined) {
      values.push(input.role);
      updates.push(`role = $${values.length}`);
    }

    if (input.status !== undefined) {
      values.push(input.status);
      updates.push(`status = $${values.length}`);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    const result = await db.query<UserPublicRow>(
      `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${values.length} AND deleted_at IS NULL
      RETURNING id, name, email, role, status, created_at, updated_at
      `,
      values
    );

    const row = result.rows[0];

    return row ? this.toPublicUser(row) : null;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await db.query(
      `
      UPDATE users
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  }

  private toPublicUser(row: UserPublicRow): PublicUser {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}