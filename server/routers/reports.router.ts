import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { generateStockAlertReport } from "../services/stockAlert";
import { 
  analyzeProductTurnover, 
  generateTurnoverReport,
  calculateTurnoverByPeriod,
  findStagnantProducts
} from "../services/productTurnover";

export const reportsRouter = router({
  movementsByPeriod: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const transactions = await db.getTransactionsByDateRange(input.startDate, input.endDate);
      
      const entradas = transactions.filter(t => t.type === "ENTRADA");
      const saidas = transactions.filter(t => t.type === "SAIDA");
      
      const totalEntradas = entradas.reduce((sum, t) => sum + t.quantity, 0);
      const totalSaidas = saidas.reduce((sum, t) => sum + t.quantity, 0);
      
      const byProduct = transactions.reduce((acc, t) => {
        const key = t.productId;
        if (!acc[key]) {
          acc[key] = {
            productId: t.productId,
            productName: t.productName || "Desconhecido",
            entradas: 0,
            saidas: 0,
          };
        }
        if (t.type === "ENTRADA") {
          acc[key].entradas += t.quantity;
        } else {
          acc[key].saidas += t.quantity;
        }
        return acc;
      }, {} as Record<number, any>);
      
      return {
        totalEntradas,
        totalSaidas,
        byProduct: Object.values(byProduct),
        transactions,
      };
    }),
  
  topProducts: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const allTransactions = await db.getAllTransactions();
      
      const productMovements = allTransactions.reduce((acc, t) => {
        const key = t.productId;
        if (!acc[key]) {
          acc[key] = {
            productId: t.productId,
            productName: t.productName || "Desconhecido",
            totalMovements: 0,
            totalQuantity: 0,
          };
        }
        acc[key].totalMovements += 1;
        acc[key].totalQuantity += t.quantity;
        return acc;
      }, {} as Record<number, any>);
      
      return Object.values(productMovements)
        .sort((a: any, b: any) => b.totalMovements - a.totalMovements)
        .slice(0, input.limit);
    }),
  
  productTurnover: protectedProcedure.query(async () => {
    const products = await db.getAllProducts();
    const transactions = await db.getAllTransactions();
    
    return generateTurnoverReport(products, transactions);
  }),
  
  productTurnoverById: protectedProcedure
    .input(z.object({ 
      productId: z.number(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const product = await db.getProductById(input.productId);
      if (!product) throw new Error("Produto não encontrado");
      
      const transactions = await db.getAllTransactions();
      
      if (input.startDate && input.endDate) {
        return calculateTurnoverByPeriod(product, transactions, input.startDate, input.endDate);
      }
      
      return analyzeProductTurnover(product, transactions);
    }),
  
  stagnantProducts: protectedProcedure
    .input(z.object({
      minDays: z.number().default(30),
    }))
    .query(async ({ input }) => {
      const products = await db.getAllProducts();
      const transactions = await db.getAllTransactions();
      
      return findStagnantProducts(products, transactions, input.minDays);
    }),
  
  stockAlerts: protectedProcedure.query(async () => {
    const products = await db.getAllProducts();
    return generateStockAlertReport(products);
  }),
});
