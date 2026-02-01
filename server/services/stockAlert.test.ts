import { describe, it, expect, vi } from "vitest";
import { calculateStockLevel, StockLevel, generateStockAlertReport } from "./stockAlert";

describe("stockAlert service", () => {
  describe("calculateStockLevel", () => {
    it("should return CRITICAL when quantity is below or equal to minStock", () => {
      const result = calculateStockLevel(5, 10);
      expect(result.level).toBe(StockLevel.CRITICAL);
      
      const resultEqual = calculateStockLevel(10, 10);
      expect(resultEqual.level).toBe(StockLevel.CRITICAL);
    });

    it("should return LOW when quantity is up to 20% above minStock", () => {
      const result = calculateStockLevel(11, 10);
      expect(result.level).toBe(StockLevel.LOW);
      
      const resultLimit = calculateStockLevel(12, 10);
      expect(resultLimit.level).toBe(StockLevel.LOW);
    });

    it("should return WARNING when quantity is up to 50% above minStock", () => {
      const result = calculateStockLevel(13, 10);
      expect(result.level).toBe(StockLevel.WARNING);
      
      const resultLimit = calculateStockLevel(15, 10);
      expect(resultLimit.level).toBe(StockLevel.WARNING);
    });

    it("should return NORMAL when quantity is more than 50% above minStock", () => {
      const result = calculateStockLevel(16, 10);
      expect(result.level).toBe(StockLevel.NORMAL);
    });
  });

  describe("generateStockAlertReport", () => {
    it("should correctly summarize stock levels for multiple products", () => {
      const products = [
        { id: 1, name: "P1", quantity: 5, minStock: 10 } as any,
        { id: 2, name: "P2", quantity: 11, minStock: 10 } as any,
        { id: 3, name: "P3", quantity: 14, minStock: 10 } as any,
        { id: 4, name: "P4", quantity: 20, minStock: 10 } as any,
      ];

      const report = generateStockAlertReport(products);
      
      expect(report.critical).toBe(1);
      expect(report.low).toBe(1);
      expect(report.warning).toBe(1);
      expect(report.normal).toBe(1);
      expect(report.total).toBe(4);
      expect(report.alerts.length).toBe(3);
    });
  });
});
