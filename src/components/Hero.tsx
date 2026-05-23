import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatProductName } from '../lib/utils';
import { useCart } from '../context/CartContext';

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export const Hero: React.FC<HeroProps> = ({ 
  title = <>O brilho que <br/> <span className="italic">já existe</span> <br/> em você.</>, 
  subtitle = "Peças banhadas a ouro 18k com acabamento de alta joalheria. Projetadas para elevar sua aura." 
}) => {
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        // Try to fetch featured first
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('destaque', true)
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.warn("Could not fetch featured product (maybe 'destaque' column is missing), picking first available:", error);
          const { data: firstProd } = await supabase.from('produtos').select('*').limit(1).maybeSingle();
          if (firstProd) {
            setFeaturedProduct({
              ...firstProd,
              name: formatProductName(firstProd.nome || ''),
              price: (firstProd.preco_venda || 0) / 100,
              image_url: firstProd.imagem
            });
          }
        } else if (data) {
          setFeaturedProduct({
            ...data,
            name: formatProductName(data.nome || ''),
            price: (data.preco_venda || 0) / 100,
            image_url: data.imagem
          });
        }
      } catch (err) {
        console.error("Hero component error:", err);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col md:flex-row items-center bg-brand-offwhite pt-24 overflow-hidden">
      {/* Left Content */}
      <div className="w-full md:w-1/2 p-8 md:p-24 flex flex-col justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold mb-8"
        >
          Semijoias de Luxo
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-8xl font-serif font-light mb-6 md:mb-8 leading-[1.1] md:leading-[0.95] text-[#1A1A1A]"
        >
          {title}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-neutral-500 text-xs md:text-base font-light mb-12 max-w-[280px] md:max-w-sm leading-relaxed italic"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap gap-4"
        >
          <Link 
            to="/estoque" 
            className="bg-brand-gold-gradient text-white px-10 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            Ver Coleção Completa
          </Link>
        </motion.div>
      </div>

      {/* Right Content - Visual Presence */}
      <div className="w-full md:w-1/2 h-[60vh] md:h-screen bg-brand-nude relative">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#D4AF37_0%,_transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[400px] h-[70%] max-h-[540px] border border-white/40 p-4 rounded-[120px]"
        >
          <div className="w-full h-full rounded-[100px] bg-brand-offwhite flex flex-col items-center justify-center text-center overflow-hidden relative shadow-2xl">
            <img 
              src={featuredProduct?.image_url || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800"} 
              alt={featuredProduct?.name || "Premium Collection"} 
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-gold/5 to-brand-gold/20" />
            
            {featuredProduct && (
              <div className="absolute bottom-0 left-0 right-0 z-10 p-8 pt-12 bg-gradient-to-t from-black/60 to-transparent">
                <div className="serif text-3xl md:text-5xl text-brand-gold italic mb-2">Destaque</div>
                <div className="serif text-lg tracking-[0.2em] uppercase opacity-70 text-white font-bold">{featuredProduct.name}</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Dynamic Badge for Featured Product */}
        {featuredProduct && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute bottom-12 right-6 md:right-12 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/50 flex gap-4 items-center z-20"
          >
            <button 
              onClick={() => addToCart(featuredProduct)}
              className="w-12 h-12 bg-brand-gold-gradient rounded-lg flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg active:scale-95"
            >
               <ShoppingBag size={24} />
            </button>
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-brand-gold font-bold mb-1">Destaque</p>
              <p className="font-serif text-lg leading-tight text-neutral-800 italic">{featuredProduct.name}</p>
              <p className="text-xs font-bold text-neutral-900 mt-1 tracking-widest">{formatCurrency(featuredProduct.price)}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Side Decor */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-12 opacity-30 z-30">
        <div className="[writing-mode:vertical-rl] text-[9px] uppercase tracking-[0.5em] font-light rotate-180">Elegância Atemporal</div>
        <div className="w-[1px] h-24 bg-brand-gold mx-auto" />
        <div className="[writing-mode:vertical-rl] text-[9px] uppercase tracking-[0.5em] font-light rotate-180">Edição Limitada</div>
      </div>
    </section>
  );
};
