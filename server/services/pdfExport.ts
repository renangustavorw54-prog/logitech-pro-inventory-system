import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Product, Transaction } from "../../drizzle/schema";
import { TurnoverResult } from "./productTurnover";

/**
 * Configuração padrão do PDF
 */
const PDF_CONFIG = {
  orientation: "portrait" as const,
  unit: "mm" as const,
  format: "a4" as const,
};

/**
 * Adiciona cabeçalho ao PDF
 */
function addHeader(doc: jsPDF, title: string) {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 27);
  
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(14, 30, 196, 30);
}

/**
 * Adiciona rodapé com paginação
 */
function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
}

/**
 * Exporta lista de produtos para PDF
 */
export function exportProductsToPDF(products: Product[]): Buffer {
  const doc = new jsPDF(PDF_CONFIG);
  
  addHeader(doc, "Relatório de Produtos");
  
  const tableData = products.map(p => [
    p.id,
    p.name,
    p.quantity,
    p.minStock,
    `R$ ${p.price}`,
    new Date(p.createdAt).toLocaleDateString("pt-BR"),
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [["ID", "Nome", "Qtd", "Mín", "Preço", "Criado em"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 70 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
    },
  });
  
  addFooter(doc);
  
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Exporta transações para PDF
 */
export function exportTransactionsToPDF(
  transactions: Array<Transaction & { productName?: string | null; userName?: string | null }>
): Buffer {
  const doc = new jsPDF(PDF_CONFIG);
  
  addHeader(doc, "Relatório de Transações");
  
  const tableData = transactions.map(t => [
    t.id,
    t.productName || `ID: ${t.productId}`,
    t.type,
    t.quantity,
    new Date(t.createdAt).toLocaleDateString("pt-BR"),
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [["ID", "Produto", "Tipo", "Qtd", "Data"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 30 },
    },
  });
  
  addFooter(doc);
  
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Exporta relatório de giro de produtos para PDF
 */
export function exportTurnoverReportToPDF(turnoverData: TurnoverResult[]): Buffer {
  const doc = new jsPDF(PDF_CONFIG);
  
  addHeader(doc, "Relatório de Giro de Produtos");
  
  // Resumo
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Executivo", 14, 40);
  
  const summary = {
    encalhados: turnoverData.filter(t => t.status === "ENCALHADO").length,
    baixoGiro: turnoverData.filter(t => t.status === "BAIXO_GIRO").length,
    giroMedio: turnoverData.filter(t => t.status === "GIRO_MEDIO").length,
    altoGiro: turnoverData.filter(t => t.status === "ALTO_GIRO").length,
  };
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total de Produtos: ${turnoverData.length}`, 14, 47);
  doc.text(`⛔ Encalhados: ${summary.encalhados}`, 14, 52);
  doc.text(`⚠️ Baixo Giro: ${summary.baixoGiro}`, 14, 57);
  doc.text(`📊 Giro Médio: ${summary.giroMedio}`, 14, 62);
  doc.text(`🚀 Alto Giro: ${summary.altoGiro}`, 14, 67);
  
  // Tabela detalhada
  const tableData = turnoverData.map(t => [
    t.productName,
    t.totalEntradas,
    t.totalSaidas,
    `${t.turnoverPercentage}%`,
    t.status,
  ]);
  
  autoTable(doc, {
    startY: 75,
    head: [["Produto", "Entradas", "Saídas", "Giro", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 35 },
    },
  });
  
  addFooter(doc);
  
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Exporta relatório de estoque baixo para PDF
 */
export function exportLowStockReportToPDF(
  products: Array<Product & { stockLevel?: string; stockMessage?: string }>
): Buffer {
  const doc = new jsPDF(PDF_CONFIG);
  
  addHeader(doc, "Relatório de Estoque Crítico");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 53, 69);
  doc.text("⚠️ ATENÇÃO: Produtos com estoque baixo ou crítico", 14, 40);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  
  const tableData = products.map(p => [
    p.name,
    p.quantity,
    p.minStock,
    p.stockLevel || "CRÍTICO",
    p.stockMessage || "Repor urgente",
  ]);
  
  autoTable(doc, {
    startY: 47,
    head: [["Produto", "Atual", "Mínimo", "Nível", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [220, 53, 69] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 45 },
    },
  });
  
  addFooter(doc);
  
  return Buffer.from(doc.output("arraybuffer"));
}
