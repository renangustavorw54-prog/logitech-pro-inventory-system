import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Movements() {
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);

  const { data: products } = trpc.products.list.useQuery();
  const createMutation = trpc.transactions.create.useMutation();
  const { refetch: refetchProducts } = trpc.products.list.useQuery();

  const handleEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createMutation.mutateAsync({
        productId: Number(formData.get("productId")),
        type: "ENTRADA",
        quantity: Number(formData.get("quantity")),
        notes: formData.get("notes") as string || undefined,
      });
      
      toast.success("Entrada registrada com sucesso!");
      setIsEntryOpen(false);
      refetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar entrada");
    }
  };

  const handleExit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createMutation.mutateAsync({
        productId: Number(formData.get("productId")),
        type: "SAIDA",
        quantity: Number(formData.get("quantity")),
        notes: formData.get("notes") as string || undefined,
      });
      
      toast.success("Saída registrada com sucesso!");
      setIsExitOpen(false);
      refetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar saída");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Movimentações</h1>
        <p className="text-muted-foreground">Registre entradas e saídas de estoque</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-600" />
              Entrada de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Registre a entrada de produtos no estoque, como compras ou devoluções.
            </p>
            <Dialog open={isEntryOpen} onOpenChange={setIsEntryOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="default">
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Registrar Entrada
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Entrada de Estoque</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEntry} className="space-y-4">
                  <div>
                    <Label htmlFor="entry-productId">Produto *</Label>
                    <Select name="productId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name} (Estoque atual: {p.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="entry-quantity">Quantidade *</Label>
                    <Input id="entry-quantity" name="quantity" type="number" min="1" required />
                  </div>
                  <div>
                    <Label htmlFor="entry-notes">Observações</Label>
                    <Textarea id="entry-notes" name="notes" rows={3} placeholder="Motivo da entrada, fornecedor, etc." />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEntryOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Registrando..." : "Registrar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-red-600" />
              Saída de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Registre a saída de produtos do estoque, como vendas ou transferências.
            </p>
            <Dialog open={isExitOpen} onOpenChange={setIsExitOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  Registrar Saída
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Saída de Estoque</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleExit} className="space-y-4">
                  <div>
                    <Label htmlFor="exit-productId">Produto *</Label>
                    <Select name="productId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name} (Estoque atual: {p.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="exit-quantity">Quantidade *</Label>
                    <Input id="exit-quantity" name="quantity" type="number" min="1" required />
                  </div>
                  <div>
                    <Label htmlFor="exit-notes">Observações</Label>
                    <Textarea id="exit-notes" name="notes" rows={3} placeholder="Motivo da saída, cliente, etc." />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsExitOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="destructive" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Registrando..." : "Registrar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estoque Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="low">Estoque Baixo</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {products?.map(p => (
                <div key={p.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.categoryName || "Sem categoria"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{p.quantity}</p>
                    <p className="text-xs text-muted-foreground">Mínimo: {p.minStock}</p>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="low" className="space-y-4">
              {products?.filter(p => p.quantity <= p.minStock).map(p => (
                <div key={p.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.categoryName || "Sem categoria"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-destructive">{p.quantity}</p>
                    <p className="text-xs text-muted-foreground">Mínimo: {p.minStock}</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
