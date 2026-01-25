import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Products() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createMutation.mutateAsync({
        name: formData.get("name") as string,
        categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : undefined,
        quantity: Number(formData.get("quantity")),
        minStock: Number(formData.get("minStock")),
        price: formData.get("price") as string,
      });
      
      toast.success("Produto criado com sucesso!");
      setIsCreateOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar produto");
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        name: formData.get("name") as string,
        categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : null,
        quantity: Number(formData.get("quantity")),
        minStock: Number(formData.get("minStock")),
        price: formData.get("price") as string,
      });
      
      toast.success("Produto atualizado com sucesso!");
      setIsEditOpen(false);
      setEditingProduct(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar produto");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Produto excluído com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir produto");
    }
  };

  const filteredProducts = products?.filter(p => 
    filterCategory === "all" || p.categoryId?.toString() === filterCategory
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="h-64 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu inventário de produtos</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="categoryId">Categoria</Label>
                <Select name="categoryId">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input id="quantity" name="quantity" type="number" min="0" defaultValue="0" required />
                </div>
                <div>
                  <Label htmlFor="minStock">Estoque Mínimo *</Label>
                  <Input id="minStock" name="minStock" type="number" min="0" defaultValue="5" required />
                </div>
              </div>
              <div>
                <Label htmlFor="price">Preço Unitário (R$) *</Label>
                <Input id="price" name="price" type="text" placeholder="0.00" defaultValue="0.00" required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Produtos</CardTitle>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isLowStock = product.quantity <= product.minStock;
                  const isOutOfStock = product.quantity === 0;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categoryName || "Sem categoria"}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">{product.minStock}</TableCell>
                      <TableCell className="text-right">
                        R$ {typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : Number(product.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <span className="text-xs font-semibold text-destructive">ESGOTADO</span>
                        ) : isLowStock ? (
                          <span className="text-xs font-semibold text-yellow-600">BAIXO</span>
                        ) : (
                          <span className="text-xs font-semibold text-green-600">OK</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome do Produto *</Label>
                <Input id="edit-name" name="name" defaultValue={editingProduct.name} required />
              </div>
              <div>
                <Label htmlFor="edit-categoryId">Categoria</Label>
                <Select name="categoryId" defaultValue={editingProduct.categoryId?.toString() || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Quantidade *</Label>
                  <Input id="edit-quantity" name="quantity" type="number" min="0" defaultValue={editingProduct.quantity} required />
                </div>
                <div>
                  <Label htmlFor="edit-minStock">Estoque Mínimo *</Label>
                  <Input id="edit-minStock" name="minStock" type="number" min="0" defaultValue={editingProduct.minStock} required />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-price">Preço Unitário (R$) *</Label>
                <Input 
                  id="edit-price" 
                  name="price" 
                  type="text" 
                  defaultValue={typeof editingProduct.price === 'string' ? editingProduct.price : editingProduct.price.toFixed(2)} 
                  required 
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditOpen(false);
                  setEditingProduct(null);
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
