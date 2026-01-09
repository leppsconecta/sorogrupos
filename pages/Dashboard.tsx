
import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  CalendarDays,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type TimeRange = 'semanal' | 'mensal' | 'anual';

interface DashboardProps {
  isWhatsAppConnected: boolean;
  onOpenConnect: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ isWhatsAppConnected, onOpenConnect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('semanal');
  const [stats, setStats] = useState({
    scheduledBlast: 0,
    publishedBlasts: 0, // New stat
    activeJobs: 0,
    totalGroups: 0,
    totalParticipants: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    processChartData();
  }, [timeRange, allJobs]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // 1. Fetch Stats
      const [
        schedulesResponse,
        publishedResponse,
        activeJobsResponse,
        groupsResponse,
        jobsResponse
      ] = await Promise.all([
        supabase
          .from('marketing_schedules')
          .select('id', { count: 'exact', head: true })
          .eq('publish_status', 0) // Changed to check publish_status = 0
          .eq('user_id', user.id),
        supabase
          .from('marketing_schedules')
          .select('id', { count: 'exact', head: true })
          .eq('publish_status', 1) // New query for publish_status = 1
          .eq('user_id', user.id),
        supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('user_id', user.id),
        supabase
          .from('whatsapp_groups')
          .select('total')
          .eq('user_id', user.id),
        supabase
          .from('jobs')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
      ]);

      // Calculate Total Participants
      const totalParticipants = (groupsResponse.data || []).reduce((acc, curr) => acc + (curr.total || 0), 0);

      setStats({
        scheduledBlast: schedulesResponse.count || 0,
        publishedBlasts: publishedResponse.count || 0,
        activeJobs: activeJobsResponse.count || 0,
        totalGroups: groupsResponse.data?.length || 0,
        totalParticipants: totalParticipants
      });

      if (jobsResponse.data) {
        setAllJobs(jobsResponse.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const processChartData = () => {
    if (!allJobs.length) return;

    const now = new Date();
    let processedData: any[] = [];

    if (timeRange === 'semanal') {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (6 - i));
        return d;
      });

      processedData = last7Days.map(date => {
        const dayStr = date.toISOString().split('T')[0];
        const count = allJobs.filter(j => j.created_at.startsWith(dayStr)).length;
        return {
          name: days[date.getDay()],
          fullDate: dayStr,
          jobs: count
        };
      });

    } else if (timeRange === 'mensal') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      processedData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const count = allJobs.filter(j => {
          const d = new Date(j.created_at);
          return d.getDate() === day && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        return {
          name: day.toString(),
          jobs: count
        };
      });

    } else if (timeRange === 'anual') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      processedData = months.map((month, index) => {
        const count = allJobs.filter(j => {
          const d = new Date(j.created_at);
          return d.getMonth() === index && d.getFullYear() === now.getFullYear();
        }).length;
        return {
          name: month,
          jobs: count
        };
      });
    }

    setChartData(processedData);
  };

  const getChartData = () => {
    return chartData.length > 0 ? chartData : [
      { name: 'Sem dados', jobs: 0 }
    ];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Grid - 2x2 on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <StatCard
          title="Disparos agendados"
          value={stats.scheduledBlast.toString()}
          icon={<CalendarDays className="text-blue-600" size={24} />}
          onClick={() => navigate('/anunciar')}
        />
        <StatCard
          title="Vagas Publicadas"
          value={stats.publishedBlasts.toString()}
          icon={<CheckCircle2 className="text-emerald-500" size={24} />}
          onClick={() => navigate('/anunciar')}
        />
        <StatCard
          title="Vagas Ativas"
          value={stats.activeJobs.toString()}
          icon={<Briefcase className="text-blue-600" size={24} />}
          onClick={() => navigate('/vagas')}
        />
        <StatCard
          title="Total de Grupos"
          value={stats.totalGroups.toString()}
          icon={<Users className="text-blue-600" size={24} />}
          onClick={() => navigate('/grupos')}
        />
        <StatCard
          title="Geral Participantes"
          value={formatNumber(stats.totalParticipants)}
          icon={<TrendingUp className="text-blue-600" size={24} />}
          onClick={() => navigate('/grupos')}
        />
      </div>

      {/* Analytics Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Vagas Anunciadas</h3>
            <p className="text-sm text-slate-500 font-medium">Histórico de vagas criadas</p>
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
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
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

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; onClick?: () => void }> = ({ title, value, icon, onClick }) => (
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
