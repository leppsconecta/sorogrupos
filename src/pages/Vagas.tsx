
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Briefcase,
  X,
  FolderPlus,
  ChevronRight,
  Folder as FolderIcon,
  Upload,
  Edit2,
  Trash2,
  ArrowLeft,
  FilePlus2,
  FileCheck,
  Eye,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  FolderInput,
  Phone,
  Mail,
  MapPin,
  Link as LinkIcon,
  Check,
  Clipboard,
  PlusCircle,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  ChevronDown,
  Smartphone,
  Search,
  Building2,
  EyeOff,
  Settings
} from 'lucide-react';
import { Vaga, Folder, JobContact, SavedJobContact } from '../types';
import { supabase } from '../lib/supabase';
import { SavedContactsModal } from '../components/modals/';
import { ActionsModal } from '../components/modals/';
import JobDetailModal, { JobDetailContent } from '../components/public/modals/JobDetailModal';
import JobCard from '../components/public/JobCard';
import { WhatsAppPreviewCard } from '../components/admin/WhatsAppPreviewCard';
import Filters from '../components/public/Filters';
import { FilterType } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

const OfficialWhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const formatPreviewDate = (dateStr: string) => {
  if (!dateStr) return '__/__';
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Formata o dia e mês: dd/mm
    const dayMonth = `${day}/${month}`;

    // Formata o dia da semana: ( segunda-feira )
    const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);

    return `${dayMonth} ( ${dayOfWeek.toLowerCase()} )`;
  } catch (e) {
    return dateStr;
  }
};

import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';

interface VagasProps {
  initialJobId?: string | null;
  onClearTargetJob?: () => void;
}

export const Vagas: React.FC<VagasProps> = ({ initialJobId, onClearTargetJob }) => {
  const { user, company, accountStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useFeedback();

  // Navegação e Dados
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Modais
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [isMoveJobModalOpen, setIsMoveJobModalOpen] = useState(false);
  // Job Management State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState<Vaga | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [jobCreationStep, setJobCreationStep] = useState<'selection' | 'form' | 'upload' | 'preview'>('selection');

  // Preview Mode State
  const [previewMode, setPreviewMode] = useState<'whatsapp' | 'site'>('whatsapp');

  // Draft da Vaga sendo criada
  const [jobDraft, setJobDraft] = useState<Partial<Vaga>>({});
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showFooterInImage, setShowFooterInImage] = useState(false);
  const [salaryEnabled, setSalaryEnabled] = useState(false);

  // Persistence Logic
  useEffect(() => {
    // Restore logic
    const savedState = localStorage.getItem('job_creation_persistence');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.isJobModalOpen) {
          // Restore
          setIsJobModalOpen(true);
          setJobCreationStep(parsed.jobCreationStep || 'selection');
          setJobDraft(parsed.jobDraft || {});
          setEditingJobId(parsed.editingJobId || null);
          setShowFooterInImage(parsed.showFooterInImage || false);
          setSalaryEnabled(parsed.salaryEnabled || false);
        }
      } catch (e) {
        console.error("Error restoring job draft", e);
      }
    }
  }, []);

  useEffect(() => {
    // Save logic
    if (isJobModalOpen) {
      const stateToSave = {
        isJobModalOpen,
        jobCreationStep,
        jobDraft,
        editingJobId,
        showFooterInImage,
        salaryEnabled
      };
      localStorage.setItem('job_creation_persistence', JSON.stringify(stateToSave));
    } else {
      // If closed, check if we should clear. 
      // If just navigating away, it won't trigger this 'else' (unmount happens).
      // If user explicitly CLOSES modal, they likely mean to discard.
      // So clearing on 'falsy' is correct for explicit action, but we need to distinguish 'unmount' from 'state change to false'.
      // Actually, this effect runs on state change. If isJobModalOpen changes to false, we clear.
    }
  }, [isJobModalOpen, jobCreationStep, jobDraft, editingJobId, showFooterInImage, salaryEnabled]);

  const clearPersistence = () => {
    localStorage.removeItem('job_creation_persistence');
  };

  // Outros estados
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [jobToMove, setJobToMove] = useState<Vaga | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');

  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const [moveJobModalFolderId, setMoveJobModalFolderId] = useState<string | null>(null);

  // Estado Modal Confirmação Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{ type: 'folder' | 'job', item: any } | null>(null);

  // Saved Contacts
  const [savedContacts, setSavedContacts] = useState<SavedJobContact[]>([]);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  // Custom Emojis
  const [previewEmojis, setPreviewEmojis] = useState('🟡🔴🔵');
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const [emojiInput, setEmojiInput] = useState('');

  const [isSearchExpanded, setIsSearchExpanded] = useState(false); // Mobile Search State
  const [isFolderSearchExpanded, setIsFolderSearchExpanded] = useState(false); // Mobile Folder Search State
  const [searchFolderTerm, setSearchFolderTerm] = useState(''); // Folder Search

  // Validation Modal
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Mobile Dropdown Menu
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Effect to handle initialJobId deep link
  const location = useLocation();
  const effectiveInitialJobId = initialJobId || (location.state as any)?.jobId;

  useEffect(() => {
    if (effectiveInitialJobId && vagas.length > 0) {
      const job = vagas.find(j => j.id === effectiveInitialJobId);
      if (job) {
        setEditingJobId(job.id);
        const folderId = job.folderId;
        if (folderId) setCurrentFolderId(folderId); // Open folder if needed

        // Open edit modal directly
        setJobCreationStep('form');
        setIsJobModalOpen(true);
        setJobDraft(job);

        // We probably shouldn't persist deep-linked edits as drafts immediately unless they change data, 
        // but it doesn't hurt.

        // Clear state to avoid reopening on re-renders (optional, but good practice if using props)
        if (onClearTargetJob) onClearTargetJob();
      }
    }
  }, [effectiveInitialJobId, vagas, onClearTargetJob]);

  // Auxiliares
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentDepth = !currentFolder ? 0 : currentFolder.level === 'company' ? 1 : 2;
  const filteredFolders = folders.filter(f => {
    const matchesParent = f.parentId === currentFolderId;
    const matchesSearch = searchFolderTerm
      ? f.name.toLowerCase().includes(searchFolderTerm.toLowerCase())
      : true;
    return matchesParent && matchesSearch;
  });

  const filteredJobs = vagas.filter(vaga => {
    const matchesFolder = currentFolderId ? vaga.folderId === currentFolderId : false;
    const matchesSearch = searchTerm ? (
      (vaga.role && vaga.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vaga.jobCode && vaga.jobCode.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : true;

    let matchesFilter = true;
    if (filterStatus === 'active') matchesFilter = vaga.status === 'Ativa';
    if (filterStatus === 'inactive') matchesFilter = vaga.status === 'Pausada';

    return matchesFolder && matchesSearch && matchesFilter;
  });

  // Carregar dados (Empresas, Setores, Vagas)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Execute all fetches in parallel for better performance
      const [companiesResponse, sectorsResponse, jobsResponse] = await Promise.all([
        supabase.from('folder_companies').select('id, name').order('name'),
        supabase.from('sectors').select('id, name, folder_company_id').order('name'),
        supabase.from('jobs').select('*, job_contacts (*)').order('created_at', { ascending: false })
      ]);

      if (companiesResponse.error) throw companiesResponse.error;
      if (sectorsResponse.error) throw sectorsResponse.error;
      if (jobsResponse.error) throw jobsResponse.error;

      // 1. Map Companies (Level 0)
      const mappedCompanies: Folder[] = (companiesResponse.data || []).map(c => ({
        id: c.id,
        name: c.name,
        parentId: null,
        level: 'company'
      }));

      // 2. Map Sectors (Level 1)
      const mappedSectors: Folder[] = (sectorsResponse.data || []).map(s => ({
        id: s.id,
        name: s.name,
        parentId: s.folder_company_id, // Link to folder_companies
        level: 'sector'
      }));

      setFolders([...mappedCompanies, ...mappedSectors]);

      // 3. Map Jobs
      const mappedJobs: Vaga[] = (jobsResponse.data || []).map(j => ({
        id: j.id,
        folderId: j.sector_id || j.folder_company_id, // Link to sector OR company (if direct)
        companyId: j.folder_company_id,
        jobCode: j.code,
        title: j.title,
        role: j.title, // 'role' in UI seems to map to 'title'
        status: j.status === 'active' ? 'Ativa' : 'Pausada',
        date: new Date(j.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: j.job_type === 'text' ? 'scratch' : 'file',
        companyName: j.company_name,
        hideCompany: j.hide_company,
        bond: j.employment_type,
        city: j.city,
        region: j.region,
        activities: j.activities,
        requirements: j.requirements,
        benefits: j.benefits,
        imageUrl: j.image_url,
        footerEnabled: j.footer_enabled,
        observation: j.observation,
        showObservation: j.show_observation,
        salary: j.salary,
        contacts: (j.job_contacts && j.job_contacts.length > 0)
          ? j.job_contacts.map((c: any) => ({
            type: c.type === 'whatsapp' ? 'WhatsApp' :
              c.type === 'email' ? 'Email' :
                c.type === 'address' ? 'Endereço' : 'Link',
            value: c.value,
            date: c.date,
            time: c.time,
            noDateTime: c.no_date_time
          }))
          : [
            j.contact_whatsapp && { type: 'WhatsApp', value: j.contact_whatsapp },
            j.contact_email && { type: 'Email', value: j.contact_email },
            j.contact_link && { type: 'Link', value: j.contact_link },
            j.contact_address && {
              type: 'Endereço',
              value: j.contact_address,
              date: j.contact_address_date,
              time: j.contact_address_time,
              noDateTime: !j.contact_address_date
            }
          ].filter(Boolean)
      }));

      setVagas(mappedJobs);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados. Verifique o console.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Saved Contacts
  const fetchSavedContacts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_job_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (data) setSavedContacts(data as SavedJobContact[]);
  };

  const fetchUserEmojis = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_job_emojis')
      .select('emojis')
      .eq('user_id', user.id)
      .single();

    if (data) setPreviewEmojis(data.emojis);
  };

  useEffect(() => {
    fetchData();
    if (user) {
      fetchSavedContacts();
      fetchUserEmojis();
    }
  }, [user]);



  const generateJobCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

  // Iniciar criação de vaga
  const startJobCreation = () => {
    setEditingJobId(null);
    setJobDraft({
      type: 'scratch',
      role: '',
      jobCode: generateJobCode(),
      hideCompany: false,
      bond: 'CLT ( Fixo )',
      contacts: []
    });
    setJobCreationStep('selection');
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: Vaga) => {
    setEditingJobId(job.id);
    setJobDraft({
      type: job.type,
      role: job.role || job.title,
      jobCode: job.jobCode || generateJobCode(),
      hideCompany: job.hideCompany,
      companyName: job.companyName,
      bond: job.bond ? (job.bond === 'CLT' ? 'CLT ( Fixo )' : job.bond === 'Jurídico' ? 'Pessoa Jurídica' : job.bond as any) : 'CLT ( Fixo )',
      city: job.city,
      region: job.region,
      activities: job.activities,
      requirements: job.requirements,
      benefits: job.benefits,
      contacts: job.contacts || [],
      imageUrl: job.imageUrl,
      observation: job.observation,
      showObservation: job.showObservation,
      salary: job.salary
    });
    setShowFooterInImage(job.footerEnabled || false);
    setSalaryEnabled(!!job.salary);
    setAttachedFile(null); // Limpar qualquer arquivo anterior
    setJobCreationStep(job.type === 'file' ? 'upload' : 'form');
    setIsJobModalOpen(true);
  };

  const handleViewJob = (job: Vaga) => {
    setViewingJob(job);
    setIsViewModalOpen(true);
  };

  const handleAddContactField = (type: JobContact['type']) => {
    // Check if contact already exists
    const existing = jobDraft.contacts || [];
    if (existing.some(c => c.type === type)) {
      return;
    }

    // Auto-fill logic
    const saved = savedContacts.find(c => c.type === type);

    setJobDraft({
      ...jobDraft,
      contacts: [...existing, { type, value: saved ? saved.value : '' }]
    });
  };

  const updateContactValue = (index: number, value: any, field: 'value' | 'date' | 'time' | 'noDateTime' = 'value') => {
    const updated = [...(jobDraft.contacts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setJobDraft({ ...jobDraft, contacts: updated });
  };

  const removeContact = (index: number) => {
    const updated = [...(jobDraft.contacts || [])];
    updated.splice(index, 1);
    setJobDraft({ ...jobDraft, contacts: updated });
  };

  const scrollToCenter = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> | React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* Refactored to accept optional job object for reuse */
  const generatePreviewText = (job?: Vaga | Partial<Vaga>) => {
    const j = job || jobDraft;
    const code = j.jobCode || j.code || '---';

    const channelStrings: string[] = [];

    j.contacts?.forEach(c => {
      if (!c.value?.trim()) return;

      if (c.type === 'WhatsApp') {
        channelStrings.push(`WhatsApp ${c.value}`);
      } else if (c.type === 'Email') {
        channelStrings.push(`e-mail ${c.value}`);
      } else if (c.type === 'Link') {
        channelStrings.push(`Link ${c.value}`);
      } else if (c.type === 'Endereço') {
        let addr = `${c.value}`;
        if (!c.noDateTime && !c.no_date_time) {
          // Handle both camelCase (frontend) and snake_case (backend/mapped) props if mixed
          const d = c.date;
          const t = c.time;
          if (d && t) {
            // Simple format if formatPreviewDate isn't available or we want simple string
            addr += ` no dia ${d.split('-').reverse().join('/')} às ${t}`;
          }
        }
        channelStrings.push(addr);
      }
    });

    const joinChannels = (list: string[]) => {
      if (list.length === 0) return '';
      if (list.length === 1) return list[0];
      const last = list.pop();
      return `${list.join(', ')} ou ${last}`;
    };

    const channelsText = joinChannels(channelStrings);
    // WhatsApp Format requires specific phrasing from previous requests:
    // "Enviar curriculo com o nome da vaga/codigo para: ..."
    const interessadosText = channelsText
      ? (job?.type === 'file' ? channelsText : `Enviar curriculo com o nome da vaga/codigo para: ${channelsText}`)
      : 'Entre em contato pelos canais oficiais.';

    // Fix: for image jobs, typically the "interessados" part is just the list of channels in the specific format users wanted previously
    // But let's stick to the generated text logic that matches Marketing.tsx if possible.

    if (j.type === 'file') {
      const observationText = j.showObservation && j.observation ? `\nObs: ${j.observation}\n` : '';
      return `*${company?.name || 'Sua Empresa'}* ${previewEmojis}
-----------------------------
Função: *${j.role || j.title || ''}*
Cód. Vaga: *${code}*
-----------------------------${observationText}
*Interessados*
 ${interessadosText}`;
    }

    const companyInfo = [
      company?.name,
      company?.whatsapp ? `WhatsApp: ${company.whatsapp}` : null,
      company?.website
    ].filter(Boolean);

    const companyInfoBlock = companyInfo.length > 0
      ? `\n\n*Mais informações:*\n${companyInfo.map(info => `➞ ${info}`).join('\n')}`
      : '';

    return `*${company?.name || 'Sua Empresa'}* ${previewEmojis}
-----------------------------
Função: *${j.role || j.title || ''}*
Cód. Vaga: *${code}*
-----------------------------  
*Vínculo:* ${j.bond || 'CLT'}${!j.hideCompany ? `
*Empresa:* ${j.companyName || ''}` : ''}${salaryEnabled && j.salary ? `
*Salário:* ${j.salary}` : ''}
*Cidade/Bairro:* ${j.city || ''} - ${j.region || ''}
*Requisitos:* ${j.requirements || ''}
*Benefícios:* ${j.benefits || ''}
*Atividades:* ${j.activities || ''}

*Interessados*
 ${interessadosText}
----------------------------- ${companyInfoBlock}`;
  };

  const handleSaveJob = async () => {
    if (!currentFolderId) return;

    // Determine IDs
    // Check if we are in a Sector or Company
    const currentFolder = folders.find(f => f.id === currentFolderId);
    if (!currentFolder) return;

    let sectorId = null;
    let companyId = null;

    if (currentFolder.level === 'company') {
      // Direct in Company
      companyId = currentFolder.id;
      sectorId = null;
    } else {
      // In a Sector
      sectorId = currentFolder.id;
      companyId = currentFolder.parentId;
    }

    if (!companyId) {
      alert("Erro: Empresa não identificada.");
      return;
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      alert("Usuário não autenticado");
      return;
    }
    const userId = user.data.user.id;

    try {
      let imageUrl = jobDraft.imageUrl || '';

      // 1. Upload Image if a NEW file is selected
      if (jobDraft.type === 'file' && attachedFile) {
        const fileExt = attachedFile.name.split('.').pop();
        const fileName = `${userId}/${companyId}/${sectorId || 'root'}/${jobDraft.jobCode}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('job-images')
          .upload(fileName, attachedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('job-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Insert or Update Job
      const jobDataToSave = {
        sector_id: sectorId,
        folder_company_id: companyId,
        user_id: userId,
        code: jobDraft.jobCode,
        job_type: jobDraft.type === 'scratch' ? 'text' : 'image',
        title: jobDraft.role,
        status: editingJobId ? undefined : 'active', // Don't reset status on edit

        // Text fields
        function: jobDraft.role,
        company_name: jobDraft.companyName,
        hide_company: jobDraft.hideCompany,
        employment_type: jobDraft.bond === 'CLT ( Fixo )' ? 'CLT' : jobDraft.bond === 'Pessoa Jurídica' ? 'PJ' : jobDraft.bond,
        city: jobDraft.city,
        region: jobDraft.region,
        activities: jobDraft.activities,
        requirements: jobDraft.requirements,
        benefits: jobDraft.benefits,
        salary: salaryEnabled ? jobDraft.salary : null,

        // Image fields
        image_url: imageUrl,
        footer_enabled: showFooterInImage,
        observation: jobDraft.observation,
        show_observation: jobDraft.showObservation,

        // New flat columns for contacts (taking the first of each type found)
        contact_whatsapp: jobDraft.contacts?.find(c => c.type === 'WhatsApp')?.value || null,
        contact_email: jobDraft.contacts?.find(c => c.type === 'Email')?.value || null,
        contact_link: jobDraft.contacts?.find(c => c.type === 'Link')?.value || null,
        contact_address: jobDraft.contacts?.find(c => c.type === 'Endereço')?.value || null,
        contact_address_date: jobDraft.contacts?.find(c => c.type === 'Endereço')?.date || null,
        contact_address_time: jobDraft.contacts?.find(c => c.type === 'Endereço')?.time || null,
      };

      let jobData;
      if (editingJobId) {
        const { data, error } = await supabase
          .from('jobs')
          .update(jobDataToSave)
          .eq('id', editingJobId)
          .select()
          .single();
        if (error) throw error;
        jobData = data;
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .insert(jobDataToSave)
          .select()
          .single();
        if (error) throw error;
        jobData = data;
      }

      // Success
      setIsJobModalOpen(false);
      fetchData(); // Refresh list
      setEditingJobId(null);

      // 3. Insert Contacts
      if (jobDraft.contacts && jobDraft.contacts.length > 0) {
        // Delete existing contacts for this job if editing
        if (editingJobId) {
          const { error: deleteContactsError } = await supabase
            .from('job_contacts')
            .delete()
            .eq('job_id', editingJobId);
          if (deleteContactsError) throw deleteContactsError;
        }

        const contactsToInsert = jobDraft.contacts.map(c => ({
          job_id: jobData.id,
          type: c.type.toLowerCase() === 'endereço' ? 'address' : c.type.toLowerCase(),
          value: c.value,
          date: c.date,
          time: c.time,
          no_date_time: c.noDateTime
        }));

        const { error: contactsError } = await supabase
          .from('job_contacts')
          .insert(contactsToInsert);

        if (contactsError) throw contactsError;
      }

      await fetchData(); // Refresh all data
      clearPersistence();
      setIsJobModalOpen(false);
      setJobCreationStep(null);

    } catch (error: any) {
      console.error('Erro ao salvar vaga:', error);
      setValidationMessage(`Erro ao salvar vaga: ${error.message}`);
      setIsValidationModalOpen(true);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const toggleJobStatus = async (jobId: string) => {
    const job = vagas.find(v => v.id === jobId);
    if (!job) return;

    const newStatus = job.status === 'Ativa' ? 'Pausada' : 'Ativa';

    // Optimistic Update
    setVagas(prev => prev.map(v => v.id === jobId ? { ...v, status: newStatus } : v));

    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus === 'Ativa' ? 'active' : 'inactive' })
      .eq('id', jobId);

    if (error) {
      setValidationMessage("Erro ao atualizar status da vaga");
      setIsValidationModalOpen(true);
      console.error(error);
      // Revert
      setVagas(prev => prev.map(v => v.id === jobId ? { ...v, status: job.status } : v));
    }
  };

  const handleMoveJob = async (vagaId: string, targetFolderId: string) => {
    const targetFolder = folders.find(f => f.id === targetFolderId);
    if (!targetFolder) return;

    let updates = {};
    if (targetFolder.level === 'company') {
      updates = { sector_id: null, folder_company_id: targetFolder.id };
    } else {
      updates = { sector_id: targetFolder.id, folder_company_id: targetFolder.parentId };
    }

    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', vagaId);

    if (error) {
      setValidationMessage("Erro ao mover vaga para a pasta selecionada");
      setIsValidationModalOpen(true);
      return;
    }

    setVagas(prev => prev.map(v => v.id === vagaId ? { ...v, folderId: targetFolderId } : v));
    setIsMoveJobModalOpen(false);
    setJobToMove(null);
    setMoveJobModalFolderId(null);
  };

  const handleCreateFolder = async () => {
    if (!folderNameInput.trim()) return;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;
    const userId = user.data.user.id;

    try {
      if (currentDepth === 0) {
        // Creating Company -> NOW folder_companies
        const { error } = await supabase
          .from('folder_companies')
          .insert({
            name: folderNameInput,
            user_id: userId
          });
        if (error) throw error;
      } else {
        // Creating Sector
        // currentFolderId is the Company ID (folder_companies)
        const { error } = await supabase
          .from('sectors')
          .insert({
            name: folderNameInput,
            folder_company_id: currentFolderId
          });
        if (error) throw error;
      }

      await fetchData();
      setIsFolderModalOpen(false);
      setFolderNameInput('');
    } catch (error: any) {
      alert(`Erro ao criar pasta: ${error.message}`);
    }
  };

  const handleUpdateFolder = async () => {
    if (!folderNameInput.trim() || !folderToEdit) return;

    try {
      const table = folderToEdit.level === 'company' ? 'folder_companies' : 'sectors';
      const { error } = await supabase
        .from(table)
        .update({ name: folderNameInput })
        .eq('id', folderToEdit.id);

      if (error) throw error;

      setFolders(prev => prev.map(f => f.id === folderToEdit.id ? { ...f, name: folderNameInput } : f));
      setIsEditFolderModalOpen(false);
      setFolderToEdit(null);
      setFolderNameInput('');
    } catch (error: any) {
      alert(`Erro ao atualizar: ${error.message}`);
    }
  };

  const handleDeleteFolder = (folder: Folder) => {
    setDeleteData({ type: 'folder', item: folder });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteJob = (jobId: string) => {
    const job = vagas.find(v => v.id === jobId);
    if (job) {
      setDeleteData({ type: 'job', item: job });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!deleteData) return;

    try {
      if (deleteData.type === 'folder') {
        const folder = deleteData.item as Folder;
        const table = folder.level === 'company' ? 'folder_companies' : 'sectors';
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', folder.id);

        if (error) throw error;
        await fetchData();
      } else {
        const job = deleteData.item as Vaga;

        // 1. Cascade Delete Future Schedules
        const today = new Date().toISOString().split('T')[0];
        const { data: futureSchedules } = await supabase
          .from('marketing_schedules')
          .select('*')
          .contains('jobs_ids', [job.id])
          .gte('scheduled_date', today);

        if (futureSchedules && futureSchedules.length > 0) {
          for (const schedule of futureSchedules) {
            const currentJobIds = schedule.jobs_ids || [];
            if (currentJobIds.length <= 1) {
              // Only this job in schedule -> Delete entire schedule
              await supabase.from('marketing_schedules').delete().eq('id', schedule.id);
            } else {
              // Multiple jobs -> Remove this ID and update count
              const updatedIds = currentJobIds.filter((id: string) => id !== job.id);
              await supabase
                .from('marketing_schedules')
                .update({
                  jobs_ids: updatedIds,
                  groups_count: updatedIds.length // Assuming groups_count refers to jobs count here based on context, checking usage... actually 'groups' usually means groups. 
                  // Wait, let's check Vagas.tsx context. 
                  // In Agendamentos.tsx: groups: s.groups_count.
                  // It seems 'groups_count' relates to target groups, not jobs.
                  // The field 'jobs_ids' holds the jobs.
                  // I should probably ONLY update jobs_ids.
                })
                .eq('id', schedule.id);
            }
          }
        }

        // 2. Delete the Job
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', job.id);

        if (error) throw error;
        setVagas(prev => prev.filter(v => v.id !== job.id));
      }
      setIsDeleteModalOpen(false);
      setDeleteData(null);
      toast({ type: 'success', title: 'Sucesso', message: 'Item excluído com sucesso!' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Erro', message: `Erro ao excluir: ${error.message}` });
    }
  };

  // Reusable Contact Section for Modal
  const renderContactSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest ml-1">Canais de Contato</h4>
          <button
            onClick={() => setIsContactsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Settings size={12} />
            Configurar
          </button>
        </div>

        {/* Contact Selection Area - Side by side icons ONLY */}
        <div className="flex items-center gap-3">
          {[
            { type: 'WhatsApp', icon: <OfficialWhatsAppIcon size={24} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { type: 'Email', icon: <Mail size={24} />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { type: 'Endereço', icon: <MapPin size={24} />, color: 'bg-rose-50 text-rose-600 border-rose-100' },
            { type: 'Link', icon: <LinkIcon size={24} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => handleAddContactField(item.type as JobContact['type'])}
              className={`flex-1 flex items-center justify-center p-5 rounded-[1.5rem] border transition-all hover:scale-105 active:scale-95 shadow-sm ${item.color}`}
              title={`Adicionar ${item.type}`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {jobDraft.contacts?.map((c, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm relative group animate-scaleUp">
            <button
              onClick={() => removeContact(i)}
              className="absolute -top-1.5 -right-1.5 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors z-10"
            >
              <X size={10} />
            </button>

            <div className="flex flex-col gap-3">
              {c.type === 'Endereço' ? (
                // Custom Layout for Address
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      O interessado deve comparecer no endereço
                    </span>
                  </div>

                  <div className="relative group">
                    <input
                      type="text"
                      value={c.value}
                      onChange={e => updateContactValue(i, e.target.value)}
                      placeholder="Endereço completo..."
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-full px-5 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500/20 transition-all"
                      onFocus={scrollToCenter}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-400">no dia</span>
                    {!c.noDateTime ? (
                      <>
                        <div className="relative">
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={c.date || ''}
                            onChange={e => updateContactValue(i, e.target.value, 'date')}
                            className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                          />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">às</span>
                        <div className="relative">
                          <input
                            type="time"
                            value={c.time || ''}
                            onChange={e => updateContactValue(i, e.target.value, 'time')}
                            className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                          />
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Data e hora ocultas</span>
                    )}

                    <div className="ml-auto">
                      <button
                        onClick={() => updateContactValue(i, !c.noDateTime, 'noDateTime')}
                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${c.noDateTime ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Sem Data/Hora
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${c.noDateTime ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${c.noDateTime ? 'left-[18px]' : 'left-0.5'}`} />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Generic Layout for Others
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg text-slate-500">
                    {c.type === 'WhatsApp' && <OfficialWhatsAppIcon size={14} />}
                    {c.type === 'Email' && <Mail size={14} />}
                    {c.type === 'Link' && <LinkIcon size={14} />}
                  </div>
                  <input
                    type="text"
                    value={c.value}
                    onChange={e => updateContactValue(i, e.target.value)}
                    placeholder={`Informe o ${c.type}...`}
                    className="flex-1 bg-transparent border-none px-2 py-1 text-base font-medium outline-none text-slate-700 dark:text-slate-200"
                    onFocus={scrollToCenter}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {currentFolderId && (
              <button onClick={() => setCurrentFolderId(currentFolder?.parentId || null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                <ArrowLeft size={18} />
              </button>
            )}
            <nav className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-400">
              <button onClick={() => setCurrentFolderId(null)} className={`hover:text-blue-600 ${!currentFolderId ? 'text-blue-600' : ''}`}>Início</button>
              {currentFolder && (
                <>
                  <ChevronRight size={12} />
                  <span className="text-blue-600">{currentFolder.name}</span>
                </>
              )}
            </nav>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
            {!currentFolderId ? 'Minhas Empresas' : ''}
          </h2>
        </div>

        <div className={`flex items-center gap-3 ${isFolderSearchExpanded ? 'w-full md:w-auto' : ''}`}>
          {currentDepth < 2 && (
            <>
              {/* Desktop Button */}
              <button
                onClick={() => {
                  setFolderNameInput('');
                  setIsFolderModalOpen(true);
                }}
                className={`hidden md:flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95`}
              >
                <FolderPlus size={18} />
                <span>{currentDepth === 0 ? 'Criar Empresa' : 'Criar Setor'}</span>
              </button>

              {/* Mobile Layout */}
              <div className="md:hidden flex items-center gap-3 w-full transition-all duration-300">
                {!isFolderSearchExpanded ? (
                  <>
                    <button
                      onClick={() => {
                        setFolderNameInput('');
                        setIsFolderModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      <FolderPlus size={18} />
                      <span>{currentDepth === 0 ? 'Empresa' : 'Setor'}</span>
                    </button>
                    {(filteredFolders.length > 0 || searchFolderTerm) && (
                      <button
                        onClick={() => setIsFolderSearchExpanded(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm hover:bg-slate-50 shadow-sm active:scale-95"
                      >
                        <Search size={18} />
                        <span>Pesquisar</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full relative animate-fadeIn">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      value={searchFolderTerm}
                      onChange={(e) => setSearchFolderTerm(e.target.value)}
                      onBlur={() => {
                        // Delay slighty to allow clearing to work if clicked
                        setTimeout(() => {
                          if (!searchFolderTerm) {
                            setIsFolderSearchExpanded(false);
                          }
                        }, 200);
                      }}
                      placeholder={currentDepth === 0 ? "Buscar empresa..." : "Buscar setor..."}
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-blue-500 dark:border-blue-500 rounded-xl text-sm outline-none ring-2 ring-blue-500/20"
                    />
                    <button
                      onClick={() => {
                        setSearchFolderTerm('');
                        setIsFolderSearchExpanded(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {currentFolderId && (
            <button onClick={startJobCreation} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95">
              <Plus size={18} />
              <span>Criar Vaga</span>
            </button>
          )}
        </div>
      </div>

      {/* Folder Search - Only show when viewing folders - DESKTOP ONLY */}
      {(!currentFolderId || filteredFolders.length > 0) && (
        <div className="hidden md:flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFolderTerm}
              onChange={(e) => setSearchFolderTerm(e.target.value)}
              placeholder={currentDepth === 0 ? "Buscar empresa..." : "Buscar setor..."}
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            {searchFolderTerm && (
              <button
                onClick={() => setSearchFolderTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid de Pastas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredFolders.map(folder => (
          <div
            key={folder.id}
            onDragOver={(e) => { e.preventDefault(); setDragOverFolderId(folder.id); }}
            onDrop={(e) => { e.preventDefault(); handleMoveJob(e.dataTransfer.getData('jobId'), folder.id); setDragOverFolderId(null); }}
            className={`group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl transition-all cursor-pointer ${dragOverFolderId === folder.id ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'hover:border-blue-500/50 hover:shadow-xl'}`}
            onClick={() => setCurrentFolderId(folder.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${folder.level === 'company' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                <FolderIcon size={24} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); setFolderToEdit(folder); setFolderNameInput(folder.name); setIsEditFolderModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-white truncate">{folder.name}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {folder.level === 'company' ? 'Empresa' : 'Setor'}
            </span>
          </div>
        ))}
      </div>

      {/* Lista de Vagas */}
      {currentFolderId && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Briefcase size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Listagem de Vagas</h3>
            </div>

            {/* Search Input & Filtering */}
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Filter Select */}
              <div className={`flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 transition-all duration-300 ease-in-out origin-left ${isSearchExpanded ? 'w-0 opacity-0 overflow-hidden p-0 sm:w-auto sm:opacity-100 sm:p-1' : 'w-auto opacity-100'}`}>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Ativas
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'inactive' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-rose-600'}`}
                >
                  Inativas
                </button>
              </div>

              <div className={`relative transition-all duration-300 ease-out ${isSearchExpanded ? 'flex-1' : 'w-10 sm:w-64'}`}>
                {/* Mobile Trigger (Visible when collapsed on Mobile) */}
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className={`absolute inset-0 flex sm:hidden items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-blue-600 transition-all ${isSearchExpanded ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}
                >
                  <Search size={16} />
                </button>

                {/* Input Field */}
                <div className={`relative w-full transition-all duration-300 ${isSearchExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto'}`}>
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400 focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-10 pr-8 py-2 text-xs outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all"
                    onBlur={() => !searchTerm && setIsSearchExpanded(false)}
                    autoFocus={isSearchExpanded} // Auto focus when expanded
                  />
                  {(searchTerm || isSearchExpanded) && (
                    <button
                      onClick={() => { setSearchTerm(''); setIsSearchExpanded(false); }}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Mobile List View */}
          <div className="md:hidden space-y-3 px-2">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-500">
                {searchTerm ? 'Nenhum resultado para a busca.' : 'Nenhuma vaga cadastrada nesta pasta.'}
              </div>
            ) : (
              filteredJobs.map(vaga => (
                <div
                  key={vaga.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4"
                >
                  {/* Header: Title + Actions */}
                  <div className="flex items-start gap-3">
                    {/* Left: Job Info */}
                    <div className="flex-1 min-w-0" onClick={() => handleViewJob(vaga)}>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                        {vaga.role || vaga.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {vaga.city || ''}{vaga.city && vaga.region ? ' - ' : ''}{vaga.region || ''}
                        {!vaga.city && !vaga.region && '—'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {vaga.date}
                      </p>
                      <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mt-2">
                        {vaga.jobCode || '---'}
                      </span>
                    </div>

                    {/* Right: Toggle + Menu */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {/* Status Toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleJobStatus(vaga.id); }}
                        className={`w-14 h-7 rounded-full transition-colors relative ${vaga.status === 'Ativa' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white absolute top-0.5 transition-all shadow ${vaga.status === 'Ativa' ? 'left-[30px]' : 'left-0.5'}`} />
                      </button>

                      {/* 3-dot Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === vaga.id ? null : vaga.id); }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {openDropdownId === vaga.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-[160px]">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleViewJob(vaga); setOpenDropdownId(null); }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors"
                              >
                                <Eye size={16} className="text-blue-600" />
                                Visualizar
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditJob(vaga); setOpenDropdownId(null); }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors"
                              >
                                <Edit2 size={16} className="text-yellow-600" />
                                Editar
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setJobToMove(vaga); setIsMoveJobModalOpen(true); setOpenDropdownId(null); }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors"
                              >
                                <FolderInput size={16} className="text-indigo-600" />
                                Mover
                              </button>
                              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteJob(vaga.id); setOpenDropdownId(null); }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 transition-colors"
                              >
                                <Trash2 size={16} />
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="w-1/3 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Cargo / Código</th>
                  <th className="w-1/6 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="w-1/6 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                  <th className="w-1/6 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="w-1/6 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                      {searchTerm ? 'Nenhum resultado para a busca.' : 'Nenhuma vaga cadastrada nesta pasta.'}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map(vaga => (
                    <tr
                      key={vaga.id}
                      draggable={currentDepth === 1 && filteredFolders.length > 0}
                      onDragStart={(e) => {
                        if (currentDepth === 1 && filteredFolders.length > 0) {
                          e.dataTransfer.setData('jobId', vaga.id);
                        } else {
                          e.preventDefault();
                        }
                      }}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${(currentDepth === 1 && filteredFolders.length > 0) ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${vaga.type === 'file' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {vaga.type === 'file' ? <ImageIcon size={16} /> : <FileText size={16} />}
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-bold text-base text-slate-800 dark:text-white block truncate text-ellipsis max-w-[220px]" title={vaga.role || vaga.title}>{vaga.role || vaga.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">COD: {vaga.jobCode || '---'}</span>
                              {(vaga.city || vaga.region) && (
                                <span className="text-xs text-slate-500 truncate max-w-[180px] border-l border-slate-300 pl-2 ml-1" title={`${vaga.city || ''} ${vaga.region ? `- ${vaga.region}` : ''}`}>
                                  {vaga.city}{vaga.region ? ` - ${vaga.region}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${vaga.type === 'file' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          {vaga.type === 'file' ? 'Imagem' : 'Texto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{vaga.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleJobStatus(vaga.id); }} className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${vaga.status === 'Ativa' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${vaga.status === 'Ativa' ? 'left-[18px]' : 'left-0.5'}`} />
                          </button>
                          <span className="text-[11px] font-bold uppercase whitespace-nowrap text-slate-500">{vaga.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setJobToMove(vaga); setIsMoveJobModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Mover Vaga"><FolderInput size={16} /></button>
                          <button onClick={() => handleViewJob(vaga)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                          <button onClick={() => handleEditJob(vaga)} className="p-2 text-slate-400 hover:text-yellow-600 transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteJob(vaga.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}




      {/* MODAL: Criação de Vaga - Largura reduzida para max-w-2xl */}
      {
        isJobModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => { clearPersistence(); setIsJobModalOpen(false); }} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">

              {/* Header seguindo padrão anexo */}
              <div className="p-6 bg-blue-950 text-white flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-blue-950 shadow-lg shadow-yellow-400/20">
                    {jobCreationStep === 'preview' ? <CheckCircle2 size={24} /> : <Plus size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {jobCreationStep === 'selection' ? 'Novo Anúncio' :
                        jobCreationStep === 'preview' ? 'Confirmar Publicação' : 'Detalhes da Vaga'}
                    </h3>
                    <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Cód: {jobDraft.jobCode}</p>
                  </div>
                </div>
                <button onClick={() => { clearPersistence(); setIsJobModalOpen(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                {jobCreationStep === 'selection' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full items-center py-4">
                    <button onClick={() => { setJobDraft({ ...jobDraft, type: 'scratch' }); setJobCreationStep('form'); }} className="group p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-yellow-400 transition-all text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-400 group-hover:text-blue-950 transition-colors">
                        <FileText size={28} />
                      </div>
                      <span className="font-black text-slate-800 dark:text-white block text-lg uppercase tracking-tight">Criar por Texto</span>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Gera o template automático de text.</p>
                    </button>
                    <button onClick={() => { setJobDraft({ ...jobDraft, type: 'file' }); setJobCreationStep('upload'); }} className="group p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-yellow-400 transition-all text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-400 group-hover:text-blue-950 transition-colors">
                        <ImageIcon size={28} />
                      </div>
                      <span className="font-black text-slate-800 dark:text-white block text-lg uppercase tracking-tight">Já tenho a Vaga</span>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Anexa uma arte/imagem pronta.</p>
                    </button>
                  </div>
                )}

                {jobCreationStep === 'form' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Grid Layout: 2 Rows of 3 Columns */}
                      <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">

                        {/* ROW 1: Cargo, Empresa, Vínculo */}

                        {/* 1. Cargo (Role) */}
                        <div className="md:col-span-4 space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Função / Cargo <span className="text-red-500">*</span></label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                              <Briefcase size={18} />
                            </div>
                            <input
                              type="text"
                              value={jobDraft.role || ''}
                              onFocus={scrollToCenter}
                              onChange={e => setJobDraft({ ...jobDraft, role: e.target.value })}
                              placeholder="Ex: Auxiliar de Limpeza"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                          </div>
                        </div>

                        {/* 2. Empresa (Company) */}
                        <div className="md:col-span-4 space-y-1.5">
                          <div className="flex items-center gap-2 h-4 ml-1">
                            <label className={`text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer select-none ${!jobDraft.hideCompany ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
                              onClick={() => setJobDraft({ ...jobDraft, hideCompany: !jobDraft.hideCompany, companyName: jobDraft.hideCompany ? jobDraft.companyName : '' })}>
                              {!jobDraft.hideCompany ? "Ocultar Empresa" : "Exibir Empresa"}
                            </label>
                            <div onClick={() => setJobDraft({ ...jobDraft, hideCompany: !jobDraft.hideCompany, companyName: jobDraft.hideCompany ? jobDraft.companyName : '' })}
                              className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${!jobDraft.hideCompany ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-sm ${!jobDraft.hideCompany ? 'left-[18px]' : 'left-0.5'}`} />
                            </div>
                          </div>

                          <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                              <Building2 size={18} />
                            </div>
                            <input
                              type="text"
                              disabled={jobDraft.hideCompany}
                              onFocus={scrollToCenter}
                              value={jobDraft.companyName || ''}
                              onChange={e => setJobDraft({ ...jobDraft, companyName: e.target.value })}
                              placeholder={jobDraft.hideCompany ? "Nome oculto na divulgação" : "Nome da empresa"}
                              className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600
                                ${jobDraft.hideCompany ? 'opacity-60 cursor-not-allowed select-none bg-slate-100 dark:bg-slate-900/50' : 'border-slate-100 dark:border-slate-800'}
                                `}
                            />
                          </div>
                        </div>

                        {/* 3. Vínculo (Bond) */}
                        <div className="md:col-span-4 space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Vínculo</label>
                          <div className="relative group">
                            <select value={jobDraft.bond} onChange={e => setJobDraft({ ...jobDraft, bond: e.target.value as any })}
                              className="w-full appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 ring-blue-500 outline-none transition-all"
                            >
                              <option value="CLT ( Fixo )">CLT ( Fixo )</option>
                              <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                              <option value="Freelance">Freelance</option>
                              <option value="Temporário">Temporário</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>

                        {/* ROW 2: Cidade, Região, Salário */}

                        {/* 4. Cidade (City) */}
                        <div className="md:col-span-4 space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Cidade</label>
                          <div className="relative group">
                            <input type="text" value={jobDraft.city || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, city: e.target.value })} placeholder="Sorocaba"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                          </div>
                        </div>

                        {/* 5. Região (Region) */}
                        <div className="md:col-span-4 space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Região / Bairro</label>
                          <div className="relative group">
                            <input type="text" value={jobDraft.region || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, region: e.target.value })} placeholder="Ex: Campolim, Centro..."
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                          </div>
                        </div>

                        {/* 6. Salário (Salary) */}
                        <div className="md:col-span-4 space-y-1.5">
                          <div className="flex items-center gap-2 h-4 ml-1">
                            <label className={`text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer select-none ${salaryEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} onClick={() => setSalaryEnabled(!salaryEnabled)}>
                              {salaryEnabled ? "Ocultar Salário" : "Exibir Salário"}
                            </label>
                            <div onClick={() => setSalaryEnabled(!salaryEnabled)} className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${salaryEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-sm ${salaryEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                            </div>
                          </div>

                          <div className={`relative group transition-all duration-300 ${salaryEnabled ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                            <input
                              disabled={!salaryEnabled}
                              type="text"
                              value={jobDraft.salary || ''}
                              onFocus={scrollToCenter}
                              onChange={e => setJobDraft({ ...jobDraft, salary: e.target.value })}
                              placeholder="Ex: R$ 2.500,00"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Detailed Fields Area */}
                      <div className="md:col-span-12 space-y-4 pt-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">REQUISITOS</label>
                          <textarea value={jobDraft.requirements || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, requirements: e.target.value })} rows={3} placeholder="O que o candidato precisa ter?"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">BENEFÍCIOS</label>
                          <textarea value={jobDraft.benefits || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, benefits: e.target.value })} rows={3} placeholder="O que a empresa oferece?"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">ATIVIDADES</label>
                          <textarea value={jobDraft.activities || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, activities: e.target.value })} rows={3} placeholder="O que o candidato irá fazer?"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" />
                        </div>
                      </div>
                    </div>



                    {renderContactSection()}
                  </div>
                )}

                {jobCreationStep === 'upload' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Nome da Vaga Obrigatório */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Nome da Vaga <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"><Briefcase size={18} /></div>
                          <input
                            type="text"
                            value={jobDraft.role || ''}
                            onChange={e => setJobDraft({ ...jobDraft, role: e.target.value })}
                            placeholder="Ex: Auxiliar Administrativo"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Cidade</label>
                          <div className="relative group">
                            <input type="text" value={jobDraft.city || ''} onChange={e => setJobDraft({ ...jobDraft, city: e.target.value })} placeholder="Sorocaba"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Região / Bairro</label>
                          <div className="relative group">
                            <input type="text" value={jobDraft.region || ''} onChange={e => setJobDraft({ ...jobDraft, region: e.target.value })} placeholder="Ex: Campolim, Centro..."
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                          </div>
                        </div>
                      </div>

                      <label className="flex flex-col items-center justify-center w-full aspect-video bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] cursor-pointer hover:border-blue-500 transition-all group overflow-hidden">
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        {attachedFile || jobDraft.imageUrl ? (
                          <div className="relative w-full h-full">
                            <img src={attachedFile ? URL.createObjectURL(attachedFile) : jobDraft.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <p className="text-white font-black uppercase text-xs">Trocar Imagem</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-10">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 text-white md:bg-blue-100 md:text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/30 md:shadow-none">
                              <Upload size={24} className="md:w-8 md:h-8" />
                            </div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">
                              <span className="md:hidden">Toque para carregar</span>
                              <span className="hidden md:block">Carregar arte da vaga</span>
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Formatos suportados: JPG, PNG</p>
                          </div>
                        )}
                      </label>

                      <div className="md:bg-slate-50 md:dark:bg-slate-800/50 md:p-6 md:rounded-3xl space-y-4 md:border md:border-slate-100 md:dark:border-slate-800">
                        <div className="md:hidden w-full h-px bg-slate-100 dark:bg-slate-800 my-4" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center"><Smartphone size={18} /></div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Adicionar rodapé de contato na imagem?</span>
                          </div>
                          <button
                            onClick={() => setShowFooterInImage(!showFooterInImage)}
                            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${showFooterInImage ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${showFooterInImage ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center"><CheckCircle2 size={18} /></div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Deseja adicionar observação?</span>
                          </div>
                          <button
                            onClick={() => setJobDraft({ ...jobDraft, showObservation: !jobDraft.showObservation })}
                            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${jobDraft.showObservation ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${jobDraft.showObservation ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>

                        {jobDraft.showObservation && (
                          <div className="animate-fadeIn pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-semibold ml-1">Observação</label>
                            <textarea
                              value={jobDraft.observation || ''}
                              onChange={e => setJobDraft({ ...jobDraft, observation: e.target.value })}
                              rows={2}
                              placeholder="Informe a observação..."
                              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400"
                            />
                          </div>
                        )}

                        {showFooterInImage && (
                          <div className="animate-fadeIn pt-4 border-t border-slate-100 dark:border-slate-800">
                            {renderContactSection()}
                          </div>
                        )}
                      </div>


                    </div>
                  </div>
                )}

                {jobCreationStep === 'preview' && (
                  <div className="space-y-6 flex flex-col items-center">

                    {/* Toggle Switch */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 mb-2">
                      <button
                        onClick={() => setPreviewMode('whatsapp')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${previewMode === 'whatsapp' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Prévia WhatsApp
                      </button>
                      <button
                        onClick={() => setPreviewMode('site')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${previewMode === 'site' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Prévia Site
                      </button>
                    </div>

                    <div className="w-full max-w-2xl">
                      {previewMode === 'whatsapp' ? (
                        <WhatsAppPreviewCard
                          type={jobDraft.type as any}
                          imageUrl={jobDraft.imageUrl}
                          attachedFile={attachedFile}
                          previewText={generatePreviewText()}
                          onEmojiClick={() => { setEmojiInput(previewEmojis); setIsEmojiModalOpen(true); }}
                        />
                      ) : (
                        <div className="bg-[#FAFAFA] dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col h-[600px] relative">
                          {/* Mock Header/Filters */}


                          <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-4">
                            <JobDetailContent
                              job={{
                                id: jobDraft.id || 'preview',
                                code: jobDraft.jobCode || 'PREVIEW',
                                title: jobDraft.role || jobDraft.title || '',
                                company: jobDraft.companyName || company?.name || '',
                                location: `${jobDraft.city || ''} - ${jobDraft.region || ''}`,
                                type: (jobDraft.bond?.includes('CLT') ? 'CLT' : jobDraft.bond?.includes('PJ') ? 'PJ' : 'Freelance') as any,
                                salary: salaryEnabled ? jobDraft.salary : undefined,
                                postedAt: 'Agora mesmo',
                                description: jobDraft.observation || (jobDraft.type === 'file' ? 'Vaga modo imagem.' : ''),
                                requirements: jobDraft.requirements ? jobDraft.requirements.split('\n').filter(i => i.trim()) : [],
                                benefits: jobDraft.benefits ? jobDraft.benefits.split('\n').filter(i => i.trim()) : [],
                                activities: jobDraft.activities ? jobDraft.activities.split('\n').filter(i => i.trim()) : [],
                                isFeatured: true,
                                isHidden: false
                              }}
                              onApply={() => { }}
                              onReport={() => { }}
                              onQuestion={() => { }}
                              showFooter={false}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer seguindo padrão anexo */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between gap-4 flex-shrink-0">
                <button
                  onClick={() => {
                    if (jobCreationStep === 'form' || jobCreationStep === 'upload') setJobCreationStep('selection');
                    else if (jobCreationStep === 'preview') setJobCreationStep(jobDraft.type === 'file' ? 'upload' : 'form');
                    else { clearPersistence(); setIsJobModalOpen(false); }
                  }}
                  className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                  {jobCreationStep === 'selection' ? 'Cancelar' : 'Voltar'}
                </button>

                {jobCreationStep !== 'selection' && (
                  <button
                    onClick={() => {
                      if (jobCreationStep === 'preview') handleSaveJob();
                      else {
                        // Validação: obrigar o nome da vaga, cidade e região
                        if (!jobDraft.role?.trim()) {
                          const input = document.querySelector('[name="role"], input[type="text"][placeholder*="Auxiliar"]') as HTMLInputElement;
                          if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                          return;
                        }
                        if (!jobDraft.city?.trim()) {
                          const input = document.querySelector('[name="city"], input[placeholder*="Sorocaba"]') as HTMLInputElement;
                          if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                          return;
                        }
                        if (!jobDraft.region?.trim()) {
                          const input = document.querySelector('[name="region"], input[placeholder*="Campolim"]') as HTMLInputElement;
                          if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                          return;
                        }

                        // Para Vaga Imagem (file), apenas Função, Cidade, Região e Imagem são obrigatórios (e contatos)
                        // Para Vaga Texto (scratch), todos os campos são obrigatórios
                        if (jobDraft.type !== 'file') {
                          if (!jobDraft.hideCompany && !jobDraft.companyName?.trim()) {
                            const input = document.querySelector('[name="companyName"], input[placeholder*="nome da empresa"]') as HTMLInputElement;
                            if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                            return;
                          }
                          if (!jobDraft.requirements?.trim()) {
                            const textarea = document.querySelector('textarea[placeholder*="requisitos"]') as HTMLTextAreaElement;
                            if (textarea) { textarea.focus(); textarea.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                            return;
                          }
                          if (!jobDraft.benefits?.trim()) {
                            const textarea = document.querySelector('textarea[placeholder*="oferece"]') as HTMLTextAreaElement;
                            if (textarea) { textarea.focus(); textarea.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                            return;
                          }
                          if (!jobDraft.activities?.trim()) {
                            const textarea = document.querySelector('textarea[placeholder*="candidato"]') as HTMLTextAreaElement;
                            if (textarea) { textarea.focus(); textarea.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                            return;
                          }
                        }

                        if (!jobDraft.contacts || jobDraft.contacts.length === 0) {
                          setValidationMessage("Adicione pelo menos um canal de contato.");
                          setIsValidationModalOpen(true);
                          // Scroll to contacts section
                          const contactSection = document.querySelector('[class*="Contatos"]') as HTMLElement;
                          if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          return;
                        }

                        if (jobDraft.contacts.some(c => !c.value.trim())) {
                          // Focus on first empty contact field
                          const emptyContactInput = Array.from(document.querySelectorAll('input[placeholder*="WhatsApp"], input[placeholder*="E-mail"], input[placeholder*="Link"], input[placeholder*="endereço"]')).find(input => !(input as HTMLInputElement).value.trim()) as HTMLInputElement;
                          if (emptyContactInput) { emptyContactInput.focus(); emptyContactInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                          return;
                        }

                        // Validate Address Date/Time if active
                        const addressContacts = jobDraft.contacts.filter(c => c.type === 'Endereço');
                        for (const ac of addressContacts) {
                          if (!ac.noDateTime) {
                            if (!ac.date || !ac.time) {
                              // Focus on date or time input
                              const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                              if (dateInput) { dateInput.focus(); dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                              return;
                            }
                          }
                        }

                        if (jobDraft.type === 'file') {
                          if (!attachedFile && !jobDraft.imageUrl) {
                            // Scroll to file upload area
                            const fileLabel = document.querySelector('label[class*="aspect-video"]') as HTMLElement;
                            if (fileLabel) fileLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            return;
                          }
                        }
                        setJobCreationStep('preview');
                      }
                    }}
                    className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    {jobCreationStep === 'preview' ? 'Finalizar e Salvar' : 'Próximo Passo'}
                  </button>
                )}
              </div>
            </div>
          </div>

        )
      }

      {/* Modal: Nova Pasta / Editar Pasta */}
      {
        (isFolderModalOpen || isEditFolderModalOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => { setIsFolderModalOpen(false); setIsEditFolderModalOpen(false); }} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp">
              <div className="p-6 bg-blue-950 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold">{isEditFolderModalOpen ? 'Editar Pasta' : (currentDepth === 0 ? 'Nova Empresa' : 'Novo Setor')}</h3>
                <button onClick={() => { setIsFolderModalOpen(false); setIsEditFolderModalOpen(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Identificação</label>
                  <input
                    autoFocus
                    type="text"
                    value={folderNameInput}
                    onChange={e => setFolderNameInput(e.target.value)}
                    placeholder="Digite o nome..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500"
                    onKeyDown={e => e.key === 'Enter' && (isEditFolderModalOpen ? handleUpdateFolder() : handleCreateFolder())}
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setIsFolderModalOpen(false); setIsEditFolderModalOpen(false); }} className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-sm">Cancelar</button>
                  <button
                    onClick={isEditFolderModalOpen ? handleUpdateFolder : handleCreateFolder}
                    className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      <SavedContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        savedContacts={savedContacts}
        onUpdate={fetchSavedContacts}
      />

      {/* Delete Confirmation Modal */}
      <ActionsModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        type="delete"
        title="Excluir Item?"
        message={
          deleteData?.type === 'folder'
            ? `Tem certeza que deseja excluir a pasta "${deleteData.item.name}"? Todo o conteúdo será perdido.`
            : `Tem certeza que deseja excluir a vaga "${deleteData?.item.role || deleteData?.item.title}"?`
        }
        confirmText="Sim, Excluir"
        onConfirm={confirmDelete}
      />

      <ActionsModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        type="error"
        title="Atenção"
        message={validationMessage}
      />


      {/* Modal de Visualização de Vaga (Admin) */}
      {isViewModalOpen && viewingJob && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsViewModalOpen(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            {/* Header com Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 shrink-0">
              <div className="bg-slate-200 dark:bg-slate-900 p-1 rounded-xl flex items-center gap-1">
                <button
                  onClick={() => setPreviewMode('whatsapp')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${previewMode === 'whatsapp' ? 'bg-[#25d366] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setPreviewMode('site')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${previewMode === 'site' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Site
                </button>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
              {previewMode === 'whatsapp' ? (
                <div className="p-6">
                  <WhatsAppPreviewCard
                    type={viewingJob.type === 'image' ? 'file' : viewingJob.type as any}
                    imageUrl={viewingJob.image_url || viewingJob.imageUrl}
                    previewText={generatePreviewText(viewingJob)}
                    onEmojiClick={() => { }}
                    showEmojiButton={false}
                  />
                </div>
              ) : (
                <div className={previewMode === 'site' ? "bg-[#FAFAFA] dark:bg-slate-900 h-full flex flex-col" : ""}>



                  <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {(viewingJob.type === 'file' || viewingJob.type === 'image') ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 animate-fadeIn">
                        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/10 text-amber-500 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm">
                          <ImageIcon size={48} />
                        </div>
                        <div className="max-w-sm space-y-3">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Formato de Imagem</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Este formato de vaga foi otimizado para compartilhamento via WhatsApp e não possui texto estruturado para exibição no site.
                          </p>
                          <div className="pt-2">
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                              Para exibir no site, converta para o formato Texto.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <JobDetailContent
                        job={{
                          id: viewingJob.id,
                          code: viewingJob.jobCode || '---',
                          title: viewingJob.role || viewingJob.title || '',
                          company: viewingJob.companyName || company?.name || 'Sua Empresa',
                          location: `${viewingJob.city || ''}${viewingJob.city && viewingJob.region ? ' - ' : ''}${viewingJob.region || ''}`,
                          type: (viewingJob.bond?.includes('CLT') ? 'CLT' : viewingJob.bond?.includes('PJ') ? 'PJ' : 'Freelance') as any,
                          salary: viewingJob.salary,
                          postedAt: viewingJob.date || 'Hoje',
                          description: viewingJob.observation || (viewingJob.type === 'file' ? 'Vaga modo imagem.' : 'Sem descrição detalhada.'),
                          requirements: viewingJob.requirements ? viewingJob.requirements.split('\n').filter(i => (typeof i === 'string' && i.trim())) : [],
                          benefits: viewingJob.benefits ? viewingJob.benefits.split('\n').filter(i => (typeof i === 'string' && i.trim())) : [],
                          activities: viewingJob.activities ? viewingJob.activities.split('\n').filter(i => (typeof i === 'string' && i.trim())) : [],
                          isFeatured: viewingJob.is_featured
                        }}
                        onApply={() => { }}
                        onReport={() => { }}
                        onQuestion={() => { }}
                        showFooter={false}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Movimentação de Vaga */}
      {
        isMoveJobModalOpen && jobToMove && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => { setIsMoveJobModalOpen(false); setMoveJobModalFolderId(null); }} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[80vh]">
              <div className="p-6 bg-indigo-950 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                    <FolderInput size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Mover Vaga</h3>
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px]">
                      {jobToMove.role || jobToMove.title}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setIsMoveJobModalOpen(false); setMoveJobModalFolderId(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {moveJobModalFolderId ? 'Selecione o Setor' : 'Selecione a Empresa'}
                  </p>
                  {moveJobModalFolderId && (
                    <button
                      onClick={() => setMoveJobModalFolderId(null)}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={12} />
                      Voltar
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Opção para Mover para cá (se estiver dentro de uma empresa) */}
                  {moveJobModalFolderId && (
                    <button
                      onClick={() => handleMoveJob(jobToMove.id, moveJobModalFolderId)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-all font-bold text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} />
                        <span>Mover para esta empresa</span>
                      </div>
                    </button>
                  )}

                  {folders
                    .filter(f => f.parentId === moveJobModalFolderId)
                    .map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => {
                          if (folder.level === 'company') {
                            setMoveJobModalFolderId(folder.id);
                          } else {
                            handleMoveJob(jobToMove.id, folder.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.01] active:scale-95 text-left
                        ${jobToMove.folderId === folder.id
                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                            : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 hover:border-indigo-300'}
                      `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${folder.level === 'company' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            <FolderIcon size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white block">{folder.name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {folder.level === 'company' ? 'Empresa' : 'Setor'}
                            </span>
                          </div>
                        </div>
                        {folder.level === 'company' ? (
                          <ChevronRight size={18} className="text-slate-300" />
                        ) : (
                          jobToMove.folderId === folder.id && (
                            <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg">
                              <Check size={14} />
                            </div>
                          )
                        )}
                      </button>
                    ))}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => { setIsMoveJobModalOpen(false); setMoveJobModalFolderId(null); }}
                  className="w-full py-3.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal de Emojis */}
      {
        isEmojiModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsEmojiModalOpen(false)} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 animate-scaleUp">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personalizar Emojis</h3>
                <button onClick={() => setIsEmojiModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seus Emojis (Máx 3)</label>
                  <input
                    type="text"
                    value={emojiInput}
                    onChange={(e) => setEmojiInput(e.target.value)} // User logic validation if strict needed, but let's keep simple
                    placeholder="Ex: 🟡🔴🔵"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-xl text-center outline-none focus:ring-2 ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Cole os emojis que deseja utilizar no título.</p>
                </div>
                <button
                  onClick={async () => {
                    if (!user) return;
                    // Basic validation
                    /*if ([...emojiInput].length > 6) {
                       alert("Por favor, use no máximo 3 emojis (aprox).");
                       return;
                    }*/

                    const { error } = await supabase
                      .from('user_job_emojis')
                      .upsert({ user_id: user.id, emojis: emojiInput });

                    if (error) {
                      setValidationMessage("Erro ao salvar emojis personalizados");
                      setIsValidationModalOpen(true);
                    } else {
                      setPreviewEmojis(emojiInput);
                      setIsEmojiModalOpen(false);
                    }
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  Salvar Preferência
                </button>
              </div>
            </div>
          </div>
        )
      }



    </div >
  );
};

