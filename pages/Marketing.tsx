
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
      className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap
        ${view === id
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-blue-500 dark:hover:bg-slate-800'}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-yellow-400 rounded-[1.25rem] flex items-center justify-center text-blue-950 shadow-xl shadow-yellow-400/20 transform -rotate-3">
            <Megaphone size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Marketing</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Broadcast & Gestão de Disparos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-800/50">
          <TabButton id="broadcast" label="Novo Envio" icon={Megaphone} />
          <TabButton id="schedules" label="Agendamentos" icon={CalendarDays} />
          <TabButton id="reports" label="Histórico" icon={History} />
        </div>
      </div>

      {view === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lado Esquerdo: Seleção e Preview */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-8">

            {/* Step Indicators row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: 1, title: 'Selecionar Vagas', active: selectedVagaIds.length > 0 },
                { step: 2, title: 'Prévia da Mensagem', active: selectedVagaIds.length > 0 },
                { step: 3, title: 'Escolher Grupos', active: selectedGroupIds.length > 0 }
              ].map((item) => (
                <div key={item.step} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${item.active ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md ${item.active ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {item.step}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{item.title}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 1. Selecionar Vagas */}
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-6 flex flex-col hover:scale-[1.01] transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Vagas</h3>
                  <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      {selectedVagaIds.length}/10
                    </span>
                  </div>
                </div>

                <div className="relative flex-1" ref={jobDropdownRef}>
                  <button
                    onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}
                    className="w-full h-full min-h-[140px] flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-500 hover:bg-blue-50/10 transition-all p-6 group"
                  >
                    {selectedVagaIds.length === 0 ? (
                      <>
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 shadow-sm transition-colors border border-slate-100 dark:border-slate-800">
                          <Plus size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 group-hover:text-blue-500 uppercase tracking-[0.2em]">Adicionar Vagas</p>
                      </>
                    ) : (
                      <div className="w-full space-y-2">
                        {selectedVagas.slice(0, 3).map(v => (
                          <div key={v.id} className="w-full flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate">{v.role}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{v.jobCode}</span>
                          </div>
                        ))}
                        {selectedVagaIds.length > 3 && (
                          <p className="text-[10px] items-center text-center font-bold text-blue-500 uppercase tracking-widest mt-2">+ {selectedVagaIds.length - 3} outras vagas</p>
                        )}
                        {selectedVagaIds.length > 0 && (
                          <div className="pt-2 flex justify-center">
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                              Clique para Editar <ChevronDown size={12} className={isJobDropdownOpen ? 'rotate-180' : ''} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </button>

                  {isJobDropdownOpen && (
                    <div className="absolute top-0 left-0 right-0 mt-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-30 max-h-[400px] overflow-hidden flex flex-col animate-scaleUp">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="relative group">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="text"
                            autoFocus
                            value={vagaSearch}
                            onChange={(e) => setVagaSearch(e.target.value)}
                            placeholder="Buscar cargo ou código..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {filteredVagasList.length === 0 ? (
                          <div className="text-center py-12">
                            <Search size={32} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhuma vaga</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-1">
                            {filteredVagasList.map(vaga => (
                              <button
                                key={vaga.id}
                                onClick={() => toggleVagaSelection(vaga.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-[1.25rem] text-left transition-all relative overflow-hidden group/item ${selectedVagaIds.includes(vaga.id) ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                              >
                                {selectedVagaIds.includes(vaga.id) && (
                                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
                                )}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${selectedVagaIds.includes(vaga.id) ? 'bg-white/20 border-transparent' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                                  {selectedVagaIds.includes(vaga.id) ? <Check size={18} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600 group-hover/item:scale-150 transition-transform" />}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-xs font-black uppercase tracking-tight ${selectedVagaIds.includes(vaga.id) ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{vaga.role}</p>
                                  <div className="flex items-center gap-2 mt-0.5 opacity-60">
                                    <span className={`text-[9px] font-bold ${selectedVagaIds.includes(vaga.id) ? 'text-white/80' : 'text-slate-500'}`}>{vaga.jobCode}</span>
                                    <div className={`w-1 h-1 rounded-full ${selectedVagaIds.includes(vaga.id) ? 'bg-white/40' : 'bg-slate-300'}`} />
                                    <span className={`text-[9px] font-bold ${selectedVagaIds.includes(vaga.id) ? 'text-white/80' : 'text-slate-500'}`}>{vaga.city}</span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <button onClick={() => setSelectedVagaIds([])} className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Limpar Seleção</button>
                        <button onClick={() => setIsJobDropdownOpen(false)} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">Concluir</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 2. Preview WhatsApp Style */}
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-6 flex flex-col hover:scale-[1.01] transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Preview</h3>
                  {selectedVagas.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button onClick={prevPreview} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-75"><ChevronLeft size={16} /></button>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{previewIndex + 1}/{selectedVagas.length}</span>
                      <button onClick={nextPreview} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-75"><ChevronRight size={16} /></button>
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-[#F0F2F5] dark:bg-[#0b141a] rounded-3xl p-6 relative overflow-hidden flex flex-col min-h-[300px] shadow-inner">
                  {/* WhatsApp header look-alike */}
                  <div className="absolute top-0 left-0 right-0 h-10 bg-[#075e54] dark:bg-[#202c33] flex items-center px-4 gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200" />
                    <div className="flex-1 h-2 w-24 bg-white/20 rounded-full" />
                  </div>

                  <div className="mt-8 flex-1 flex flex-col justify-end">
                    {selectedVagas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                        <Smartphone size={48} className="text-slate-900 dark:text-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Aguardando seleção...</p>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-[#d9fdd3] dark:text-slate-900 self-start p-4 rounded-[1.25rem] rounded-tl-none shadow-sm max-w-[90%] relative group animate-scaleUp">
                        {/* SVG Tail for speech bubble */}
                        <div className="absolute top-0 left-[-10px] w-4 h-4 text-white dark:text-[#d9fdd3]">
                          <svg viewBox="0 0 8 13" preserveAspectRatio="none" className="w-full h-full fill-current"><path d="M1.533 3.568 8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path></svg>
                        </div>
                        <div className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
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
                        <div className="flex justify-end gap-1 mt-1 opacity-40">
                          <span className="text-[8px] font-bold uppercase">14:20</span>
                          <Check size={8} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4 items-center">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 dark:border-slate-800">
                    <TagIcon size={20} />
                  </div>
                  <p className="text-[9px] font-bold text-amber-700 dark:text-amber-300 leading-tight uppercase tracking-widest">Padrão Visual Sorogrupos Ativado. As mensagens serão entregues com formatação otimizada.</p>
                </div>
              </section>
            </div>
          </div>

          {/* Lado Direito: Grupos e Ações */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-8 h-full">
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none h-full flex flex-col space-y-6 hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Grupos</h3>
                <button
                  onClick={selectAllGroups}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                >
                  {selectedGroupIds.length === filteredGroups.length && filteredGroups.length > 0 ? 'Limpar Todos' : 'Selecionar Todos'}
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                    placeholder="Filtrar grupos..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border shadow-sm
                      ${selectedTag === null
                        ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/20'
                        : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500'}`}
                  >
                    Todos
                  </button>
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border shadow-sm
                        ${selectedTag === tag
                          ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/20'
                          : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500'}`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[400px]">
                {filteredGroups.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Users size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum grupo aqui</p>
                  </div>
                ) : (
                  filteredGroups.map(group => (
                    <div
                      key={group.id}
                      onClick={() => toggleGroupSelection(group.id)}
                      className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer relative overflow-hidden group/card
                        ${selectedGroupIds.includes(group.id)
                          ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-500/50 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {selectedGroupIds.includes(group.id) && (
                        <div className="absolute right-[-20px] top-[-20px] w-12 h-12 bg-blue-600 rotate-45 flex items-center justify-center pt-5 pr-5">
                          <Check size={12} className="text-white transform -rotate-45" />
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${selectedGroupIds.includes(group.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 group-hover/card:border-blue-500'}`}>
                        <Users size={20} />
                      </div>

                      <div className="flex-1">
                        <p className={`text-xs font-black uppercase tracking-tight ${selectedGroupIds.includes(group.id) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{group.name}</p>
                        <div className="flex gap-2 mt-1">
                          {group.tags.map(tag => (
                            <span key={tag} className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {selectedGroupIds.length > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alvos Selecionados</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{selectedGroupIds.length} Grupos</span>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsScheduling(!isScheduling)}
                      className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all border-2
                        ${isScheduling
                          ? 'bg-yellow-400 text-blue-950 border-yellow-400 shadow-[0_10px_30px_-10px_rgba(250,204,21,0.5)] scale-105'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 active:scale-95'}`}
                    >
                      <CalendarIcon size={18} /> Agendar
                    </button>
                    <button
                      disabled={selectedVagaIds.length === 0 || selectedGroupIds.length === 0}
                      onClick={handleSend}
                      className="flex-[1.5] flex items-center justify-center gap-3 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-900/40 dark:shadow-blue-600/30 disabled:opacity-50 hover:bg-black dark:hover:bg-blue-700 transition-all hover:translate-y-[-2px] active:translate-y-[0px] active:scale-95"
                    >
                      <Send size={18} /> Enviar Agora
                    </button>
                  </div>
                </div>

                {isScheduling && (
                  <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-800 space-y-6 animate-scaleUp shadow-2xl">
                    <div className="space-y-4">
                      <div className="space-y-3 relative" ref={datePickerRef}>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Data do Disparo</label>
                        <button
                          onClick={() => setShowDatePicker(!showDatePicker)}
                          className={`w-full flex items-center justify-between bg-slate-800/50 border-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${selectedDates.length > 0 ? 'border-yellow-400 text-white' : 'border-slate-700 text-slate-500'}`}
                        >
                          <div className="flex items-center gap-3">
                            <CalendarIcon size={16} className={selectedDates.length > 0 ? 'text-yellow-400' : 'text-slate-600'} />
                            <span>{selectedDates.length === 0 ? 'Selecionar Dias' : `${selectedDates.length} Selecionados`}</span>
                          </div>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {showDatePicker && (
                          <div className="absolute bottom-full mb-4 left-0 right-0 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl z-40 p-3 animate-scaleUp">
                            <div className="grid grid-cols-1 gap-2">
                              {nextDays.map(d => (
                                <button
                                  key={d.value}
                                  onClick={() => toggleDateSelection(d.value)}
                                  className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all border-2
                                    ${selectedDates.includes(d.value)
                                      ? 'bg-yellow-400 border-yellow-400 text-blue-950 scale-[1.02] shadow-lg shadow-yellow-400/20'
                                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                >
                                  <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-black uppercase tracking-tight">{d.value}</span>
                                    <span className="text-[8px] font-bold opacity-60 mt-1">{d.label}</span>
                                  </div>
                                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${selectedDates.includes(d.value) ? 'bg-blue-950 border-blue-950' : 'border-slate-700'}`}>
                                    {selectedDates.includes(d.value) && <Check size={12} className="text-white" />}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 relative" ref={timePickerRef}>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Horário Preferencial</label>
                        <button
                          onClick={() => setShowTimePicker(!showTimePicker)}
                          className={`w-full flex items-center justify-between bg-slate-800/50 border-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${scheduleTime ? 'border-yellow-400 text-white' : 'border-slate-700 text-slate-500'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock3 size={16} className={scheduleTime ? 'text-yellow-400' : 'text-slate-600'} />
                            <span>{scheduleTime || 'Escolha a Hora'}</span>
                          </div>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${showTimePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {showTimePicker && (
                          <div className="absolute bottom-full mb-4 left-0 right-0 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl z-40 p-4 animate-scaleUp">
                            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                              {timeSlots.map(t => (
                                <button
                                  key={t}
                                  onClick={() => { setScheduleTime(t); setShowTimePicker(false); }}
                                  className={`py-3 rounded-xl text-[10px] font-black transition-all border-2
                                    ${scheduleTime === t
                                      ? 'bg-yellow-400 border-yellow-400 text-blue-950 shadow-md'
                                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
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
                      className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30"
                    >
                      Confirmar {selectedDates.length} Disparos
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {view === 'schedules' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Envios Programados</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Fila de automação: {schedules.length} agendamentos</p>
              </div>
              <button
                onClick={() => setView('broadcast')}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={18} /> Novo Envio
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schedules.map(item => (
                <div key={item.id} className="flex flex-col p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:translate-y-[-4px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800">
                        <span className="text-lg font-black leading-none">{item.date.split('/')[0]}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{item.date.split('/')[1] === '05' ? 'MAI' : 'JUN'}</span>
                      </div>
                      <div>
                        <div className="bg-blue-600/10 dark:bg-blue-400/10 px-3 py-1 rounded-full w-fit mb-1 border border-blue-600/20">
                          <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">Automático</span>
                        </div>
                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">Disparo em Massa</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all border border-slate-100 dark:border-slate-800"><Eye size={18} /></button>
                      <button onClick={() => removeSchedule(item.id)} className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 hover:text-rose-500 shadow-sm transition-all border border-slate-100 dark:border-slate-800"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vagas</span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">{item.jobsCount} ITENS</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Canais</span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">{item.groupsCount} GRUPOS</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pronto para envio</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Clock size={14} className="text-blue-500" />
                        <span className="text-sm font-black">{item.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {schedules.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                  <CalendarDays size={64} className="mx-auto mb-6 text-slate-200" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Fila de agendamento vazia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'reports' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Histórico</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Registros dos últimos 30 dias</p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Todos</button>
              <button className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Sucesso</button>
              <button className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Falhas</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:translate-x-2 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Mass Broadcast #{1020 + i}</h4>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-md text-[8px] font-black uppercase tracking-widest">Sucesso</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><CalendarIcon size={12} /> 22/05/2024</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> 14:30</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> 5 Grupos Atingidos</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800 hidden md:block mx-4" />
                  <button className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <Eye size={18} /> Detalhes
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
