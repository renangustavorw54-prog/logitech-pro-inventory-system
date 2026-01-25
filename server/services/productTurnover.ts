import { Transaction, Product } from "../../drizzle/schema";

/**
 * Interface para resultado do cálculo de giro
 */
export interface TurnoverResult {
  productId: number;
  productName: string;
  totalEntradas: number;
  totalSaidas: number;
  turnoverRate: number;
  turnoverPercentage: number;
  status: "ENCALHADO" | "BAIXO_GIRO" | "GIRO_MEDIO" | "ALTO_GIRO";
  statusMessage: string;
  daysAnalyzed?: number;
  averageDailySales?: number;
}

/**
 * Calcula a taxa de giro de um produto
 * Giro = (Saídas / Entradas) * 100
 */
export function calculateTurnover(entradas: number, saidas: number): number {
  if (entradas === 0) return 0;
  return (saidas / entradas) * 100;
}

/**
 * Determina o status do giro baseado na taxa
 */
export function getTurnoverStatus(turnoverRate: number): {
  status: TurnoverResult["status"];
  message: string;
} {
  if (turnoverRate === 0) {
    return {
      status: "ENCALHADO",
      message: "⛔ ENCALHADO: Produto sem saídas - considere promoção ou descontinuar",
    };
  } else if (turnoverRate < 30) {
    return {
      status: "BAIXO_GIRO",
      message: "⚠️ BAIXO GIRO: Produto com poucas vendas - revisar estratégia",
    };
  } else if (turnoverRate < 70) {
    return {
      status: "GIRO_MEDIO",
      message: "📊 GIRO MÉDIO: Produto com vendas moderadas",
    };
  } else {
    return {
      status: "ALTO_GIRO",
      message: "🚀 ALTO GIRO: Produto com excelente saída - manter estoque",
    };
  }
}

/**
 * Analisa o giro de um produto específico
 */
export function analyzeProductTurnover(
  product: Product,
  transactions: Transaction[]
): TurnoverResult {
  const productTransactions = transactions.filter(t => t.productId === product.id);
  
  const entradas = productTransactions
    .filter(t => t.type === "ENTRADA")
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const saidas = productTransactions
    .filter(t => t.type === "SAIDA")
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const turnoverRate = calculateTurnover(entradas, saidas);
  const { status, message } = getTurnoverStatus(turnoverRate);
  
  return {
    productId: product.id,
    productName: product.name,
    totalEntradas: entradas,
    totalSaidas: saidas,
    turnoverRate,
    turnoverPercentage: Math.round(turnoverRate),
    status,
    statusMessage: message,
  };
}

/**
 * Analisa o giro de múltiplos produtos
 */
export function analyzeMultipleProducts(
  products: Product[],
  transactions: Transaction[]
): TurnoverResult[] {
  return products
    .map(product => analyzeProductTurnover(product, transactions))
    .sort((a, b) => b.turnoverRate - a.turnoverRate);
}

/**
 * Calcula giro com base em período de tempo
 */
export function calculateTurnoverByPeriod(
  product: Product,
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): TurnoverResult {
  const periodTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.createdAt);
    return (
      t.productId === product.id &&
      transactionDate >= startDate &&
      transactionDate <= endDate
    );
  });
  
  const entradas = periodTransactions
    .filter(t => t.type === "ENTRADA")
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const saidas = periodTransactions
    .filter(t => t.type === "SAIDA")
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const turnoverRate = calculateTurnover(entradas, saidas);
  const { status, message } = getTurnoverStatus(turnoverRate);
  
  // Calcula dias analisados e média diária
  const daysAnalyzed = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const averageDailySales = daysAnalyzed > 0 ? saidas / daysAnalyzed : 0;
  
  return {
    productId: product.id,
    productName: product.name,
    totalEntradas: entradas,
    totalSaidas: saidas,
    turnoverRate,
    turnoverPercentage: Math.round(turnoverRate),
    status,
    statusMessage: message,
    daysAnalyzed,
    averageDailySales: Math.round(averageDailySales * 100) / 100,
  };
}

/**
 * Identifica produtos encalhados (sem movimento)
 */
export function findStagnantProducts(
  products: Product[],
  transactions: Transaction[],
  minDaysWithoutSales: number = 30
): Array<Product & { daysSinceLastSale: number }> {
  const now = new Date();
  
  return products
    .map(product => {
      const productSales = transactions
        .filter(t => t.productId === product.id && t.type === "SAIDA")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const lastSale = productSales[0];
      const daysSinceLastSale = lastSale
        ? Math.floor((now.getTime() - new Date(lastSale.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;
      
      return {
        ...product,
        daysSinceLastSale,
      };
    })
    .filter(p => p.daysSinceLastSale >= minDaysWithoutSales)
    .sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale);
}

/**
 * Gera relatório completo de giro
 */
export function generateTurnoverReport(
  products: Product[],
  transactions: Transaction[]
): {
  summary: {
    totalProducts: number;
    encalhados: number;
    baixoGiro: number;
    giroMedio: number;
    altoGiro: number;
  };
  products: TurnoverResult[];
  stagnant: Array<Product & { daysSinceLastSale: number }>;
} {
  const analysis = analyzeMultipleProducts(products, transactions);
  const stagnant = findStagnantProducts(products, transactions);
  
  return {
    summary: {
      totalProducts: products.length,
      encalhados: analysis.filter(p => p.status === "ENCALHADO").length,
      baixoGiro: analysis.filter(p => p.status === "BAIXO_GIRO").length,
      giroMedio: analysis.filter(p => p.status === "GIRO_MEDIO").length,
      altoGiro: analysis.filter(p => p.status === "ALTO_GIRO").length,
    },
    products: analysis,
    stagnant,
  };
}
