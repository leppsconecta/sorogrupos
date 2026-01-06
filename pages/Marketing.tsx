import React, { useState, useMemo, useRef, useEffect, createRef } from 'react';
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
  const vagaItemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const groupItemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});

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
      // Scroll to selected item
      setTimeout(() => {
        const ref = vagaItemRefs.current[id];
        if (ref?.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return [...prev, id];
    });
  };

  const toggleGroupSelection = (id: string) => {
    setSelectedGroupIds(prev => {
      const isCurrentlySelected = prev.includes(id);
      if (!isCurrentlySelected) {
        // Scroll to selected item
        setTimeout(() => {
          const ref = groupItemRefs.current[id];
          if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
      return isCurrentlySelected ? prev.filter(gId => gId !== id) : [...prev, id];
    });
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

  const handleScheduleSubmit = () => {
    const newSchedule = {
      id: `s${Date.now()}`,
      jobsCount: selectedVagaIds.length,
      groupsCount: selectedGroupIds.length,
      date: selectedDates.join(', '),
      time: scheduleTime,
      status: 'pending'
    };
    setSchedules([...schedules, newSchedule]);
    setIsScheduling(false);
    setView('schedules');
    setSelectedDates([]);
    setScheduleTime('');
    setSelectedVagaIds([]);
    setSelectedGroupIds([]);
  };

  const removeSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Generate date slots (today + 14 days)
  // Helper to generate next 7 days
  const generateNext7Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      dates.push(`${day}/${month}`);
    }
    return dates;
  };

  const dateSlots = useMemo(() => generateNext7Days(), []);

  // Generate time slots 24h, ordered starting from 07:00
  const timeSlots = useMemo(() => {
    const slots = [];
    // 07:00 to 23:00
    for (let i = 7; i <= 23; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
    }
    // 00:00 to 06:00
    for (let i = 0; i < 7; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-600 dark:text-yellow-400 border border-yellow-400/20">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Broadcasting</h2>
            <p className="text-sm text-slate-500 font-medium">Gerencie seus disparos e agendamentos.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          {[{ id: 'broadcast', label: 'Novo Envio', icon: Megaphone }, { id: 'schedules', label: 'Agendamentos', icon: CalendarDays }, { id: 'reports', label: 'Histórico', icon: History }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap
                ${view === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          {/* Left Column: Vagas & Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 px-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedVagaIds.length > 0 ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>1</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selecionar Vagas</span>
              <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedGroupIds.length > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Grupos</span>
              <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">3</div>
            </div>

            {/* Vaga Selection Card */}
            <div className={`bg-white dark:bg-slate-900 rounded-[2rem] p-5 border transition-all duration-300 ${isJobDropdownOpen ? 'border-blue-500/50 shadow-lg shadow-blue-500/5' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}>
              <div ref={jobDropdownRef} className="relative">
                <button
                  onClick={() => {
                    setIsJobDropdownOpen(!isJobDropdownOpen);
                    // Autofocus search on open
                    setTimeout(() => {
                      const input = jobDropdownRef.current?.querySelector('input');
                      if (input) (input as HTMLInputElement).focus();
                    }, 100);
                  }}
                  className="w-full text-left"
                >
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Conteúdo do Envio</label>
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div>
                      {selectedVagaIds.length === 0 ? (
                        <h3 className="text-lg font-bold text-slate-400">Selecione as Vagas</h3>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-800 dark:text-white leading-none">{selectedVagaIds.length} Vagas Selecionadas</span>
                        </div>
                      )}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isJobDropdownOpen ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </button>

                {/* Dropdown Content */}
                {isJobDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-scaleUp origin-top">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                      <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="text"
                          autoFocus
                          value={vagaSearch}
                          onChange={(e) => setVagaSearch(e.target.value)}
                          placeholder="Buscar cargo ou código..."
                          className="w-full bg-slate-50 dark:bg-slate-800/50 pl-11 pr-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-all"
                        />
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                      {filteredVagasList.length > 0 ? (
                        filteredVagasList.map(vaga => {
                          const isSelected = selectedVagaIds.includes(vaga.id);
                          if (!vagaItemRefs.current[vaga.id]) {
                            vagaItemRefs.current[vaga.id] = createRef<HTMLDivElement>();
                          }
                          return (
                            <div
                              key={vaga.id}
                              ref={vagaItemRefs.current[vaga.id]}
                              onClick={() => toggleVagaSelection(vaga.id)}
                              className={`p-3 rounded-2xl cursor-pointer mb-1 transition-all flex items-center justify-between group
                                ${isSelected
                                  ? 'bg-blue-50 dark:bg-blue-900/20'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              <div>
                                <h4 className={`font-semibold text-xs ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{vaga.role}</h4>
                                <p className="text-[10px] font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{vaga.jobCode}</span>
                                  <span>{vaga.companyName}</span>
                                </p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all
                                ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-200 dark:border-slate-700 group-hover:border-blue-300'}`}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-slate-400">
                          <p className="text-xs font-bold">Nenhuma vaga encontrada</p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <button onClick={() => setSelectedVagaIds([])} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 px-3 py-2 transition-colors uppercase tracking-widest">Limpar</button>
                      <button onClick={() => setIsJobDropdownOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all">Pronto</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WhatsApp Preview Card */}
            <div className="bg-[#F0F2F5] dark:bg-[#0b141a] p-5 rounded-[2rem] shadow-inner relative overflow-hidden group">
              {/* Pattern Background Overlay */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              {/* WhatsApp Header Mock */}
              <div className="bg-[#008069] dark:bg-[#202c33] h-14 absolute top-0 left-0 right-0 px-4 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <ChevronLeft className="text-white" size={24} />
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Sorogrupos&background=random" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm leading-tight">Grupo de Divulgação</span>
                    <span className="text-white/80 text-[10px] truncate w-24 font-normal">Ana, Beto, Carla...</span>
                  </div>
                </div>
                <div className="flex gap-4 text-white">
                  <Smartphone size={20} />
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="mt-16 relative z-0">


                {selectedVagaIds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-60">
                    <Smartphone size={48} className="mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest text-center">Prévia da Mensagem<br />Aparecerá aqui</p>
                  </div>
                ) : (
                  <div className="flex justify-center animate-scaleUp">
                    <div className="bg-white dark:bg-[#202c33] p-4 rounded-[1.25rem] rounded-tl-none shadow-sm max-w-[85%] relative w-full">
                      {/* Triangle Tail */}
                      <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -left-2 text-white dark:text-[#202c33] fill-current"><path opacity="0.13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path><path d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path></svg>

                      {/* Message Content */}
                      {selectedVagas.length > 0 && (
                        <div className="space-y-3">
                          <div className="relative rounded-lg overflow-hidden aspect-video bg-slate-200">
                            {/* Placeholder for Job Image */}
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white">
                              <span className="font-black text-2xl uppercase tracking-widest opacity-20">VAGA</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                              <p className="text-white text-xs font-bold truncate">{selectedVagas[previewIndex]?.role}</p>
                            </div>

                            {/* Carousel Controls */}
                            {selectedVagas.length > 1 && (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); prevPreview(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-10 hover:scale-110 active:scale-95"><ChevronLeft size={20} /></button>
                                <button onClick={(e) => { e.stopPropagation(); nextPreview(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-10 hover:scale-110 active:scale-95"><ChevronRight size={20} /></button>

                                <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/50 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm z-10 border border-white/10 shadow-sm">
                                  {previewIndex + 1} / {selectedVagas.length}
                                </div>
                              </>
                            )}
                          </div>

                          <div className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-snug">
                            <p className="font-bold mb-1">🔥 NOVA OPORTUNIDADE!</p>
                            <p>Cargo: *{selectedVagas[previewIndex]?.role}*</p>
                            <p>Cidade: {selectedVagas[previewIndex]?.city}</p>
                            <p className="mt-2 text-xs opacity-80">Toque abaixo para ver mais detalhes e se candidatar 👇</p>
                          </div>


                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
                            <button className="w-full py-2 bg-blue-50 text-blue-600 rounded text-xs font-bold text-center">Ver Vaga Completa</button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end mt-1 gap-1 items-center opacity-60">
                        <span className="text-[10px] text-slate-500 font-medium">10:42</span>
                        <Check size={14} className="text-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Right Column: Grupos & Scheduling */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col relative overflow-hidden">
              {/* Selection Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Destinatários</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Selecione os grupos para disparo</p>
                </div>
                <div className="bg-blue-50/80 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                  {selectedGroupIds.length} Selecionados
                </div>
              </div>

              {/* Tag Filters */}
              <div className="mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600 -mx-2 px-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm
                      ${selectedTag === null
                        ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-800/20'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-400 hover:text-blue-500'}`}
                  >
                    Todos
                  </button>
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm
                        ${selectedTag === tag
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                          : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-400 hover:text-blue-500'}`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 min-h-[300px] max-h-[500px]">
                {filteredGroups.map(group => {
                  const isSelected = selectedGroupIds.includes(group.id);
                  return (
                    <div
                      key={group.id}
                      onClick={() => toggleGroupSelection(group.id)}
                      className={`p-4 mb-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group
                         ${isSelected
                          ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800'
                          : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 bg-white dark:bg-slate-800/30'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          <Users size={18} />
                        </div>
                        <div>
                          <h4 className={`font-semibold text-sm ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>{group.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><Users size={10} /> {group.members} membros</span>
                            <div className="flex gap-1">
                              {group.tags.map(t => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded text-slate-500 font-medium uppercase">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-200 dark:border-slate-700'}`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-widest px-2">
                  <button onClick={selectAllGroups} className="hover:text-blue-600 transition-colors">Selecionar Todos</button>
                  <button onClick={() => setSelectedGroupIds([])} className="hover:text-rose-500 transition-colors">Limpar</button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button
                    onClick={() => setIsScheduling(!isScheduling)}
                    disabled={selectedVagaIds.length === 0 || selectedGroupIds.length === 0}
                    className="py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 border border-slate-200 dark:border-slate-700"
                  >
                    <CalendarDays size={18} /> Agendar
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={selectedVagaIds.length === 0 || selectedGroupIds.length === 0}
                    className="py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                  >
                    <Send size={18} /> Enviar Agora
                  </button>
                </div>
              </div>

              {/* Inline Scheduling Drawer */}
              {isScheduling && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-slate-800 dark:text-white font-bold uppercase tracking-tight flex items-center gap-2 text-sm">
                      <CalendarDays className="text-blue-600" size={18} /> Configurar Agendamento
                    </h4>
                    <button onClick={() => setIsScheduling(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={16} /></button>
                  </div>

                  <div className="space-y-3">
                    {/* Date Picker */}
                    <div className="relative" ref={datePickerRef}>
                      <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                            ${selectedDates.length > 0 ? 'border-blue-500 text-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                      >
                        <div className="flex items-center gap-3">
                          <CalendarIcon size={14} className={selectedDates.length > 0 ? 'text-blue-600' : 'text-slate-400'} />
                          <span>{selectedDates.length > 0 ? `${selectedDates.length} datas selecionadas` : 'Escolha a Data'}</span>
                        </div>
                        <ChevronDown size={12} className={`transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`} />
                      </button>

                      {showDatePicker && (
                        <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 animate-scaleUp">
                          <div className="grid grid-cols-4 gap-2">
                            {dateSlots.map(date => (
                              <button
                                key={date}
                                onClick={() => {
                                  setSelectedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
                                }}
                                className={`p-2 rounded-lg text-[10px] font-bold transition-all border relative
                                    ${selectedDates.includes(date)
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'}`}
                              >
                                {date}
                                {selectedDates.includes(date) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Time Picker */}
                    <div className="relative" ref={timePickerRef}>
                      <button
                        onClick={() => setShowTimePicker(!showTimePicker)}
                        className={`w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                            ${scheduleTime ? 'border-blue-500 text-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock3 size={14} className={scheduleTime ? 'text-blue-600' : 'text-slate-400'} />
                          <span>{scheduleTime || 'Escolha a Hora'}</span>
                        </div>
                        <ChevronDown size={12} className={`transition-transform duration-300 ${showTimePicker ? 'rotate-180' : ''}`} />
                      </button>

                      {showTimePicker && (
                        <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 animate-scaleUp">
                          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                            {timeSlots.map(t => (
                              <button
                                key={t}
                                onClick={() => { setScheduleTime(t); setShowTimePicker(false); }}
                                className={`py-2 rounded-lg text-[10px] font-bold transition-all border
                                    ${scheduleTime === t
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'}`}
                              >
                                {t}
                              </button>
                            ))}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleScheduleSubmit}
                    disabled={selectedDates.length === 0 || !scheduleTime}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Confirmar {selectedDates.length > 0 ? selectedDates.length : ''} Agendamento{selectedDates.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )
      }

      {
        view === 'schedules' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Envios Programados</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Fila de automação: {schedules.length} agendamentos</p>
                </div>
                <button
                  onClick={() => setView('broadcast')}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={18} /> Novo Envio
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schedules.map(item => (
                  <div key={item.id} className="flex flex-col p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:translate-y-[-4px]">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800">
                          <span className="text-lg font-bold leading-none">{item.date.split('/')[0]}</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">{item.date.split('/')[1] === '05' ? 'MAI' : 'JUN'}</span>
                        </div>
                        <div>
                          <div className="bg-blue-600/10 dark:bg-blue-400/10 px-3 py-1 rounded-full w-fit mb-1 border border-blue-600/20">
                            <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">Automático</span>
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm">Disparo em Massa</h4>
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
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.jobsCount} ITENS</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Canais</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.groupsCount} GRUPOS</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pronto para envio</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-sm font-bold">{item.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center py-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                    <CalendarDays size={64} className="mx-auto mb-6 text-slate-200" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Fila de agendamento vazia</p>
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Histórico</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Registros dos últimos 30 dias</p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg">Todos</button>
              <button className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">Sucesso</button>
              <button className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">Falhas</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:translate-x-2 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Mass Broadcast #{1020 + i}</h4>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-md text-[8px] font-bold uppercase tracking-widest">Sucesso</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><CalendarIcon size={12} /> 22/05/2024</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> 14:30</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> 5 Grupos Atingidos</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800 hidden md:block mx-4" />
                  <button className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    <Eye size={18} /> Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
      }
    </div>
  );
};
