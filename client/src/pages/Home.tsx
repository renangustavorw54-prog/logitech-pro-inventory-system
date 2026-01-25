import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Home() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
      </div>
    );
  }

  // Prepare chart data from recent transactions
  const chartData = stats.recentTransactions.reduce((acc, t) => {
    const date = new Date(t.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      if (t.type === 'ENTRADA') {
        existing.entradas += t.quantity;
      } else {
        existing.saidas += t.quantity;
      }
    } else {
      acc.push({
        date,
        entradas: t.type === 'ENTRADA' ? t.quantity : 0,
        saidas: t.type === 'SAIDA' ? t.quantity : 0,
      });
    }
    return acc;
  }, [] as Array<{ date: string; entradas: number; saidas: number }>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu estoque em tempo real</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Itens abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Valor do inventário</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Últimas transações</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entradas" fill="hsl(var(--chart-1))" name="Entradas" />
                <Bar dataKey="saidas" fill="hsl(var(--chart-2))" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma movimentação recente</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{t.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${t.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'ENTRADA' ? '+' : '-'}{t.quantity}
                    </span>
                    <p className="text-xs text-muted-foreground">{t.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhuma transação registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
