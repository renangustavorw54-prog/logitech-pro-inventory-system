import QRCode from "qrcode";
import bwipjs from "bwip-js";
import { Product } from "../../drizzle/schema";

/**
 * Interface para opções de geração de QR Code
 */
export interface QRCodeOptions {
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Interface para opções de código de barras
 */
export interface BarcodeOptions {
  bcid?: "code128" | "ean13" | "ean8" | "upca" | "upce";
  text?: string;
  scale?: number;
  height?: number;
  includetext?: boolean;
}

/**
 * Gera QR Code para um produto (retorna Data URL)
 */
export async function generateProductQRCode(
  product: Product,
  options?: QRCodeOptions
): Promise<string> {
  const productData = JSON.stringify({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
  });

  const defaultOptions: QRCodeOptions = {
    errorCorrectionLevel: "M",
    width: 300,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    ...options,
  };

  return await QRCode.toDataURL(productData, defaultOptions);
}

/**
 * Gera QR Code simples com ID do produto
 */
export async function generateSimpleQRCode(productId: number): Promise<string> {
  return await QRCode.toDataURL(`PRODUCT:${productId}`, {
    errorCorrectionLevel: "M",
    width: 200,
  });
}

/**
 * Gera código de barras para um produto
 * Usa Code128 por padrão (suporta números e letras)
 */
export async function generateProductBarcode(
  product: Product,
  options?: BarcodeOptions
): Promise<Buffer> {
  const defaultOptions: BarcodeOptions = {
    bcid: "code128",
    text: `PROD-${String(product.id).padStart(8, "0")}`,
    scale: 3,
    height: 10,
    includetext: true,
    ...options,
  };

  try {
    const png = await bwipjs.toBuffer(defaultOptions as any);
    return png as unknown as Buffer;
  } catch (error) {
    throw new Error(`Erro ao gerar código de barras: ${error}`);
  }
}

/**
 * Gera código de barras EAN-13 (para produtos com código EAN)
 */
export async function generateEAN13Barcode(eanCode: string): Promise<Buffer> {
  // Valida se o código tem 13 dígitos
  if (!/^\d{13}$/.test(eanCode)) {
    throw new Error("Código EAN-13 deve ter exatamente 13 dígitos");
  }

  try {
    const png = await bwipjs.toBuffer({
      bcid: "ean13",
      text: eanCode,
      scale: 3,
      height: 10,
      includetext: true,
    } as any);
    return png as unknown as Buffer;
  } catch (error) {
    throw new Error(`Erro ao gerar código EAN-13: ${error}`);
  }
}

/**
 * Gera QR Code em formato PNG (Buffer)
 */
export async function generateQRCodeBuffer(
  data: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  const defaultOptions: QRCodeOptions = {
    errorCorrectionLevel: "M",
    width: 300,
    ...options,
  };

  return await QRCode.toBuffer(data, defaultOptions);
}

/**
 * Gera múltiplos QR Codes para uma lista de produtos
 */
export async function generateBulkQRCodes(
  products: Product[]
): Promise<Array<{ productId: number; productName: string; qrCode: string }>> {
  const results = await Promise.all(
    products.map(async (product) => ({
      productId: product.id,
      productName: product.name,
      qrCode: await generateProductQRCode(product),
    }))
  );

  return results;
}

/**
 * Gera múltiplos códigos de barras para uma lista de produtos
 */
export async function generateBulkBarcodes(
  products: Product[]
): Promise<Array<{ productId: number; productName: string; barcode: Buffer }>> {
  const results = await Promise.all(
    products.map(async (product) => ({
      productId: product.id,
      productName: product.name,
      barcode: await generateProductBarcode(product),
    }))
  );

  return results;
}

/**
 * Gera etiqueta completa com QR Code e informações do produto
 */
export async function generateProductLabel(product: Product): Promise<{
  qrCode: string;
  barcode: Buffer;
  productInfo: {
    id: number;
    name: string;
    price: string;
    quantity: number;
  };
}> {
  const [qrCode, barcode] = await Promise.all([
    generateProductQRCode(product),
    generateProductBarcode(product),
  ]);

  return {
    qrCode,
    barcode,
    productInfo: {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    },
  };
}
