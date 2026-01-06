
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
  Move,
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
import { SavedContactsModal } from '../components/SavedContactsModal';

const OfficialWhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

import { useAuth } from '../contexts/AuthContext';

export const Vagas: React.FC = () => {
  const { user, company } = useAuth();
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

  // Draft da Vaga sendo criada
  const [jobDraft, setJobDraft] = useState<Partial<Vaga>>({});
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showFooterInImage, setShowFooterInImage] = useState(false);

  // Outros estados
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [jobToMove, setJobToMove] = useState<Vaga | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');

  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

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

  // Auxiliares
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentDepth = !currentFolder ? 0 : currentFolder.level === 'company' ? 1 : 2;
  const filteredFolders = folders.filter(f => f.parentId === currentFolderId);

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
      contacts: job.contacts || []
    });
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

  const generatePreviewText = () => {
    const j = jobDraft;
    const code = j.jobCode || '---';
    const parts: string[] = [];

    j.contacts?.forEach(c => {
      if (c.type === 'WhatsApp') parts.push(`WhatsApp ${c.value}`);
      else if (c.type === 'Email') parts.push(`e-mail ${c.value} com o código da vaga ${code}`);
      else if (c.type === 'Link') parts.push(`pelo link ${c.value}`);
      else if (c.type === 'Endereço') {
        if (!c.noDateTime) {
          parts.push(`Compareça no ${c.value} no dia ${c.date || '__/__'} às ${c.time || '__:__'}`);
        } else {
          parts.push(`Compareça em: ${c.value}`);
        }
      }
    });

    const interessadosText = parts.length > 0
      ? `Envie seu currículo para ${parts.join(' ou ')}`
      : 'Entre em contato pelos canais oficiais.';

    if (j.type === 'file') {
      const observationText = j.showObservation && j.observation ? `\nObs: ${j.observation}\n` : '';
      return `*${company?.name || 'Sua Empresa'} Contrata* ${previewEmojis}
-----------------------------
Função: *${j.role || ''}*
Cód. Vaga: *${code}*
-----------------------------${observationText}
*Interessados*
 ${interessadosText}`;
    }

    return `*${company?.name || 'Sua Empresa'} Contrata* ${previewEmojis}
-----------------------------
Função: *${j.role || ''}*
Cód. Vaga: *${code}*
-----------------------------  
*Vínculo:* ${j.bond || ''}
*Empresa:* ${j.hideCompany ? '(Oculto)' : j.companyName || ''}
*Cidade/Bairro:* ${j.city || ''} - ${j.region || ''}
*Requisitos:* ${j.requirements || ''}
*Benefícios:* ${j.benefits || ''}
*Atividades:* ${j.activities || ''}

*Interessados*
 ${interessadosText}
----------------------------- 

*Mais informações:*
➞ ${company?.name || 'Agência Sync'}
➞ ${company?.whatsapp || '5515996993021'}
➞ ${company?.website || 'soroempregos.com.br'}`;
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
      let imageUrl = '';

      // 1. Upload Image if exists
      if (jobDraft.type === 'file' && attachedFile) {
        const fileExt = attachedFile.name.split('.').pop();
        const fileName = `${userId}/${companyId}/${sectorId}/${jobDraft.jobCode}.${fileExt}`;

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

        // Image fields
        image_url: imageUrl,
        footer_enabled: showFooterInImage,
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
      setIsJobModalOpen(false);
      setJobCreationStep(null);

    } catch (error: any) {
      console.error('Erro ao salvar vaga:', error);
      alert(`Erro ao salvar vaga: ${error.message}`);
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
      alert("Erro ao atualizar status");
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
      alert("Erro ao mover vaga");
      return;
    }

    setVagas(prev => prev.map(v => v.id === vagaId ? { ...v, folderId: targetFolderId } : v));
    setIsMoveJobModalOpen(false);
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
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', job.id);

        if (error) throw error;
        setVagas(prev => prev.filter(v => v.id !== job.id));
      }
      setIsDeleteModalOpen(false);
      setDeleteData(null);
    } catch (error: any) {
      alert(`Erro ao excluir: ${error.message}`);
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
                    className="flex-1 bg-transparent border-none px-2 py-1 text-base font-medium outline-none"
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

        <div className="flex items-center gap-3">
          {currentDepth < 2 && (
            <button onClick={() => { setFolderNameInput(''); setIsFolderModalOpen(true); }} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm hover:bg-slate-50 shadow-sm">
              <FolderPlus size={18} />
              <span className="hidden sm:inline">{currentDepth === 0 ? 'Nova Empresa' : 'Novo Setor'}</span>
              <span className="sm:hidden">{currentDepth === 0 ? 'Empresa' : 'Setor'}</span>
            </button>
          )}
          {currentFolderId && (
            <button onClick={startJobCreation} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95">
              <Plus size={18} />
              <span>Criar Vaga</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Pastas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 outline-none focus:ring-2 ring-blue-500/20"
              >
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>

              <div className="relative w-full sm:w-64 group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cargo ou código..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="w-1/3 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Cargo / Código</th>
                  <th className="hidden sm:table-cell w-1/6 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="hidden md:table-cell w-1/6 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                  <th className="w-1/4 sm:w-1/6 px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Status</th>
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
                    <tr key={vaga.id} draggable onDragStart={(e) => e.dataTransfer.setData('jobId', vaga.id)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
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
                      <td className="hidden sm:table-cell px-6 py-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${vaga.type === 'file' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          {vaga.type === 'file' ? 'Imagem' : 'Texto'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{vaga.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleJobStatus(vaga.id); }} className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${vaga.status === 'Ativa' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${vaga.status === 'Ativa' ? 'left-[18px]' : 'left-0.5'}`} />
                          </button>
                          <span className="hidden sm:inline text-[11px] font-bold uppercase whitespace-nowrap text-slate-500">{vaga.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
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

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && deleteData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 animate-scaleUp text-center">

            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Confirmar Exclusão</h3>

            <p className="text-sm text-slate-500 mb-6">
              {deleteData.type === 'folder'
                ? `Tem certeza que deseja excluir ${deleteData.item.level === 'company' ? 'a empresa' : 'o setor'} "${deleteData.item.name}"?`
                : `Tem certeza que deseja excluir a vaga "${deleteData.item.role || deleteData.item.title}"?`
              }
              <br />
              <span className="font-bold text-rose-500 text-xs mt-1 block">Essa ação não pode ser desfeita.</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all active:scale-95"
              >
                Excluir
              </button>
            </div>

          </div>
        </div>
      )}


      {/* MODAL: Criação de Vaga - Largura reduzida para max-w-2xl */}
      {
        isJobModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsJobModalOpen(false)} />
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
                <button onClick={() => setIsJobModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
                      {/* Row 1 */}
                      <div className="md:col-span-6 space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Função / Cargo <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"><Briefcase size={18} /></div>
                          <input type="text" value={jobDraft.role || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, role: e.target.value })} placeholder="Ex: Auxiliar de Limpeza"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                        </div>
                      </div>
                      <div className="md:col-span-6 space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-semibold">Empresa</label>
                          <button
                            onClick={() => setJobDraft({ ...jobDraft, hideCompany: !jobDraft.hideCompany, companyName: jobDraft.hideCompany ? jobDraft.companyName : '' })}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            {jobDraft.hideCompany ? (
                              <><Eye size={12} /> Mostrar Nome</>
                            ) : (
                              <><EyeOff size={12} /> Ocultar na Vaga</>
                            )}
                          </button>
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

                      {/* Row 2: Vínculo (30%), Cidade (30%), Região (40%) */}
                      <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-10 gap-6">
                        <div className="md:col-span-3 space-y-1.5">
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

                        <div className="md:col-span-3 space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Cidade</label>
                          <div className="relative group">
                            <input type="text" value={jobDraft.city || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, city: e.target.value })} placeholder="Sorocaba"
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                          </div>
                        </div>

                        <div className="md:col-span-4 space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Região / Bairro</label>
                          <div className="relative group">
                            <input type="text" value={jobDraft.region || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, region: e.target.value })} placeholder="Ex: Campolim, Centro..."
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
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

                    {/* OBSERVATION - Optional */}
                    <div className="space-y-3 pt-2 pb-4">
                      <button
                        onClick={() => setJobDraft({ ...jobDraft, showObservation: !jobDraft.showObservation })}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        {jobDraft.showObservation ? (
                          <><div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white"><CheckCircle2 size={10} /></div> Deseja adicionar observação?</>
                        ) : (
                          <><div className="w-4 h-4 rounded border border-slate-300"></div> Deseja adicionar observação?</>
                        )}
                      </button>

                      {jobDraft.showObservation && (
                        <div className="animate-fadeIn space-y-1.5 pl-6 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                          <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-semibold">Observação</label>
                          <textarea
                            value={jobDraft.observation || ''}
                            onChange={e => setJobDraft({ ...jobDraft, observation: e.target.value })}
                            rows={2}
                            placeholder="Informe a observação..."
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400"
                          />
                        </div>
                      )}
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

                    <label className="flex flex-col items-center justify-center w-full aspect-video bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] cursor-pointer hover:border-blue-500 transition-all group overflow-hidden">
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      {attachedFile ? (
                        <div className="relative w-full h-full">
                          <img src={URL.createObjectURL(attachedFile)} className="w-full h-full object-contain" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <p className="text-white font-black uppercase text-xs">Trocar Imagem</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-10">
                          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                          </div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">Carregar arte da vaga</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Formatos suportados: JPG, PNG</p>
                        </div>
                      )}
                    </label>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center"><Smartphone size={18} /></div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Adicionar rodapé de contato na imagem?</span>
                        </div>
                        <button onClick={() => setShowFooterInImage(!showFooterInImage)} className={`w-12 h-6 rounded-full transition-all relative ${showFooterInImage ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${showFooterInImage ? 'left-6.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {showFooterInImage && <div className="animate-fadeIn pt-2 border-t border-slate-100 dark:border-slate-800">{renderContactSection()}</div>}
                    </div>
                  </div>
                </div>
              )}

              {jobCreationStep === 'preview' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-900 shadow-inner relative">
                    <div className="absolute top-6 right-8 flex items-center gap-3">
                      <button
                        onClick={() => { setEmojiInput(previewEmojis); setIsEmojiModalOpen(true); }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all"
                      >
                        Alterar Emojis
                      </button>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Prévia do Texto</span>
                    </div>
                    {jobDraft.type === 'file' && attachedFile && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-w-sm mx-auto shadow-xl">
                        <img src={URL.createObjectURL(attachedFile)} className="w-full h-auto" alt="Job Visual" />
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-mono text-[11px] font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                      {generatePreviewText()}
                    </pre>
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
                  else setIsJobModalOpen(false);
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
                      // Validação: obrigar o nome da vaga
                      if (!jobDraft.role?.trim()) { alert("Por favor, informe a Função / Cargo."); return; }

                      // Para Vaga Imagem (file), apenas Função e Imagem são obrigatórios (e contatos)
                      // Para Vaga Texto (scratch), todos os campos são obrigatórios
                      if (jobDraft.type !== 'file') {
                        if (!jobDraft.hideCompany && !jobDraft.companyName?.trim()) { alert("Por favor, informe o nome da Empresa."); return; }
                        if (!jobDraft.city?.trim()) { alert("Por favor, informe a Cidade."); return; }
                        if (!jobDraft.region?.trim()) { alert("Por favor, informe a Região / Bairro."); return; }
                        if (!jobDraft.requirements?.trim()) { alert("Por favor, informe os Requisitos."); return; }
                        if (!jobDraft.benefits?.trim()) { alert("Por favor, informe os Benefícios."); return; }
                        if (!jobDraft.activities?.trim()) { alert("Por favor, informe as Atividades."); return; }
                      }

                      if (!jobDraft.contacts || jobDraft.contacts.length === 0) {
                        alert("Por favor, selecione ao menos 1 contato.");
                        return;
                      }

                      if (jobDraft.contacts.some(c => !c.value.trim())) {
                        alert("Por favor, preencha as informações de todos os contatos selecionados.");
                        return;
                      }

                      // Validate Address Date/Time if active
                      const addressContacts = jobDraft.contacts.filter(c => c.type === 'Endereço');
                      for (const ac of addressContacts) {
                        if (!ac.noDateTime) {
                          if (!ac.date || !ac.time) {
                            alert("Para contatos de Endereço, a Data e Hora são obrigatórias quando a opção 'Sem Data/Hora' está desativada.");
                            return;
                          }
                        }
                      }

                      if (jobCreationStep === 'upload' && !attachedFile) {
                        alert("Por favor, carregue a imagem da vaga.");
                        return;
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

{/* Modal: Nova Pasta / Editar Pasta */ }
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


{/* Modal de Visualização Rápida */ }
{
  isViewModalOpen && viewingJob && (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl p-8 animate-scaleUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{viewingJob.role || viewingJob.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-slate-400">COD: <span className="text-slate-600 dark:text-slate-300">{viewingJob.jobCode || viewingJob.code}</span></span>
              <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase ${viewingJob.status === 'Ativa' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {viewingJob.status}
              </span>
            </div>
          </div>
          <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          {/* Content Section */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-400">
            <strong className="text-slate-800 dark:text-slate-200 block mb-1">Empresa:</strong>
            <p className="mb-4">{viewingJob.companyName || '(Oculta)'}</p>

            <strong className="text-slate-800 dark:text-slate-200 block mb-1">Requisitos:</strong>
            <p className="mb-4">{viewingJob.requirements}</p>

            <strong className="text-slate-800 dark:text-slate-200 block mb-1">Benefícios:</strong>
            <p className="mb-4">{viewingJob.benefits}</p>

            <strong className="text-slate-800 dark:text-slate-200 block mb-1">Atividades:</strong>
            <p className="mb-4">{viewingJob.activities}</p>

            {/* Contacts Section - Integrated */}
            {viewingJob.contacts && viewingJob.contacts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <strong className="text-slate-800 dark:text-slate-200 block mb-2 text-xs uppercase tracking-wide">Contatos</strong>
                <div className="space-y-2">
                  {viewingJob.contacts.map((contact, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-6 h-6 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-blue-500 shadow-sm border border-slate-100 dark:border-slate-700">
                        {contact.type === 'WhatsApp' && <OfficialWhatsAppIcon size={12} />}
                        {contact.type === 'Email' && <Mail size={12} />}
                        {contact.type === 'Endereço' && <MapPin size={12} />}
                        {contact.type === 'Link' && <LinkIcon size={12} />}
                      </div>
                      <span className="font-medium">{contact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

{/* Modal de Emojis */ }
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
                alert("Erro ao salvar emojis");
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

