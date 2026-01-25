import { Product } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

/**
 * Níveis de criticidade do estoque
 */
export enum StockLevel {
  CRITICAL = "CRITICAL",   // Abaixo do mínimo
  LOW = "LOW",             // Até 20% acima do mínimo
  WARNING = "WARNING",     // Até 50% acima do mínimo
  NORMAL = "NORMAL",       // Acima de 50% do mínimo
}

/**
 * Interface para resultado da verificação de estoque
 */
export interface StockCheckResult {
  level: StockLevel;
  quantity: number;
  minStock: number;
  percentage: number;
  message: string;
}

/**
 * Calcula o nível de estoque de um produto
 */
export function calculateStockLevel(quantity: number, minStock: number): StockCheckResult {
  const percentage = minStock > 0 ? (quantity / minStock) * 100 : 100;
  
  let level: StockLevel;
  let message: string;
  
  if (quantity <= minStock) {
    level = StockLevel.CRITICAL;
    message = `⛔ CRÍTICO: Estoque abaixo do mínimo!`;
  } else if (percentage <= 120) {
    level = StockLevel.LOW;
    message = `⚠️ BAIXO: Estoque próximo ao mínimo`;
  } else if (percentage <= 150) {
    level = StockLevel.WARNING;
    message = `⚡ ATENÇÃO: Considere repor o estoque`;
  } else {
    level = StockLevel.NORMAL;
    message = `✅ NORMAL: Estoque adequado`;
  }
  
  return {
    level,
    quantity,
    minStock,
    percentage: Math.round(percentage),
    message,
  };
}

/**
 * Verifica e notifica sobre estoque crítico
 */
export async function checkLowStock(product: Product): Promise<StockCheckResult> {
  const result = calculateStockLevel(product.quantity, product.minStock);
  
  // Envia notificação apenas para níveis críticos e baixos
  if (result.level === StockLevel.CRITICAL || result.level === StockLevel.LOW) {
    await notifyOwner({
      title: result.level === StockLevel.CRITICAL 
        ? "⛔ Alerta de Estoque CRÍTICO" 
        : "⚠️ Alerta de Estoque Baixo",
      content: `
**Produto:** ${product.name}
**Estoque Atual:** ${result.quantity} unidades
**Estoque Mínimo:** ${result.minStock} unidades
**Status:** ${result.message}

${result.level === StockLevel.CRITICAL 
  ? "⚠️ AÇÃO URGENTE NECESSÁRIA: Repor estoque imediatamente!" 
  : "Recomenda-se repor o estoque em breve."}
      `.trim(),
    });
  }
  
  return result;
}

/**
 * Verifica múltiplos produtos e retorna apenas os que precisam de atenção
 */
export function checkMultipleProducts(products: Product[]): Array<Product & { stockCheck: StockCheckResult }> {
  return products
    .map(product => ({
      ...product,
      stockCheck: calculateStockLevel(product.quantity, product.minStock),
    }))
    .filter(p => p.stockCheck.level !== StockLevel.NORMAL)
    .sort((a, b) => {
      // Ordena por criticidade (CRITICAL primeiro, depois LOW, depois WARNING)
      const levelOrder = { CRITICAL: 0, LOW: 1, WARNING: 2, NORMAL: 3 };
      return levelOrder[a.stockCheck.level] - levelOrder[b.stockCheck.level];
    });
}

/**
 * Gera relatório de alertas de estoque
 */
export function generateStockAlertReport(products: Product[]): {
  critical: number;
  low: number;
  warning: number;
  normal: number;
  total: number;
  alerts: Array<Product & { stockCheck: StockCheckResult }>;
} {
  const alerts = checkMultipleProducts(products);
  
  const critical = alerts.filter(p => p.stockCheck.level === StockLevel.CRITICAL).length;
  const low = alerts.filter(p => p.stockCheck.level === StockLevel.LOW).length;
  const warning = alerts.filter(p => p.stockCheck.level === StockLevel.WARNING).length;
  const normal = products.length - alerts.length;
  
  return {
    critical,
    low,
    warning,
    normal,
    total: products.length,
    alerts,
  };
}
