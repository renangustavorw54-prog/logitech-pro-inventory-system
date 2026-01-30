import { vi } from "vitest";

export const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  execute: vi.fn().mockResolvedValue([{}]),
};

// Mocking the getDb function
export const getDb = vi.fn().mockResolvedValue(mockDb);

// Mocking specific database functions
export const getAllCategories = vi.fn().mockResolvedValue([]);
export const getCategoryById = vi.fn().mockResolvedValue(undefined);
export const createCategory = vi.fn().mockResolvedValue(1);
export const updateCategory = vi.fn().mockResolvedValue(undefined);
export const deleteCategory = vi.fn().mockResolvedValue(undefined);

export const getAllProducts = vi.fn().mockResolvedValue([]);
export const getProductById = vi.fn().mockResolvedValue(undefined);
export const getProductsByCategory = vi.fn().mockResolvedValue([]);
export const getLowStockProducts = vi.fn().mockResolvedValue([]);
export const createProduct = vi.fn().mockResolvedValue(1);
export const updateProduct = vi.fn().mockResolvedValue(undefined);
export const deleteProduct = vi.fn().mockResolvedValue(undefined);
export const updateProductQuantity = vi.fn().mockResolvedValue(undefined);

export const getAllTransactions = vi.fn().mockResolvedValue([]);
export const getTransactionsByProduct = vi.fn().mockResolvedValue([]);
export const getTransactionsByDateRange = vi.fn().mockResolvedValue([]);
export const createTransaction = vi.fn().mockResolvedValue(1);

export const getDashboardStats = vi.fn().mockResolvedValue({
  totalProducts: 0,
  lowStockCount: 0,
  totalValue: 0,
  recentTransactions: [],
});
