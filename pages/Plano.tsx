
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  QrCode, 
  Copy, 
  Check,
  Zap,
  X,
  ChevronRight,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';
import { Payment } from '../types';

interface PlanOption {
  id: string;
  name: string;
  price: number;
  period: string;
  months: number;
  tag?: string;
}

export const Plano: React.FC = () => {
  const [showPixModal, setShowPixModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isViewingPlans, setIsViewingPlans] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState('mensal');

  const plans: PlanOption[] = [
    { id: 'mensal', name: 'Mensal', price: 149.90, period: 'mês', months: 1 },
    { id: 'semestral', name: 'Semestral', price: 129.90, period: 'mês', months: 6, tag: 'Popular' },
    { id: 'anual', name: 'Anual', price: 119.00, period: 'mês', months: 12, tag: 'Melhor Valor' },
  ];

  const currentPlan = plans.find(p => p.id === currentPlanId) || plans[0];

  const rawPayments: Payment[] = [
    { id: '1', date: '10/05/2024', amount: 'R$ 149,90', method: 'Cartão de Crédito', status: 'Pago' },
    { id: '2', date: '10/04/2024', amount: 'R$ 149,90', method: 'PIX', status: 'Pago' },
    { id: '3', date: '10/06/2024', amount: 'R$ 149,90', method: 'PIX', status: 'Pendente' },
  ];

  const payments = useMemo(() => {
    return [...rawPayments].sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      return dateB.localeCompare(dateA);
    });
  }, [rawPayments]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX013662d512a4-7984-47f6-8a71-332d442b100e5204000053039865405149.905802BR5915SOROGRUPOS6008SOROCABA62070503***6304E2B1');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const calculateSavings = (plan: PlanOption) => {
    const monthlyTotal = 149.90 * plan.months;
    const planTotal = plan.price * plan.months;
    return monthlyTotal - planTotal;
  };

  const handlePlanAction = (id: string) => {
    // In a real app, this would trigger an API call
    setCurrentPlanId(id);
    setIsViewingPlans(false);
    alert(`Plano alterado para ${id.charAt(0).toUpperCase() + id.slice(1)} com sucesso!`);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {!isViewingPlans ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Card do Plano Atual */}
          <div className="lg:col-span-1">
            <section className="bg-blue-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full flex flex-col border border-white/5">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Zap size={20} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Plano Atual</span>
                  </div>
                  {/* Status dentro do Card */}
                  <div className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Ativo</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-black mb-1">{currentPlan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black">R$ {currentPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">/ {currentPlan.period}</span>
                </div>
                <p className="text-blue-300/60 text-[10px] font-bold uppercase tracking-widest mb-8">Cobrança recorrente</p>

                <div className="space-y-4 mb-10 flex-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-medium">Disparos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-medium">Gestão de Grupos e Vagas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-medium">Automação de Horários</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => setIsViewingPlans(true)}
                    className="w-full bg-white text-blue-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-xl"
                  >
                    Ver Todos os Planos <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Decorativo */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-800 rounded-full blur-[60px] opacity-20" />
            </section>
          </div>

          {/* Fatura Pendente e Histórico */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center">
                   <Clock size={32} />
                 </div>
                 <div>
                   <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">Próxima Fatura</h4>
                   <p className="text-xs text-slate-500 font-medium">Vencimento: 10 de Junho de 2024</p>
                 </div>
               </div>
               
               <div className="text-right flex flex-col md:items-end gap-3 w-full md:w-auto">
                 <span className="text-2xl font-black text-slate-800 dark:text-white">R$ {currentPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 <button 
                  onClick={() => setShowPixModal(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                 >
                   <QrCode size={16} /> Pagar com PIX
                 </button>
               </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Histórico de Pagamentos</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos meses</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50">
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Método</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Recibo</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                     {payments.map(p => (
                       <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="px-8 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{p.date}</td>
                         <td className="px-8 py-4 text-xs font-bold text-slate-800 dark:text-white">{p.amount}</td>
                         <td className="px-8 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.method}</td>
                         <td className="px-8 py-4">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             p.status === 'Pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                           }`}>
                             {p.status}
                           </span>
                         </td>
                         <td className="px-8 py-4 text-center">
                           <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                             <Download size={16} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsViewingPlans(false)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} /> Voltar ao Meu Plano
            </button>
            <div className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} /> Economize mais nos planos longos
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const savings = calculateSavings(plan);
              const isCurrent = plan.id === currentPlanId;
              const isUpgrade = plan.price < currentPlan.price || plan.months > currentPlan.months;

              return (
                <div 
                  key={plan.id}
                  className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border p-8 flex flex-col relative transition-all group hover:shadow-2xl hover:-translate-y-2
                    ${isCurrent ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100 dark:border-slate-800'}
                  `}
                >
                  {plan.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-950 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {plan.tag}
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-xl font-black text-slate-800 dark:text-white">{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl font-black text-blue-600">R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">/ {plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Total</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        R$ {(plan.price * plan.months).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {savings > 0 && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Seu Ganho / Economia</p>
                        <p className="text-sm font-black text-emerald-500">
                          + R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                       {['Disparos Ilimitados', 'Acesso Total', 'Suporte VIP'].map(feat => (
                         <div key={feat} className="flex items-center gap-2">
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{feat}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {isCurrent ? (
                    <div className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center">
                      Plano Atual
                    </div>
                  ) : (
                    <button 
                      onClick={() => handlePlanAction(plan.id)}
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg
                        ${isUpgrade 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' 
                          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 dark:bg-white dark:text-slate-950'
                        }
                      `}
                    >
                      {isUpgrade ? 'Fazer Upgrade' : 'Alterar para este'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal PIX */}
      {showPixModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowPixModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-scaleUp text-center">
            <button onClick={() => setShowPixModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>

            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-600/10">
              <QrCode size={40} />
            </div>

            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Pagamento via PIX</h3>
            <p className="text-sm text-slate-500 mb-8">Escaneie o QR Code ou copie a chave abaixo para pagar.</p>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 inline-block mb-8">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SorogruposPixPlaceholder" alt="QR Code PIX" className="w-48 h-48 dark:invert" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <input readOnly type="text" value="00020126580014BR.GOV.BCB.PIX..." className="flex-1 bg-transparent border-none text-[10px] font-mono outline-none text-slate-500" />
                <button onClick={handleCopyPix} className="text-blue-600 hover:text-blue-700 transition-all p-1">
                  {isCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl flex items-center gap-3">
                 <CheckCircle2 size={16} className="text-emerald-500" />
                 <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider text-left">O acesso é liberado instantaneamente após o pagamento.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
