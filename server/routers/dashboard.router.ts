import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { generateStockAlertReport } from "../services/stockAlert";

export const dashboardRouter = router({
  stats: protectedProcedure.query(async () => {
    return await db.getDashboardStats();
  }),
  
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
});
