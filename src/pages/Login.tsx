import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ChevronRight, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // If user is already logged in, redirect them
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        navigate(redirectPath);
      }
    });
  }, [navigate, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        throw new Error('Erro ao fazer login. Verifique suas credenciais ou crie uma nova conta.');
      }

      setSuccess('Bem-vinda de volta a Una Aura! Redirecionando...');
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao tentar entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col justify-between">
      <Navbar onCartOpen={() => {}} />

      {/* Main Container */}
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-brand-gold/10 relative overflow-hidden">
          {/* Decorative luxury effects */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-nude/10 blur-[50px] rounded-full pointer-events-none" />

          {/* Return Home Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-brand-gold transition-colors mb-6 font-semibold"
          >
            <ArrowLeft size={12} />
            Voltar para a Loja
          </Link>

          {/* Brand/Auth Header */}
          <div className="text-center mb-8">
            <span className="text-[9px] uppercase tracking-[0.4em] text-brand-gold font-bold block mb-1">
              Exclusividade & Elegância
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] font-light">
              Entrar em Minha Conta
            </h2>
            <p className="text-xs text-neutral-400 italic mt-2 leading-relaxed">
              Acesse sua reserva exclusiva, dados de envio e acompanhe seus pedidos.
            </p>
          </div>

          {/* Success messages */}
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 shadow-xs mx-auto animate-pulse">
                <Sparkles size={20} />
              </div>
              <h3 className="font-serif italic text-lg text-neutral-800">Conexão Estabelecida</h3>
              <p className="text-xs text-neutral-500">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-brand-offwhite border border-brand-nude/20 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5 flex justify-between">
                  <span>Senha de Acesso</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-brand-offwhite border border-brand-nude/20 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-[11px] italic bg-red-50 py-2.5 px-4 rounded-xl border border-red-100">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold hover:shadow-lg transition-all duration-300 disabled:opacity-50 mt-6 cursor-pointer"
              >
                {loading ? 'Acessando...' : 'Acessar Conta'}
                {!loading && <ChevronRight size={14} />}
              </button>
            </form>
          )}

          {/* Mode toggle */}
          {!success && (
            <div className="mt-8 text-center text-xs pt-4 border-t border-dashed border-neutral-100">
              <span className="text-neutral-400">É nova na Una Aura?</span>{' '}
              <Link
                to={`/cadastro?redirect=${encodeURIComponent(redirectPath)}`}
                className="text-brand-gold font-bold hover:underline ml-1 uppercase tracking-wider text-[10px]"
              >
                Crie sua conta
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};
