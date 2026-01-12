
import React, { useState } from 'react';
import {
    CreditCard,
    Check,
    Calendar,
    Download,
    AlertCircle,
    QrCode
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const PlansSection: React.FC = () => {
    const { account, accountStatus, subscription, user } = useAuth();
    const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

    const getPlanDetails = () => {
        if (accountStatus === 'trial') {
            return {
                name: 'Período de Teste',
                price: 'Grátis',
                interval: '7 dias',
                status_label: 'Trial Grátis',
                renewal_label: 'Expira em',
                date: account?.trial_end_at ? new Date(account.trial_end_at).toLocaleDateString('pt-BR') : '---'
            };
        }

        const amount = subscription?.plan_amount ? (subscription.plan_amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 97,00';
        const interval = subscription?.plan_interval === 'month' ? 'Mensal' : subscription?.plan_interval === 'year' ? 'Anual' : 'Mensal';

        return {
            name: subscription?.plan_type === 'pro' ? 'Plano PRO' : 'Plano Básico',
            price: amount,
            interval: interval,
            status_label: accountStatus === 'active' ? 'Ativo' : 'Inativo',
            renewal_label: 'Renova em',
            date: subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR') : '---'
        };
    };

    const handleCheckout = async (mode: 'payment' | 'subscription') => {
        if (!user) return; // Ensure user is present
        setIsCheckingOut(mode);
        try {
            // Price IDs
            const RECURRING_PRICE = 'price_1SolZw2MPjzdFt9kHRlBT8hE'; // Mensal Recorrente
            const ONE_TIME_PRICE = 'price_1SolWz2MPjzdFt9kgWrySX9g'; // Avulso 1 Mês

            const { data, error } = await supabase.functions.invoke('create-checkout', {
                body: { // Body is ignored by health-check but kept for signature compatibility
                    priceId: mode === 'subscription' ? RECURRING_PRICE : ONE_TIME_PRICE,
                    mode: mode,
                    successUrl: `${window.location.origin}/painel?payment_success=true`,
                    cancelUrl: `${window.location.origin}/meuplano?payment_canceled=true`,
                    userId: user.id,
                    userEmail: user.email
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error); // Catch function-returned errors
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(`Erro ao iniciar pagamento: ${error.message || error}`);
        } finally {
            setIsCheckingOut(null);
        }
    };

    const planDetails = getPlanDetails();

    const getStatusBadge = () => {
        if (accountStatus === 'active') {
            return (
                <div className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest leading-none">Ativo</span>
                </div>
            );
        }
        if (accountStatus === 'trial') {
            return (
                <div className="bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest leading-none">Trial Grátis</span>
                </div>
            );
        }
        return (
            <div className="bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest leading-none">Inativo</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Header com Status */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Meu Plano</h2>
                    <p className="text-sm text-slate-500">Gerencie sua assinatura e pagamentos</p>
                </div>
                {getStatusBadge()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card do Plano Atual */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Plano Atual</span>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{planDetails.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-blue-600">{planDetails.price}</span>
                                    <span className="text-sm text-slate-500 font-medium">/{planDetails.interval}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3 mb-1">
                                    <Calendar size={16} className="text-blue-500" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{planDetails.renewal_label}</span>
                                </div>
                                <p className="text-lg font-bold text-slate-800 dark:text-white pl-7">
                                    {planDetails.date}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            {[
                                'Acesso total ao sistema',
                                'Criação ilimitada de vagas',
                                'Agendamento de disparos',
                                'Suporte prioritário'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    <span className="font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            {accountStatus === 'active' && (
                                <button className="px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm uppercase tracking-wider hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all">
                                    Cancelar Assinatura
                                </button>
                            )}
                            {(accountStatus === 'inactive' || accountStatus === 'trial') && (
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleCheckout('payment')}
                                        disabled={!!isCheckingOut}
                                        className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <QrCode size={18} />
                                        {isCheckingOut === 'payment' ? 'Processando...' : '1 Mês - Avulso (Pix/Cartão)'}
                                    </button>
                                    <button
                                        onClick={() => handleCheckout('subscription')}
                                        disabled={!!isCheckingOut}
                                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CreditCard size={18} />
                                        {isCheckingOut === 'subscription' ? 'Processando...' : 'Assinar Mensal (Recorrente)'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Histórico de Pagamentos */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Faturas</h3>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-blue-600">
                            <Download size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar max-h-[300px] lg:max-h-none">
                        {[].length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-xs">Nenhuma fatura encontrada.</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">Mensalidade Pro</p>
                                        <p className="text-xs text-slate-500">14 Out 2023</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800 dark:text-white text-sm">R$ 97,00</p>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Pago</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p className="text-xs text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
                                Seu próximo pagamento será processado automaticamente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
