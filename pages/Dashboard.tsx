
import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  CalendarDays,
  Smartphone,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from 'recharts';

type TimeRange = 'semanal' | 'mensal' | 'anual';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  isWhatsAppConnected: boolean;
  onOpenConnect: () => void;
}

const dataWeekly = [
  { name: 'Seg', jobs: 40 },
  { name: 'Ter', jobs: 35 },
  { name: 'Qua', jobs: 75 },
  { name: 'Qui', jobs: 80 },
  { name: 'Sex', jobs: 55 },
  { name: 'Sáb', jobs: 95 },
  { name: 'Dom', jobs: 120 },
];

const dataMonthly = Array.from({ length: 30 }, (_, i) => ({
  name: (i + 1).toString(),
  jobs: Math.floor(Math.random() * 50) + 10,
}));

const dataYearly = [
  { name: 'Jan', jobs: 1200 },
  { name: 'Fev', jobs: 1400 },
  { name: 'Mar', jobs: 1100 },
  { name: 'Abr', jobs: 1800 },
  { name: 'Mai', jobs: 2200 },
  { name: 'Jun', jobs: 2100 },
  { name: 'Jul', jobs: 1900 },
  { name: 'Ago', jobs: 2050 },
  { name: 'Set', jobs: 2300 },
  { name: 'Out', jobs: 2500 },
  { name: 'Nov', jobs: 2700 },
  { name: 'Dez', jobs: 3000 },
];

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, isWhatsAppConnected, onOpenConnect }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('semanal');

  const getChartData = () => {
    if (timeRange === 'semanal') return dataWeekly;
    if (timeRange === 'mensal') return dataMonthly;
    return dataYearly;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* WhatsApp Connection Alert/Card */}
      <div 
        onClick={() => !isWhatsAppConnected && onOpenConnect()}
        className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-sm flex items-center justify-between
          ${isWhatsAppConnected 
            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800 animate-pulse'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center 
            ${isWhatsAppConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className={`font-semibold text-sm uppercase tracking-widest ${isWhatsAppConnected ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isWhatsAppConnected ? 'WhatsApp Conectado' : 'Status da Conexão WhatsApp'}
            </h3>
            <p className={`text-xs font-medium ${isWhatsAppConnected ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>
              {isWhatsAppConnected ? 'Tudo ok - Disparos ativos' : 'Desconectado - Clique para conectar agora'}
            </p>
          </div>
        </div>
        {!isWhatsAppConnected && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest">
            <AlertCircle size={14} /> Alerta: Desconectado
          </div>
        )}
        {isWhatsAppConnected && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest">
            <CheckCircle2 size={14} /> Ativo
          </div>
        )}
      </div>

      {/* Stats Grid - 2x2 on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Disparos agendados" 
          value="12" 
          icon={<CalendarDays className="text-blue-600" size={24} />} 
          onClick={() => setActiveTab('marketing')}
        />
        <StatCard 
          title="Vagas Ativas" 
          value="56" 
          icon={<Briefcase className="text-blue-600" size={24} />} 
          onClick={() => setActiveTab('vagas')}
        />
        <StatCard 
          title="Total de Grupos" 
          value="142" 
          icon={<Users className="text-blue-600" size={24} />} 
          onClick={() => setActiveTab('grupos')}
        />
        <StatCard 
          title="Geral Participantes" 
          value="48.2k" 
          icon={<TrendingUp className="text-blue-600" size={24} />} 
          onClick={() => setActiveTab('marketing')}
        />
      </div>

      {/* Analytics Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Vagas Anunciadas</h3>
            <p className="text-sm text-slate-500 font-medium">Histórico de disparos realizados</p>
          </div>
          <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-auto">
            {(['semanal', 'mensal', 'anual'] as TimeRange[]).map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-semibold uppercase tracking-widest transition-all
                  ${timeRange === range 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-600'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[250px] sm:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getChartData()} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 500}} 
                dy={15}
                interval={timeRange === 'mensal' ? 4 : 0}
              />
              <YAxis hide axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '24px', border: 'none', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="jobs" fill="#3b82f6" radius={[10, 10, 10, 10]} barSize={timeRange === 'mensal' ? 8 : 40}>
                {timeRange !== 'mensal' && (
                  <LabelList dataKey="jobs" position="top" style={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} offset={10} />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string; value: string; icon: React.ReactNode; onClick?: () => void}> = ({ title, value, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full text-left bg-white dark:bg-slate-900 p-4 sm:p-7 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group outline-none focus:ring-2 ring-blue-500/20"
  >
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors group-hover:bg-yellow-400 group-hover:text-blue-950">
        {icon}
      </div>
    </div>
    <h4 className="text-lg sm:text-2xl font-semibold text-slate-800 dark:text-white mb-1 tracking-tight">{value}</h4>
    <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-tight line-clamp-1">{title}</p>
  </button>
);
