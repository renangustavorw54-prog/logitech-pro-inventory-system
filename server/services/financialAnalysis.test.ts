import { describe, it, expect } from "vitest";
import { calculateFinancialStats, analyzeProbabilities } from "./financialAnalysis";

describe("financialAnalysis service", () => {
  describe("calculateFinancialStats", () => {
    it("should correctly calculate totals and ROI", () => {
      const products = [
        { id: 1, name: "P1", quantity: 10, price: "100.00", cost: "50.00" } as any,
        { id: 2, name: "P2", quantity: 5, price: "200.00", cost: "150.00" } as any,
      ];

      const stats = calculateFinancialStats(products);
      
      // P1: cost 50 * 10 = 500, revenue 100 * 10 = 1000
      // P2: cost 150 * 5 = 750, revenue 200 * 5 = 1000
      // Total Investment: 500 + 750 = 1250
      // Total Revenue: 1000 + 1000 = 2000
      // Total Profit: 2000 - 1250 = 750
      // Average ROI: (750 / 1250) * 100 = 60%

      expect(stats.totalInvestment).toBe(1250);
      expect(stats.totalPotentialRevenue).toBe(2000);
      expect(stats.totalPotentialProfit).toBe(750);
      expect(stats.averageROI).toBe(60);
      expect(stats.topValueItems[0].name).toBe("P1"); // ROI 100% vs P2 ROI 33.3%
    });
  });

  describe("analyzeProbabilities", () => {
    it("should return high risk for products with no sales", () => {
      const product = { id: 1, name: "P1", quantity: 10 } as any;
      const transactions: any[] = [];
      
      const analysis = analyzeProbabilities(product, transactions);
      
      expect(analysis.riskLevel).toBe("HIGH");
      expect(analysis.sellProbability).toBe(0.1);
    });

    it("should calculate probability based on recent sales", () => {
      const product = { id: 1, name: "P1", quantity: 10 } as any;
      const now = new Date();
      const transactions = [
        { productId: 1, type: "SAIDA", quantity: 5, createdAt: now } as any,
      ];
      
      const analysis = analyzeProbabilities(product, transactions);
      
      expect(analysis.sellProbability).toBe(0.5); // 5 / 10
      expect(analysis.riskLevel).toBe("MEDIUM");
    });
  });
});
