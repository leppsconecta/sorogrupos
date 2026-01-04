
import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Send, 
  Phone, 
  MessageSquare, 
  ImageIcon, 
  CheckCircle2, 
  Clock, 
  Search,
  ChevronRight,
  Plus
} from 'lucide-react';
import { SupportTicket } from '../types';

export const Suporte: React.FC = () => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: '1', code: 'TKT-8291', subject: 'Problema no envio de vagas', description: 'Não consigo enviar...', phone: '(15) 99122-3344', status: 'Em análise', date: '22/05/2024', hasAttachment: true },
    { id: '2', code: 'TKT-7102', subject: 'Dúvida sobre plano Pro', description: 'Gostaria de saber...', phone: '(15) 99122-3344', status: 'Concluído', date: '15/05/2024', hasAttachment: false },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SupportTicket = {
      id: Math.random().toString(36).substr(2, 9),
      code: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      description,
      phone,
      status: 'Pendente',
      date: new Date().toLocaleDateString('pt-BR'),
      hasAttachment: !!file
    };
    setTickets([newTicket, ...tickets]);
    setStep('success');
    
    // Reset form
    setSubject('');
    setPhone('');
    setDescription('');
    setFile(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Em análise': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Concluído': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return '';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
          <LifeBuoy size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Central de Ajuda</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário de Abertura */}
        <div className="lg:col-span-7">
          {step === 'form' ? (
            <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Abrir Chamado</h3>
                <p className="text-sm text-slate-500 font-medium">Descreva seu problema ou dúvida e nossa equipe retornará em breve.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assunto</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><MessageSquare size={18} /></div>
                    <input 
                      required
                      type="text" 
                      value={subject} 
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Ex: Erro ao carregar imagem" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Telefone / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><Phone size={18} /></div>
                    <input 
                      required
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(15) 99999-9999" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                  <textarea 
                    required
                    rows={4}
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva o que está acontecendo..." 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all resize-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anexar Print (Opcional)</label>
                  <label className="flex items-center justify-center gap-3 w-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-blue-500 transition-all group">
                    <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} accept="image/*" />
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm">
                      <ImageIcon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{file ? file.name : 'Selecione uma imagem'}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">JPG, PNG ou GIF</p>
                    </div>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Enviar Chamado <Send size={18} />
                </button>
              </form>
            </section>
          ) : (
            <section className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-6 animate-scaleUp">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Ticket Registrado!</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">Recebemos sua solicitação. Por favor, aguarde o retorno da nossa equipe em seu WhatsApp.</p>
              </div>
              <button 
                onClick={() => setStep('form')}
                className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Abrir novo chamado
              </button>
            </section>
          )}
        </div>

        {/* Histórico Lateral */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Meus Chamados</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tickets.length} tickets</span>
            </div>

            <div className="space-y-4 overflow-y-auto custom-scrollbar max-h-[500px] pr-2">
              {tickets.map(t => (
                <div key={t.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t.code}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{t.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2 line-clamp-1">{t.subject}</h4>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(t.status)}`}>
                      {t.status === 'Pendente' && <Clock size={10} />}
                      {t.status === 'Em análise' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                      {t.status === 'Concluído' && <CheckCircle2 size={10} />}
                      {t.status}
                    </div>
                    {t.hasAttachment && <ImageIcon size={14} className="text-slate-300" />}
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-10">
                  <Clock size={40} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum chamado aberto</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-start gap-3">
                 <LifeBuoy size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                 <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-normal">Nosso tempo médio de resposta é de até 2 horas em dias úteis.</p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
