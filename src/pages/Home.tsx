import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { SalesTeam } from '../components/SalesTeam';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

import { formatProductName } from '../lib/utils';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('home-produtos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    fetchData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: prods, error } = await supabase
      .from('produtos')
      .select('*, colecoes(name)')
      .order('created_at', { ascending: false });

    let finalData = prods;

    if (error) {
      console.warn("Erro ao buscar produtos com coleções (Home), tentando select simples:", error);
      const { data: simpleProds, error: simpleError } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (simpleError) {
        console.error("Erro crítico ao buscar produtos (Home):", simpleError);
        finalData = [];
      } else {
        finalData = simpleProds;
      }
    }

    const mapAndSet = (list: any[]) => {
      const inStockList = list.filter(p => (p.quantidade_estoque || 0) > 0);
      
      const mapped = inStockList.map(p => ({
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
      setProducts(mapped);
      
      const uniqueCategories = Array.from(new Set(mapped.map(p => p.categoria).filter(Boolean)));
      setCategories(uniqueCategories as string[]);
    };

    mapAndSet(finalData || []);
    setLoading(false);
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoria === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <main>
        <Hero />

        {/* Lightweight Modern Catalog Section - Real-time In-place Filtering */}
        <section id="featured" className="py-20 md:py-28 bg-white border-b border-brand-gold/10">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            
            {/* Header Content with Compact Layout */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 border-l border-brand-gold/35 pl-5 md:pl-8">
              <div className="max-w-xl">
                <span className="text-brand-gold text-[9px] uppercase tracking-[0.4em] font-bold mb-3 block">Coleção Una Aura</span>
                <h2 className="text-3xl md:text-5xl font-serif font-light mb-4">Catálogo de Semijoias</h2>
                <p className="text-neutral-500 font-light text-xs md:text-sm italic leading-relaxed">
                  Banhadas a ouro 18k com brilho inigualável de alta joalheria. Encontre a peça ideal para exalar sua aura singular.
                </p>
              </div>

              {/* FILTER COMPONENT: Responsive and Clean (Dropdown on mobile, pristine list on desktop) */}
              <div className="relative z-35 self-start md:self-auto flex items-center gap-3">
                <SlidersHorizontal size={14} className="text-brand-gold opacity-80" />
                
                {/* Desktop view: Elegant inline text-only filter tabs */}
                <div className="hidden sm:flex items-center gap-1 bg-neutral-50 p-1.5 rounded-full border border-neutral-100">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer ${
                      !selectedCategory 
                        ? 'bg-[#1A1A1A] text-white shadow-xs' 
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Exibir Tudo
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer ${
                        selectedCategory === cat 
                          ? 'bg-brand-gold text-white shadow-xs' 
                          : 'text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Mobile view: Slick custom dropdown popover */}
                <div className="sm:hidden relative">
                  <button
                    onClick={() => setHomeDropdownOpen(!homeDropdownOpen)}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-neutral-50 hover:bg-neutral-100 border border-brand-gold/20 text-neutral-800 text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer min-w-[190px]"
                  >
                    <span>{selectedCategory || 'Categorias'}</span>
                    <ChevronDown size={12} className={`text-brand-gold transition-transform duration-300 ${homeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {homeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10 animate-fade-in" onClick={() => setHomeDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-52 bg-white border border-brand-gold/15 rounded-2xl shadow-xl z-20 py-2 overflow-hidden text-left"
                        >
                          <button
                            onClick={() => {
                              setSelectedCategory(null);
                              setHomeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-sans transition-colors ${notActive => !selectedCategory ? 'bg-brand-gold/5 font-bold text-brand-gold' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}
                          >
                            Todas as Peças (Tudo)
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setHomeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs font-sans transition-colors ${selectedCategory === cat ? 'bg-brand-gold/5 font-bold text-brand-gold' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-8 md:gap-y-16">
              {loading ? (
                 [1,2,3,4,5,6,7,8].map(i => <div key={i} className="animate-pulse bg-brand-offwhite aspect-[3/4] rounded-xl" />)
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isSelected={selectedProductId === product.id}
                    onClick={() => setSelectedProductId(product.id === selectedProductId ? null : product.id)}
                  />
                ))
              ) : (
                <div className="col-span-full py-24 text-center text-neutral-400 italic font-serif text-base bg-brand-offwhite rounded-3xl border border-dashed border-brand-gold/20 p-8">
                  Nenhuma semijoia encontrada nesta categoria em nosso estoque atual.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 md:py-32 bg-brand-offwhite relative overflow-hidden">
           <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl italic text-neutral-800 mb-8 md:mb-12">O Brilho que já existe em você.</h2>
              <p className="text-base md:text-xl text-neutral-600 font-light max-w-3xl leading-relaxed mb-12 italic">
                "Na UNA AURA, não acreditamos que as joias trazem brilho. Acreditamos que o brilho já é parte da sua essência. Nossas peças são apenas o reflexo dessa luz interior, o elo entre sua alma e sua presença no mundo."
              </p>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-brand-gold flex items-center justify-center">
                <div className="w-2 h-2 bg-brand-gold rounded-full animate-ping" />
              </div>
           </div>
           {/* Abstract Gold Glows */}
           <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-brand-gold/10 blur-[130px] rounded-full" />
           <div className="absolute top-1/3 right-0 -translate-y-1/2 w-80 h-80 bg-brand-nude/20 blur-[150px] rounded-full" />
        </section>

        <SalesTeam />

        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-light mb-4 text-[#1A1A1A]">Siga nossa Aura</h2>
            <a 
              href="https://www.instagram.com/unaaurafortaleza/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-gold text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold mb-12 md:mb-16 block hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              @unaaurafortaleza
            </a>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square relative group overflow-hidden bg-brand-offwhite">
                  <img 
                    src={`https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400&sig=${i+10}`}
                    alt="Instagram Post"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
