import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { 
  generateBulkQRCodes, 
  generateBulkBarcodes
} from "../services/barcodeGenerator";

export const barcodesRouter = router({
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
});
