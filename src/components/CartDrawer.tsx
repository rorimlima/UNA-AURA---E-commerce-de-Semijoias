import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, MessageCircle, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [dbClient, setDbClient] = React.useState<any>(null);
  const [vendedores, setVendedores] = React.useState<any[]>([]);
  const [showSalesSelector, setShowSalesSelector] = React.useState(false);
  const [showAuthRequirement, setShowAuthRequirement] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch registered user details from the database (including address 'endereco')
  React.useEffect(() => {
    if (currentUser) {
      supabase
        .from('clientes')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (data) {
            setDbClient(data);
          } else if (error) {
            console.warn("Could not load client database data:", error.message);
          }
        });
    } else {
      setDbClient(null);
    }
  }, [currentUser]);

  // Fetch salespeople whenever drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setShowSalesSelector(false);
      setShowAuthRequirement(false);
      supabase
        .from('vendedores')
        .select('*')
        .then(({ data }) => {
          if (data) {
            setVendedores(data);
          }
        });
    }
  }, [isOpen]);

  const handleExecuteCheckout = (rawPhone: string, vendedorNome: string) => {
    // Format phone to contain only digits
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const clientName = dbClient?.nome || currentUser?.user_metadata?.nome || currentUser?.email?.split('@')[0] || 'Novo Brilho';
    const clientPhone = dbClient?.telefone || currentUser?.user_metadata?.telefone || '';
    const clientAddress = dbClient?.endereco || currentUser?.user_metadata?.endereco || '';

    let message = `✨ *PEDIDO UNA AURA* ✨\n`;
    message += `_Uma aura de elegância está por vir._\n\n`;
    message += `*Atendimento por:* ${vendedorNome}\n\n`;
    message += `*Itens Escolhidos:*\n`;
    cart.forEach(item => {
      message += `💍 ${item.name}\n   └ ${item.quantity}un • ${formatCurrency(item.price * item.quantity)}\n`;
    });
    message += `\n*VALOR TOTAL:* ${formatCurrency(total)}\n\n`;
    message += `*DADOS DA CLIENTE:*\n`;
    message += `👤 *Nome:* ${clientName}\n`;
    if (clientPhone) {
      message += `📱 *WhatsApp:* ${clientPhone}\n`;
    }
    if (clientAddress) {
      message += `📍 *Endereço de Entrega:* ${clientAddress}\n`;
    } else {
      message += `📍 *Endereço:* Não cadastrado\n`;
    }
    message += `\n_Olá ${vendedorNome}! Gostaria de prosseguir com o pagamento e entrega destas peças exclusivas._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    setShowSalesSelector(false);
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      setShowAuthRequirement(true);
      return;
    }

    // Direct, fresh fetch from vendedores table to guarantee results are shown
    const { data: freshSales, error } = await supabase
      .from('vendedores')
      .select('*');

    const activeVendedores = freshSales || vendedores;
    if (freshSales) {
      setVendedores(freshSales);
    }

    if (activeVendedores && activeVendedores.length > 0) {
      setShowSalesSelector(true);
    } else {
      // Fetch default store WhatsApp number as safe fallback
      const { data: settings } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'whatsapp_number')
        .single();

      const fallbackNumber = settings?.value || '55011999999999';
      handleExecuteCheckout(fallbackNumber, 'Consultora');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/40 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-offwhite z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-brand-gold/10 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-serif font-light text-neutral-800">Sua Sacola</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mt-1">UNA AURA — Exclusive Selection</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-brand-offwhite rounded-full transition-colors border border-transparent hover:border-brand-gold/20">
                <X size={20} className="text-neutral-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-20 h-20 rounded-full border border-brand-gold/20 flex items-center justify-center mb-6">
                    <ShoppingBag size={32} className="stroke-neutral-300 stroke-[1]" />
                  </div>
                  <p className="font-serif italic text-xl text-neutral-800">Sua sacola aguarda <br/> por uma nova luz.</p>
                  <button 
                    onClick={onClose}
                    className="mt-6 text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold border-b border-brand-gold/30 pb-1 hover:border-brand-gold transition-all"
                  >
                    Começar a brilhar
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-32 bg-brand-nude/10 rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-xl text-[#1A1A1A] leading-tight group-hover:text-brand-gold transition-colors">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter mt-2">{formatCurrency(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-brand-gold/20 rounded-full px-3 py-1 bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-neutral-400 hover:text-brand-gold"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-xs font-bold font-sans">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-neutral-400 hover:text-brand-gold"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-neutral-800">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-white border-t border-brand-gold/10 space-y-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                {currentUser ? (
                  <div className="bg-emerald-50/60 border border-emerald-150 rounded-2xl p-3.5 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <p className="text-[10px] text-emerald-800 leading-normal">
                      Sua conta está ativa (<strong>{currentUser.user_metadata?.nome || currentUser.email?.split('@')[0]}</strong>). Seus dados serão enviados de forma automática ao consultor!
                    </p>
                  </div>
                ) : (
                  <div className="bg-brand-nude/10 border border-brand-gold/10 rounded-2xl p-3.5 text-center">
                    <p className="text-[10px] text-neutral-500 leading-normal mb-1.5 italic">
                      Dica: Cadastre-se ou acesse sua conta no topo do site para salvar suas coleções e atendimento personalizado!
                    </p>
                    <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold">Aura Exclusiva ✦</span>
                  </div>
                )}

                <div className="space-y-2">
                   <div className="flex justify-between items-baseline">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Subtotal</span>
                    <span className="text-2xl font-serif text-[#1A1A1A]">{formatCurrency(total)}</span>
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-300 italic text-center font-bold">
                    Frete e taxas calculados no checkout
                  </p>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-neutral-900 text-white h-16 flex items-center justify-center gap-4 rounded-full text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-brand-gold-gradient transition-all duration-500 shadow-xl"
                >
                  <MessageCircle size={18} className="stroke-[1.5]" />
                  Finalizar no WhatsApp
                </button>
              </div>
            )}

            {/* Salespeople Selection Overlay */}
            <AnimatePresence>
              {showSalesSelector && (
                <motion.div 
                  initial={{ opacity: 0, y: '30%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '30%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="absolute inset-0 bg-white z-[80] flex flex-col"
                >
                  <div className="p-8 border-b border-brand-gold/10 flex items-center justify-between bg-brand-offwhite">
                    <div>
                      <h3 className="text-xl font-serif text-neutral-800">Selecione uma Consultora</h3>
                      <p className="text-[10px] uppercase tracking-wider text-brand-gold font-bold mt-1">Atendimento Exclusivo ✦</p>
                    </div>
                    <button 
                      onClick={() => setShowSalesSelector(false)}
                      className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-[#1A1A1A] transition-colors font-bold border border-neutral-200 hover:border-brand-gold/30 px-3 py-1.5 rounded-full bg-white cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <p className="text-xs text-neutral-500 font-light italic leading-relaxed mb-4">
                      Para lhe atender com total exclusividade, selecione uma de nossas consultoras de vendas. Os itens da sua reserva serão enviados de forma automática para ela no WhatsApp.
                    </p>
                    
                    {vendedores.map((vendedor) => (
                      <button
                        key={vendedor.id}
                        onClick={() => handleExecuteCheckout(vendedor.whatsapp || vendedor.telefone, vendedor.nome)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-brand-offwhite border border-brand-gold/10 hover:border-brand-gold/40 hover:shadow-md transition-all text-left duration-300 group cursor-pointer"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-brand-gold/20 flex-shrink-0 bg-white">
                          <img 
                            src={vendedor.foto || `https://ui-avatars.com/api/?name=${vendedor.nome}&background=F5EFED&color=B88E43`} 
                            alt={vendedor.nome} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif italic text-base text-neutral-800 group-hover:text-brand-gold truncate transition-colors">
                            {vendedor.nome}
                          </h4>
                          <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mt-0.5">
                            Consultora de Joias
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-50 group-hover:text-white transition-all transform group-hover:scale-105">
                          <MessageCircle size={14} className="stroke-[2]" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-8 border-t border-brand-gold/10 bg-brand-offwhite flex justify-center text-center">
                    <span className="text-[9.5px] uppercase tracking-wider text-neutral-400 font-bold">UNA AURA — Suporte Personalizado</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Modal Requirement Overlay */}
            <AnimatePresence>
              {showAuthRequirement && (
                <motion.div 
                  initial={{ opacity: 0, y: '30%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '30%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="absolute inset-0 bg-white z-[90] flex flex-col justify-between"
                >
                  <div className="p-8 border-b border-brand-gold/10 flex items-center justify-between bg-brand-offwhite">
                    <div>
                      <h3 className="text-xl font-serif text-neutral-800">Finalizar Reserva</h3>
                      <p className="text-[10px] uppercase tracking-wider text-brand-gold font-bold mt-1">✦ Acesso Exclusivo ✦</p>
                    </div>
                    <button 
                      onClick={() => setShowAuthRequirement(false)}
                      className="p-1 px-3 border border-neutral-200 hover:border-brand-gold/30 rounded-full transition-colors text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-neutral-800 bg-white cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full border border-brand-gold/20 bg-brand-offwhite flex items-center justify-center text-brand-gold shadow-xs mb-2">
                      <Lock size={24} className="stroke-[1.5]" />
                    </div>
                    
                    <div>
                      <h4 className="font-serif italic text-2xl text-neutral-800 leading-normal mb-3">Conexão Necessária</h4>
                      <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-xs">
                        Para garantir total segurança de seus dados e oferecer um acompanhamento personalizado VIP de nossas consultoras, a finalização de peças exclusivas é reservada para clientes cadastradas.
                      </p>
                    </div>

                    <div className="w-full pt-4 space-y-3">
                      <Link
                        to="/login?redirect=/"
                        onClick={() => { setShowAuthRequirement(false); onClose(); }}
                        className="w-full h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all duration-300"
                      >
                        Entrar em Minha Conta
                      </Link>
                      
                      <Link
                        to="/cadastro?redirect=/"
                        onClick={() => { setShowAuthRequirement(false); onClose(); }}
                        className="w-full h-12 bg-transparent text-neutral-800 border border-neutral-300 rounded-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-bold hover:border-brand-gold hover:text-brand-gold transition-all duration-300"
                      >
                        Criar Conta Nova
                      </Link>
                    </div>
                  </div>

                  <div className="p-8 border-t border-brand-gold/10 bg-brand-offwhite text-center">
                    <p className="text-[9.5px] uppercase tracking-wider text-neutral-400 font-bold">UNA AURA — Exclusive Jewelry Services</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
