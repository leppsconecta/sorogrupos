import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Clock, CheckCircle2, AlertCircle, TrendingUp, DollarSign, Activity, CalendarDays } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Referral {
    id: string;
    created_at: string;
    status: string;
    profiles: {
        full_name: string | null;
        email: string | null;
    } | null;
}

export const DashboardParceiro: React.FC = () => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchReferrals() {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Pega o ID do Afiliado logado
                const { data: affiliateData, error: affErr } = await supabase
                    .from('affiliates')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (affErr) throw affErr;

                // 2. Busca todas as indicações usando esse ID
                if (affiliateData) {
                    const { data: refData, error: refErr } = await supabase
                        .from('referrals')
                        .select(`
              id,
              created_at,
              status,
              profiles:referred_user_id ( full_name )
            `)
                        .eq('affiliate_id', affiliateData.id)
                        .order('created_at', { ascending: false });

                    if (refErr) throw refErr;

                    setReferrals(refData as unknown as Referral[] || []);
                }
            } catch (err: any) {
                console.error('Erro ao buscar indicados:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchReferrals();
    }, [user]);

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const inactiveReferrals = referrals.filter(r => r.status !== 'active').length;

    // Métricas Fictícias Baseadas nos Referrals para dar sensação de lucro/crescimento
    const currentMonth = new Date().getMonth();
    const comissionPerActive = 49.90; // Exemplo de R$ 49,90 por lead ativo
    const balance = activeReferrals * comissionPerActive;

    // Gerando dados do grafico de recebimentos baseado nas datas reais de cadastro
    const chartData = useMemo(() => {
        if (!referrals.length) return [];

        const dataByMonth: Record<string, { month: string; value: number; leads: number }> = {};

        // Meses dos ultimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('pt-BR', { month: 'short' });
            dataByMonth[monthName] = { month: monthName, value: 0, leads: 0 };
        }

        referrals.forEach(ref => {
            if (ref.status === 'active') {
                const refDate = new Date(ref.created_at);
                const monthName = refDate.toLocaleString('pt-BR', { month: 'short' });
                if (dataByMonth[monthName]) {
                    dataByMonth[monthName].value += comissionPerActive;
                    dataByMonth[monthName].leads += 1;
                }
            }
        });

        return Object.values(dataByMonth);
    }, [referrals]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-32">
            {/* KPI Cards (No Header Title) */}
            <div className="flex justify-end mb-2">
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-blue-100 dark:border-slate-700/50">
                    <CalendarDays size={18} className="text-blue-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Acumulado Total
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Saldo / Lucro */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 border border-blue-500/30 shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <DollarSign size={24} className="text-blue-100" />
                            </div>
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                                <TrendingUp size={12} /> +12%
                            </span>
                        </div>
                        <div>
                            <p className="text-blue-100/70 text-sm font-medium mb-1">Lucro Estimado</p>
                            <h3 className="text-3xl font-black tracking-tight">{formatCurrency(balance)}</h3>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                {/* Contas Ativas */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-green-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Contas Ativas</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{activeReferrals}</h3>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-5 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                        <CheckCircle2 size={100} />
                    </div>
                </div>

                {/* Contas Inativas */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-2xl">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Contas Inativas (Pendentes)</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{inactiveReferrals}</h3>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-5 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                        <Clock size={100} />
                    </div>
                </div>

                {/* Total Leads */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Users size={24} />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total de Leads Gerados</p>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white">{totalReferrals}</h3>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-5 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                        <Users size={100} />
                    </div>
                </div>
            </div>

            {/* Gráficos Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Crescimento de Receita</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Evolução dos lucros nos últimos 6 meses</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-slate-700/50 rounded-lg">
                            <Activity size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `R$${value}`} dx={-10} />
                                <Tooltip
                                    formatter={(value: number) => [formatCurrency(value), "Lucro"]}
                                    labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Chart / Conversions */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Desempenho por Mês</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Leads convertidos e Valor Recebido</p>
                    </div>
                    <div className="h-[300px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={false} />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'value' ? formatCurrency(value) : value,
                                        name === 'value' ? "Comissão Recebida" : "Cadastros Ativos"
                                    ]}
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar yAxisId="left" dataKey="leads" name="leads" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar yAxisId="right" dataKey="value" name="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tabela de Indicados (Validação Visual / Histórico de Recebimento) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            Histórico de Recebimento e Indicações
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Lista completa das empresas e candidatos indicados</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        <div className="animate-spin w-8 h-8 md:w-10 md:h-10 border-4 border-blue-500 border-t-transparent flex items-center mx-auto rounded-full mb-4"></div>
                        Carregando seus leads...
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-rose-500 flex flex-col items-center">
                        <AlertCircle size={32} className="mb-2" />
                        <p>Falha ao buscar referências.</p>
                        <span className="text-xs text-rose-400">{error}</span>
                    </div>
                ) : referrals.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="font-semibold text-slate-600 dark:text-slate-300">Nenhum cadastro ainda.</p>
                        <p className="text-sm mt-1 max-w-sm">Compartilhe seu link disponível no cabeçalho superior para começar a trackear cadastros novos.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/80">
                                    <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Usuário Indicado</th>
                                    <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Data do Lead</th>
                                    <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Comissão Prevista</th>
                                    <th className="p-4 md:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {referrals.map((ref) => (
                                    <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 md:px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-sm text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {(ref.profiles?.full_name || 'U')[0]}
                                                </div>
                                                {ref.profiles?.full_name || 'Usuário Não Identificado'}
                                            </div>
                                        </td>
                                        <td className="p-4 md:px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={14} className="opacity-50" />
                                                {new Date(ref.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </div>
                                        </td>
                                        <td className="p-4 md:px-6 py-4 whitespace-nowrap">
                                            <span className={`font-semibold ${ref.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500 line-through'}`}>
                                                {formatCurrency(comissionPerActive)}
                                            </span>
                                        </td>
                                        <td className="p-4 md:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${ref.status === 'active'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}
                                            >
                                                {ref.status === 'active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                {ref.status === 'active' ? 'Convertido' : 'Pendente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
