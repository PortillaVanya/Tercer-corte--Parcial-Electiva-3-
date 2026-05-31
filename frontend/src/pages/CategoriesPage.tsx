import { useEffect, useState } from 'react';
import { useCategoryStore } from '../store/categoryStore';
import type { Categoria } from '../store/categoryStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const CategoriesPage = () => {
  const { categories, isLoading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category: Categoria | null = null) => {
    if (category) {
      setEditingCategory(category);
      setNombre(category.nombre);
    } else {
      setEditingCategory(null);
      setNombre('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, nombre);
        toast.warning('Categoría actualizada');
      } else {
        await createCategory(nombre);
        toast.success('Categoría creada');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Error al procesar categoría');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta categoría? Se desvincularán los productos asociados.')) {
      try {
        await deleteCategory(id);
        toast.error('Categoría eliminada');
      } catch {
        toast.error('Error al eliminar');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-900/40 p-8 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Categorías</h2>
          <p className="text-slate-400 font-medium">Organiza tus productos por familias y tipos.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="h-14 px-8 text-lg font-bold premium-gradient rounded-2xl shadow-blue-500/20 shadow-2xl hover:scale-105 active:scale-95 transition-all gap-3">
          <Plus className="h-6 w-6" /> Nueva Categoría
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-12 w-12" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={category.id}
            >
              <Card className="bg-slate-900/40 border-white/10 hover:border-blue-500/50 transition-all group h-full flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <FolderTree className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white uppercase tracking-tight">{category.nombre}</h3>
                        <p className="text-xs text-slate-500">ID: #{category.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(category)} className="hover:bg-blue-500/20 hover:text-blue-400">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)} className="hover:bg-red-500/20 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex-1">
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Productos ({category.productos?.length || 0})</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.productos && category.productos.length > 0 ? (
                        category.productos.map(p => (
                          <span key={p.id} className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2 py-1 rounded-md">
                            {p.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600 italic">Sin productos asociados</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
        className="bg-[#0f172a] border-white/10"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Categoría</label>
            <Input
              placeholder="Ej: Electrónica, Hogar..."
              className="bg-slate-950 border-white/10 text-white h-12 rounded-xl"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="px-10 h-12 premium-gradient font-bold rounded-xl shadow-lg shadow-blue-500/20">
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
