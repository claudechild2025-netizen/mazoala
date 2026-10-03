import { z } from "zod";

export const UserRoleSchema = z.enum(["OWNER", "MANAGER", "WAREHOUSE", "DELIVERY", "READ_ONLY"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
