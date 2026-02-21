// System roles are intentionally coarse-grained for predictable RBAC behavior.
export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  SALES = 'Sales',
  VIEWER = 'Viewer'
}

// Roles hierarchy used for privilege checks where broader access is required.
export const ROLE_PRIORITY: Record<Role, number> = {
  [Role.VIEWER]: 1,
  [Role.SALES]: 2,
  [Role.MANAGER]: 3,
  [Role.ADMIN]: 4
};
