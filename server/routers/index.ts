import { systemRouter } from "../_core/systemRouter";
import { router } from "../_core/trpc";
import { authRouter } from "./auth.router";
import { dashboardRouter } from "./dashboard.router";
import { categoriesRouter } from "./categories.router";
import { productsRouter } from "./products.router";
import { transactionsRouter } from "./transactions.router";
import { reportsRouter } from "./reports.router";
import { financialRouter } from "./financial.router";
import { exportsRouter } from "./exports.router";
import { barcodesRouter } from "./barcodes.router";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  dashboard: dashboardRouter,
  categories: categoriesRouter,
  products: productsRouter,
  transactions: transactionsRouter,
  reports: reportsRouter,
  financial: financialRouter,
  exports: exportsRouter,
  barcodes: barcodesRouter,
});

export type AppRouter = typeof appRouter;
