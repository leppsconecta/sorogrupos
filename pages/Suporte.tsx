import React, { useState, useEffect } from 'react';
import {
  Send,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  LifeBuoy
} from 'lucide-react';
import { SupportTicket } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { supabase } from '../lib/supabase';

export const Suporte: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useFeedback();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showToast('error', 'Erro ao carregar chamados');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const newTicket = {
        code: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: user.id,
        subject,
        description,
        phone,
        status: 'Pendente'
      };

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([newTicket])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTickets([data, ...tickets]);
        setStep('success');

        // Reset form
        setSubject('');
        setPhone('');
        setDescription('');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showToast('error', 'Erro ao abrir chamado');
    } finally {
      setLoading(false);
    }
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
      {/* Header removed as requested */}

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
                <InputField
                  label="Assunto"
                  icon={MessageSquare}
                  required
                  value={subject}
                  onChange={(e: any) => setSubject(e.target.value)}
                  placeholder="Ex: Erro ao carregar imagem"
                />

                <InputField
                  label="Seu Telefone / WhatsApp"
                  icon={Phone}
                  required
                  value={phone}
                  onChange={(e: any) => setPhone(e.target.value)}
                  placeholder="(15) 99999-9999"
                />

                <InputField
                  label="Descrição Detalhada"
                  icon={MessageSquare}
                  required
                  isTextArea
                  rows={4}
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                  placeholder="Descreva o que está acontecendo..."
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Chamado'} <Send size={18} />
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tickets.length} tickets</span>
            </div>

            <div className="space-y-4 overflow-y-auto custom-scrollbar max-h-[500px] pr-2">
              {loading && tickets.length === 0 ? (
                <div className="text-center py-10">
                  <Clock size={40} className="mx-auto text-slate-200 mb-2 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando...</p>
                </div>
              ) : tickets.map(t => (
                <div key={t.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{t.code}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2 line-clamp-1">{t.subject}</h4>

                  <div className="flex items-center justify-between mt-4">
                    <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(t.status)}`}>
                      {t.status === 'Pendente' && <Clock size={10} />}
                      {t.status === 'Em análise' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                      {t.status === 'Concluído' && <CheckCircle2 size={10} />}
                      {t.status}
                    </div>
                  </div>
                </div>
              ))}
              {!loading && tickets.length === 0 && (
                <div className="text-center py-10">
                  <Clock size={40} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum chamado aberto</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-start gap-3">
                <LifeBuoy size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-normal font-medium">Nosso tempo médio de resposta é de até 2 horas em dias úteis.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, icon: Icon, placeholder, type = "text", value, onChange, required = false, isTextArea = false, rows = 4 }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute top-4 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      {isTextArea ? (
        <textarea
          required={required}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
        />
      ) : (
        <input
          required={required}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
      )}
    </div>
  </div>
);
