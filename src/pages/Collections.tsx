import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { formatProductName } from '../lib/utils';

export const Collections: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionProducts(selectedCollection.id);
    }
  }, [selectedCollection]);

  async function fetchCollections() {
    setLoading(true);
    const { data } = await supabase.from('colecoes').select('*');
    if (data) {
      // For luxury feel, we need images. If the collection doesn't have an image field, 
      // we might pick the first product's image as a representative thumbnail.
      const collectionsWithImages = await Promise.all(data.map(async (col) => {
        const { data: prods } = await supabase
          .from('produtos')
          .select('imagem')
          .eq('colecao_id', col.id)
          .order('quantidade_estoque', { ascending: false })
          .limit(1);
        
        const thumbnail = prods && prods.length > 0 
          ? prods[0].imagem 
          : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800';
          
        return { ...col, thumbnail };
      }));
      setCollections(collectionsWithImages);
    }
    setLoading(false);
  }

  async function fetchCollectionProducts(colId: string) {
    setLoading(true);
    const { data } = await supabase
      .from('produtos')
      .select('*, colecoes(name)')
      .eq('colecao_id', colId);
    
    if (data) {
      const mapped = data.map(p => ({
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
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-4"
            >
              <Sparkles className="text-brand-gold opacity-40 shadow-sm" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-neutral-800 mb-6 tracking-tight"
            >
              Nossas Coleções
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base uppercase tracking-[0.3em] font-bold text-brand-gold opacity-70"
            >
              Histórias eternizadas em ouro e design
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {!selectedCollection ? (
              <motion.div 
                key="collections-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {collections.map((col, idx) => (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedCollection(col)}
                    className="group cursor-pointer relative overflow-hidden rounded-2xl aspect-[3/4] shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_rgba(184,142,67,0.15)] transition-all duration-700"
                  >
                    <img 
                      src={col.thumbnail} 
                      alt={col.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <div className="absolute inset-0 p-10 flex flex-col justify-end items-center text-center">
                      <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        Explorar Coleção
                      </span>
                      <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-2 tracking-wide leading-tight">
                        {col.name}
                      </h2>
                      <div className="w-12 h-[1px] bg-brand-gold/50 my-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                      <button className="flex items-center gap-2 text-white text-[10px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-all duration-500">
                        Ver Peças <ChevronRight size={14} className="text-brand-gold" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="collection-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button 
                  onClick={() => setSelectedCollection(null)}
                  className="mb-12 text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400 hover:text-brand-gold transition-colors flex items-center gap-2 group"
                >
                  <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Voltar para Coleções
                </button>

                <div className="mb-16 flex flex-col items-start gap-4">
                  <h2 className="text-4xl md:text-5xl font-serif italic text-neutral-800 tracking-tight">{selectedCollection.name}</h2>
                  <div className="w-24 h-0.5 bg-brand-gold/40 rounded-full" />
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-white/50 aspect-[3/4] rounded-2xl" />)}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {products.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        isSelected={selectedProductId === product.id}
                        onClick={() => setSelectedProductId(product.id === selectedProductId ? null : product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 rounded-3xl border-2 border-dashed border-brand-nude/20">
                    <p className="italic font-serif text-neutral-400 text-xl tracking-tight">
                      Peças exclusivas estão sendo preparadas para esta coleção.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};
