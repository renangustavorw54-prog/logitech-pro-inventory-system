import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Pie, PieChart, Cell, Legend } from "recharts";
import { FileText, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Reports() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: movementsData, isLoading: isLoadingMovements } = trpc.reports.movementsByPeriod.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const { data: topProductsData, isLoading: isLoadingTop } = trpc.reports.topProducts.useQuery({
    limit: 10,
  });

  const handleExportPDF = () => {
    toast.info("Funcionalidade de exportação PDF será implementada em breve");
  };

  const movementsChartData = useMemo(() => {
    if (!movementsData) return [];
    return [
      { name: 'Entradas', value: movementsData.totalEntradas, fill: 'hsl(var(--chart-1))' },
      { name: 'Saídas', value: movementsData.totalSaidas, fill: 'hsl(var(--chart-2))' },
    ];
  }, [movementsData]);

  const productChartData = useMemo(() => {
    if (!movementsData?.byProduct) return [];
    return Object.values(movementsData.byProduct)
      .sort((a: any, b: any) => (b.entradas + b.saidas) - (a.entradas + a.saidas))
      .slice(0, 10)
      .map((p: any) => ({
        name: p.productName,
        entradas: p.entradas,
        saidas: p.saidas,
      }));
  }, [movementsData]);

  if (isLoadingMovements || isLoadingTop) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="h-96 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
          <p className="text-muted-foreground">Visualize dados e tendências do seu estoque</p>
        </div>
        <Button onClick={handleExportPDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total de Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {movementsData?.totalEntradas || 0}
            </div>
            <p className="text-sm text-muted-foreground">Unidades adicionadas ao estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {movementsData?.totalSaidas || 0}
            </div>
            <p className="text-sm text-muted-foreground">Unidades retiradas do estoque</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {movementsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={movementsChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {movementsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma movimentação no período</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          {productChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entradas" fill="hsl(var(--chart-1))" name="Entradas" />
                <Bar dataKey="saidas" fill="hsl(var(--chart-2))" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos Mais Movimentados</CardTitle>
        </CardHeader>
        <CardContent>
          {topProductsData && topProductsData.length > 0 ? (
            <div className="space-y-4">
              {topProductsData.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.totalMovements} movimentações
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{product.totalQuantity}</p>
                    <p className="text-xs text-muted-foreground">unidades</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
