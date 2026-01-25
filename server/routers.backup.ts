import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
  }),

  // Categories
  categories: router({
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
      .mutation(async ({ input }) => {
        const id = await db.createCategory(input);
        return { id, success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1, "Nome é obrigatório").optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // Products
  products: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    getByCategory: protectedProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
    
    getLowStock: protectedProcedure.query(async () => {
      return await db.getLowStockProducts();
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        categoryId: z.number().optional(),
        quantity: z.number().min(0, "Quantidade deve ser positiva").default(0),
        minStock: z.number().min(0, "Estoque mínimo deve ser positivo").default(5),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido").default("0.00"),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProduct(input);
        return { id, success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1, "Nome é obrigatório").optional(),
        categoryId: z.number().optional().nullable(),
        quantity: z.number().min(0, "Quantidade deve ser positiva").optional(),
        minStock: z.number().min(0, "Estoque mínimo deve ser positivo").optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Preço inválido").optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // Transactions
  transactions: router({
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
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new Error("Produto não encontrado");
        }

        // Validate stock for SAIDA
        if (input.type === "SAIDA" && product.quantity < input.quantity) {
          throw new Error(`Estoque insuficiente. Disponível: ${product.quantity}`);
        }

        // Calculate new quantity
        const newQuantity = input.type === "ENTRADA" 
          ? product.quantity + input.quantity 
          : product.quantity - input.quantity;

        // Update product quantity
        await db.updateProductQuantity(input.productId, newQuantity);

        // Create transaction record
        const transactionId = await db.createTransaction({
          productId: input.productId,
          userId: ctx.user.id,
          type: input.type,
          quantity: input.quantity,
          notes: input.notes,
        });

        // Check if product is now low stock and send notification
        if (newQuantity <= product.minStock) {
          await notifyOwner({
            title: "⚠️ Alerta de Estoque Baixo",
            content: `O produto "${product.name}" está com estoque crítico: ${newQuantity} unidades (mínimo: ${product.minStock})`,
          });
        }

        return { id: transactionId, success: true, newQuantity };
      }),
  }),

  // Reports
  reports: router({
    movementsByPeriod: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        const transactions = await db.getTransactionsByDateRange(input.startDate, input.endDate);
        
        // Group by type
        const entradas = transactions.filter(t => t.type === "ENTRADA");
        const saidas = transactions.filter(t => t.type === "SAIDA");
        
        // Calculate totals
        const totalEntradas = entradas.reduce((sum, t) => sum + t.quantity, 0);
        const totalSaidas = saidas.reduce((sum, t) => sum + t.quantity, 0);
        
        // Group by product
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
        
        // Group by product and count movements
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
        
        // Sort by total movements and limit
        return Object.values(productMovements)
          .sort((a: any, b: any) => b.totalMovements - a.totalMovements)
          .slice(0, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
