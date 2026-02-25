import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, ArrowDownRight, Clock, CheckCircle2, History, Banknote } from 'lucide-react';

interface PaymentHistory {
    id: string;
    amount: number;
    date: string;
    status: 'paid' | 'pending';
    description: string;
}

interface LeadPayment {
    id: string;
    lead_name: string;
    amount: number;
    date: string;
    plan: string;
}

// Estes são dados MOCKADOS para a interface visual conforme pedido pelo cliente (apenas layout no momento)
// Posteriormente serão plugados às tabelas reais de pagamentos
const mockPayments: PaymentHistory[] = [
    { id: '1', amount: 499.00, date: '2023-11-05', status: 'paid', description: 'Comissões de Outubro/2023' },
    { id: '2', amount: 850.50, date: '2023-12-05', status: 'paid', description: 'Comissões de Novembro/2023' },
    { id: '3', amount: 1240.00, date: '2024-01-05', status: 'paid', description: 'Comissões de Dezembro/2023' }
];

const mockUpcoming: PaymentHistory[] = [
    { id: '4', amount: 890.00, date: '2024-02-05', status: 'pending', description: 'Comissões de Janeiro/2024 (Previsto)' },
];

const mockLeadPayments: LeadPayment[] = [
    { id: '101', lead_name: 'Tech Solutions Ltda', amount: 149.90, date: '2024-01-15', plan: 'Plano Plus Mensal' },
    { id: '102', lead_name: 'João Carlos Silva', amount: 49.90, date: '2024-01-18', plan: 'Assinatura Candidato API' },
    { id: '103', lead_name: 'Recruta Fácil RH', amount: 399.00, date: '2024-01-22', plan: 'Plano Premium' },
];

export const FinanceiroParceiro: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'historic' | 'upcoming' | 'leads'>('upcoming');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
                        Financeiro
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Gerencie seus recebimentos, saldos futuros e detalhes das suas conversões.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800/30">
                    <Banknote size={18} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(890.00)} a receber
                    </span>
                </div>
            </div>

            {/* Navegação por Abas */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-full md:w-max overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-700/50">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 
            ${activeTab === 'upcoming' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
          `}
                >
                    <Clock size={16} /> Próximos Pagamentos
                </button>
                <button
                    onClick={() => setActiveTab('historic')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2
            ${activeTab === 'historic' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
          `}
                >
                    <History size={16} /> Meu Histórico
                </button>
                <button
                    onClick={() => setActiveTab('leads')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2
            ${activeTab === 'leads' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
          `}
                >
                    <ArrowDownRight size={16} /> Pagamentos de Leads
                </button>
            </div>

            {/* Conteúdo Dinâmico das Abas */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80">
                                <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                    {activeTab === 'leads' ? 'IDENTIFICAÇÃO DO LEAD' : 'DESCRIÇÃO DO REPASSE'}
                                </th>
                                <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">DATA</th>
                                {activeTab === 'leads' && (
                                    <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">PRODUTO/PLANO</th>
                                )}
                                <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">VALOR</th>
                                <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {/* Aba Próximos Pagamentos */}
                            {activeTab === 'upcoming' && mockUpcoming.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 md:px-6 py-4">
                                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                                <Clock size={14} />
                                            </div>
                                            {item.description}
                                        </div>
                                    </td>
                                    <td className="p-4 md:px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 md:px-6 py-4 font-bold text-slate-800 dark:text-white">{formatCurrency(item.amount)}</td>
                                    <td className="p-4 md:px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                            <Clock size={12} /> Agendado
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {/* Aba Meu Histórico */}
                            {activeTab === 'historic' && mockPayments.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 md:px-6 py-4">
                                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <DollarSign size={14} />
                                            </div>
                                            {item.description}
                                        </div>
                                    </td>
                                    <td className="p-4 md:px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 md:px-6 py-4 font-bold text-green-600 dark:text-green-400">{formatCurrency(item.amount)}</td>
                                    <td className="p-4 md:px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            <CheckCircle2 size={12} /> Liquidado
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {/* Aba Leads */}
                            {activeTab === 'leads' && mockLeadPayments.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 md:px-6 py-4">
                                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {item.lead_name.charAt(0)}
                                            </div>
                                            {item.lead_name}
                                        </div>
                                    </td>
                                    <td className="p-4 md:px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 md:px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{item.plan}</td>
                                    <td className="p-4 md:px-6 py-4 font-bold text-slate-800 dark:text-white">{formatCurrency(item.amount)}</td>
                                    <td className="p-4 md:px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                            Venda Confirmada
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(activeTab === 'historic' && mockPayments.length === 0) ||
                        (activeTab === 'upcoming' && mockUpcoming.length === 0) ||
                        (activeTab === 'leads' && mockLeadPayments.length === 0) ? (
                        <div className="p-12 text-center text-slate-500">
                            Nenhuma transação encontrada nesta categoria.
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
