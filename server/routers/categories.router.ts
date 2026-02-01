import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { requirePermission } from "../auth/middleware";

export const categoriesRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllCategories();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCategoryById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx.user.role as any, "CREATE");
      const id = await db.createCategory(input);
      return { id, success: true };
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1, "Nome é obrigatório").optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx.user.role as any, "UPDATE");
      const { id, ...data } = input;
      await db.updateCategory(id, data);
      return { success: true };
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx.user.role as any, "DELETE");
      await db.deleteCategory(input.id);
      return { success: true };
    }),
});
