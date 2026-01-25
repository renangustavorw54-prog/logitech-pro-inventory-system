import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Categories() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories, isLoading, refetch } = trpc.categories.list.useQuery();
  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();
  const deleteMutation = trpc.categories.delete.useMutation();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createMutation.mutateAsync({
        name: formData.get("name") as string,
        description: formData.get("description") as string || undefined,
      });
      
      toast.success("Categoria criada com sucesso!");
      setIsCreateOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar categoria");
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        name: formData.get("name") as string,
        description: formData.get("description") as string || undefined,
      });
      
      toast.success("Categoria atualizada com sucesso!");
      setIsEditOpen(false);
      setEditingCategory(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar categoria");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Categoria excluída com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir categoria");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Categorias</h1>
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
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Organize seus produtos por categorias</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" rows={3} />
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
          <CardTitle>Lista de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || "—"}</TableCell>
                    <TableCell>{new Date(category.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsEditOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(category.id, category.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome da Categoria *</Label>
                <Input id="edit-name" name="name" defaultValue={editingCategory.name} required />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea id="edit-description" name="description" rows={3} defaultValue={editingCategory.description || ""} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditOpen(false);
                  setEditingCategory(null);
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
