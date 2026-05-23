import React from 'react';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-gold/20 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="md:col-span-2">
          <h2 className="text-4xl font-serif text-[#1A1A1A] tracking-[0.3em] font-light mb-8">UNA AURA</h2>
          <p className="text-neutral-400 font-light text-sm max-w-xs leading-relaxed mb-10 italic">
            Nascida para exaltar o brilho que já existe em cada mulher. Design autoral, banho 18k e alta joalheria.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/unaaurafortaleza/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-brand-gold/20 flex items-center justify-center text-neutral-400 hover:text-brand-gold hover:border-brand-gold transition-all">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-gold mb-8">Navegação</h3>
          <ul className="space-y-4 text-neutral-500 text-[11px] uppercase tracking-[0.25em] font-medium">
            <li><a href="/" className="hover:text-brand-gold transition-colors">Início</a></li>
            <li><a href="/estoque" className="hover:text-brand-gold transition-colors">Nossas Joias</a></li>
            <li><a href="/#featured" className="hover:text-brand-gold transition-colors">Destaques</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-gold mb-8">Informações</h3>
          <ul className="space-y-4 text-neutral-500 text-[11px] uppercase tracking-[0.2em] font-bold">
            <li><a href="#" className="hover:text-brand-gold transition-colors">Privacidade</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Trocas</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Envio</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-24 pt-8 border-t border-brand-gold/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-400">
            © {new Date().getFullYear()} UNA AURA SEMIJOIAS
          </p>
          <a href="/admin" className="text-[7px] uppercase tracking-[0.2em] text-neutral-200/50 hover:text-brand-gold transition-colors">
            Acesso Restrito
          </a>
        </div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-300 font-light text-center md:text-right">
          PROJETADO PARA ELEVAR SUA AURA.
        </p>
      </div>
    </footer>
  );
};
