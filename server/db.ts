import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, products, transactions, InsertCategory, InsertProduct, InsertTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      console.warn("⚠️ [Database] DATABASE_URL ausente.");
      return null;
    }

    try {
      _db = drizzle(process.env.DATABASE_URL);
      // Teste rápido de 3 segundos
      await Promise.race([
        _db.execute(sql`SELECT 1`),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 3000))
      ]);
    } catch (error) {
      console.error("⚠️ [Database] Falha na conexão inicial:", error.message);
      // Não matamos o processo, permitimos que o tRPC tente novamente depois
      const tempDb = _db;
      _db = null; 
      return tempDb; 
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'ADMIN';
      updateSet.role = 'ADMIN';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Categories
// ============================================================================

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(data) as any;
  return Number(result.insertId);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ============================================================================
// Products
// ============================================================================

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: products.id,
    name: products.name,
    categoryId: products.categoryId,
    categoryName: categories.name,
    quantity: products.quantity,
    minStock: products.minStock,
    price: products.price,
    createdAt: products.createdAt,
    updatedAt: products.updatedAt,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .orderBy(products.name);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    id: products.id,
    name: products.name,
    categoryId: products.categoryId,
    categoryName: categories.name,
    quantity: products.quantity,
    minStock: products.minStock,
    price: products.price,
    createdAt: products.createdAt,
    updatedAt: products.updatedAt,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(eq(products.id, id))
  .limit(1);
  return result[0];
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId));
}

export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: products.id,
    name: products.name,
    categoryId: products.categoryId,
    categoryName: categories.name,
    quantity: products.quantity,
    minStock: products.minStock,
    price: products.price,
    createdAt: products.createdAt,
    updatedAt: products.updatedAt,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(sql`${products.quantity} <= ${products.minStock}`)
  .orderBy(products.quantity);
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data) as any;
  return Number(result.insertId);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function updateProductQuantity(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ quantity }).where(eq(products.id, id));
}

// ============================================================================
// Transactions
// ============================================================================

export async function getAllTransactions() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: transactions.id,
    productId: transactions.productId,
    productName: products.name,
    userId: transactions.userId,
    userName: users.name,
    type: transactions.type,
    quantity: transactions.quantity,
    notes: transactions.notes,
    createdAt: transactions.createdAt,
  })
  .from(transactions)
  .leftJoin(products, eq(transactions.productId, products.id))
  .leftJoin(users, eq(transactions.userId, users.id))
  .orderBy(desc(transactions.createdAt));
}

export async function getTransactionsByProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: transactions.id,
    productId: transactions.productId,
    productName: products.name,
    userId: transactions.userId,
    userName: users.name,
    type: transactions.type,
    quantity: transactions.quantity,
    notes: transactions.notes,
    createdAt: transactions.createdAt,
  })
  .from(transactions)
  .leftJoin(products, eq(transactions.productId, products.id))
  .leftJoin(users, eq(transactions.userId, users.id))
  .where(eq(transactions.productId, productId))
  .orderBy(desc(transactions.createdAt));
}

export async function getTransactionsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: transactions.id,
    productId: transactions.productId,
    productName: products.name,
    userId: transactions.userId,
    userName: users.name,
    type: transactions.type,
    quantity: transactions.quantity,
    notes: transactions.notes,
    createdAt: transactions.createdAt,
  })
  .from(transactions)
  .leftJoin(products, eq(transactions.productId, products.id))
  .leftJoin(users, eq(transactions.userId, users.id))
  .where(and(
    gte(transactions.createdAt, startDate),
    lte(transactions.createdAt, endDate)
  ))
  .orderBy(desc(transactions.createdAt));
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(transactions).values(data) as any;
  return Number(result.insertId);
}

// ============================================================================
// Dashboard Statistics
// ============================================================================

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalProductsResult] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const totalProducts = totalProductsResult?.count || 0;

  const lowStockItems = await getLowStockProducts();
  const lowStockCount = lowStockItems.length;

  const allProducts = await db.select().from(products);
  const totalValue = allProducts.reduce((sum, p) => {
    const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
    return sum + (price * p.quantity);
  }, 0);

  const recentTransactions = await db.select({
    id: transactions.id,
    productId: transactions.productId,
    productName: products.name,
    type: transactions.type,
    quantity: transactions.quantity,
    createdAt: transactions.createdAt,
  })
  .from(transactions)
  .leftJoin(products, eq(transactions.productId, products.id))
  .orderBy(desc(transactions.createdAt))
  .limit(10);

  return {
    totalProducts,
    lowStockCount,
    totalValue,
    recentTransactions,
  };
}
