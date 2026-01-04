
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Send, 
  Search, 
  CheckCircle2, 
  Clock, 
  Users, 
  Eye, 
  Megaphone,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  History,
  Check,
  CalendarDays,
  Trash2,
  Plus,
  Clock3,
  Calendar as CalendarIcon,
  Smartphone,
  AlertCircle,
  Tag as TagIcon
} from 'lucide-react';

// Mock data for jobs
const MOCK_VAGAS = [
  { id: 'v1', role: 'Auxiliar de Produção', jobCode: 'PROD22', type: 'scratch', companyName: 'Indústria ABC', city: 'Sorocaba' },
  { id: 'v2', role: 'Desenvolvedor Frontend', jobCode: 'DEV99', type: 'scratch', companyName: 'Tech Solutions', city: 'Votorantim' },
  { id: 'v3', role: 'Vendedor Externo', jobCode: 'VEND05', type: 'scratch', companyName: 'Comércio Local', city: 'Sorocaba' },
  { id: 'v4', role: 'Operador de Empilhadeira', jobCode: 'LOG10', type: 'scratch', companyName: 'Logistics SA', city: 'Sorocaba' },
  { id: 'v5', role: 'Recepcionista', jobCode: 'REC01', type: 'scratch', companyName: 'Hotel Central', city: 'Itu' },
  { id: 'v6', role: 'Auxiliar Administrativo', jobCode: 'ADM55', type: 'scratch', companyName: 'Office Corp', city: 'Sorocaba' },
  { id: 'v7', role: 'Cozinheiro', jobCode: 'COZ02', type: 'scratch', companyName: 'Restaurante Sabor', city: 'Votorantim' },
  { id: 'v8', role: 'Analista de RH', jobCode: 'RH001', type: 'scratch', companyName: 'Empresa XPTO', city: 'Sorocaba' },
  { id: 'v9', role: 'Motorista', jobCode: 'MOT09', type: 'scratch', companyName: 'Transp Global', city: 'Iperó' },
  { id: 'v10', role: 'Segurança', jobCode: 'SEG55', type: 'scratch', companyName: 'Protect S/A', city: 'Sorocaba' },
  { id: 'v11', role: 'Faxineira', jobCode: 'FAX01', type: 'scratch', companyName: 'Clean Pro', city: 'Votorantim' },
];

// Mock data for groups with tags
const MOCK_GROUPS = [
  { id: 'g1', name: 'Empregos Sorocaba - Grupo 1', members: 256, tags: ['Empregos', 'Sorocaba'] },
  { id: 'g2', name: 'Vagas TI & Tech', members: 120, tags: ['Tecnologia', 'TI'] },
  { id: 'g3', name: 'Oportunidades Votorantim', members: 180, tags: ['Empregos', 'Votorantim'] },
  { id: 'g4', name: 'Vagas Indústria & Operacional', members: 250, tags: ['Indústria', 'Operacional'] },
  { id: 'g5', name: 'Balcão de Empregos', members: 256, tags: ['Empregos'] },
];

const AVAILABLE_TAGS = ['Empregos', 'Tecnologia', 'Indústria', 'Operacional', 'TI', 'Sorocaba', 'Votorantim'];

// Mock data for scheduled items
const INITIAL_SCHEDULES = [
  { id: 's1', jobsCount: 3, groupsCount: 5, date: '25/05/2024', time: '09:00', status: 'pending' },
  { id: 's2', jobsCount: 1, groupsCount: 2, date: '26/05/2024', time: '14:00', status: 'pending' },
];

interface MarketingProps {
  isWhatsAppConnected: boolean;
  onOpenConnect: () => void;
}

export const Marketing: React.FC<MarketingProps> = ({ isWhatsAppConnected, onOpenConnect }) => {
  const [view, setView] = useState<'broadcast' | 'reports' | 'schedules'>('broadcast');
  const [selectedVagaIds, setSelectedVagaIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [vagaSearch, setVagaSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Custom Date/Time states
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Carousel state
  const [previewIndex, setPreviewIndex] = useState(0);

  // Schedules state
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);

  // Dropdown states & Refs for Click Outside
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const jobDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(event.target as Node)) {
        setIsJobDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGroups = useMemo(() => {
    return MOCK_GROUPS.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(groupSearch.toLowerCase());
      const matchesTag = selectedTag ? g.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [groupSearch, selectedTag]);

  const filteredVagasList = useMemo(() => {
    return MOCK_VAGAS.filter(v => 
      v.role.toLowerCase().includes(vagaSearch.toLowerCase()) || 
      v.jobCode.toLowerCase().includes(vagaSearch.toLowerCase()) ||
      v.city.toLowerCase().includes(vagaSearch.toLowerCase())
    );
  }, [vagaSearch]);

  const selectedVagas = useMemo(() => {
    return MOCK_VAGAS.filter(v => selectedVagaIds.includes(v.id));
  }, [selectedVagaIds]);

  const toggleVagaSelection = (id: string) => {
    setSelectedVagaIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(vId => vId !== id);
        if (previewIndex >= next.length && next.length > 0) setPreviewIndex(next.length - 1);
        return next;
      }
      if (prev.length >= 10) {
        alert("Limite máximo atingido. Você pode selecionar no máximo 10 vagas por envio.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleGroupSelection = (id: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  const selectAllGroups = () => {
    if (selectedGroupIds.length === filteredGroups.length && filteredGroups.length > 0) {
      // If all currently visible are selected, clear only those
      const visibleIds = filteredGroups.map(g => g.id);
      setSelectedGroupIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Select all currently visible
      const visibleIds = filteredGroups.map(g => g.id);
      setSelectedGroupIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const nextPreview = () => {
    setPreviewIndex(prev => (prev + 1) % selectedVagas.length);
  };

  const prevPreview = () => {
    setPreviewIndex(prev => (prev - 1 + selectedVagas.length) % selectedVagas.length);
  };

  const handleSend = () => {
    if (selectedVagaIds.length === 0 || selectedGroupIds.length === 0) return;
    alert(`Enviando ${selectedVagaIds.length} vaga(s) para ${selectedGroupIds.length} grupo(s)!`);
  };

  const toggleDateSelection = (date: string) => {
    setSelectedDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handleScheduleSubmit = () => {
    if (selectedDates.length === 0 || !scheduleTime || selectedVagaIds.length === 0 || selectedGroupIds.length === 0) {
      alert("Selecione os dias, o horário, as vagas e os grupos.");
      return;
    }
    
    const newSchedules = selectedDates.map(date => ({
      id: Math.random().toString(36).substr(2, 9),
      jobsCount: selectedVagaIds.length,
      groupsCount: selectedGroupIds.length,
      date: date,
      time: scheduleTime,
      status: 'pending'
    }));
    
    setSchedules([...newSchedules, ...schedules]);
    alert(`${newSchedules.length} agendamento(s) realizado(s) com sucesso!`);
    setIsScheduling(false);
    setSelectedVagaIds([]);
    setSelectedGroupIds([]);
    setSelectedDates([]);
    setScheduleTime('');
  };

  const removeSchedule = (id: string) => {
    if (confirm('Deseja cancelar este agendamento?')) {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  // Restricted to 7 days window
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const label = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
    return { value: `${day}/${month}/${year}`, label, isToday: i === 0 };
  });

  // Hourly slots from 07:00 to 20:00
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = (7 + i).toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // UI Components
  const TabButton = ({ id, label, icon: Icon }: { id: typeof view, label: string, icon: any }) => (
    <button 
      onClick={() => setView(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap
        ${view === id 
          ? 'bg-blue-600 text-white shadow-blue-600/20' 
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* WhatsApp Connection Alert/Card */}
      <div 
        onClick={() => !isWhatsAppConnected && onOpenConnect()}
        className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-between
          ${isWhatsAppConnected 
            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800 animate-pulse'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
            ${isWhatsAppConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className={`font-semibold text-xs uppercase tracking-widest ${isWhatsAppConnected ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isWhatsAppConnected ? 'WhatsApp Conectado' : 'Atenção: WhatsApp Desconectado'}
            </h3>
            <p className={`text-[10px] font-medium ${isWhatsAppConnected ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>
              {isWhatsAppConnected ? 'Tudo ok - Sistema pronto para disparos' : 'Clique aqui para conectar e habilitar as funções'}
            </p>
          </div>
        </div>
        {!isWhatsAppConnected && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-semibold uppercase tracking-widest">
            <AlertCircle size={12} /> Desconectado
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-blue-950 shadow-lg shadow-yellow-400/20">
            <Megaphone size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Broadcasting</h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          <TabButton id="broadcast" label="Novo Envio" icon={Megaphone} />
          <TabButton id="schedules" label="Agendamentos" icon={CalendarDays} />
          <TabButton id="reports" label="Histórico" icon={History} />
        </div>
      </div>

      {view === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lado Esquerdo: Seleção e Preview */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Selecionar Vagas */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[11px] font-black text-blue-950 shadow-md">1</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Selecionar Vagas</h3>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {selectedVagaIds.length === 10 ? 'Limite Máximo Atingido' : `Vagas Ativas (${selectedVagaIds.length}/10)`}
                </p>
                {selectedVagaIds.length > 0 && (
                  <button onClick={() => setSelectedVagaIds([])} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline">Limpar Tudo</button>
                )}
              </div>
              
              <div className="relative" ref={jobDropdownRef}>
                <button 
                  onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}
                  className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl text-sm font-medium text-slate-500 hover:border-blue-500 transition-all outline-none"
                >
                  <span className={selectedVagaIds.length > 0 ? 'text-slate-900 dark:text-white font-bold' : ''}>
                    {selectedVagaIds.length > 0 ? `${selectedVagaIds.length} vaga(s) selecionada(s)` : 'Clique para selecionar as vagas...'}
                  </span>
                  <ChevronDown size={18} className={`transition-transform duration-300 ${isJobDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isJobDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-20 max-h-80 overflow-y-auto p-3 animate-scaleUp">
                    {/* Search Bar for Vagas */}
                    <div className="relative mb-3 group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        value={vagaSearch}
                        onChange={(e) => setVagaSearch(e.target.value)}
                        placeholder="Buscar por cargo ou código..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {vagaSearch && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setVagaSearch(''); }}
                          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {filteredVagasList.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase">Nenhuma vaga encontrada</div>
                      ) : (
                        filteredVagasList.map(vaga => (
                          <button 
                            key={vaga.id}
                            onClick={() => toggleVagaSelection(vaga.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${selectedVagaIds.includes(vaga.id) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedVagaIds.includes(vaga.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200 dark:border-slate-700'}`}>
                              {selectedVagaIds.includes(vaga.id) && <Check size={14} className="text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold">{vaga.role}</p>
                              <p className="text-[10px] opacity-60">COD: {vaga.jobCode} • {vaga.city}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Preview Carousel */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[11px] font-black text-blue-950 shadow-md">2</div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Prévia da Mensagem</h3>
                </div>
                {selectedVagas.length > 1 && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{previewIndex + 1} de {selectedVagas.length}</span>
                    <div className="flex gap-1">
                      <button onClick={prevPreview} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><ChevronLeft size={16} /></button>
                      <button onClick={nextPreview} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                )}
              </div>

              {selectedVagas.length === 0 ? (
                <div className="h-48 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                  <Megaphone size={40} className="mb-3 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Selecione uma vaga para visualizar</p>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-900 font-mono text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap relative shadow-inner">
                    {`*Agência Sync Contrata* 🟡🔴🔵  
-----------------------------  
Função: *${selectedVagas[previewIndex]?.role}*
Cód. Vaga: *${selectedVagas[previewIndex]?.jobCode}*
-----------------------------  
*Empresa:* ${selectedVagas[previewIndex]?.companyName}
*Cidade:* ${selectedVagas[previewIndex]?.city}

*Interessados*
Envie seu currículo pelo WhatsApp oficial do Sorogrupos.
----------------------------- 

*Mais informações:*
🠖 Agência Sync
🠖 5515996993021
🠖 soroempregos.com.br`}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 text-blue-600">
                  <Info size={16} />
                </div>
                <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-normal">As mensagens são formatadas seguindo o padrão Sorogrupos. Para manter a qualidade da rede, os envios são limitados a 10 vagas por disparo.</p>
              </div>
            </section>
          </div>

          {/* Lado Direito: Grupos e Ações */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[11px] font-black text-blue-950 shadow-md">3</div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Grupos</h3>
                </div>
                <button onClick={selectAllGroups} className="text-xs font-black text-yellow-600 dark:text-yellow-400 hover:underline uppercase tracking-widest">
                  {selectedGroupIds.length === filteredGroups.length && filteredGroups.length > 0 ? 'Remover Seleção' : 'Selecionar Tudo'}
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                    placeholder="Filtrar por nome..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 ring-blue-500 transition-all"
                  />
                </div>

                {/* Tag Filter row within group selection */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                      ${selectedTag === null 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500'
                      }`}
                  >
                    Todos
                  </button>
                  {AVAILABLE_TAGS.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                        ${selectedTag === tag 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500'
                        }`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar max-h-[300px]">
                {filteredGroups.length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum grupo encontrado</p>
                  </div>
                ) : (
                  filteredGroups.map(group => (
                    <div 
                      key={group.id}
                      onClick={() => toggleGroupSelection(group.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group
                        ${selectedGroupIds.includes(group.id) 
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200'}`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${selectedGroupIds.includes(group.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200 dark:border-slate-800 group-hover:border-blue-500'}`}>
                        {selectedGroupIds.includes(group.id) && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{group.name}</p>
                        <div className="flex gap-1 mt-1">
                          {group.tags.map(tag => (
                            <span key={tag} className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsScheduling(!isScheduling)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all border
                      ${isScheduling ? 'bg-yellow-400 text-blue-950 border-yellow-400 shadow-lg shadow-yellow-400/20' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
                  >
                    <CalendarIcon size={18} /> Agendar
                  </button>
                  <button 
                    disabled={selectedVagaIds.length === 0 || selectedGroupIds.length === 0}
                    onClick={handleSend}
                    className="flex-[2] flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 disabled:opacity-50 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <Send size={18} /> Enviar Agora
                  </button>
                </div>

                {isScheduling && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scaleUp">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2 relative" ref={datePickerRef}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dias do Disparo (Janela de 7 dias)</label>
                        <button 
                          onClick={() => setShowDatePicker(!showDatePicker)}
                          className={`w-full flex items-center justify-between bg-white dark:bg-slate-900 border px-4 py-3.5 rounded-xl text-xs font-bold transition-all
                            ${selectedDates.length > 0 ? 'border-blue-500 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
                        >
                          <div className="flex items-center gap-3">
                            <CalendarIcon size={16} className="text-blue-500" />
                            <span>{selectedDates.length === 0 ? 'Escolha os dias' : `${selectedDates.length} dia(s) selecionado(s)`}</span>
                          </div>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showDatePicker && (
                          <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 p-2 animate-scaleUp">
                            <div className="grid grid-cols-1 gap-1">
                              {nextDays.map(d => (
                                <button 
                                  key={d.value}
                                  onClick={() => toggleDateSelection(d.value)}
                                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all
                                    ${selectedDates.includes(d.value) ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}`}
                                >
                                  <div className="flex items-center gap-2">
                                     <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${selectedDates.includes(d.value) ? 'bg-white border-white' : 'border-slate-200 dark:border-slate-700'}`}>
                                        {selectedDates.includes(d.value) && <Check size={10} className="text-blue-600" />}
                                     </div>
                                     <span className="text-xs font-bold">{d.value}</span>
                                  </div>
                                  <span className="text-[9px] font-black uppercase opacity-60">{d.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 relative" ref={timePickerRef}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário (07:00 às 20:00)</label>
                        <button 
                          onClick={() => setShowTimePicker(!showTimePicker)}
                          className={`w-full flex items-center justify-between bg-white dark:bg-slate-900 border px-4 py-3.5 rounded-xl text-xs font-bold transition-all
                            ${scheduleTime ? 'border-blue-500 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock3 size={16} className="text-blue-500" />
                            <span>{scheduleTime || 'Escolha a hora'}</span>
                          </div>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${showTimePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {showTimePicker && (
                          <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 p-2 animate-scaleUp">
                            <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                              {timeSlots.map(t => (
                                <button 
                                  key={t}
                                  onClick={() => { setScheduleTime(t); setShowTimePicker(false); }}
                                  className={`py-2.5 rounded-lg text-[10px] font-black transition-all
                                    ${scheduleTime === t ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleScheduleSubmit} 
                      disabled={selectedDates.length === 0 || !scheduleTime} 
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/10 disabled:opacity-50 transition-all active:scale-95"
                    >
                      Agendar para {selectedDates.length} dia(s)
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {view === 'schedules' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Envios Programados</h3>
                <p className="text-sm text-slate-500 font-medium">Você tem {schedules.length} disparos automáticos configurados.</p>
              </div>
              <button onClick={() => setView('broadcast')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95">
                <Plus size={18} /> Novo Agendamento
              </button>
            </div>

            <div className="space-y-4">
              {schedules.map(item => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-md">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-black leading-none">{item.date.split('/')[0]}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">{item.date.split('/')[1] === '05' ? 'MAI' : 'JUN'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white leading-tight">Disparo de {item.jobsCount} vaga(s)</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Clock size={12} className="text-blue-500" /> {item.time}</span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><Users size={12} className="text-blue-500" /> {item.groupsCount} grupos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full flex items-center gap-2 border border-blue-100 dark:border-blue-900/50">
                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pendente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all"><Eye size={18} /></button>
                      <button onClick={() => removeSchedule(item.id)} className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 hover:text-rose-500 shadow-sm transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {schedules.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                  <CalendarDays size={48} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum agendamento ativo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'reports' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Histórico de Envios</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Envio em Massa #{1020 + i}</h4>
                    <p className="text-xs text-slate-400 font-medium">Concluído em 22/05/2024 às 14:30 • 5 grupos atingidos</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                    <span className="text-xs font-black text-emerald-500 uppercase">Sucesso</span>
                  </div>
                  <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
