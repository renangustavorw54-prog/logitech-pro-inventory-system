import { Product, Transaction } from "../../drizzle/schema";

export interface FinancialStats {
  totalInvestment: number;
  totalPotentialRevenue: number;
  totalPotentialProfit: number;
  averageROI: number;
  topValueItems: { id: number; name: string; roi: number }[];
}

export interface ProbabilityAnalysis {
  productId: number;
  productName: string;
  sellProbability: number; // 0 to 1
  expectedTurnoverDays: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function calculateFinancialStats(products: Product[]): FinancialStats {
  let totalInvestment = 0;
  let totalPotentialRevenue = 0;

  const itemsWithROI = products.map(p => {
    const price = parseFloat(p.price as string);
    const cost = parseFloat(p.cost as string);
    const quantity = p.quantity;
    
    totalInvestment += cost * quantity;
    totalPotentialRevenue += price * quantity;
    
    const profit = price - cost;
    const roi = cost > 0 ? (profit / cost) * 100 : 0;
    
    return { id: p.id, name: p.name, roi };
  });

  const totalPotentialProfit = totalPotentialRevenue - totalInvestment;
  const averageROI = totalInvestment > 0 ? (totalPotentialProfit / totalInvestment) * 100 : 0;

  const topValueItems = itemsWithROI
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);

  return {
    totalInvestment,
    totalPotentialRevenue,
    totalPotentialProfit,
    averageROI,
    topValueItems
  };
}

export function analyzeProbabilities(
  product: Product, 
  transactions: Transaction[]
): ProbabilityAnalysis {
  const productTransactions = transactions.filter(t => t.productId === product.id && t.type === 'SAIDA');
  
  if (productTransactions.length === 0) {
    return {
      productId: product.id,
      productName: product.name,
      sellProbability: 0.1,
      expectedTurnoverDays: 90,
      riskLevel: 'HIGH'
    };
  }

  // Calculate frequency
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const recentSales = productTransactions.filter(t => new Date(t.createdAt) >= thirtyDaysAgo);
  const totalQuantitySold = recentSales.reduce((sum, t) => sum + t.quantity, 0);
  
  // Probability based on recent sales (max 1.0)
  const sellProbability = Math.min(totalQuantitySold / 10, 0.95);
  
  // Expected turnover
  const daysInPeriod = 30;
  const avgSalesPerDay = totalQuantitySold / daysInPeriod;
  const expectedTurnoverDays = avgSalesPerDay > 0 ? Math.round(product.quantity / avgSalesPerDay) : 90;

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  if (sellProbability > 0.7) riskLevel = 'LOW';
  else if (sellProbability < 0.3) riskLevel = 'HIGH';

  return {
    productId: product.id,
    productName: product.name,
    sellProbability,
    expectedTurnoverDays,
    riskLevel
  };
}
