import { UserRole } from "./roles.js";

export type ActionPermission =
  | "catalog:view"
  | "catalog:manage"
  | "catalog:resolve_gaps"
  | "inventory:view"
  | "inventory:adjust"
  | "receiving:view"
  | "receiving:count"
  | "receiving:confirm"
  | "receiving:correct"
  | "orders:view"
  | "orders:create"
  | "orders:confirm"
  | "orders:cancel"
  | "orders:prepare"
  | "orders:return"
  | "delivery:view"
  | "delivery:update_status"
  | "reports:view"
  | "reports:generate_official"
  | "audit:view"
  | "system:manage_roles"
  | "system:manage_cutover";

const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<ActionPermission>> = {
  OWNER: new Set<ActionPermission>([
    "catalog:view", "catalog:manage", "catalog:resolve_gaps",
    "inventory:view", "inventory:adjust",
    "receiving:view", "receiving:count", "receiving:confirm", "receiving:correct",
    "orders:view", "orders:create", "orders:confirm", "orders:cancel", "orders:prepare", "orders:return",
    "delivery:view", "delivery:update_status",
    "reports:view", "reports:generate_official",
    "audit:view", "system:manage_roles", "system:manage_cutover"
  ]),
  MANAGER: new Set<ActionPermission>([
    "catalog:view", "catalog:manage", "catalog:resolve_gaps",
    "inventory:view", "inventory:adjust",
    "receiving:view", "receiving:count", "receiving:confirm", "receiving:correct",
    "orders:view", "orders:create", "orders:confirm", "orders:cancel", "orders:prepare", "orders:return",
    "delivery:view", "delivery:update_status",
    "reports:view", "reports:generate_official",
    "audit:view"
  ]),
  WAREHOUSE: new Set<ActionPermission>([
    "catalog:view",
    "inventory:view",
    "receiving:view", "receiving:count", "receiving:confirm",
    "orders:view", "orders:prepare"
  ]),
  DELIVERY: new Set<ActionPermission>([
    "delivery:view", "delivery:update_status"
  ]),
  READ_ONLY: new Set<ActionPermission>([
    "catalog:view", "inventory:view", "receiving:view", "orders:view", "reports:view"
  ])
};

export function hasPermission(role: UserRole, action: ActionPermission): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function assertPermission(role: UserRole, action: ActionPermission): void {
  if (!hasPermission(role, action)) {
    throw new Error(`FORBIDDEN: Role '${role}' lacks permission for '${action}'`);
  }
}
