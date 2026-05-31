import { useState, useEffect } from 'react';
import { Search, Package, FolderTree, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import { useProveedorStore } from '../store/proveedorStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  type: 'producto' | 'categoria' | 'proveedor';
  id: string | number;
  title: string;
  subtitle?: string;
  path: string;
}

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const navigate = useNavigate();
  const { productos } = useProductStore();
  const { categories } = useCategoryStore();
  const { proveedores } = useProveedorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % results.length);
        }
        if (e.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        }
        if (e.key === 'Enter' && results.length > 0) {
          navigate(results[selectedIndex].path);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Buscar productos
    productos.forEach((p) => {
      if (p.nombre.toLowerCase().includes(term) || p.descripcion?.toLowerCase().includes(term)) {
        searchResults.push({
          type: 'producto',
          id: p.id,
          title: p.nombre,
          subtitle: `$${p.precio.toFixed(2)} - Stock: ${p.stock}`,
          path: `/products`,
        });
      }
    });

    // Buscar categorías
    categories.forEach((c) => {
      if (c.nombre.toLowerCase().includes(term)) {
        searchResults.push({
          type: 'categoria',
          id: c.id,
          title: c.nombre,
          path: `/categories`,
        });
      }
    });

    // Buscar proveedores
    proveedores.forEach((p) => {
      if (p.nombre.toLowerCase().includes(term) || p.email.toLowerCase().includes(term)) {
        searchResults.push({
          type: 'proveedor',
          id: p.id,
          title: p.nombre,
          subtitle: p.email,
          path: `/suppliers`,
        });
      }
    });

    setResults(searchResults.slice(0, 10));
    setSelectedIndex(0);
  }, [searchTerm, productos, categories, proveedores]);

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      producto: Package,
      categoria: FolderTree,
      proveedor: Users,
    };
    return icons[type] || Package;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      producto: 'text-blue-500',
      categoria: 'text-purple-500',
      proveedor: 'text-green-500',
    };
    return colors[type] || 'text-slate-500';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors group"
        title="Búsqueda global (Ctrl+K)"
      >
        <Search className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos, categorías, proveedores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="w-full h-12 pl-12 pr-12 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-500 bg-slate-800 rounded">
                    ESC
                  </kbd>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    {searchTerm ? 'No se encontraron resultados' : 'Escribe para buscar...'}
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map((result, index) => {
                      const Icon = getIcon(result.type);
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            navigate(result.path);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            index === selectedIndex ? 'bg-blue-500/20' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-white/5 ${getTypeColor(result.type)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-white">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-sm text-slate-400">{result.subtitle}</p>
                            )}
                          </div>
                          <kbd className="px-2 py-1 text-xs text-slate-500 bg-slate-800 rounded">
                            {index + 1}
                          </kbd>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↑↓</kbd> Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↵</kbd> Seleccionar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">ESC</kbd> Cerrar
                  </span>
                </div>
                <span>{results.length} resultados</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
