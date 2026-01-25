/**
 * Sistema de Controle de Acesso Baseado em Funções (RBAC)
 * Define roles e permissões para diferentes tipos de usuários
 */

export type Role = "ADMIN" | "ESTOQUE" | "VISUALIZACAO";

export type Permission = 
  | "CREATE" 
  | "READ" 
  | "UPDATE" 
  | "DELETE" 
  | "EXPORT" 
  | "MANAGE_USERS";

/**
 * Mapa de permissões por role
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT", "MANAGE_USERS"],
  ESTOQUE: ["CREATE", "READ", "UPDATE", "EXPORT"],
  VISUALIZACAO: ["READ", "EXPORT"],
};

/**
 * Verifica se um role tem uma permissão específica
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Verifica se um role tem todas as permissões especificadas
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Verifica se um role tem pelo menos uma das permissões especificadas
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Retorna todas as permissões de um role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Descrições amigáveis dos roles
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Acesso total ao sistema, incluindo gerenciamento de usuários",
  ESTOQUE: "Pode criar, editar e visualizar produtos e movimentações",
  VISUALIZACAO: "Apenas visualização de dados e exportação de relatórios",
};
