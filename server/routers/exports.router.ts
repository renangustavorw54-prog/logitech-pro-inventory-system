import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { requirePermission } from "../auth/middleware";
import { analyzeMultipleProducts } from "../services/productTurnover";
import { 
  exportProductsToExcel, 
  exportTransactionsToExcel, 
  exportTurnoverReportToExcel,
  exportCompleteReport
} from "../services/excelExport";
import { 
  exportProductsToPDF, 
  exportTransactionsToPDF, 
  exportTurnoverReportToPDF,
  exportLowStockReportToPDF
} from "../services/pdfExport";

export const exportsRouter = router({
  productsExcel: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.user.role as any, "EXPORT");
    const products = await db.getAllProducts();
    const buffer = exportProductsToExcel(products);
    return { data: buffer.toString("base64") };
  }),
  
  productsPDF: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.user.role as any, "EXPORT");
    const products = await db.getAllProducts();
    const buffer = exportProductsToPDF(products);
    return { data: buffer.toString("base64") };
  }),
  
  transactionsExcel: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.user.role as any, "EXPORT");
    const transactions = await db.getAllTransactions();
    const buffer = exportTransactionsToExcel(transactions);
    return { data: buffer.toString("base64") };
  }),
  
  transactionsPDF: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.user.role as any, "EXPORT");
    const transactions = await db.getAllTransactions();
    const buffer = exportTransactionsToPDF(transactions);
    return { data: buffer.toString("base64") };
  }),
  
  turnoverExcel: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.user.role as any, "EXPORT");
    const products = await db.getAllProducts();
    const transactions = await db.getAllTransactions();
    const turnoverData = analyzeMultipleProducts(products, transactions);
    const buffer = exportTurnoverReportToExcel(turnoverData);
    return { data: buffer.toString("base64") };
  }),
  
  turnoverPDF: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.user.role as any, "EXPORT");
    const products = await db.getAllProducts();
    const transactions = await db.getAllTransactions();
    const turnoverData = analyzeMultipleProducts(products, transactions);
    const buffer = exportTurnoverReportToPDF(turnoverData);
    return { data: buffer.toString("base64") };
  }),
  
  completeReport: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.user.role as any, "EXPORT");
    const products = await db.getAllProducts();
    const transactions = await db.getAllTransactions();
    const turnoverData = analyzeMultipleProducts(products, transactions);
    const buffer = exportCompleteReport(products, transactions, turnoverData);
    return { data: buffer.toString("base64") };
  }),
  
  lowStockPDF: protectedProcedure.query(async ({ ctx }) => {
    requirePermission(ctx.user.role as any, "EXPORT");
    const products = await db.getLowStockProducts();
    const buffer = exportLowStockReportToPDF(products);
    return { data: buffer.toString("base64") };
  }),
});
