import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { requirePermission } from "../auth/middleware";
import { generateStockAlertReport } from "../services/stockAlert";
import { 
  generateProductQRCode, 
  generateProductBarcode,
  generateProductLabel
} from "../services/barcodeGenerator";

export const productsRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllProducts();
  }),
  
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
  
  generateQRCode: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const product = await db.getProductById(input.productId);
      if (!product) throw new Error("Produto não encontrado");
      
      const qrCode = await generateProductQRCode(product);
      return { qrCode };
    }),
  
  generateBarcode: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const product = await db.getProductById(input.productId);
      if (!product) throw new Error("Produto não encontrado");
      
      const barcode = await generateProductBarcode(product);
      return { barcode: barcode.toString("base64") };
    }),
  
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
});
