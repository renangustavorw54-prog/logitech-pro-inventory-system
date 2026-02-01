import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { 
  calculateFinancialStats, 
  analyzeProbabilities 
} from "../services/financialAnalysis";

export const financialRouter = router({
  financialStats: protectedProcedure.query(async () => {
    const products = await db.getAllProducts();
    return calculateFinancialStats(products as any);
  }),

  probabilityAnalysis: protectedProcedure
    .input(z.object({ productId: z.number().optional() }))
    .query(async ({ input }) => {
      const transactions = await db.getAllTransactions();
      
      if (input.productId) {
        const product = await db.getProductById(input.productId);
        if (!product) throw new Error("Produto não encontrado");
        return [analyzeProbabilities(product as any, transactions as any)];
      }
      
      const products = await db.getAllProducts();
      return products.map(p => analyzeProbabilities(p as any, transactions as any));
    }),
});
