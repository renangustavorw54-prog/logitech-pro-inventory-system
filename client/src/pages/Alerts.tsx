import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function Alerts() {
  const { data: lowStockProducts, isLoading } = trpc.products.getLowStock.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Alertas</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="h-96 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const criticalItems = lowStockProducts?.filter(p => p.quantity === 0) || [];
  const lowItems = lowStockProducts?.filter(p => p.quantity > 0 && p.quantity <= p.minStock) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alertas de Estoque</h1>
        <p className="text-muted-foreground">Produtos que precisam de atenção imediata</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Itens com estoque baixo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems.length}</div>
            <p className="text-xs text-muted-foreground">Produtos esgotados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowItems.length}</div>
            <p className="text-xs text-muted-foreground">Abaixo do mínimo</p>
          </CardContent>
        </Card>
      </div>

      {criticalItems.length > 0 && (
        <Card className="border-red-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Produtos Esgotados (Crítico)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Estoque Atual</TableHead>
                  <TableHead className="text-right">Estoque Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalItems.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.categoryName || "Sem categoria"}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{product.quantity}</TableCell>
                    <TableCell className="text-right">{product.minStock}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">ESGOTADO</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {lowItems.length > 0 && (
        <Card className="border-yellow-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Estoque Atual</TableHead>
                  <TableHead className="text-right">Estoque Mínimo</TableHead>
                  <TableHead className="text-right">Diferença</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowItems.map((product) => {
                  const difference = product.minStock - product.quantity;
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categoryName || "Sem categoria"}</TableCell>
                      <TableCell className="text-right font-bold text-yellow-600">{product.quantity}</TableCell>
                      <TableCell className="text-right">{product.minStock}</TableCell>
                      <TableCell className="text-right text-muted-foreground">-{difference}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                          BAIXO
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {lowStockProducts?.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tudo em ordem!</h3>
              <p className="text-muted-foreground">
                Todos os produtos estão com estoque acima do nível mínimo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
