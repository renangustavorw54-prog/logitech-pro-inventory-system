import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpCircle, ArrowDownCircle, History as HistoryIcon } from "lucide-react";

export default function History() {
  const { data: transactions, isLoading } = trpc.transactions.list.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Histórico</h1>
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
      <div>
        <h1 className="text-3xl font-bold">Histórico de Transações</h1>
        <p className="text-muted-foreground">Visualize todas as movimentações de estoque</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {new Date(t.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{t.productName}</TableCell>
                      <TableCell>
                        {t.type === 'ENTRADA' ? (
                          <Badge variant="default" className="bg-green-600">
                            <ArrowUpCircle className="mr-1 h-3 w-3" />
                            ENTRADA
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <ArrowDownCircle className="mr-1 h-3 w-3" />
                            SAÍDA
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={t.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}>
                          {t.type === 'ENTRADA' ? '+' : '-'}{t.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{t.userName || "Sistema"}</TableCell>
                      <TableCell className="max-w-xs truncate">{t.notes || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma transação registrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
