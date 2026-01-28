import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { requirePermission, requireAdmin } from "./auth/middleware";
import { checkLowStock, generateStockAlertReport } from "./services/stockAlert";
import { 
  analyzeProductTurnover, 
  analyzeMultipleProducts, 
  generateTurnoverReport,
  calculateTurnoverByPeriod,
  findStagnantProducts
} from "./services/productTurnover";
import { 
  exportProductsToExcel, 
  exportTransactionsToExcel, 
  exportTurnoverReportToExcel,
  exportCompleteReport
} from "./services/excelExport";
import { 
  exportProductsToPDF, 
  exportTransactionsToPDF, 
  exportTurnoverReportToPDF,
  exportLowStockReportToPDF
} from "./services/pdfExport";
import { 
  generateProductQRCode, 
  generateSimpleQRCode, 
  generateProductBarcode,
  generateProductLabel,
  generateBulkQRCodes,
  generateBulkBarcodes
} from "./services/barcodeGenerator";
import { 
  calculateFinancialStats, 
  analyzeProbabilities 
} from "./services/financialAnalysis";

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
    
    // Novo: Dashboard com alertas de estoque
    statsWithAlerts: protectedProcedure.query(async () => {
      const stats = await db.getDashboardStats();
      const products = await db.getAllProducts();
      const alertReport = generateStockAlertReport(products);
      
      return {
        ...stats,
        stockAlerts: {
          critical: alertReport.critical,
          low: alertReport.low,
          warning: alertReport.warning,
          total: alertReport.total,
        },
      };
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
  }),

  // Products
  products: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    // Novo: Lista com análise de estoque
    listWithStockAnalysis: protectedProcedure.query(async () => {
      const products = await db.getAllProducts();
      const alertReport = generateStockAlertReport(products);
      
      return {
        products,
        alerts: alertReport.alerts,
      };
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
      .mutation(async ({ input, ctx }) => {
        requirePermission(ctx.user.role as any, "CREATE");
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
      .mutation(async ({ input, ctx }) => {
        requirePermission(ctx.user.role as any, "UPDATE");
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requirePermission(ctx.user.role as any, "DELETE");
        await db.deleteProduct(input.id);
        return { success: true };
      }),
    
    // Novo: Gerar QR Code para produto
    generateQRCode: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) throw new Error("Produto não encontrado");
        
        const qrCode = await generateProductQRCode(product);
        return { qrCode };
      }),
    
    // Novo: Gerar código de barras para produto
    generateBarcode: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) throw new Error("Produto não encontrado");
        
        const barcode = await generateProductBarcode(product);
        return { barcode: barcode.toString("base64") };
      }),
    
    // Novo: Gerar etiqueta completa
    generateLabel: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) throw new Error("Produto não encontrado");
        
        const label = await generateProductLabel(product);
        return {
          ...label,
          barcode: label.barcode.toString("base64"),
        };
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
        requirePermission(ctx.user.role as any, "CREATE");
        
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

        // Check stock and send alert if needed
        const updatedProduct = { ...product, quantity: newQuantity };
        await checkLowStock(updatedProduct);

        return { id: transactionId, success: true, newQuantity };
      }),
  }),

  // Reports - Melhorado com novas funcionalidades
  reports: router({
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
    
    // Novo: Relatório de giro de produtos
    productTurnover: protectedProcedure.query(async () => {
      const products = await db.getAllProducts();
      const transactions = await db.getAllTransactions();
      
      return generateTurnoverReport(products, transactions);
    }),
    
    // Novo: Giro de produto específico
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
    
    // Novo: Produtos encalhados
    stagnantProducts: protectedProcedure
      .input(z.object({
        minDays: z.number().default(30),
      }))
      .query(async ({ input }) => {
        const products = await db.getAllProducts();
        const transactions = await db.getAllTransactions();
        
        return findStagnantProducts(products, transactions, input.minDays);
      }),
    
    // Novo: Alertas de estoque
    stockAlerts: protectedProcedure.query(async () => {
      const products = await db.getAllProducts();
      return generateStockAlertReport(products);
    }),

    // Novo: Análise Financeira (Gestão de Banca)
    financialStats: protectedProcedure.query(async () => {
      const products = await db.getAllProducts();
      return calculateFinancialStats(products as any);
    }),

    // Novo: Análise de Probabilidades de Giro
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
  }),

  // Novo: Exportação de dados
  exports: router({
    // Exportar produtos para Excel
    productsExcel: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx.user.role as any, "EXPORT");
      const products = await db.getAllProducts();
      const buffer = exportProductsToExcel(products);
      return { data: buffer.toString("base64") };
    }),
    
    // Exportar produtos para PDF
    productsPDF: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx.user.role as any, "EXPORT");
      const products = await db.getAllProducts();
      const buffer = exportProductsToPDF(products);
      return { data: buffer.toString("base64") };
    }),
    
    // Exportar transações para Excel
    transactionsExcel: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx.user.role as any, "EXPORT");
      const transactions = await db.getAllTransactions();
      const buffer = exportTransactionsToExcel(transactions);
      return { data: buffer.toString("base64") };
    }),
    
    // Exportar transações para PDF
    transactionsPDF: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx.user.role as any, "EXPORT");
      const transactions = await db.getAllTransactions();
      const buffer = exportTransactionsToPDF(transactions);
      return { data: buffer.toString("base64") };
    }),
    
    // Exportar relatório de giro para Excel
    turnoverExcel: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx.user.role as any, "EXPORT");
      const products = await db.getAllProducts();
      const transactions = await db.getAllTransactions();
      const turnoverData = analyzeMultipleProducts(products, transactions);
      const buffer = exportTurnoverReportToExcel(turnoverData);
      return { data: buffer.toString("base64") };
    }),
    
    // Exportar relatório de giro para PDF
    turnoverPDF: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx.user.role as any, "EXPORT");
      const products = await db.getAllProducts();
      const transactions = await db.getAllTransactions();
      const turnoverData = analyzeMultipleProducts(products, transactions);
      const buffer = exportTurnoverReportToPDF(turnoverData);
      return { data: buffer.toString("base64") };
    }),
    
    // Exportar relatório completo (todas as abas)
    completeReport: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx.user.role as any, "EXPORT");
      const products = await db.getAllProducts();
      const transactions = await db.getAllTransactions();
      const turnoverData = analyzeMultipleProducts(products, transactions);
      const buffer = exportCompleteReport(products, transactions, turnoverData);
      return { data: buffer.toString("base64") };
    }),
    
    // Exportar alertas de estoque para PDF
    lowStockPDF: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx.user.role as any, "EXPORT");
      const products = await db.getLowStockProducts();
      const buffer = exportLowStockReportToPDF(products);
      return { data: buffer.toString("base64") };
    }),
  }),
  
  // Novo: Códigos de barras e QR em massa
  barcodes: router({
    // Gerar QR codes para múltiplos produtos
    bulkQRCodes: protectedProcedure
      .input(z.object({
        productIds: z.array(z.number()).optional(),
      }))
      .query(async ({ input }) => {
        const products = input.productIds 
          ? await Promise.all(input.productIds.map(id => db.getProductById(id)))
          : await db.getAllProducts();
        
        const validProducts = products.filter(p => p !== null);
        return await generateBulkQRCodes(validProducts as any);
      }),
    
    // Gerar códigos de barras para múltiplos produtos
    bulkBarcodes: protectedProcedure
      .input(z.object({
        productIds: z.array(z.number()).optional(),
      }))
      .query(async ({ input }) => {
        const products = input.productIds 
          ? await Promise.all(input.productIds.map(id => db.getProductById(id)))
          : await db.getAllProducts();
        
        const validProducts = products.filter(p => p !== null);
        const barcodes = await generateBulkBarcodes(validProducts as any);
        
        return barcodes.map(b => ({
          ...b,
          barcode: b.barcode.toString("base64"),
        }));
      }),
  }),
});

export type AppRouter = typeof appRouter;
