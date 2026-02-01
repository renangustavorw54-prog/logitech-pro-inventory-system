import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { requirePermission } from "../auth/middleware";
import { checkLowStock } from "../services/stockAlert";

export const transactionsRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllTransactions();
  }),
  
  getByProduct: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return await db.getTransactionsByProduct(input.productId);
    }),
  
  getByDateRange: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      return await db.getTransactionsByDateRange(input.startDate, input.endDate);
    }),
  
  create: protectedProcedure
    .input(z.object({
      productId: z.number(),
      type: z.enum(["ENTRADA", "SAIDA"]),
      quantity: z.number().min(1, "Quantidade deve ser maior que zero"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx.user.role as any, "CREATE");
      
      const product = await db.getProductById(input.productId);
      if (!product) {
        throw new Error("Produto não encontrado");
      }

      if (input.type === "SAIDA" && product.quantity < input.quantity) {
        throw new Error(`Estoque insuficiente. Disponível: ${product.quantity}`);
      }

      const newQuantity = input.type === "ENTRADA" 
        ? product.quantity + input.quantity 
        : product.quantity - input.quantity;

      await db.updateProductQuantity(input.productId, newQuantity);

      const transactionId = await db.createTransaction({
        productId: input.productId,
        userId: ctx.user.id,
        type: input.type,
        quantity: input.quantity,
        notes: input.notes,
      });

      const updatedProduct = { ...product, quantity: newQuantity };
      await checkLowStock(updatedProduct);

      return { id: transactionId, success: true, newQuantity };
    }),
});
