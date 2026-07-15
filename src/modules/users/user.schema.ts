import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "manager", "user"]);
export const userStatusSchema = z.enum(["active", "blocked", "disabled"]);

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(100),
  role: userRoleSchema.default("user"),
  status: userStatusSchema.default("active"),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    role: userRoleSchema.optional(),
    status: userStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const userListQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});