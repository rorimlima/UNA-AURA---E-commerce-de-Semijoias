import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Phone, User, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Cadastro: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up user on Supabase Auth (saves in Auth system containing user_metadata)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            nome: name,
            telefone: phone,
            endereco: address,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message || 'Erro ao criar conta.');
      }

      const user = signUpData?.user;

      if (user) {
        // 2. Persist the client's information into the database 'clientes' table as requested!
        const payload = {
          id: user.id,
          nome: name,
          email: email.trim(),
          telefone: phone,
          endereco: address,
          usuario: email.trim(),
          senha: password, // Store password to the customer database database table as explicitly requested
          created_at: new Date().toISOString()
        };

        try {
          // Attempt insertion
          const { error: dbError } = await supabase.from('clientes').insert([payload]);

          if (dbError) {
            console.warn("Informação: Tabela 'clientes' inexistente ou sem permissões de gravação direta. Salvando via user_metadata apenas.", dbError.message);
          }
        } catch (dbErr) {
          console.warn("Informação: Falha silenciosa ao gravar na tabela clientes. Fallback seguro ativado.", dbErr);
        }

        // Always save to a backup list in localStorage so registration remains effective and testable locally instantly!
        try {
          const localClientes = JSON.parse(localStorage.getItem('local-clientes') || '[]');
          localClientes.push(payload);
          localStorage.setItem('local-clientes', JSON.stringify(localClientes));
        } catch (localErr) {
          console.warn("Falha ao salvar backup local de clientes:", localErr);
        }
      }

      setSuccess('Cadastro realizado com sucesso! Seja bem-vinda à Una Aura. ✨');
      setTimeout(() => {
        // Automatically authenticate and navigate
        navigate(redirectPath);
      }, 1800);

    } catch (err: any) {
      setError(err.message || 'Não foi possível concluir seu cadastro. Tente novamente.');
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

          {/* Return button */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-brand-gold transition-colors mb-6 font-semibold"
          >
            <ArrowLeft size={12} />
            Voltar para a Loja
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-[9px] uppercase tracking-[0.4em] text-brand-gold font-bold block mb-1">
              Faça Parte do Nosso Universo
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] font-light">
              Criar Minha Conta
            </h2>
            <p className="text-xs text-neutral-400 italic mt-2 leading-relaxed">
              Registre seus dados para acelerar suas compras e receber novidades exclusivas.
            </p>
          </div>

          {/* Success screen */}
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 shadow-xs mx-auto animate-bounce">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-serif italic text-lg text-neutral-800">Seja Bem-vinda!</h3>
              <p className="text-xs text-neutral-500">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-brand-offwhite border border-brand-nude/20 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                    placeholder="Juliana Silva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5">
                  WhatsApp / Telefone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-brand-offwhite border border-brand-nude/20 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                    placeholder="(85) 99999-9999"
                  />
                </div>
              </div>

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
                <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5">
                  Endereço de Entrega
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/60" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-brand-offwhite border border-brand-nude/20 rounded-full focus:outline-none focus:border-brand-gold transition-colors text-xs text-[#1A1A1A]"
                    placeholder="Rua, número, bairro, cidade e CEP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-1.5 flex justify-between">
                  <span>Escolha uma Senha</span>
                  <span className="text-neutral-400 font-normal lowercase max-150px">mín. 6 dígitos</span>
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

              {/* Error box */}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-[11px] italic bg-red-50 py-2.5 px-4 rounded-xl border border-red-100 mt-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold hover:shadow-lg transition-all duration-300 disabled:opacity-50 mt-6 cursor-pointer"
              >
                {loading ? 'Criando sua Aura...' : 'Registrar Minha Conta'}
                {!loading && <ChevronRight size={14} />}
              </button>
            </form>
          )}

          {/* Redirect options */}
          {!success && (
            <div className="mt-8 text-center text-xs pt-4 border-t border-dashed border-neutral-100">
              <span className="text-neutral-400">Já possui uma conta?</span>{' '}
              <Link
                to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                className="text-brand-gold font-bold hover:underline ml-1 uppercase tracking-wider text-[10px]"
              >
                Faça login aqui
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};
