import { useEffect, useState } from 'react';
import { useProveedorStore } from '../store/proveedorStore';
import type { Proveedor, OrdenCompra } from '../store/proveedorStore';
import { useProductStore } from '../store/productStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Plus, Pencil, Trash2, Search, Package, Truck, Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Producto {
  id: number | string;
  nombre: string;
  precio: number | string;
}

interface DetalleOrden {
  id?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  producto?: Producto;
}

// ✅ Badge con variantes compatibles con el componente real
const getEstadoBadge = (estado: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'PENDIENTE': 'secondary',
    'ENVIADO': 'secondary',
    'RECIBIDO': 'default',
    'CANCELADO': 'destructive'
  };
  return variants[estado] || 'default';
};

const getEstadoIcon = (estado: string) => {
  const icons: Record<string, typeof Clock> = {
    'PENDIENTE': Clock,
    'ENVIADO': Truck,
    'RECIBIDO': CheckCircle,
    'CANCELADO': XCircle
  };
  return icons[estado] || Package;
};

// Componente interno para cada orden
const OrderItem = ({ orden, index, onRecibir, onEdit, onDelete }: {
  orden: OrdenCompra;
  index: number;
  onRecibir: (id: number) => void;
  onEdit: (orden: OrdenCompra) => void;
  onDelete: (id: number) => void;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const EstadoIcon = getEstadoIcon(orden.estado);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-slate-900/40 border-white/10 hover:border-white/20 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <EstadoIcon className="h-5 w-5" />
                <h3 className="text-lg font-bold text-white">{orden.numeroOrden}</h3>
                <Badge variant={getEstadoBadge(orden.estado)}>{orden.estado}</Badge>
              </div>
              <p className="text-sm text-slate-400">Proveedor: {orden.proveedor?.nombre}</p>
              <p className="text-sm text-slate-400">Fecha: {new Date(orden.fechaOrden).toLocaleDateString()}</p>
              <p className="text-sm text-slate-400">Total: ${orden.total.toFixed(2)}</p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-400 hover:text-blue-300 mt-2"
              >
                {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            </div>
            <div className="flex gap-2">
              {orden.estado !== 'RECIBIDO' && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(orden)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(orden.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              {orden.estado === 'ENVIADO' && (
                <Button onClick={() => onRecibir(orden.id)} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Recibir
                </Button>
              )}
            </div>
          </div>
          {showDetails && orden.detalles && orden.detalles.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Productos:</h4>
              <div className="space-y-2">
                {orden.detalles.map((detalle) => (
                  <div key={detalle.id} className="flex justify-between items-center text-sm">
                    <span className="text-white">{detalle.producto?.nombre || 'Producto'}</span>
                    <div className="flex gap-4 text-slate-400">
                      <span>Cantidad: {detalle.cantidad}</span>
                      <span>Precio: ${detalle.precioUnitario.toFixed(2)}</span>
                      <span>Subtotal: ${detalle.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ProveedoresPage = () => {
  const {
    proveedores,
    ordenesCompra,
    fetchProveedores,
    fetchOrdenesCompra,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    createOrdenCompra,
    recibirOrdenCompra,
    updateOrdenCompra,
    deleteOrdenCompra
  } = useProveedorStore();

  const { productos, fetchProductos } = useProductStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'proveedores' | 'ordenes'>('proveedores');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrdenModalOpen, setIsOrdenModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [editingOrden, setEditingOrden] = useState<OrdenCompra | null>(null);

  const [formData, setFormData] = useState<Partial<Proveedor>>({
    nombre: '',
    contacto: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: ''
  });

  const [ordenFormData, setOrdenFormData] = useState({
    proveedorId: 0,
    fechaOrden: new Date().toISOString().split('T')[0],
    fechaEntregaEsperada: '',
    notas: '',
    detalles: [] as DetalleOrden[]
  });

  useEffect(() => {
    fetchProveedores();
    fetchOrdenesCompra();
    fetchProductos();
  }, [fetchProveedores, fetchOrdenesCompra, fetchProductos]);

  const filteredProveedores = proveedores.filter((p: Proveedor) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (proveedor: Proveedor | null = null) => {
    if (proveedor) {
      setEditingProveedor(proveedor);
      setFormData(proveedor);
    } else {
      setEditingProveedor(null);
      setFormData({ nombre: '', contacto: '', email: '', telefono: '', direccion: '', notas: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProveedor) {
        await updateProveedor(editingProveedor.id, formData);
        toast.success('Proveedor actualizado exitosamente');
      } else {
        await createProveedor(formData);
        toast.success('Proveedor creado exitosamente');
      }
      setIsModalOpen(false);
      fetchProveedores();
    } catch {
      toast.error('Error al guardar proveedor');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      try {
        await deleteProveedor(id);
        toast.success('Proveedor eliminado exitosamente');
        fetchProveedores();
      } catch {
        toast.error('Error al eliminar proveedor');
      }
    }
  };

  const addDetalle = () => {
    setOrdenFormData({
      ...ordenFormData,
      detalles: [...ordenFormData.detalles, { productoId: 0, cantidad: 1, precioUnitario: 0 }]
    });
  };

  const removeDetalle = (index: number) => {
    const newDetalles = [...ordenFormData.detalles];
    newDetalles.splice(index, 1);
    setOrdenFormData({ ...ordenFormData, detalles: newDetalles });
  };

  const updateDetalle = (index: number, field: 'productoId' | 'cantidad' | 'precioUnitario', value: number) => {
    const newDetalles = [...ordenFormData.detalles];
    newDetalles[index][field] = value;
    setOrdenFormData({ ...ordenFormData, detalles: newDetalles });
  };

  const calculateTotal = () => {
    return ordenFormData.detalles.reduce((sum, detalle) => sum + (detalle.cantidad * detalle.precioUnitario), 0);
  };

  const handleOpenOrdenModal = (orden: OrdenCompra | null = null) => {
    if (orden) {
      setEditingOrden(orden);
      setOrdenFormData({
        proveedorId: orden.proveedorId,
        fechaOrden: new Date(orden.fechaOrden).toISOString().split('T')[0],
        fechaEntregaEsperada: orden.fechaEntregaEsperada ? new Date(orden.fechaEntregaEsperada).toISOString().split('T')[0] : '',
        notas: orden.notas || '',
        detalles: (orden.detalles || []).map(detalle => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario
        }))
      });
    } else {
      setEditingOrden(null);
      setOrdenFormData({
        proveedorId: 0,
        fechaOrden: new Date().toISOString().split('T')[0],
        fechaEntregaEsperada: '',
        notas: '',
        detalles: []
      });
    }
    setIsOrdenModalOpen(true);
  };

  const handleOrdenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ordenFormData.detalles.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }
    if (ordenFormData.proveedorId === 0) {
      toast.error('Debe seleccionar un proveedor');
      return;
    }
    try {
      if (editingOrden) {
        await updateOrdenCompra(editingOrden.id, ordenFormData);
        toast.success('Orden de compra actualizada exitosamente');
      } else {
        await createOrdenCompra(ordenFormData);
        toast.success('Orden de compra creada exitosamente');
      }
      setIsOrdenModalOpen(false);
      setOrdenFormData({
        proveedorId: 0,
        fechaOrden: new Date().toISOString().split('T')[0],
        fechaEntregaEsperada: '',
        notas: '',
        detalles: []
      });
      fetchOrdenesCompra();
    } catch {
      toast.error('Error al guardar orden de compra');
    }
  };

  const handleDeleteOrden = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta orden de compra?')) {
      try {
        await deleteOrdenCompra(id);
        toast.success('Orden de compra eliminada exitosamente');
        fetchOrdenesCompra();
      } catch {
        toast.error('Error al eliminar orden de compra');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Gestión de Proveedores</h2>
          <p className="text-slate-400">Administra proveedores y órdenes de compra</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {activeTab === 'proveedores' && (
            <Button onClick={() => handleOpenModal()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Proveedor
            </Button>
          )}
          {activeTab === 'ordenes' && (
            <Button onClick={() => handleOpenOrdenModal()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('proveedores')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'proveedores'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Proveedores ({filteredProveedores.length})
        </button>
        <button
          onClick={() => setActiveTab('ordenes')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'ordenes'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Órdenes de Compra ({ordenesCompra.length})
        </button>
      </div>

      {activeTab === 'proveedores' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProveedores.map((proveedor, index) => (
            <motion.div
              key={proveedor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-slate-900/40 border-white/10 hover:border-white/20 transition-all">
                <CardHeader>
                  <CardTitle className="text-white">{proveedor.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Contacto: {proveedor.contacto}</p>
                    <p className="text-sm text-slate-400">Email: {proveedor.email}</p>
                    <p className="text-sm text-slate-400">Teléfono: {proveedor.telefono}</p>
                    <p className="text-sm text-slate-400">Dirección: {proveedor.direccion}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenModal(proveedor)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(proveedor.id)}
                      className="flex-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {ordenesCompra.map((orden, index) => (
            <OrderItem
              key={orden.id}
              orden={orden}
              index={index}
              onRecibir={recibirOrdenCompra}
              onEdit={handleOpenOrdenModal}
              onDelete={handleDeleteOrden}
            />
          ))}
        </div>
      )}

      {/* Modal Proveedor */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="Contacto"
            value={formData.contacto}
            onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            required
          />
          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            required
          />
          <Input
            label="Notas"
            value={formData.notas || ''}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingProveedor ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Orden de Compra */}
      <Modal isOpen={isOrdenModalOpen} onClose={() => setIsOrdenModalOpen(false)} title={editingOrden ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}>
        <form onSubmit={handleOrdenSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Proveedor</label>
            <select
              value={ordenFormData.proveedorId}
              onChange={(e) => setOrdenFormData({ ...ordenFormData, proveedorId: Number(e.target.value) })}
              className="w-full h-10 rounded-md border border-white/20 bg-slate-900/50 px-3 text-white"
              required
            >
              <option value="0">Seleccionar proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <Input
            label="Fecha de Orden"
            type="date"
            value={ordenFormData.fechaOrden}
            onChange={(e) => setOrdenFormData({ ...ordenFormData, fechaOrden: e.target.value })}
            required
          />
          <Input
            label="Fecha de Entrega Esperada"
            type="date"
            value={ordenFormData.fechaEntregaEsperada}
            onChange={(e) => setOrdenFormData({ ...ordenFormData, fechaEntregaEsperada: e.target.value })}
          />
          <Input
            label="Notas"
            value={ordenFormData.notas}
            onChange={(e) => setOrdenFormData({ ...ordenFormData, notas: e.target.value })}
          />

          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Productos</h3>
              <Button type="button" onClick={addDetalle} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
            </div>

            <div className="space-y-3">
              {ordenFormData.detalles.map((detalle, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm text-slate-400 mb-1">Producto</label>
                    <select
                      value={detalle.productoId}
                      onChange={(e) => {
                        const productId = Number(e.target.value);
                        const product = productos.find(p => Number(p.id) === productId);
                        updateDetalle(index, 'productoId', productId);
                        if (product) {
                          updateDetalle(index, 'precioUnitario', Number(product.precio));
                        } else {
                          updateDetalle(index, 'precioUnitario', 0);
                        }
                      }}
                      className="w-full h-10 rounded-md border border-white/20 bg-slate-900/50 px-3 text-white"
                      required
                    >
                      <option value="0">Seleccionar producto</option>
                      {productos.map((p) => (
                        <option key={p.id} value={Number(p.id)}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-sm text-slate-400 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={detalle.cantidad}
                      onChange={(e) => updateDetalle(index, 'cantidad', Number(e.target.value))}
                      className="w-full h-10 rounded-md border border-white/20 bg-slate-900/50 px-3 text-white"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm text-slate-400 mb-1">Precio Unitario</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detalle.precioUnitario}
                      onChange={(e) => updateDetalle(index, 'precioUnitario', Number(e.target.value))}
                      className="w-full h-10 rounded-md border border-white/20 bg-slate-900/50 px-3 text-white"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm text-slate-400 mb-1">Subtotal</label>
                    <div className="h-10 flex items-center px-3 text-white">
                      ${(detalle.cantidad * detalle.precioUnitario).toFixed(2)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeDetalle(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <MinusCircle className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>

            {ordenFormData.detalles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                <div className="text-right">
                  <span className="text-slate-400">Total: </span>
                  <span className="text-xl font-bold text-white">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsOrdenModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingOrden ? 'Actualizar' : 'Crear Orden'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};