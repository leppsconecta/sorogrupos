
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
  Search
} from 'lucide-react';
import { Vaga, Folder, JobContact } from '../types';

const OfficialWhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const Vagas: React.FC = () => {
  // Navegação e Dados
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'f1', name: 'Sorocaba Tech', parentId: null, level: 'company' },
    { id: 'f2', name: 'Logística Regional', parentId: null, level: 'company' },
    { id: 'sub1', name: 'Desenvolvimento', parentId: 'f1', level: 'sector' },
  ]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados dos Modais
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [isMoveJobModalOpen, setIsMoveJobModalOpen] = useState(false);
  const [jobCreationStep, setJobCreationStep] = useState<'selection' | 'form' | 'upload' | 'preview' | null>(null);
  
  // Draft da Vaga sendo criada
  const [jobDraft, setJobDraft] = useState<Partial<Vaga>>({});
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showFooterInImage, setShowFooterInImage] = useState(false);

  // Outros estados
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [jobToMove, setJobToMove] = useState<Vaga | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Auxiliares
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentDepth = !currentFolder ? 0 : currentFolder.level === 'company' ? 1 : 2;
  const filteredFolders = folders.filter(f => f.parentId === currentFolderId);
  
  // Filter jobs by folder AND search term
  const filteredJobs = vagas.filter(v => {
    const matchesFolder = v.folderId === currentFolderId;
    const matchesSearch = searchTerm === '' || 
      (v.role || v.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.jobCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFolder && matchesSearch;
  });

  // Iniciar criação de vaga
  const startJobCreation = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setJobDraft({
      jobCode: code,
      contacts: [],
      bond: 'CLT',
      hideCompany: false,
      status: 'Ativa'
    });
    setAttachedFile(null);
    setShowFooterInImage(false);
    setJobCreationStep('selection');
    setIsJobModalOpen(true);
  };

  const handleAddContactField = (type: JobContact['type']) => {
    const existing = jobDraft.contacts || [];
    if (type !== 'WhatsApp' && existing.some(c => c.type === type)) return;

    setJobDraft({
      ...jobDraft,
      contacts: [...existing, { type, value: '' }]
    });
  };

  const updateContactValue = (index: number, value: string, field: 'value' | 'date' | 'time' = 'value') => {
    const updated = [...(jobDraft.contacts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setJobDraft({ ...jobDraft, contacts: updated });
  };

  const removeContact = (index: number) => {
    const updated = [...(jobDraft.contacts || [])];
    updated.splice(index, 1);
    setJobDraft({ ...jobDraft, contacts: updated });
  };

  const generatePreviewText = () => {
    const j = jobDraft;
    const code = j.jobCode || '---';
    const parts: string[] = [];

    j.contacts?.forEach(c => {
      if (c.type === 'WhatsApp') parts.push(`WhatsApp ${c.value}`);
      else if (c.type === 'Email') parts.push(`e-mail ${c.value} com o código da vaga ${code}`);
      else if (c.type === 'Link') parts.push(`pelo link ${c.value}`);
      else if (c.type === 'Endereço') parts.push(`Compareça no ${c.value} no dia ${c.date || '__/__'} as ${c.time || '__:__'}`);
    });

    const interessadosText = parts.length > 0 
      ? `Envie seu currículo para ${parts.join(' ou ')}`
      : 'Entre em contato pelos canais oficiais.';

    if (j.type === 'file') {
      return `*Anúncio de Vaga (Imagem)*\nCargo: *${j.role || ''}*\nCód. Vaga: *${code}*\n\n*Rodapé de Contato:*\n${interessadosText}`;
    }

    return `*Agência Sync Contrata* 🟡🔴🔵  
-----------------------------  
Função: *${j.role || ''}*
Cód. Vaga: *${code}*
-----------------------------  
*Vínculo:* ${j.bond || ''}
*Empresa:* ${j.hideCompany ? '(Oculto)' : j.companyName || ''}
*Cidade/Bairro:* ${j.city || ''} - ${j.region || ''}

*Atividades:*
${j.activities || ''}

*Requisitos:*
${j.requirements || ''}

*Benefícios:*
${j.benefits || ''}

*Interessados*
 ${interessadosText}
----------------------------- 

*Mais informações:*
🠖 Agência Sync
🠖 5515996993021
🠖 soroempregos.com.br`;
  };

  const handleSaveJob = () => {
    const newJob: Vaga = {
      ...jobDraft,
      id: Math.random().toString(36).substr(2, 9),
      title: jobDraft.role || 'Nova Vaga',
      companyId: currentFolderId!,
      folderId: currentFolderId!,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativa',
      type: jobDraft.type as 'scratch' | 'file'
    } as Vaga;

    setVagas([...vagas, newJob]);
    setIsJobModalOpen(false);
    setJobCreationStep(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const toggleJobStatus = (id: string) => {
    setVagas(prev => prev.map(v => v.id === id ? { ...v, status: v.status === 'Ativa' ? 'Pausada' : 'Ativa' } : v));
  };

  const handleMoveJob = (vagaId: string, targetFolderId: string) => {
    setVagas(prev => prev.map(v => v.id === vagaId ? { ...v, folderId: targetFolderId } : v));
    setIsMoveJobModalOpen(false);
  };

  const handleCreateFolder = () => {
    if (!folderNameInput.trim()) return;
    
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name: folderNameInput,
      parentId: currentFolderId,
      level: currentDepth === 0 ? 'company' : 'sector'
    };

    setFolders([...folders, newFolder]);
    setIsFolderModalOpen(false);
    setFolderNameInput('');
  };

  const handleUpdateFolder = () => {
    if (!folderNameInput.trim() || !folderToEdit) return;

    setFolders(prev => prev.map(f => f.id === folderToEdit.id ? { ...f, name: folderNameInput } : f));
    setIsEditFolderModalOpen(false);
    setFolderToEdit(null);
    setFolderNameInput('');
  };

  // Reusable Contact Section for Modal
  const renderContactSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">CANAIS DE CONTATO</h4>
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

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg text-slate-500">
                    {c.type === 'WhatsApp' && <OfficialWhatsAppIcon size={14} />}
                    {c.type === 'Email' && <Mail size={14} />}
                    {c.type === 'Endereço' && <MapPin size={14} />}
                    {c.type === 'Link' && <LinkIcon size={14} />}
                 </div>
                 <input 
                    type="text" 
                    value={c.value}
                    onChange={e => updateContactValue(i, e.target.value)}
                    placeholder={`Informe o ${c.type}...`}
                    className="flex-1 bg-transparent border-none px-2 py-1 text-xs font-medium outline-none"
                  />
              </div>
              {c.type === 'Endereço' && (
                <div className="flex gap-2 pl-8">
                  <input type="date" value={c.date || ''} onChange={e => updateContactValue(i, e.target.value, 'date')} className="flex-1 bg-white dark:bg-slate-700 border-none rounded-xl px-3 py-2 text-[10px] outline-none" />
                  <input type="time" value={c.time || ''} onChange={e => updateContactValue(i, e.target.value, 'time')} className="w-24 bg-white dark:bg-slate-700 border-none rounded-xl px-3 py-2 text-[10px] outline-none" />
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
            {!currentFolderId ? 'Minhas Empresas' : currentFolder?.name}
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
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir pasta?')) setFolders(folders.filter(f => f.id !== folder.id)); }} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
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
            
            {/* Search Input */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="w-1/3 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Código</th>
                  <th className="hidden sm:table-cell w-1/6 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                  <th className="hidden md:table-cell w-1/6 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="w-1/4 sm:w-1/6 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="w-1/6 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
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
                            <span className="font-semibold text-sm text-slate-800 dark:text-white block truncate">{vaga.role || vaga.title}</span>
                            <span className="text-[10px] font-bold text-slate-400">COD: {vaga.jobCode || '---'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${vaga.type === 'file' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          {vaga.type === 'file' ? 'Imagem' : 'Texto'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-xs text-slate-400 whitespace-nowrap">{vaga.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <button onClick={() => toggleJobStatus(vaga.id)} className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${vaga.status === 'Ativa' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                             <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${vaga.status === 'Ativa' ? 'left-4.5' : 'left-0.5'}`} />
                           </button>
                           <span className="hidden sm:inline text-[10px] font-bold uppercase whitespace-nowrap text-slate-400">{vaga.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                          <button className="p-2 text-slate-400 hover:text-yellow-600 transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => setVagas(vagas.filter(v => v.id !== vaga.id))} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
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
      {isJobModalOpen && (
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
                  <button onClick={() => { setJobDraft({...jobDraft, type: 'scratch'}); setJobCreationStep('form'); }} className="group p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-yellow-400 transition-all text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-400 group-hover:text-blue-950 transition-colors">
                      <FileText size={28} />
                    </div>
                    <span className="font-black text-slate-800 dark:text-white block text-lg uppercase tracking-tight">Criar por Texto</span>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Gera o template automático de text.</p>
                  </button>
                  <button onClick={() => { setJobDraft({...jobDraft, type: 'file'}); setJobCreationStep('upload'); }} className="group p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-yellow-400 transition-all text-center flex flex-col items-center">
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Função / Cargo <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><Briefcase size={18} /></div>
                        <input type="text" value={jobDraft.role || ''} onChange={e => setJobDraft({...jobDraft, role: e.target.value})} placeholder="Ex: Auxiliar de Limpeza" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm outline-none focus:ring-2 ring-blue-500" />
                      </div>
                    </div>
                    <div className="md:col-span-6 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa</label>
                        <button onClick={() => setJobDraft({...jobDraft, hideCompany: !jobDraft.hideCompany, companyName: jobDraft.hideCompany ? jobDraft.companyName : ''})} className={`text-[9px] font-bold px-2 py-0.5 rounded ${jobDraft.hideCompany ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{jobDraft.hideCompany ? 'EMPRESA OCULTA' : 'OCULTAR EMPRESA'}</button>
                      </div>
                      <input type="text" disabled={jobDraft.hideCompany} value={jobDraft.companyName || ''} onChange={e => setJobDraft({...jobDraft, companyName: e.target.value})} placeholder="Nome da empresa" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-blue-500 disabled:opacity-30 outline-none" />
                    </div>

                    {/* Row 2 */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vínculo</label>
                      <select value={jobDraft.bond} onChange={e => setJobDraft({...jobDraft, bond: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-3 py-3.5 text-xs focus:ring-2 ring-blue-500 outline-none">
                        <option value="CLT">CLT</option>
                        <option value="Jurídico">PJ</option>
                        <option value="Freelance">Freela</option>
                        <option value="Temporário">Temp</option>
                      </select>
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                      <input type="text" value={jobDraft.city || ''} onChange={e => setJobDraft({...jobDraft, city: e.target.value})} placeholder="Sorocaba" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-sm outline-none" />
                    </div>
                    <div className="md:col-span-7 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Região / Bairro</label>
                      <input type="text" value={jobDraft.region || ''} onChange={e => setJobDraft({...jobDraft, region: e.target.value})} placeholder="Ex: Campolim, Centro..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 ring-blue-500" />
                    </div>

                    {/* Detailed Fields Area */}
                    <div className="md:col-span-12 space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ATIVIDADES</label>
                        <textarea value={jobDraft.activities || ''} onChange={e => setJobDraft({...jobDraft, activities: e.target.value})} rows={3} placeholder="O que o candidato irá fazer?" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-blue-500 outline-none resize-none" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">REQUISITOS</label>
                        <textarea value={jobDraft.requirements || ''} onChange={e => setJobDraft({...jobDraft, requirements: e.target.value})} rows={3} placeholder="O que o candidato precisa ter?" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-blue-500 outline-none resize-none" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BENEFÍCIOS</label>
                        <textarea value={jobDraft.benefits || ''} onChange={e => setJobDraft({...jobDraft, benefits: e.target.value})} rows={3} placeholder="O que a empresa oferece?" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-blue-500 outline-none resize-none" />
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Vaga <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><Briefcase size={18} /></div>
                        <input 
                          type="text" 
                          value={jobDraft.role || ''} 
                          onChange={e => setJobDraft({...jobDraft, role: e.target.value})} 
                          placeholder="Ex: Auxiliar Administrativo" 
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm outline-none focus:ring-2 ring-blue-500" 
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
                    <div className="absolute top-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Prévia do Texto</div>
                    {jobDraft.type === 'file' && attachedFile && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-w-sm mx-auto shadow-xl">
                        <img src={URL.createObjectURL(attachedFile)} className="w-full h-auto" alt="Job Visual" />
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-mono text-[11px] font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                      {generatePreviewText()}
                    </pre>
                  </div>

                  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Revise os dados antes de publicar.</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400/70 mt-0.5">Ao confirmar, a vaga ficará disponível imediatamente para disparos em massa.</p>
                    </div>
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
                      if (!jobDraft.role?.trim()) {
                        alert("Por favor, informe o nome da vaga antes de prosseguir.");
                        return;
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
      )}

      {/* Modal: Nova Pasta / Editar Pasta */}
      {(isFolderModalOpen || isEditFolderModalOpen) && (
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
      )}
    </div>
  );
};
