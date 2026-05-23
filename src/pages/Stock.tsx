import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { CartDrawer } from '../components/CartDrawer';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Filter, X } from 'lucide-react';

import { formatProductName } from '../lib/utils';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const Stock: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  const activeCategory = searchParams.get('categoria');
  const activeSearch = searchParams.get('busca');
  const minPrice = searchParams.get('min_preco') ? Number(searchParams.get('min_preco')) : null;
  const maxPrice = searchParams.get('max_preco') ? Number(searchParams.get('max_preco')) : null;

  useEffect(() => {
    const channel = supabase
      .channel('stock-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        () => {
          fetchStock();
        }
      )
      .subscribe();

    fetchStock();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchStock() {
    setLoading(true);
    // Use select('*, colecoes(name)') for internal join, with fallback
    const { data, error } = await supabase
      .from('produtos')
      .select('*, colecoes(name)');
    
    let finalData = data;

    if (error) {
      console.warn("Erro ao buscar estoque com coleções, tentando select simples:", error);
      const { data: simpleData, error: simpleError } = await supabase
        .from('produtos')
        .select('*');
      
      if (simpleError) {
        console.error("Erro crítico ao buscar estoque:", simpleError);
        finalData = [];
      } else {
        finalData = simpleData;
      }
    }

    const mapAndSet = (list: any[]) => {
      const mappedData = list.map(p => ({
        ...p,
        name: formatProductName(p.nome || 'Peça Sem Nome'),
        price: (p.preco_venda || 0) / 100,
        image_url: p.imagem,
        images: p.galeria || p.imagens || (p.imagem ? [p.imagem] : []),
        referencia: p.referencia || 'N/A',
        description: p.descricao || '',
        quantidade_estoque: p.quantidade_estoque || 0,
        collection: p.colecoes
      }));
      setProducts(mappedData);
      
      const cats = Array.from(new Set(mappedData.map(p => p.categoria).filter(Boolean)));
      setAllCategories(cats as string[]);
    };

    mapAndSet(finalData || []);
    setLoading(false);
  }

  useEffect(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter(p => p.categoria === activeCategory);
    }
    if (activeSearch) {
      const searchLower = activeSearch.toLowerCase().trim();
      result = result.filter(p => 
        (p.name || '').toLowerCase().includes(searchLower) || 
        (p.referencia || '').toLowerCase().includes(searchLower) ||
        (p.categoria || '').toLowerCase().includes(searchLower)
      );
    }
    if (minPrice !== null && !isNaN(minPrice)) {
      result = result.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      result = result.filter(p => p.price <= maxPrice);
    }
    setFilteredProducts(result);
  }, [activeCategory, activeSearch, minPrice, maxPrice, products]);

  const toggleCategory = (cat: string) => {
    if (activeCategory === cat) {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: cat });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <main className="pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Package size={16} className="text-brand-gold" />
                <span className="text-brand-gold text-[10px] uppercase tracking-[0.4em] font-bold block">Alta Semijoia</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-[#1A1A1A]">Curadoria de Luxo</h1>
              <p className="mt-4 text-neutral-500 font-light text-sm md:text-base max-w-xl italic leading-relaxed">
                Cada peça em nosso estoque foi selecionada para refletir a luz interior de quem a usa. Peças banhadas a 10 milésimos de ouro 18k, com acabamento de joalheria.
              </p>
            </div>
            
            <div className="relative z-20 self-start md:self-auto">
              <button 
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="px-6 h-11 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold bg-white text-neutral-800 border border-brand-gold/30 hover:border-brand-gold transition-all flex items-center justify-between gap-4 cursor-pointer shadow-xs min-w-[220px]"
              >
                <span>{activeCategory ? `Filtrar: ${activeCategory}` : 'Filtrar por Categoria'}</span>
                <span className={`text-[8px] text-brand-gold transition-transform duration-300 ${filterDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              <AnimatePresence>
                {filterDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setFilterDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 md:left-auto left-0 mt-2 w-56 bg-white border border-brand-gold/15 rounded-2xl shadow-xl z-20 py-2.5 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setSearchParams({});
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-xs font-sans transition-all flex items-center justify-between ${!activeCategory ? 'bg-brand-gold/5 text-brand-gold font-bold' : 'text-neutral-500 hover:text-brand-gold hover:bg-brand-gold/5'}`}
                      >
                        <span>Todas as Joias</span>
                        {!activeCategory && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />}
                      </button>
                      
                      {allCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            toggleCategory(cat);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-xs font-sans transition-all flex items-center justify-between ${activeCategory === cat ? 'bg-brand-gold/5 text-brand-gold font-bold' : 'text-neutral-500 hover:text-brand-gold hover:bg-brand-gold/5'}`}
                        >
                          <span>{cat}</span>
                          {activeCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-8 md:gap-y-16">
            {loading ? (
               [1,2,3,4,5,6,7,8].map(i => <div key={i} className="animate-pulse bg-brand-offwhite aspect-[3/4] rounded" />)
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={product.id} 
                  className="relative"
                >
                  <ProductCard 
                    product={product} 
                    isSelected={selectedProductId === product.id}
                    onClick={() => setSelectedProductId(product.id === selectedProductId ? null : product.id)}
                  />
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Ref: {product.referencia || 'N/A'}</span>
                      <div className="flex items-center gap-2">
                        {product.quantidade_estoque > 0 ? (
                           <>
                             <span className="relative flex h-1.5 w-1.5">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                             </span>
                             <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-500">
                               {product.quantidade_estoque} Uni.
                             </span>
                           </>
                        ) : (
                          <span className="text-[9px] uppercase tracking-widest font-bold text-red-400">
                            Esgotado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center">
                <p className="font-serif italic text-2xl text-neutral-300">
                  {activeSearch ? 'Nenhum item corresponde à sua busca.' : 'Nenhum produto encontrado nesta categoria.'}
                </p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="mt-6 text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold border-b border-brand-gold/30 pb-1 cursor-pointer"
                >
                  Ver todo o estoque
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <ProductDetailModal
        product={products.find(p => p.id === selectedProductId) || null}
        isOpen={selectedProductId !== null}
        onClose={() => setSelectedProductId(null)}
      />

      <Footer />
    </div>
  );
};
