import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, Search, SlidersHorizontal } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  onCartOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCartOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const { cart, total } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('busca') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_preco') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_preco') || '');
  const [showPriceFilters, setShowPriceFilters] = useState(false);

  // Keep search state in sync with URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get('busca') || '');
    setMinPrice(searchParams.get('min_preco') || '');
    setMaxPrice(searchParams.get('max_preco') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    const query = searchQuery.trim();
    if (query) params.set('busca', query);
    
    const min = minPrice.trim();
    if (min) params.set('min_preco', min);
    
    const max = maxPrice.trim();
    if (max) params.set('max_preco', max);
    
    const cat = searchParams.get('categoria');
    if (cat) params.set('categoria', cat);

    const qs = params.toString();
    navigate(qs ? `/estoque?${qs}` : '/estoque');
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = [
    { name: 'Estoque', href: '/estoque' },
    { name: 'Destaques', href: '/#featured' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-brand-offwhite/90 backdrop-blur-md border-b border-brand-gold/20">
      {!isSupabaseConfigured && (
        <div className="bg-amber-600 text-neutral-100 text-[9px] sm:text-[10px] text-center font-sans py-1.5 px-3 uppercase tracking-[0.1em] font-medium flex items-center justify-center gap-2 border-b border-gold/15">
          <span>⚠️ BANCO OFFLINE: SUPABASE NÃO CONFIGURADO</span>
          <span className="hidden lg:inline opacity-80 font-normal">| Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel ou no arquivo .env para renderizar dados dinâmicos.</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-20 md:h-24 flex items-center justify-between">
        {/* Left Section: Mobile Menu & Desktop Links */}
        <div className="flex-1 flex items-center">
          <button 
            className="md:hidden p-2 text-neutral-600 mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          
          <div className="hidden md:flex gap-4 lg:gap-8 items-center text-[9.5px] uppercase tracking-[0.25em] font-medium text-[#1A1A1A]">
            <Link to="/" className="hover:text-brand-gold transition-colors">Início</Link>
            <Link to="/colecoes" className="hover:text-brand-gold transition-colors">Coleções</Link>
            <Link to="/estoque" className="hover:text-brand-gold transition-colors">Nossas Joias</Link>
            
            <div className="h-3 w-[1px] bg-brand-gold/20 mx-1" />
            
            {/* Elegant Categories Dropdown */}
            <div 
              className="relative py-2 group"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button 
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="hover:text-brand-gold transition-colors flex items-center gap-1.5 cursor-pointer text-[9.5px] uppercase tracking-[0.25em] font-medium text-[#1A1A1A]"
              >
                Categorias 
                <span className="text-[7px] text-brand-gold opacity-75 group-hover:rotate-180 transition-transform duration-350">▼</span>
              </button>
              
              <AnimatePresence>
                {categoriesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 mt-1.5 w-48 bg-white border border-brand-gold/15 rounded-2xl shadow-xl py-3 z-50 overflow-hidden"
                  >
                    {['Anéis', 'Brincos', 'Colares', 'Pulseiras', 'Pingentes'].map(cat => (
                      <Link 
                        key={cat}
                        to={`/estoque?categoria=${encodeURIComponent(cat)}`} 
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="block px-5 py-2 text-xs text-neutral-600 hover:text-brand-gold hover:bg-brand-gold/5 transition-all text-left font-sans"
                      >
                        {cat}
                      </Link>
                    ))}
                    <div className="border-t border-brand-gold/5 my-2" />
                    <Link 
                      to="/estoque" 
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="block px-5 py-1.5 text-[9px] text-brand-gold hover:text-[#1A1A1A] hover:bg-brand-gold/5 transition-all text-left font-bold uppercase tracking-widest"
                    >
                      Ver Tudo
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="/#featured" className="hover:text-brand-gold transition-colors">Destaques</a>
          </div>
        </div>

        {/* Center Section: Logo */}
        <div className="flex-shrink-0 flex justify-center px-2">
          <Link to="/">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-serif tracking-[0.25em] md:tracking-[0.35em] text-[#1A1A1A] font-light whitespace-nowrap">
              UNA AURA
            </h1>
          </Link>
        </div>

        {/* Right Section: Cart & Icons */}
        <div className="flex-1 flex items-center justify-end gap-2 md:gap-5">
          
          {/* Elegant Desktop Search Bar & Price Filters */}
          <div className="relative hidden md:block">
            <form 
              onSubmit={handleSearchSubmit} 
              className="flex items-center relative max-w-[140px] lg:max-w-[200px]"
            >
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowPriceFilters(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar joias..."
                className="w-full h-8 pl-8 pr-7 text-[11px] bg-white border border-brand-gold/15 hover:border-brand-gold/30 focus:border-brand-gold rounded-full transition-all focus:outline-none placeholder-neutral-400 font-sans text-neutral-800"
              />
              <button 
                type="submit" 
                className="absolute left-2.5 text-brand-gold/60 hover:text-brand-gold transition-colors flex items-center justify-center p-0 cursor-pointer"
              >
                <Search size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowPriceFilters(!showPriceFilters)}
                className={`absolute right-2.5 flex items-center justify-center p-0 cursor-pointer transition-colors ${showPriceFilters || minPrice || maxPrice ? 'text-brand-gold font-bold scale-105' : 'text-neutral-400 hover:text-brand-gold'}`}
                title="Filtros de Preço"
              >
                <SlidersHorizontal size={11} />
              </button>
            </form>

            <AnimatePresence>
              {showPriceFilters && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPriceFilters(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-brand-gold/15 rounded-2xl shadow-xl p-5 z-50 space-y-4 font-sans text-neutral-805"
                  >
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gold flex items-center gap-1.5 font-sans">
                        <SlidersHorizontal size={10} /> Filtro de Preço
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowPriceFilters(false)}
                        className="text-neutral-400 hover:text-[#1A1A1A] p-0 cursor-pointer flex items-center justify-center bg-transparent border-none"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-neutral-400 font-bold mb-1">Mínimo (R$)</label>
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="Ex: 50"
                          className="w-full h-8 px-2.5 bg-brand-offwhite border border-brand-gold/10 rounded-lg text-[10px] focus:outline-none focus:border-brand-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-neutral-400 font-bold mb-1">Máximo (R$)</label>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="Ex: 500"
                          className="w-full h-8 px-2.5 bg-brand-offwhite border border-brand-gold/10 rounded-lg text-[10px] focus:outline-none focus:border-brand-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice('');
                          setMaxPrice('');
                        }}
                        className="flex-1 h-7 border border-brand-gold/15 hover:border-brand-gold text-brand-gold text-[9px] uppercase tracking-widest font-bold rounded-full transition-all cursor-pointer bg-transparent"
                      >
                        Limpar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          handleSearchSubmit(e);
                          setShowPriceFilters(false);
                        }}
                        className="flex-1 h-7 bg-neutral-900 hover:bg-brand-gold text-white text-[9px] uppercase tracking-widest font-bold rounded-full transition-all cursor-pointer border-none"
                      >
                        Filtrar
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* User Section (Logged In vs Guest) */}
          {user ? (
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
              <span className="text-[9px] uppercase tracking-[0.15em] text-brand-gold font-bold flex items-center gap-1 bg-brand-gold/5 px-2.5 py-1 rounded-full border border-brand-gold/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Juliana / {user.user_metadata?.nome || user.email?.split('@')[0]}
              </span>
              <button 
                onClick={handleLogout}
                className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold hover:text-red-500 transition-colors mt-1 flex items-center gap-1"
              >
                <LogOut size={10} /> Sair
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
              <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 font-bold">Faça parte de Una Aura</span>
              <Link 
                to="/login"
                className="text-[10.5px] uppercase tracking-widest font-serif font-bold text-brand-gold hover:text-[#1A1A1A] transition-all mt-0.5 underline underline-offset-4 decoration-brand-gold/30 flex items-center gap-1.5 cursor-pointer"
              >
                <User size={12} className="text-brand-gold" /> Entrar / Cadastro
              </Link>
            </div>
          )}

          {/* User trigger for mobile/smaller viewports */}
          {user ? (
            <button 
              onClick={handleLogout}
              className="w-10 h-10 sm:hidden rounded-full border border-brand-gold/20 flex items-center justify-center text-neutral-500 hover:text-brand-gold hover:border-brand-gold transition-all bg-white shadow-xs cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut size={15} />
            </button>
          ) : (
            <Link 
              to="/login"
              className="w-10 h-10 sm:hidden rounded-full border border-brand-gold/20 flex items-center justify-center text-neutral-500 hover:text-brand-gold hover:border-brand-gold transition-all bg-white shadow-xs cursor-pointer"
              title="Entrar / Cadastrar"
            >
              <User size={15} />
            </Link>
          )}

          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Reserva Exclusiva</span>
            <span className="text-xs font-semibold uppercase tracking-tighter">
              {cartCount === 0 
                ? 'Sua Sacola' 
                : `${cartCount.toString().padStart(2, '0')} Itens — ${formatCurrency(total)}`
              }
            </span>
          </div>

          <div className="flex items-center">
            <button 
              onClick={onCartOpen}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-brand-gold/20 flex items-center justify-center relative text-neutral-800 hover:text-brand-gold hover:border-brand-gold transition-all bg-white shadow-sm"
            >
              <ShoppingBag size={18} className="stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[9px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-brand-offwhite border-b border-brand-gold/20 p-8 flex flex-col gap-6 text-center items-center shadow-lg"
          >
            {/* Elegant Mobile Search Bar & Price Filters */}
            <form 
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setIsMenuOpen(false);
              }} 
              className="w-full max-w-[280px] flex flex-col gap-3 mb-2"
            >
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar joias..."
                  className="w-full h-10 pl-11 pr-4 text-xs bg-white border border-brand-gold/15 rounded-full focus:outline-none focus:border-brand-gold text-neutral-800 placeholder-neutral-400 font-sans"
                />
                <button 
                  type="submit" 
                  className="absolute left-4 text-brand-gold/60 flex items-center justify-center p-0 cursor-pointer animate-none bg-transparent border-none"
                >
                  <Search size={14} />
                </button>
              </div>

              {/* Price Filter inputs for Mobile */}
              <div className="w-full grid grid-cols-2 gap-2 text-left font-sans">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-neutral-400 font-bold mb-1 pl-1">Mínimo (R$)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min (ex: 50)"
                    className="w-full h-9 px-3 bg-white border border-brand-gold/15 rounded-full text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-brand-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-neutral-400 font-bold mb-1 pl-1">Máximo (R$)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max (ex: 500)"
                    className="w-full h-9 px-3 bg-white border border-brand-gold/15 rounded-full text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-brand-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </form>

            <Link to="/colecoes" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif italic text-neutral-700 hover:text-brand-gold">
              Coleções
            </Link>
            <Link to="/estoque" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif italic text-neutral-700 hover:text-brand-gold">
              Nossas Joias
            </Link>
            <div className="w-full max-w-[250px] text-center">
              <button 
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="w-full flex items-center justify-center gap-2 text-xl font-serif italic text-neutral-700 hover:text-brand-gold py-1"
              >
                <span>Categorias</span>
                <span className={`text-[9px] transition-transform duration-300 ${categoriesDropdownOpen ? 'rotate-180 text-brand-gold' : 'text-neutral-400'}`}>▼</span>
              </button>
              
              <AnimatePresence>
                {categoriesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden flex flex-col items-center gap-3.5 bg-brand-gold/[0.03] border border-brand-gold/10 rounded-2xl py-4 mt-2"
                  >
                    {['Anéis', 'Brincos', 'Colares', 'Pulseiras', 'Pingentes'].map(cat => (
                      <Link 
                        key={cat}
                        to={`/estoque?categoria=${encodeURIComponent(cat)}`}
                        onClick={() => { setIsMenuOpen(false); setCategoriesDropdownOpen(false); }}
                        className="text-sm font-medium uppercase tracking-widest text-neutral-500 hover:text-brand-gold py-0.5"
                      >
                        {cat}
                      </Link>
                    ))}
                    <div className="w-[100px] h-[1px] bg-brand-gold/10" />
                    <Link 
                      to="/estoque"
                      onClick={() => { setIsMenuOpen(false); setCategoriesDropdownOpen(false); }}
                      className="text-xs uppercase tracking-widest font-bold text-brand-gold"
                    >
                      Ver Todas
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a href="/#featured" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif italic text-neutral-700 hover:text-brand-gold">
              Destaques
            </a>
            
            <hr className="w-full border-brand-gold/10" />
            
            {user ? (
              <button 
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="text-xs uppercase tracking-widest font-bold text-red-500"
              >
                Sair da Conta ({user.email})
              </button>
            ) : (
              <Link 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-xs uppercase tracking-widest font-bold text-brand-gold"
              >
                Entrar / Cadastrar
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
