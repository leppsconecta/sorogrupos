
import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    Plus
} from 'lucide-react';

interface AgendamentosProps {
    setActiveTab: (tab: string) => void;
}

// Mock data for scheduled and published posts
const MOCK_POSTS = [
    { id: 'p1', title: 'Auxiliar de Produção', company: 'Indústria ABC', date: '2026-01-06', time: '19:00', status: 'scheduled', groups: 3 },
    { id: 'p2', title: 'Desenvolvedor Frontend', company: 'Tech Solutions', date: '2026-01-07', time: '14:00', status: 'scheduled', groups: 5 },
    { id: 'p3', title: 'Vendedor Externo', company: 'Comércio Local', date: '2026-01-05', time: '10:00', status: 'published', groups: 4 },
    { id: 'p4', title: 'Op. de Empilhadeira', company: 'Logistics SA', date: '2026-01-04', time: '15:30', status: 'published', groups: 2 },
    { id: 'p5', title: 'Recepcionista', company: 'Hotel Central', date: '2026-01-08', time: '09:00', status: 'scheduled', groups: 3 },
];

export const Agendamentos: React.FC<AgendamentosProps> = ({ setActiveTab }) => {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Generate week days starting from today
    const getWeekDays = () => {
        const days = [];
        const today = new Date(currentDate);
        // Get start of week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = useMemo(() => getWeekDays(), [currentDate]);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const getPostsForDate = (date: Date) => {
        const dateStr = formatDate(date);
        return MOCK_POSTS.filter(post => post.date === dateStr);
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const monthYear = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="h-full flex flex-col animate-fadeIn">
            {/* Calendar View */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Calendar Controls - Reduced Height */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'week'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'month'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                Mês
                            </button>
                        </div>

                        {/* Month/Year Display */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={goToPreviousWeek}
                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="text-center min-w-[160px]">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white capitalize">{monthYear}</h3>
                            </div>

                            <button
                                onClick={goToNextWeek}
                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Actions: Today + Anunciar Vaga */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                            >
                                Hoje
                            </button>

                            <button
                                onClick={() => setActiveTab('marketing')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                <Plus size={14} />
                                Anunciar Vaga
                            </button>
                        </div>
                    </div>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex-shrink-0">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <div
                            key={day}
                            className={`p-2 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${index === 0 || index === 6 ? 'bg-slate-100/50 dark:bg-slate-800/50' : ''
                                }`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {day}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Days Grid - Flex-1 to fill remaining space */}
                <div className="flex-1 grid grid-cols-7 overflow-hidden">
                    {weekDays.map((day, index) => {
                        const posts = getPostsForDate(day);
                        const isTodayDate = isToday(day);

                        return (
                            <div
                                key={index}
                                className={`flex flex-col p-2 border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${isTodayDate ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                                    } ${index === 0 || index === 6 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
                            >
                                {/* Day Number */}
                                <div className="flex items-center justify-between mb-2 px-1 flex-shrink-0">
                                    <span
                                        className={`text-xs font-bold ${isTodayDate
                                                ? 'w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full'
                                                : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </span>
                                    {posts.length > 0 && (
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {posts.length}
                                        </span>
                                    )}
                                </div>

                                {/* Posts for this day - Compact View + Scroll */}
                                <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar p-1">
                                    {posts.map(post => (
                                        <div
                                            key={post.id}
                                            className={`p-2 rounded-lg border-l-2 transition-all hover:brightness-95 cursor-pointer shadow-sm flex-shrink-0
                        ${post.status === 'scheduled'
                                                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30' // Programado = Verde
                                                    : 'border-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/30' // Publicado = Amarelo
                                                }`}
                                        >
                                            {/* Time & Icon */}
                                            <div className="flex items-center gap-1 mb-1">
                                                {post.status === 'scheduled' ? (
                                                    <Clock size={10} className="text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <CheckCircle2 size={10} className="text-yellow-600 dark:text-yellow-400" />
                                                )}
                                                <span className={`text-[10px] font-black tracking-tight ${post.status === 'scheduled'
                                                        ? 'text-emerald-700 dark:text-emerald-300'
                                                        : 'text-yellow-700 dark:text-yellow-300'
                                                    }`}>
                                                    {post.time}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight mb-0.5 truncate">
                                                {post.title}
                                            </p>

                                            {/* Company */}
                                            <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                                {post.company}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
