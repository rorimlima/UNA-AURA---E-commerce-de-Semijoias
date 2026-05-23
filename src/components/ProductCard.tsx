import React from 'react';
import { 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  Circle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images?: string[];
  collection?: { name: string };
  quantidade_estoque?: number;
}

interface ProductCardProps {
  product: Product;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onClick }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const isOutOfStock = (product.quantidade_estoque ?? 0) <= 0;
  
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  React.useEffect(() => {
    if (!isSelected) {
      setCurrentImageIndex(0);
    }
  }, [isSelected]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className={`group cursor-pointer transition-all duration-500 rounded-xl p-3 border border-transparent ${
        isSelected 
          ? 'scale-[1.02] border-brand-gold/20 bg-white shadow-[0_30px_60px_-15px_rgba(184,142,67,0.18)]' 
          : 'hover:border-brand-gold/10 hover:bg-gradient-to-b hover:from-white hover:to-brand-gold/5 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)]'
      }`}
    >
      <div className={`relative aspect-[4/5] overflow-hidden bg-brand-nude/10 rounded-lg transition-all duration-500 ${
        isSelected ? 'ring-1 ring-brand-gold shadow-[0_15px_30px_rgba(184,142,67,0.1)]' : 'ring-1 ring-transparent'
      }`}>
        <AnimatePresence mode="wait">
          <motion.img 
            key={displayImages[currentImageIndex]}
            src={displayImages[currentImageIndex] || 'https://via.placeholder.com/400x500?text=Sem+Imagem'} 
            alt={product.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale-[50%]' : ''}`}
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {isSelected && displayImages.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all z-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all z-30"
            >
              <ChevronRight size={16} />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
              {displayImages.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-brand-gold w-3' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
        
        {isOutOfStock && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
              Esgotado
            </span>
          </div>
        )}
        
        {/* Quick Add Overlay - Desktop */}
        <div className={`absolute inset-0 bg-neutral-900/5 md:bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 hidden md:flex ${isOutOfStock ? 'pointer-events-none' : ''}`}>
          {!isOutOfStock && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="w-full h-11 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold translate-y-4 group-hover:translate-y-0 transition-all duration-500 rounded-full shadow-md bg-gradient-to-br from-brand-gold/10 to-brand-gold/20 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold-gradient hover:text-white hover:border-transparent hover:shadow-xl active:scale-95"
            >
              <ShoppingBag size={14} />
              ADICIONAR
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 text-center px-2 sm:px-4 pb-2">
        {product.collection && (
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] text-brand-gold font-bold mb-2 sm:mb-3 block opacity-80 transition-opacity group-hover:opacity-100">
             {product.collection.name}
          </span>
        )}
        <h3 className="font-serif text-sm sm:text-base md:text-lg lg:text-xl text-neutral-900 group-hover:text-brand-gold transition-colors duration-500 leading-tight italic tracking-wide mb-2 sm:mb-3 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex flex-col items-center gap-0.5 sm:gap-1 mb-4 sm:mb-6">
          <p className="text-neutral-900 text-sm sm:text-base font-semibold tracking-[0.1em]">{formatCurrency(product.price)}</p>
          <p className="text-neutral-400 text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-medium opacity-70">
            ou 10x de {formatCurrency(product.price / 10)}
          </p>
        </div>
        
        {product.description && (
          <p className="hidden sm:block text-[10px] text-neutral-500 font-light italic line-clamp-2 max-w-[240px] mx-auto mb-6 h-10 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {product.description}
          </p>
        )}

        {/* Unique Selling Points */}
        <div className="hidden sm:flex items-center justify-center gap-5 py-4 border-t border-brand-gold/10 mt-2 opacity-60 group-hover:opacity-100 transition-all">
          <span className="text-[8px] uppercase tracking-[0.3em] text-brand-gold font-bold">Ouro 18k</span>
          <div className="w-1 h-1 rounded-full bg-brand-gold/30" />
          <span className="text-[8px] uppercase tracking-[0.3em] text-brand-gold font-bold">Premium</span>
          <div className="w-1 h-1 rounded-full bg-brand-gold/30" />
          <span className="text-[8px] uppercase tracking-[0.3em] text-brand-gold font-bold">Eterna</span>
        </div>
        
        {/* Mobile Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            !isOutOfStock && addToCart(product);
          }}
          disabled={isOutOfStock}
          className={`md:hidden mt-4 w-full h-10 sm:h-12 rounded-full flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold transition-all active:scale-95 shadow-sm border ${
            isOutOfStock 
              ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed' 
              : 'bg-gradient-to-br from-brand-gold/10 to-brand-gold/20 text-brand-gold border-brand-gold/20 active:bg-brand-gold-gradient active:text-white active:shadow-lg'
          }`}
        >
           {isOutOfStock ? (
             'INDISPONÍVEL'
           ) : (
             <>
               <ShoppingBag size={12} />
               ADICIONAR
             </>
           )}
        </button>
      </div>
    </motion.div>
  );
};
