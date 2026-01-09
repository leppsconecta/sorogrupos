import React, { useState, useMemo, useRef, useEffect, createRef } from 'react';
import {
  Send,
  Search,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarDays,
  Trash2,
  Plus,
  Clock3,
  Calendar as CalendarIcon,
  Smartphone,
  AlertCircle,
  Edit2,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { JobEditModal } from '../components/JobEditModal';
import { SuccessModal } from '../components/SuccessModal';
import { JobSelectorModal } from '../components/JobSelectorModal';

// Helper for date formatting
const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Interfaces
interface Job {
  id: string;
  code: string;
  title: string;
  city: string;
  company_name: string;
  job_type: 'text' | 'image';
  status: string;
  created_at: string;
  // New fields for text generation
  description?: string; // fallback
  role: string;
  jobCode: string; // mapped from code
  hideCompany?: boolean;
  bond?: string;
  region?: string;
  activities?: string;
  requirements?: string;
  benefits?: string;
  imageUrl?: string;
  footerEnabled?: boolean;
  observation?: string;
  showObservation?: boolean;
  contacts: JobContact[];
}

interface JobContact {
  type: string;
  value: string;
  date?: string;
  time?: string;
  noDateTime?: boolean;
}

interface GroupTag {
  tags_group: {
    name: string;
  };
}

interface Group {
  id: string;
  name_group: string;
  total: number;
  image: string | null;
  whatsapp_groups_tags: GroupTag[];
}

interface Tag {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  jobsCount: number;
  groupsCount: number;
  date: string;
  time: string;
  status: 'pending' | 'success' | 'error';
}

const INITIAL_SCHEDULES: Schedule[] = []; // We can keep this empty or fetch from DB later

interface MarketingProps {
  isWhatsAppConnected: boolean;
  onOpenConnect: () => void;
}

export const Marketing: React.FC<MarketingProps> = ({ isWhatsAppConnected, onOpenConnect }) => {
  const navigate = useNavigate();
  const { company, user } = useAuth();
  const [view, setView] = useState<'broadcast' | 'reports' | 'schedules'>('broadcast');

  // Data States
  const [vagas, setVagas] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [isSending, setIsSending] = useState(false);

  // Carousel state
  const [previewIndex, setPreviewIndex] = useState(0);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Schedules state
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingJob, setEditingJob] = useState<any>(null);

  // Dropdown states & Refs for Click Outside
  // Modal State
  const [isJobSelectorOpen, setIsJobSelectorOpen] = useState(false);


  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const vagaItemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const groupItemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*, job_contacts(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });



      // Fetch Groups with tags
      const { data: groupsData } = await supabase
        .from('whatsapp_groups')
        .select(`
          id,
          name_group,
          total,
          image,
          whatsapp_groups_tags (
            tags_group (
              name
            )
          )
        `)
        .eq('user_id', user.id);

      // Fetch Tags
      const { data: tagsData } = await supabase
        .from('tags_group')
        .select('name')
        .eq('user_id', user.id);

      if (jobsData) {
        const mappedVagas = jobsData.map(j => ({
          id: j.id,
          role: j.title, // Map title to role
          jobCode: j.code, // Map code to jobCode
          type: j.job_type === 'text' ? 'scratch' : 'file',
          companyName: j.company_name,
          city: j.city,
          status: j.status,
          image: j.file_url || j.image_url, // For display
          content: j.description,
          created_at: j.created_at,
          // Mapped fields
          hideCompany: j.hide_company,
          bond: j.employment_type === 'CLT' ? 'CLT ( Fixo )' : j.employment_type === 'PJ' ? 'Pessoa Jurídica' : j.employment_type,
          region: j.region,
          activities: j.activities,
          requirements: j.requirements,
          benefits: j.benefits,
          imageUrl: j.image_url || j.file_url, // Raw url
          footerEnabled: j.footer_enabled,
          observation: j.observation,
          showObservation: j.show_observation,
          contacts: (j.job_contacts || []).map((c: any) => ({
            type: c.type === 'whatsapp' ? 'WhatsApp' :
              c.type === 'email' ? 'Email' :
                c.type === 'address' ? 'Endereço' : 'Link',
            value: c.value,
            date: c.date,
            time: c.time,
            noDateTime: c.no_date_time
          }))
        }));
        setVagas(mappedVagas);
      }

      if (groupsData) {
        const mappedGroups = groupsData.map(g => ({
          id: g.id,
          name: g.name_group, // Map name_group to name
          members: g.total, // Map total to members
          image: g.image,
          tags: g.whatsapp_groups_tags.map((t: any) => t.tags_group?.name).filter(Boolean) // Flatten tags
        }));
        setGroups(mappedGroups);
      }

      if (tagsData) {
        setAvailableTags(tagsData.map(t => t.name));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    return groups.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(groupSearch.toLowerCase());
      const matchesTag = selectedTag ? g.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [groups, groupSearch, selectedTag]);

  const filteredVagasList = useMemo(() => {
    return vagas.filter(v =>
      v.role.toLowerCase().includes(vagaSearch.toLowerCase()) ||
      v.jobCode.toLowerCase().includes(vagaSearch.toLowerCase()) ||
      v.city.toLowerCase().includes(vagaSearch.toLowerCase())
    );
  }, [vagas, vagaSearch]);

  const selectedVagas = useMemo(() => {
    return vagas.filter(v => selectedVagaIds.includes(v.id));
  }, [vagas, selectedVagaIds]);

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

  const generateJobText = (job: any) => {
    if (!job) return '';
    const code = job.jobCode || '---';
    const cvParts: string[] = [];
    const addressParts: string[] = [];
    const linkParts: string[] = [];

    job.contacts?.forEach((c: any) => {
      if (c.type === 'WhatsApp') cvParts.push(`WhatsApp ${c.value}`);
      else if (c.type === 'Email') cvParts.push(`e-mail ${c.value}`);
      else if (c.type === 'Link') linkParts.push(`Link ${c.value}`);
      else if (c.type === 'Endereço') {
        const addressBase = `${c.value}`;
        // Simple date format if needed, defaulting to string as we don't have full date formatter here unless reused
        if (!c.noDateTime) {
          const dateStr = c.date ? new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
          addressParts.push(`${addressBase} no dia ${dateStr} às ${c.time || '__:__'}`);
        } else {
          addressParts.push(addressBase);
        }
      }
    });

    const joinList = (list: string[]) => {
      if (list.length === 0) return '';
      if (list.length === 1) return list[0];
      const last = list.pop();
      return `${list.join(', ')} ou ${last}`;
    };

    const cvText = cvParts.length > 0 ? `Enviar curriculo com o nome da vaga/codigo para: ${joinList(cvParts)}` : '';
    const addressText = addressParts.length > 0 ? `Compareça no endereço: ${joinList(addressParts)}` : '';
    const linkText = linkParts.length > 0 ? `Acesse: ${joinList(linkParts)}` : '';

    const finalParts = [cvText, addressText, linkText].filter(Boolean);
    const interessadosText = finalParts.length > 0 ? joinList(finalParts) : 'Entre em contato pelos canais oficiais.';

    // Image Job Text Structure (Simpler)
    if (job.type === 'file') {
      const observationText = job.showObservation && job.observation ? `\nObs: ${job.observation}\n` : '';
      return `*${company?.name || 'Sua Empresa'}* 🟡🔴🤣
      -----------------------------
Função: *${job.role || ''}*
Cód. Vaga: *${code}*
-----------------------------${observationText}
*Interessados*
 ${interessadosText}`;
    }

    // Text Job Structure (Full)
    return `*${company?.name || 'Sua Empresa'}* 🟡🔴🤣
-----------------------------
Função: *${job.role || ''}*
Cód. Vaga: *${code}*
-----------------------------  
*Vínculo:* ${job.bond || 'CLT'}
*Empresa:* ${job.hideCompany ? '(Oculto)' : job.companyName || ''}
*Cidade/Bairro:* ${job.city || ''} - ${job.region || ''}
*Requisitos:* ${job.requirements || ''}
*Benefícios:* ${job.benefits || ''}
*Atividades:* ${job.activities || ''}

*Interessados*
 ${interessadosText}
----------------------------- 

*Mais informações:*
➞ ${company?.name || 'Lepps |Conecta'}
➞ ${company?.whatsapp || '11946610753'}
➞ ${company?.website || 'leppsconecta.com.br'}`;
  };

  /* New: Utility to save schedule/send action to DB */
  const saveScheduleToDB = async (status: 'pending' | 'sent', dateStr: string, timeStr: string) => {
    try {
      const inserts = selectedVagaIds.flatMap(jobId =>
        selectedGroupIds.map(groupId => ({
          user_id: user?.id,
          jobs_count: 1, // One record per job
          groups_count: 1, // One record per group
          scheduled_date: dateStr,
          scheduled_time: timeStr,
          status: status,
          publish_status: 0,
          jobs_ids: [jobId], // Single ID in array
          groups_ids: [groupId], // Single ID in array
          id_group: groupId // Single Group ID string
        }))
      );

      const { error } = await supabase
        .from('marketing_schedules')
        .insert(inserts);

      if (error) {
        console.error('Error saving schedule:', error);
        alert('Erro ao salvar agendamento: ' + error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception saving schedule:', err);
      return false;
    }
  };

  const handleSend = async () => {
    if (selectedVagaIds.length === 0 || selectedGroupIds.length === 0 || isSending) return;

    try {
      setIsSending(true);
      // Save as "sent" (executed immediately)
      const now = new Date();
      // Use YYYY-MM-DD for DB compatibility
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const success = await saveScheduleToDB('sent', dateStr, timeStr);

      if (success) {
        setSuccessMessage("O envio será processado em breve");
        setSuccessModalOpen(true);

        // Reset selection
        setSelectedVagaIds([]);
        setSelectedGroupIds([]);
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      alert("Erro ao enviar.");
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (selectedDates.length === 0 || !scheduleTime) return;

    const datePart = selectedDates[0]; // expect YYYY-MM-DD
    // Create Date from inputs
    // datePart is YYYY-MM-DD, scheduleTime is HH:MM
    // We need to parse explicitly to avoid timezone issues or just use string construction
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = scheduleTime.split(':').map(Number);

    const scheduledDate = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    // Calculate difference in minutes
    const diffMs = scheduledDate.getTime() - now.getTime();
    const diffMins = diffMs / 60000;

    if (diffMins < 30) {
      alert("Selecione um horário pelo menos 30 minutos após o horário atual.");
      return;
    }

    const success = await saveScheduleToDB(
      'pending',
      datePart,
      scheduleTime
    );

    if (success) {
      setSuccessMessage("O envio foi programado, aguarde para verificar status");
      setSuccessModalOpen(true);
      setIsScheduling(false);
      // Reset form
      setSelectedDates([]);
      setScheduleTime('');
      setSelectedVagaIds([]);
      setSelectedGroupIds([]);
    }
  };

  const removeSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return d;
    });
  };

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        // Updated Logic: Prevent navigation if next month is completely out of range
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 30);

        // Check if the FIRST day of next month is beyond maxDate
        const nextMonthFirstDay = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
        if (nextMonthFirstDay > maxDate) {
          return prev;
        }
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    // Normalize date to compare dates only
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today || checkDate > maxDate;
  };

  const formatDateValue = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const toggleDateSelection = (date: Date) => {
    const dateStr = formatDateValue(date);
    // Single selection logic
    setSelectedDates(prev => {
      if (prev[0] === dateStr) return []; // Deselect if same
      return [dateStr]; // Replace with new
    });
  };

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="space-y-4">


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
            <div className={`bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-blue-500/30`}>
              <div className="relative">
                <button
                  onClick={() => setIsJobSelectorOpen(true)}
                  className="w-full text-left group"
                >
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Conteúdo do Envio</label>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 transition-colors border border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-800/50">
                    <div>
                      {selectedVagaIds.length === 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Search size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Selecionar Vagas</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Clique para buscar e adicionar</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <span className="font-black text-lg">{selectedVagaIds.length}</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white">vagas selecionadas</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Clique para alterar seleção</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 text-slate-400 shadow-sm group-hover:text-blue-500 transition-all`}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <JobSelectorModal
              isOpen={isJobSelectorOpen}
              onClose={() => setIsJobSelectorOpen(false)}
              vagas={vagas}
              selectedVagaIds={selectedVagaIds}
              onToggleVaga={toggleVagaSelection}
              onClearSelection={() => setSelectedVagaIds([])}
            />

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
                          {selectedVagas[previewIndex]?.type === 'file' ? (
                            <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              {/* Full Image Display */}
                              <div className="relative w-full flex items-center justify-center bg-slate-900 min-h-[200px]">
                                {selectedVagas[previewIndex]?.image ? (
                                  <img
                                    src={selectedVagas[previewIndex].image}
                                    alt="Vaga"
                                    className="w-full h-auto max-h-[400px] object-contain"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-10 opacity-50 text-white">
                                    <ImageIcon size={48} />
                                    <span className="text-xs font-bold mt-2 uppercase tracking-widest">Sem Imagem</span>
                                  </div>
                                )}
                              </div>

                              {/* Carousel Controls (Over Image) */}
                              {selectedVagas.length > 1 && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); prevPreview(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-10 hover:scale-110 active:scale-95"><ChevronLeft size={20} /></button>
                                  <button onClick={(e) => { e.stopPropagation(); nextPreview(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-10 hover:scale-110 active:scale-95"><ChevronRight size={20} /></button>

                                  <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/50 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm z-10 border border-white/10 shadow-sm">
                                    {previewIndex + 1} / {selectedVagas.length}
                                  </div>
                                </>
                              )}

                              {/* Caption for Image - Text displayed below image */}
                              <div className="p-3 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 font-medium leading-snug whitespace-pre-wrap">
                                {generateJobText(selectedVagas[previewIndex]).split('\n').map((line, i) => (
                                  <React.Fragment key={i}>
                                    {line.split(/(\*[^*]+\*)/g).map((part, j) => (
                                      part.startsWith('*') && part.endsWith('*') ? (
                                        <strong key={j}>{part.slice(1, -1)}</strong>
                                      ) : (
                                        <span key={j}>{part}</span>
                                      )
                                    ))}
                                    <br />
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="relative rounded-lg bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-100 dark:border-slate-800">
                              {/* Text Job Display */}
                              <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium leading-snug">
                                {generateJobText(selectedVagas[previewIndex]).split('\n').map((line, i) => (
                                  <React.Fragment key={i}>
                                    {line.split(/(\*[^*]+\*)/g).map((part, j) => (
                                      part.startsWith('*') && part.endsWith('*') ? (
                                        <strong key={j}>{part.slice(1, -1)}</strong>
                                      ) : (
                                        <span key={j}>{part}</span>
                                      )
                                    ))}
                                    <br />
                                  </React.Fragment>
                                ))}
                              </div>

                              {/* Carousel Controls for Text */}
                              {selectedVagas.length > 1 && (
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                                  <button onClick={(e) => { e.stopPropagation(); prevPreview(); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><ChevronLeft size={16} /></button>
                                  <span className="text-[10px] font-bold text-slate-400">{previewIndex + 1} / {selectedVagas.length}</span>
                                  <button onClick={(e) => { e.stopPropagation(); nextPreview(); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><ChevronRight size={16} /></button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons (Outside Bubble) */}
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => {
                                setEditingJob(selectedVagas[previewIndex]);
                                setIsEditModalOpen(true);
                              }}
                              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                              title="Editar Vaga"
                            >
                              <Edit2 size={14} /> Editar
                            </button>
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
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
              {/* Selection Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Destinatários</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500 font-medium">Selecione os grupos</p>
                    {selectedGroupIds.length > 0 && (
                      <span className="hidden md:inline-block text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                        {selectedGroupIds.length} selecionados
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={selectAllGroups}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedGroupIds.length === filteredGroups.length && filteredGroups.length > 0
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-500 border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    <span className="md:hidden">Todos</span><span className="hidden md:inline">Selecionar Todos</span>
                  </button>
                  {selectedGroupIds.length > 0 && (
                    <button
                      onClick={() => setSelectedGroupIds([])}
                      className="text-[9px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider hover:underline pr-1"
                    >
                      Limpar
                    </button>
                  )}
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
                  {availableTags.map(tag => (
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
                {/* Mobile Count (Below Tags) */}
                {selectedGroupIds.length > 0 && (
                  <div className="md:hidden mt-3 px-1">
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                      {selectedGroupIds.length} selecionados
                    </span>
                  </div>
                )}
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
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors overflow-hidden ${isSelected ? 'bg-white border-2 border-blue-100' : 'bg-slate-100 dark:bg-slate-800'
                          } ${(!group.image || group.image === 'sem_imagem' || group.image === 'sem_image') ? '!bg-slate-300 dark:!bg-slate-600' : ''}`}>
                          {group.image && group.image !== 'sem_imagem' && group.image !== 'sem_image' ? (
                            <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users size={18} className="text-slate-500 dark:text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>{group.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 flex-shrink-0"><Users size={10} /> {group.members} membros</span>
                            <div className="flex gap-1 overflow-hidden">
                              {group.tags.map(t => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded text-slate-500 font-medium uppercase whitespace-nowrap">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-200 dark:border-slate-700'}`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  onClick={() => setIsScheduling(!isScheduling)}
                  disabled={selectedVagaIds.length === 0 || selectedGroupIds.length === 0}
                  className="py-3.5 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 border border-slate-200 dark:border-slate-700"
                >
                  <CalendarDays size={18} /> Agendar
                </button>
                <button
                  onClick={handleSend}
                  disabled={selectedVagaIds.length === 0 || selectedGroupIds.length === 0 || isSending}
                  className="py-3.5 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {isSending ? 'Enviando...' : 'Enviar Agora'}
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

                <div className="space-y-4">
                  {/* Custom Calendar */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">

                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => handleMonthChange('prev')}
                        disabled={isDateDisabled(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0))}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                        {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => handleMonthChange('next')}
                        disabled={isDateDisabled(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 mb-2">
                      {weekDays.map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}

                      {calendarDays.map(date => {
                        const dateStr = formatDateValue(date);
                        const isSelected = selectedDates.includes(dateStr);
                        const disabled = isDateDisabled(date);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() => toggleDateSelection(date)}
                            disabled={disabled}
                            className={`
                                h-8 w-full rounded-lg text-xs font-medium transition-all flex items-center justify-center relative
                                ${isSelected
                                ? 'bg-blue-600 text-white shadow-md'
                                : disabled
                                  ? 'text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'}
                                ${isToday && !isSelected ? 'border border-blue-200 dark:border-blue-800 text-blue-600' : ''}
                              `}
                          >
                            {date.getDate()}
                            {isSelected && <div className="absolute bottom-0.5 w-1 h-1 bg-white rounded-full" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Input (Flexible) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Horário do Disparo</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Clock3 size={18} />
                      </div>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all cursor-pointer"
                      />
                    </div>
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

      )
      }

      {
        view === 'reports' && (
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

      {/* Edit Modal */}
      <JobEditModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingJob(null); }}
        jobToEdit={editingJob}
        hideBackButton={true}
        onSave={() => {
          fetchData();
          setIsEditModalOpen(false);
          setEditingJob(null);
        }}
      />

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message={successMessage}
        autoCloseDuration={5000}
      />
    </div >
  );
};
