import { TRPCError } from "@trpc/server";
import { hasPermission, Permission, Role } from "./roles";

/**
 * Verifica se o usuário tem a permissão necessária
 * Lança erro se não tiver
 */
export function requirePermission(userRole: Role, permission: Permission): void {
  if (!hasPermission(userRole, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Você não tem permissão para realizar esta ação. Permissão necessária: ${permission}`,
    });
  }
}

/**
 * Verifica se o usuário é admin
 */
export function requireAdmin(userRole: Role): void {
  if (userRole !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas administradores podem realizar esta ação",
    });
  }
}
