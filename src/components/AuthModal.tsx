import React, { useState } from 'react';
import { X, Mail, Lock, Phone, User, Check, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw new Error('Erro ao fazer login. Verifique seu e-mail e senha.');
        }

        setSuccess('Bem-vinda de volta a Una Aura! ✨');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);

      } else {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: name,
              telefone: phone,
            },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message || 'Erro ao realizar o cadastro.');
        }

        setSuccess('Conta criada com sucesso! Divirta-se em nossa loja. ✨');
        setTimeout(() => {
          // Auto switch to login or signal completion
          onClose();
          if (onSuccess) onSuccess();
        }, 1800);
      }
    } catch (err: any) {
      setError(err.message || 'Desculpe, ocorreu um erro estrutural.');
    } finally {
      setLoading(false);
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
            className="fixed inset-0 bg-neutral-950/60 z-[100] backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 overflow-y-auto z-[101] flex items-start sm:items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 my-auto shadow-2xl border border-brand-gold/10 overflow-hidden"
            >
              {/* Luxury Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-nude/10 blur-[50px] rounded-full pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors border border-transparent hover:border-brand-gold/10 text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <span className="text-[9px] uppercase tracking-[0.4em] text-brand-gold font-bold block mb-1">
                  Exclusividade & Elegância
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] font-light">
                  {isLogin ? 'Bem-vinda de Volta' : 'Criar Sua Conta'}
                </h2>
                <p className="text-[11px] sm:text-xs text-neutral-400 italic mt-2 leading-relaxed">
                  {isLogin 
                    ? 'Acesse seu painel com facilidade e gerencie seu brilho.' 
                    : 'Registre-se para salvar dados de entrega e acelerar seu pedido.'
                  }
                </p>
              </div>

              {success ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 shadow-sm animate-bounce">
                    <Check size={32} />
                  </div>
                  <h3 className="font-serif italic text-xl text-neutral-800">Tudo Pronto!</h3>
                  <p className="text-xs text-neutral-500 max-w-xs">{success}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5">
                            Seu Nome Completo
                          </label>
                          <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full h-11 pl-10 pr-4 bg-brand-offwhite border border-brand-nude/40 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                              placeholder="Juliana Silva"
                              required={!isLogin}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5">
                            WhatsApp / Telefone
                          </label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full h-11 pl-10 pr-4 bg-brand-offwhite border border-brand-nude/40 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                              placeholder="(85) 99999-9999"
                              required={!isLogin}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5">
                      Endereço de E-mail
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-brand-offwhite border border-brand-nude/40 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5">
                      Escolha uma Senha
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-brand-offwhite border border-brand-nude/40 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-[11px] italic text-center bg-red-50 py-2 rounded-lg border border-red-100 mt-2"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold-gradient hover:shadow-lg hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 mt-6 cursor-pointer"
                  >
                    {loading ? 'Processando...' : isLogin ? 'Entrar com Elegância' : 'Cadastrar na Loja'}
                    {!loading && <ChevronRight size={14} />}
                  </button>
                </form>
              )}

              {/* Mode Toggle Button */}
              {!success && (
                <div className="mt-8 text-center text-xs">
                  <span className="text-neutral-400">
                    {isLogin ? 'É nova na Una Aura?' : 'Já possui cadastro?'}
                  </span>{' '}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-brand-gold font-bold hover:underline ml-1 uppercase tracking-wider text-[10px]"
                  >
                    {isLogin ? 'Crie sua conta' : 'Acesse seu login'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
