import * as XLSX from "xlsx";
import { Product, Transaction } from "../../drizzle/schema";
import { TurnoverResult } from "./productTurnover";

/**
 * Exporta lista de produtos para Excel
 */
export function exportProductsToExcel(products: Product[]): Buffer {
  const data = products.map(p => ({
    ID: p.id,
    Nome: p.name,
    "Categoria ID": p.categoryId || "N/A",
    Quantidade: p.quantity,
    "Estoque Mínimo": p.minStock,
    "Preço (R$)": p.price,
    "Criado em": new Date(p.createdAt).toLocaleString("pt-BR"),
    "Atualizado em": new Date(p.updatedAt).toLocaleString("pt-BR"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");

  // Ajusta largura das colunas
  const maxWidth = data.reduce((w, r) => Math.max(w, r.Nome.length), 10);
  worksheet["!cols"] = [
    { wch: 5 },  // ID
    { wch: maxWidth + 5 },  // Nome
    { wch: 12 }, // Categoria ID
    { wch: 10 }, // Quantidade
    { wch: 15 }, // Estoque Mínimo
    { wch: 12 }, // Preço
    { wch: 18 }, // Criado em
    { wch: 18 }, // Atualizado em
  ];

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

/**
 * Exporta transações para Excel
 */
export function exportTransactionsToExcel(
  transactions: Array<Transaction & { productName?: string | null; userName?: string | null }>
): Buffer {
  const data = transactions.map(t => ({
    ID: t.id,
    Produto: t.productName || `ID: ${t.productId}`,
    Usuário: t.userName || `ID: ${t.userId}`,
    Tipo: t.type,
    Quantidade: t.quantity,
    Observações: t.notes || "",
    Data: new Date(t.createdAt).toLocaleString("pt-BR"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transações");

  worksheet["!cols"] = [
    { wch: 5 },  // ID
    { wch: 30 }, // Produto
    { wch: 20 }, // Usuário
    { wch: 10 }, // Tipo
    { wch: 10 }, // Quantidade
    { wch: 30 }, // Observações
    { wch: 18 }, // Data
  ];

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

/**
 * Exporta relatório de giro de produtos para Excel
 */
export function exportTurnoverReportToExcel(turnoverData: TurnoverResult[]): Buffer {
  const data = turnoverData.map(t => ({
    "ID Produto": t.productId,
    "Nome do Produto": t.productName,
    "Total Entradas": t.totalEntradas,
    "Total Saídas": t.totalSaidas,
    "Taxa de Giro (%)": t.turnoverPercentage,
    Status: t.status,
    Mensagem: t.statusMessage,
    "Média Diária": t.averageDailySales || "N/A",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Giro de Produtos");

  worksheet["!cols"] = [
    { wch: 10 }, // ID Produto
    { wch: 30 }, // Nome do Produto
    { wch: 15 }, // Total Entradas
    { wch: 15 }, // Total Saídas
    { wch: 15 }, // Taxa de Giro
    { wch: 15 }, // Status
    { wch: 50 }, // Mensagem
    { wch: 12 }, // Média Diária
  ];

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

/**
 * Exporta relatório completo com múltiplas abas
 */
export function exportCompleteReport(
  products: Product[],
  transactions: Array<Transaction & { productName?: string | null; userName?: string | null }>,
  turnoverData: TurnoverResult[]
): Buffer {
  const workbook = XLSX.utils.book_new();

  // Aba 1: Produtos
  const productsData = products.map(p => ({
    ID: p.id,
    Nome: p.name,
    "Categoria ID": p.categoryId || "N/A",
    Quantidade: p.quantity,
    "Estoque Mínimo": p.minStock,
    "Preço (R$)": p.price,
  }));
  const productsSheet = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(workbook, productsSheet, "Produtos");

  // Aba 2: Transações
  const transactionsData = transactions.map(t => ({
    ID: t.id,
    Produto: t.productName || `ID: ${t.productId}`,
    Tipo: t.type,
    Quantidade: t.quantity,
    Data: new Date(t.createdAt).toLocaleString("pt-BR"),
  }));
  const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transações");

  // Aba 3: Giro de Produtos
  const turnoverDataFormatted = turnoverData.map(t => ({
    Produto: t.productName,
    Entradas: t.totalEntradas,
    Saídas: t.totalSaidas,
    "Giro (%)": t.turnoverPercentage,
    Status: t.status,
  }));
  const turnoverSheet = XLSX.utils.json_to_sheet(turnoverDataFormatted);
  XLSX.utils.book_append_sheet(workbook, turnoverSheet, "Análise de Giro");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
