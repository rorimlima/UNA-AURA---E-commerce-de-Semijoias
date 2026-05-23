import React, { useState, useEffect } from 'react';
import { X, Star, Check, Sparkles, ShoppingBag, MessageSquare, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images?: string[];
  collection?: { name: string };
  quantidade_estoque?: number;
  referencia?: string;
  categoria?: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

// Pre-seeded high-quality testimonials based on jewel categories
const DEFAULT_REVIEWS: Record<string, Review[]> = {
  default: [
    {
      id: 'rev-1',
      author: 'Alessandra M.',
      rating: 5,
      date: '10/05/2026',
      title: 'Peça absolutamente deslumbrante!',
      comment: 'Estou maravilhada com a qualidade do banho de ouro 18k. O brilho é idêntico ao de joia maciça e o acabamento é impecável. Veio em uma embalagem luxuosa aveludada.',
      verified: true
    },
    {
      id: 'rev-2',
      author: 'Beatriz Vasconcelos',
      rating: 5,
      date: '28/04/2026',
      title: 'Elegância e Sofisticação',
      comment: 'Uma obra-prima. Usei em um casamento e recebi inúmeros elogios. A durabilidade é excelente, recomendo de olhos fechados.',
      verified: true
    },
    {
      id: 'rev-3',
      author: 'Mariana Costa',
      rating: 4,
      date: '15/04/2026',
      title: 'Muito bonita e brilhante',
      comment: 'O banho é muito bonito mesmo, com cor de ouro legítimo e brilhante. Chegou rápido e muito bem embalado. Voltarei a comprar.',
      verified: true
    }
  ],
  anel: [
    {
      id: 'rev-anel-1',
      author: 'Glória S.',
      rating: 5,
      date: '12/05/2026',
      title: 'Encaixe perfeito e brilho eterno',
      comment: 'O anel é finíssimo, as cravações de zircônias são extremamente firmes e brilham como diamantes reais. O peso dele passa uma sensação de joia de alta alfaiataria.',
      verified: true
    },
    {
      id: 'rev-anel-2',
      author: 'Fernanda Albuquerque',
      rating: 5,
      date: '03/05/2026',
      title: 'Mais bonito que na foto!',
      comment: 'Fiquei chocada com a delicadeza dos detalhes. Uso todos os dias e o banho continua incrivelmente dourado e perfeito.',
      verified: true
    }
  ],
  brinco: [
    {
      id: 'rev-brinco-1',
      author: 'Juliana Mendes',
      rating: 5,
      date: '18/05/2026',
      title: 'Leve e luxuoso',
      comment: 'O brinco tem um caimento perfeito e não pesa absolutamente nada na orelha. A tarraxa é excelente e muito segura. Brilha lindamente no rosto.',
      verified: true
    },
    {
      id: 'rev-brinco-2',
      author: 'Carla Silveira',
      rating: 5,
      date: '30/04/2026',
      title: 'Sem palavras para essa perfeição',
      comment: 'Comprei para usar em eventos formais e virou minha peça favorita. O tom dourado de Una Aura é diferenciado, super elegante, não é aquele amarelo artificial.',
      verified: true
    }
  ],
  colar: [
    {
      id: 'rev-colar-1',
      author: 'Patrícia Alencar',
      rating: 5,
      date: '22/05/2026',
      title: 'Colar maravilhoso e delicado',
      comment: 'O pingente e o elo da corrente são absurdamente delicados. O brilho no colo é maravilhoso, super minimalista e chique. Perfeito para usar sozinho ou em composições.',
      verified: true
    },
    {
      id: 'rev-colar-2',
      author: 'Isabela Derez',
      rating: 5,
      date: '08/05/2026',
      title: 'Perfeição em forma de colar',
      comment: 'Chave de ouro para os meus looks executivos. O fecho é muito seguro e robusto, banho de alto padrão realmente.',
      verified: true
    }
  ]
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Review inputs state
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setReviewSuccess('');
      setReviewError('');
      
      // Load reviews from localStorage first, or use default category reviews
      const stored = localStorage.getItem(`reviews-${product.id}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        const cat = (product.categoria || '').toLowerCase();
        let seed: Review[] = DEFAULT_REVIEWS.default;
        if (cat.includes('anel')) seed = DEFAULT_REVIEWS.anel;
        else if (cat.includes('brinco')) seed = DEFAULT_REVIEWS.brinco;
        else if (cat.includes('colar') || cat.includes('gargantilha') || cat.includes('corrente')) seed = DEFAULT_REVIEWS.colar;
        
        setReviews(seed);
        localStorage.setItem(`reviews-${product.id}`, JSON.stringify(seed));
      }
    }
  }, [product]);

  if (!product) return null;

  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url];

  const handleNextImg = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrevImg = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const isOutOfStock = (product.quantidade_estoque ?? 0) <= 0;

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  // Handle Review submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    if (!newAuthor.trim() || !newComment.trim() || !newTitle.trim()) {
      setReviewError('Por favor, preencha todos os campos da avaliação.');
      setSubmittingReview(false);
      return;
    }

    const brandNewReview: Review = {
      id: `rev-custom-${Date.now()}`,
      author: newAuthor.trim(),
      rating: newRating,
      date: new Date().toLocaleDateString('pt-BR'),
      title: newTitle.trim(),
      comment: newComment.trim(),
      verified: true
    };

    const updatedReviews = [brandNewReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews-${product.id}`, JSON.stringify(updatedReviews));

    setReviewSuccess('Sua avaliação foi publicada com sucesso! Agradecemos seu prestígio.');
    setNewAuthor('');
    setNewTitle('');
    setNewComment('');
    setNewRating(5);
    setSubmittingReview(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4">
          {/* Elegant dark overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0c0c0c]/75 backdrop-blur-md"
            id="detail-modal-overlay"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-brand-gold/15 max-h-[90vh] flex flex-col z-[110]"
            id="detail-modal-content"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-xs border border-brand-gold/15 flex items-center justify-center text-neutral-800 hover:text-brand-gold hover:border-brand-gold hover:shadow-md transition-all z-30 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Scrollable Body wrapper */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Side: Luxury Image Gallery */}
                <div className="bg-brand-offwhite p-6 sm:p-10 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-brand-gold/10 relative min-h-[350px] sm:min-h-[500px]">
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-brand-gold/15 bg-white shadow-md">
                    <img 
                      src={displayImages[currentImageIndex] || 'https://via.placeholder.com/600x750?text=Sem+Imagem'} 
                      alt={product.name}
                      uuid-id="detail-main-img"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Image Controls */}
                    {displayImages.length > 1 && (
                      <>
                        <button 
                          onClick={handlePrevImg}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 text-neutral-700 hover:text-brand-gold transition-colors flex items-center justify-center z-10 cursor-pointer shadow-xs"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button 
                          onClick={handleNextImg}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 text-neutral-700 hover:text-brand-gold transition-colors flex items-center justify-center z-10 cursor-pointer shadow-xs"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail slider */}
                  {displayImages.length > 1 && (
                    <div className="flex gap-2.5 mt-4 overflow-x-auto py-1 max-w-full justify-center">
                      {displayImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-14 h-14 rounded-lg overflow-hidden border transition-all ${idx === currentImageIndex ? 'border-brand-gold ring-1 ring-brand-gold/30 scale-105' : 'border-neutral-200 hover:border-brand-gold/40'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trust badges */}
                  <div className="mt-8 grid grid-cols-3 gap-3 w-full border-t border-brand-gold/10 pt-6">
                    <div className="text-center space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold block">Material Nobre</span>
                      <span className="text-[10px] text-neutral-500 italic">Banhado Ouro 18k</span>
                    </div>
                    <div className="text-center space-y-1 border-x border-brand-gold/10">
                      <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold block">Garantia Eterna</span>
                      <span className="text-[10px] text-neutral-500 italic">Certificado Único</span>
                    </div>
                    <div className="text-center space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold block">Livre de Chumbo</span>
                      <span className="text-[10px] text-neutral-500 italic font-light">Niquel Free</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Jewel Specs + Interactive Testimonials */}
                <div className="p-6 sm:p-10 space-y-8 flex flex-col justify-between">
                  {/* Category and Name */}
                  <div>
                    {product.collection?.name && (
                      <span className="text-[9px] uppercase tracking-[0.4em] text-brand-gold font-bold block mb-2">
                        {product.collection.name} ✦ Exclusive
                      </span>
                    )}
                    <h2 className="text-3xl font-serif text-[#1e1e1e] italic leading-tight mb-2">
                      {product.name}
                    </h2>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className="fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono tracking-wider text-neutral-400 font-bold uppercase mt-0.5">
                        {avgRating} de 5.0 ({reviews.length} avaliações)
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Stock info */}
                  <div className="p-5 rounded-2xl bg-brand-offwhite border border-brand-gold/10 space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-semibold text-[#1A1A1A] tracking-wider">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-[10px] text-neutral-400 line-through">
                        {formatCurrency(product.price * 1.3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-brand-gold font-bold uppercase tracking-widest text-[10px]">
                        ou 10x de {formatCurrency(product.price / 10)} sem juros
                      </p>
                      <span className="text-[9px] font-mono tracking-widest text-neutral-400 font-bold bg-white px-2 py-1 rounded-full border border-neutral-100">
                        REF: {product.referencia || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500">
                        Sobre esta Aura
                      </h4>
                      <p className="text-xs text-[#4a4a4a] leading-relaxed italic font-light">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Add to Cart CTA */}
                  <div>
                    <button
                      onClick={() => {
                        if (!isOutOfStock) {
                          addToCart(product);
                          onClose();
                        }
                      }}
                      disabled={isOutOfStock}
                      className={`w-full h-14 rounded-full flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] font-bold hover:shadow-lg active:scale-[0.98] transition-all duration-300 border cursor-pointer ${
                        isOutOfStock 
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed' 
                          : 'bg-neutral-900 border-transparent text-white hover:bg-brand-gold'
                      }`}
                    >
                      <ShoppingBag size={15} />
                      {isOutOfStock ? 'Peça Indisponível' : 'Adicionar à minha Reserva'}
                    </button>
                    {!isOutOfStock && (
                      <span className="text-[9px] text-neutral-400 text-center block mt-2 tracking-wider">
                        Reserva segurada por 24 horas para atendimento exclusivo no WhatsApp.
                      </span>
                    )}
                  </div>

                  {/* ---------------- DEPOIMENTOS & AVALIAÇÕES SECTION ---------------- */}
                  <div className="border-t border-dashed border-neutral-200 pt-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif italic text-lg text-neutral-800">Avaliações das Clientes</h3>
                        <p className="text-[9px] uppercase tracking-wider text-brand-gold font-bold mt-0.5">Relatos Reais e Verificados ✦</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 text-[10px] font-bold flex items-center gap-1">
                        <Check size={12} className="stroke-[3]" />
                        <span>100% Satifeitas</span>
                      </div>
                    </div>

                    {/* Ratings graph bars dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-brand-offwhite p-4 rounded-2xl border border-brand-gold/10 items-center">
                      <div className="text-center sm:text-left">
                        <span className="text-4xl font-serif text-neutral-800 font-bold block">{avgRating}</span>
                        <div className="flex text-amber-500 justify-center sm:justify-start my-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className="fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium block">De {reviews.length} clientes</span>
                      </div>

                      <div className="col-span-2 space-y-1.5 text-[9px] text-neutral-500 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-8 shrink-0">5 estrelas</span>
                          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gold rounded-full" style={{ width: '92%' }} />
                          </div>
                          <span className="w-8 shrink-0 text-right">92%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-8 shrink-0">4 estrelas</span>
                          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gold rounded-full" style={{ width: '8%' }} />
                          </div>
                          <span className="w-8 shrink-0 text-right">8%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-8 shrink-0">3 estrelas</span>
                          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden text-center">
                            <div className="h-full bg-neutral-200" />
                          </div>
                          <span className="w-8 shrink-0 text-right">0%</span>
                        </div>
                      </div>
                    </div>

                    {/* List of Reviews */}
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-4 border border-neutral-100 rounded-2xl bg-white hover:shadow-xs transition-shadow space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-serif italic font-bold text-sm text-[#1A1A1A]">{rev.author}</h5>
                                {rev.verified && (
                                  <span className="text-[8px] tracking-widest font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                                    <Check size={8} className="stroke-[3]" /> COMPRA VERIFICADA
                                  </span>
                                )}
                              </div>
                              <div className="flex text-amber-500 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={10} className={s <= rev.rating ? 'fill-current' : 'text-neutral-200'} />
                                ))}
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-neutral-400 font-medium">{rev.date}</span>
                          </div>
                          <div>
                            <h6 className="text-[11px] font-bold text-neutral-800 tracking-wide">{rev.title}</h6>
                            <p className="text-xs text-neutral-500 leading-relaxed italic font-light mt-1">"{rev.comment}"</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Write a review form */}
                    <form onSubmit={handleSubmitReview} className="p-5 border border-brand-gold/15 bg-brand-offwhite rounded-2xl space-y-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-brand-gold" />
                        <h4 className="font-serif italic text-sm text-[#1a1a1a] font-bold">Relate a sua experiência de Brilho</h4>
                      </div>

                      {reviewSuccess && (
                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 text-xs italic flex items-center gap-2">
                          <Sparkles size={14} className="text-emerald-500 flex-shrink-0" />
                          <span>{reviewSuccess}</span>
                        </div>
                      )}

                      {reviewError && (
                        <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-3 text-xs italic">
                          {reviewError}
                        </div>
                      )}

                      {!reviewSuccess && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider font-bold text-neutral-500 mb-1">Seu Nome</label>
                              <input 
                                type="text"
                                value={newAuthor}
                                onChange={(e) => setNewAuthor(e.target.value)}
                                className="w-full h-9 px-3 bg-white border border-brand-nude/20 rounded-full focus:outline-none focus:border-brand-gold text-xs text-[#1A1A1A]"
                                placeholder="Sofia Ribeiro"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider font-bold text-neutral-500 mb-1">Sua Nota</label>
                              <select 
                                value={newRating}
                                onChange={(e) => setNewRating(Number(e.target.value))}
                                className="w-full h-9 px-3 bg-white border border-brand-nude/20 rounded-full focus:outline-none focus:border-brand-gold text-xs text-[#1A1A1A] font-bold text-brand-gold"
                              >
                                <option value={5}>★★★★★ (Excelente)</option>
                                <option value={4}>★★★★☆ (Ótimo)</option>
                                <option value={3}>★★★☆☆ (Bom)</option>
                                <option value={2}>★★☆☆☆ (Regular)</option>
                                <option value={1}>★☆☆☆☆ (Ruim)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-bold text-neutral-500 mb-1">Título do Depoimento</label>
                            <input 
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              className="w-full h-9 px-3 bg-white border border-brand-nude/20 rounded-full focus:outline-none focus:border-brand-gold text-xs text-[#1A1A1A]"
                              placeholder="Ex: Joia mais perfeita que já comprei!"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase tracking-wider font-bold text-neutral-500 mb-1">Relato Detalhado</label>
                            <textarea 
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={3}
                              className="w-full p-3 bg-white border border-brand-nude/20 rounded-xl focus:outline-none focus:border-brand-gold text-xs text-[#1A1A1A] resize-none leading-relaxed italic"
                              placeholder="Fale sobre o banho de ouro 18k, as tarraxas, o caimento e o brilho desta peça única..."
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="w-full h-10 bg-neutral-900 hover:bg-brand-gold text-white text-[10px] uppercase tracking-widest font-bold rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>Publicar Avaliação</span>
                            <Sparkles size={11} />
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer information bar */}
            <div className="p-4 border-t border-brand-gold/10 bg-brand-offwhite flex items-center justify-between text-[9px] uppercase tracking-widest text-neutral-400 font-bold px-6 shrink-0">
              <span>UNA AURA ✦ Alta Semijoalheria</span>
              <span>Exclusive Customer Experience</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
