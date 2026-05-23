import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const SalesTeam: React.FC = () => {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendedores() {
      const { data } = await supabase
        .from('vendedores')
        .select('*');
      if (data) {
        setVendedores(data);
      }
      setLoading(false);
    }
    fetchVendedores();
  }, []);

  if (loading) return null;
  if (vendedores.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-bold mb-4"
          >
            Atendimento Personalizado
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif italic text-neutral-800"
          >
            Nossas Especialistas
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vendedores.map((vendedor, idx) => (
            <motion.div
              key={vendedor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-brand-offwhite rounded-3xl p-8 border border-brand-gold/5 hover:border-brand-gold/20 transition-all duration-500 shadow-sm hover:shadow-xl flex flex-col items-center text-center"
            >
              <div className="relative w-32 h-32 mb-6 p-1 border border-brand-gold/20 rounded-full">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src={vendedor.foto || `https://ui-avatars.com/api/?name=${vendedor.nome}&background=F5EFED&color=B88E43`} 
                    alt={vendedor.nome} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-serif italic text-neutral-800 mb-2">{vendedor.nome}</h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-6">Consultora de Joias</p>
              
              <div className="flex flex-col w-full gap-3">
                <a
                  href={`https://wa.me/${vendedor.whatsapp || vendedor.telefone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-neutral-900 text-white w-full py-4 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-brand-gold transition-all duration-300 shadow-md active:scale-95"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
                {vendedor.telefone && (
                   <a 
                    href={`tel:${vendedor.telefone}`}
                    className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold hover:text-brand-gold transition-colors flex items-center justify-center gap-2"
                   >
                     <Phone size={12} /> {vendedor.telefone}
                   </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
