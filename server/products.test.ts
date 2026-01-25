import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Products Router", () => {
  it("should list all products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should create a new product", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product",
      quantity: 10,
      minStock: 5,
      price: "19.99",
    });

    expect(result.success).toBe(true);
    expect(typeof result.id).toBe("number");
  });

  it("should get low stock products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const lowStockProducts = await caller.products.getLowStock();
    expect(Array.isArray(lowStockProducts)).toBe(true);
  });
});

describe("Categories Router", () => {
  it("should list all categories", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("should create a new category", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.create({
      name: "Test Category",
      description: "Test description",
    });

    expect(result.success).toBe(true);
    expect(typeof result.id).toBe("number");
  });
});

describe("Dashboard Router", () => {
  it("should get dashboard statistics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.stats();
    expect(stats).toBeDefined();
    expect(typeof stats?.totalProducts).toBe("number");
    expect(typeof stats?.lowStockCount).toBe("number");
    expect(typeof stats?.totalValue).toBe("number");
    expect(Array.isArray(stats?.recentTransactions)).toBe(true);
  });
});
