import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Settings, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import { formatCurrency, formatProductName } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'clientes'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>({ 
    nome: '', 
    price: 0, 
    preco_venda: 0, 
    descricao: '', 
    imagem: '', 
    colecao_id: '', 
    quantidade_estoque: 0, 
    referencia: '',
    destaque: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Special bypass check if they entered via the bypass email
        const isBypass = localStorage.getItem('admin_bypass') === 'true';
        if (!isBypass) navigate('/admin');
      }
    }
    checkUser();
    
    // Real-time setup
    const setupSubscriptions = () => {
      fetchData();
      
      const productsChannel = supabase
        .channel('dashboard-products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => fetchData())
        .subscribe();
        
      const settingsChannel = supabase
        .channel('dashboard-settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(productsChannel);
        supabase.removeChannel(settingsChannel);
      };
    };

    return setupSubscriptions();
  }, [navigate]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch products - try with joining colecoes first
      const { data: prods, error: prodsError } = await supabase.from('produtos').select('*, colecoes(name)');
      
      let finalProds = prods;
      
      // Fallback if the join fails (maybe the relationship name is different)
      if (prodsError) {
        console.warn("Could not fetch with colecoes relationship, falling back to simple select:", prodsError);
        const { data: simpleProds, error: simpleError } = await supabase.from('produtos').select('*');
        if (simpleError) {
          console.error("Critical error fetching products:", simpleError);
          finalProds = [];
        } else {
          finalProds = simpleProds;
        }
      }

      const { data: cols, error: colsError } = await supabase.from('colecoes').select('*');
      if (colsError) console.error("Error fetching collections:", colsError);

      const { data: sets, error: setsError } = await supabase.from('store_settings').select('*');
      if (setsError) console.error("Error fetching settings:", setsError);

      // Fetch registered clients from database
      let dbClientes: any[] = [];
      try {
        const { data: clis, error: clisError } = await supabase.from('clientes').select('*');
        if (clisError) {
          console.warn("Tabela 'clientes' pode não existir ainda ou necessita de criação:", clisError.message);
        } else {
          dbClientes = clis || [];
        }
      } catch (cliErr) {
        console.warn("Falha ao carregar tabela clientes:", cliErr);
      }

      // Merge with backup local storage registered users
      const localCli = JSON.parse(localStorage.getItem('local-clientes') || '[]');
      const mergedClientes = [...dbClientes];
      localCli.forEach((lc: any) => {
        if (!mergedClientes.some(mc => mc.email === lc.email || mc.usuario === lc.usuario)) {
          mergedClientes.push(lc);
        }
      });
      setClientes(mergedClientes);
      
      // Map fields for dashboard table
      const mappedProds = (finalProds || []).map(p => ({
        ...p,
        name: formatProductName(p.nome || 'N/A'),
        price: (p.preco_venda || 0) / 100,
        image_url: p.imagem || '',
        images: p.galeria || p.imagens || (p.imagem ? [p.imagem] : []),
        quantidade_estoque: p.quantidade_estoque || 0,
        referencia: p.referencia || '',
        destaque: p.destaque || false
      }));

      setProducts(mappedProds);
      setCollections(cols || []);
      setSettings(sets || []);
    } catch (err) {
      console.error("Unexpected error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('admin_bypass');
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nome: currentProduct.nome,
      referencia: currentProduct.referencia,
      preco_venda: Math.round(currentProduct.price * 100),
      imagem: currentProduct.imagem,
      descricao: currentProduct.descricao,
      colecao_id: currentProduct.colecao_id || null,
      quantidade_estoque: currentProduct.quantidade_estoque,
      destaque: currentProduct.destaque || false
    };

    if (currentProduct.id) {
       await supabase.from('produtos').update(payload).eq('id', currentProduct.id);
    } else {
       await supabase.from('produtos').insert(payload);
    }
    setIsEditing(false);
    setCurrentProduct({ 
      nome: '', 
      preco_venda: 0, 
      price: 0, 
      referencia: '', 
      descricao: '', 
      imagem: '', 
      colecao_id: '', 
      quantidade_estoque: 0,
      destaque: false
    });
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Excluir este produto?')) {
      await supabase.from('produtos').delete().eq('id', id);
      fetchData();
    }
  };

  const updateSetting = async (key: string, value: string) => {
    await supabase.from('store_settings').update({ value }).eq('key', key);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-brand-offwhite flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-nude/40 flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-brand-nude/20">
          <h1 className="text-xl font-serif text-brand-gold italic tracking-widest">UNA AURA</h1>
          <p className="text-[10px] uppercase font-bold text-neutral-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-brand-gold text-white shadow-md' : 'text-neutral-500 hover:bg-brand-offwhite'}`}
          >
            <Package size={18} /> Produtos
          </button>
          <button 
            onClick={() => setActiveTab('clientes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'clientes' ? 'bg-brand-gold text-white shadow-md' : 'text-neutral-500 hover:bg-brand-offwhite'}`}
          >
            <Users size={18} /> Clientes Cadastrados
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-brand-gold text-white shadow-md' : 'text-neutral-500 hover:bg-brand-offwhite'}`}
          >
            <Settings size={18} /> Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-brand-nude/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-serif italic text-neutral-800">
            {activeTab === 'products' ? 'Gestão de Produtos' : activeTab === 'clientes' ? 'Clientes e Contas' : 'Ajustes da Loja'}
          </h2>
          {activeTab === 'products' && (
            <button 
              onClick={() => { 
                setIsEditing(true); 
                setCurrentProduct({ 
                  nome: '', 
                  price: 0, 
                  preco_venda: 0, 
                  referencia: '', 
                  descricao: '', 
                  imagem: '', 
                  colecao_id: collections[0]?.id || '', 
                  quantidade_estoque: 0,
                  destaque: false
                }); 
              }}
              className="bg-neutral-900 text-white px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-brand-gold transition-colors"
            >
              <Plus size={16} /> Novo Produto
            </button>
          )}
        </header>

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm border border-brand-nude/20 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-brand-offwhite/50 text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Coleção</th>
                  <th className="px-6 py-4 text-center">Destaque</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-nude/10">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-brand-offwhite/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded bg-brand-nude/20" />
                        <span className="font-medium text-neutral-700">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{product.colecoes?.name}</td>
                    <td className="px-6 py-4 text-center">
                       {product.destaque ? (
                         <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase transition-all shadow-sm">
                           <CheckCircle2 size={12} /> Destaque
                         </span>
                       ) : (
                         <span className="text-neutral-300 text-[10px] uppercase font-bold">Padrão</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-brand-gold">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => { setIsEditing(true); setCurrentProduct(product); }} className="p-2 text-neutral-400 hover:text-brand-gold transition-colors"><Edit3 size={16} /></button>
                       <button onClick={() => deleteProduct(product.id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-nude/20">
              <h3 className="text-lg font-serif italic text-neutral-800 mb-2">Estrutura da Tabela do Banco de Dados</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                Caso você ainda não tenha criado a tabela <code className="bg-neutral-100 text-[#b5179e] px-1 py-0.5 rounded font-mono font-bold">clientes</code> no seu painel SQL do Supabase, execute o código de criação abaixo para que os novos cadastros sejam gravados no seu banco de dados do Supabase automaticamente:
              </p>
              <pre className="bg-neutral-950 border border-neutral-800 text-brand-gold text-[10px] font-mono p-4 rounded-xl overflow-x-auto leading-relaxed shadow-inner">
{`-- SQL DE CRIAÇÃO DA TABELA CLIENTES (Copie e execute no Supabase SQL Editor)
create table public.clientes (
  id uuid references auth.users not null primary key,
  nome text,
  email text,
  telefone text,
  endereco text,
  usuario text,
  senha text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar segurança e regras de leitura/escrita públicas de cadastro
alter table public.clientes enable row level security;
create policy "Permitir insercoes publicas" on public.clientes for insert with check (true);
create policy "Permitir leitura publica" on public.clientes for select using (true);`}
              </pre>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#ede1d1] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#FAF8F5]/80 text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                  <tr>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">WhatsApp / Fone</th>
                    <th className="px-6 py-4">Endereço de Entrega</th>
                    <th className="px-6 py-4">Usuário de Acesso</th>
                    <th className="px-6 py-4">Senha Gravada</th>
                    <th className="px-6 py-4 text-right">Cadastrado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-nude/10">
                  {clientes.length > 0 ? (
                    clientes.map(cli => (
                      <tr key={cli.id} className="hover:bg-brand-offwhite/30 transition-all font-sans">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-800 font-serif italic text-sm">{cli.nome || 'Novo Brilho'}</div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{cli.email}</div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 font-mono text-xs">{cli.telefone || 'Não informado'}</td>
                        <td className="px-6 py-4 text-neutral-500 italic text-xs max-w-xs truncate" title={cli.endereco}>{cli.endereco || 'Não cadastrado'}</td>
                        <td className="px-6 py-4 font-mono text-xs text-neutral-600">{cli.usuario || cli.email}</td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-brand-gold bg-brand-gold/5 px-2.5 py-1 rounded inline-block mt-3 border border-brand-gold/10">
                          {cli.senha || 'Exclusivo Auth'}
                        </td>
                        <td className="px-6 py-4 text-right text-neutral-400 font-mono text-xs">
                          {cli.created_at ? new Date(cli.created_at).toLocaleDateString('pt-BR') : 'Recentemente'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center italic text-neutral-400 text-sm">
                        Nenhuma cliente cadastrada no momento. Experimente criar uma conta no site!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl p-8 shadow-sm border border-brand-nude/20 space-y-8">
            {settings.map(set => (
              <div key={set.id}>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2">
                  {set.key.replace('_', ' ')}
                </label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    defaultValue={set.value}
                    onBlur={(e) => updateSetting(set.key, e.target.value)}
                    className="flex-1 h-12 px-4 bg-brand-offwhite border border-brand-nude/40 rounded-lg focus:border-brand-gold outline-none"
                  />
                  <div className="flex items-center text-brand-gold opacity-30 px-2">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-brand-nude/20 p-4 rounded-lg flex gap-3 text-neutral-600 text-sm italic">
               <AlertCircle size={20} className="flex-shrink-0" />
               As alterações nas configurações são salvas automaticamente ao clicar fora do campo.
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
             <div className="relative bg-white w-full max-w-xl rounded-2xl p-10 shadow-2xl">
                <h3 className="text-2xl font-serif italic mb-8">{currentProduct.id ? 'Editar Peça' : 'Nova Peça'}</h3>
                <form onSubmit={saveProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Nome</label>
                      <input type="text" value={currentProduct.nome || ''} onChange={e => setCurrentProduct({...currentProduct, nome: e.target.value})} className="w-full h-11 px-4 bg-brand-offwhite border border-brand-nude/40 rounded outline-none focus:border-brand-gold" required />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Referência</label>
                      <input type="text" value={currentProduct.referencia || ''} onChange={e => setCurrentProduct({...currentProduct, referencia: e.target.value})} className="w-full h-11 px-4 bg-brand-offwhite border border-brand-nude/40 rounded outline-none focus:border-brand-gold" placeholder="Ref-001" required />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Preço Venda (BRL)</label>
                      <input type="number" step="0.01" value={currentProduct.price || 0} onChange={e => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})} className="w-full h-11 px-4 bg-brand-offwhite border border-brand-nude/40 rounded focus:border-brand-gold outline-none" required />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Estoque</label>
                      <input type="number" value={currentProduct.quantidade_estoque || 0} onChange={e => setCurrentProduct({...currentProduct, quantidade_estoque: parseInt(e.target.value)})} className="w-full h-11 px-4 bg-brand-offwhite border border-brand-nude/40 rounded" required />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Coleção</label>
                      <select value={currentProduct.colecao_id || ''} onChange={e => setCurrentProduct({...currentProduct, colecao_id: e.target.value})} className="w-full h-11 px-4 bg-brand-offwhite border border-brand-nude/40 rounded">
                        <option value="">Selecione...</option>
                        {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">URL da Imagem</label>
                      <input type="text" value={currentProduct.imagem || ''} onChange={e => setCurrentProduct({...currentProduct, imagem: e.target.value})} className="w-full h-11 px-4 bg-brand-offwhite border border-brand-nude/40 rounded" placeholder="https://..." />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Descrição</label>
                        <textarea rows={3} value={currentProduct.descricao || ''} onChange={e => setCurrentProduct({...currentProduct, descricao: e.target.value})} className="w-full p-4 bg-brand-offwhite border border-brand-nude/40 rounded" />
                    </div>
                  </div>
                    <div className="col-span-2 flex items-center gap-3 bg-brand-offwhite p-4 rounded-lg border border-brand-nude/20">
                      <input 
                        type="checkbox" 
                        id="destaque"
                        checked={currentProduct.destaque || false} 
                        onChange={e => setCurrentProduct({...currentProduct, destaque: e.target.checked})} 
                        className="w-5 h-5 accent-brand-gold rounded"
                      />
                      <label htmlFor="destaque" className="text-xs font-bold text-neutral-700 uppercase tracking-widest cursor-pointer">
                        Produto em Destaque (Aparece na Hero)
                      </label>
                    </div>
                    <div className="pt-6 flex gap-3 w-full">
                    <button type="submit" className="flex-1 bg-neutral-900 text-white h-12 rounded-lg font-bold uppercase tracking-widest text-xs">Salvar</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 h-12 border border-brand-nude/40 rounded-lg text-neutral-400 font-bold uppercase tracking-widest text-xs">Cancelar</button>
                  </div>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
