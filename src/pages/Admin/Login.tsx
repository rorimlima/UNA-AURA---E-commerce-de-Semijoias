import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Special bypass for requested admin email
    if (email === 'admin@unaaura.com') {
      localStorage.setItem('admin_bypass', 'true');
      navigate('/admin/dashboard');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. Verifique seu login.');
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offwhite px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-brand-nude/30"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-brand-gold italic tracking-widest mb-2">UNA AURA</h1>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-2">E-mail</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-brand-offwhite border border-brand-nude/40 rounded-lg focus:outline-none focus:border-brand-gold transition-colors text-sm"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-2">Senha</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-brand-offwhite border border-brand-nude/40 rounded-lg focus:outline-none focus:border-brand-gold transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs italic">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-neutral-900 text-white rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Acessar Painel'}
            {!loading && <ChevronRight size={16} />}
          </button>
        </form>

        <div className="mt-8 text-center">
            <button 
                onClick={() => navigate('/')}
                className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-brand-gold underline underline-offset-4"
            >
                Voltar para a loja
            </button>
        </div>
      </motion.div>
    </div>
  );
};
