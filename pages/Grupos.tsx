
import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  X,
  Link as LinkIcon,
  Crown,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  ImageIcon,
  Phone,
  AlignLeft,
  Hash,
  Trash2,
  Settings2,
  Tag as TagIcon,
  Edit3,
  Upload,
  RotateCw,
  Smartphone,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  image: string;
  membersCount: number;
  isAdmin: boolean;
  link: string;
  contact?: string;
  description?: string;
  tags: string[];
}

interface GruposProps {
  externalTrigger?: number;
  isWhatsAppConnected: boolean;
  onOpenConnect: () => void;
}

export const Grupos: React.FC<GruposProps> = ({ externalTrigger, isWhatsAppConnected, onOpenConnect }) => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [taggingGroup, setTaggingGroup] = useState<Group | null>(null);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [joinValue, setJoinValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Form for creation
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTagsInput, setFormTagsInput] = useState('');

  // Global tags management
  const [availableTags, setAvailableTags] = useState<string[]>(['Empregos', 'Tecnologia', 'Vendas', 'Design', 'Marketing', 'Logística', 'Networking', 'Suporte']);
  const [newTagInput, setNewTagInput] = useState('');

  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Vagas Sorocaba 1', image: 'https://picsum.photos/seed/group1/200/200', membersCount: 12450, isAdmin: true, link: 'https://chat.whatsapp.com/vagas1', tags: ['Empregos', 'Networking'] },
    { id: '2', name: 'Devs Interior SP', image: 'https://picsum.photos/seed/group2/200/200', membersCount: 3200, isAdmin: false, link: 'https://chat.whatsapp.com/devs-sp', tags: ['Tecnologia', 'Design'] },
    { id: '3', name: 'Vendas Diretas', image: 'https://picsum.photos/seed/group3/200/200', membersCount: 8900, isAdmin: true, link: 'https://chat.whatsapp.com/vendas-diretas', tags: ['Vendas', 'Marketing'] },
    { id: '4', name: 'Freelas Design', image: 'https://picsum.photos/seed/group4/200/200', membersCount: 1500, isAdmin: false, link: 'https://chat.whatsapp.com/freelas-design', tags: ['Design', 'Tecnologia'] },
    { id: '5', name: 'Marketing Digital', image: 'https://picsum.photos/seed/group5/200/200', membersCount: 5600, isAdmin: false, link: 'https://chat.whatsapp.com/mkt-dig', tags: ['Marketing'] },
  ]);

  useEffect(() => {
    if (externalTrigger && externalTrigger > 0) {
      openCreateModal();
    }
  }, [externalTrigger]);

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? g.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleSyncGroups = () => {
    setIsSyncing(true);
    // Simulating API call to fetch new groups
    setTimeout(() => {
      setIsSyncing(false);
      alert('Lista de grupos atualizada com sucesso!');
    }, 1500);
  };

  const openCreateModal = () => {
    setFormName('');
    setFormImage('');
    setFormContact('');
    setFormDescription('');
    setFormTagsInput('');
    setIsCreateModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = () => {
    if (!formName.trim() || !formContact.trim()) return;

    const tags = formTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newGroup: Group = {
      id: Math.random().toString(36).substr(2, 9),
      name: formName,
      image: formImage || `https://picsum.photos/seed/${formName}/200/200`,
      membersCount: 1,
      isAdmin: true,
      link: `https://chat.whatsapp.com/new-${Math.random().toString(36).substr(2, 5)}`,
      contact: formContact,
      description: formDescription,
      tags: tags
    };

    setGroups([newGroup, ...groups]);
    setIsCreateModalOpen(false);
  };

  const handleJoinGroup = () => {
    if (!joinValue.trim()) return;
    alert(`Solicitação enviada para o grupo: ${joinValue}`);
    setJoinValue('');
    setIsJoinModalOpen(false);
  };

  const copyLink = (group: Group) => {
    navigator.clipboard.writeText(group.link);
    setCopiedId(group.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Tag Group Actions
  const toggleTagInGroup = (group: Group, tag: string) => {
    const hasTag = group.tags.includes(tag);
    const updatedTags = hasTag
      ? group.tags.filter(t => t !== tag)
      : [...group.tags, tag];

    setGroups(groups.map(g => g.id === group.id ? { ...g, tags: updatedTags } : g));
  };

  // Global Tag Manager Actions
  const addGlobalTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !availableTags.includes(trimmed)) {
      setAvailableTags([...availableTags, trimmed]);
      setNewTagInput('');
    }
  };

  const deleteGlobalTag = (tag: string) => {
    if (confirm(`Remover a tag "#${tag}" globalmente?`)) {
      setAvailableTags(availableTags.filter(t => t !== tag));
      setGroups(groups.map(g => ({ ...g, tags: g.tags.filter(t => t !== tag) })));
      if (selectedTag === tag) setSelectedTag(null);
    }
  };

  const startEditingTag = (index: number, value: string) => {
    setEditingTagIndex(index);
    setEditingTagValue(value);
  };

  const saveEditedTag = (oldTag: string) => {
    const newValue = editingTagValue.trim();
    if (newValue && newValue !== oldTag) {
      const updatedList = [...availableTags];
      updatedList[editingTagIndex!] = newValue;
      setAvailableTags(updatedList);

      setGroups(groups.map(g => ({
        ...g,
        tags: g.tags.map(t => t === oldTag ? newValue : t)
      })));

      if (selectedTag === oldTag) setSelectedTag(newValue);
    }
    setEditingTagIndex(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">



      {/* Search and Action Bar - All on the same line */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Search Input - Expanding */}
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar comunidades pelo nome..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleSyncGroups}
            disabled={isSyncing}
            className={`flex items-center justify-center gap-2 px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm hover:text-blue-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 whitespace-nowrap ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Atualizar Grupos"
          >
            <RotateCw size={18} className={isSyncing ? 'animate-spin text-blue-600' : ''} />
            <span className="hidden sm:inline">{isSyncing ? 'Atualizando...' : 'Atualizar Grupos'}</span>
          </button>

          <button
            onClick={() => setIsTagsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm hover:text-blue-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            title="Gerenciar Tags"
          >
            <Settings2 size={18} />
            <span className="hidden sm:inline">Tags</span>
          </button>

          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <LinkIcon size={18} />
            <span className="hidden sm:inline">Entrar no Grupo</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Criar Grupo</span>
          </button>
        </div>
      </div>

      {/* Tag Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
            ${selectedTag === null
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500'
            }`}
        >
          Todos
        </button>
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
              ${selectedTag === tag
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500'
              }`}
          >
            # {tag}
          </button>
        ))}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden flex flex-col items-center text-center relative"
          >
            {/* Tag Button Top Right - Fixed to always show per request */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setTaggingGroup(group)}
                className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
                title="Adicionar Tag"
              >
                <TagIcon size={16} />
              </button>
            </div>

            {/* Group Thumbnail (Circular) */}
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full p-1 border-2 border-blue-100 dark:border-slate-800 group-hover:border-blue-500 transition-colors">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {group.isAdmin && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-950 shadow-lg border-2 border-white dark:border-slate-900">
                  <Crown size={14} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 w-full space-y-2">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white truncate px-2 leading-tight">
                {group.name}
              </h4>
              <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <Users size={12} className="text-blue-500" />
                <span>{group.membersCount.toLocaleString()} participantes</span>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 mt-3 min-h-[20px]">
                {group.tags.map(tag => (
                  <span key={tag} className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full mt-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              Ver Conversas
              <ExternalLink size={14} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); copyLink(group); }}
              className={`w-full mt-3 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95
                ${copiedId === group.id
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'}`}
            >
              {copiedId === group.id ? <Check size={14} /> : <Copy size={14} />}
              {copiedId === group.id ? 'Copiado!' : 'Copiar Link'}
            </button>
          </div>
        ))}
      </div>

      {/* Modal: Create Group */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
            {/* Dark Header */}
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-blue-950 shadow-lg shadow-yellow-400/20">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Criar Grupo</h3>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Novo Canal</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-6">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-slate-300 relative group cursor-pointer overflow-hidden hover:border-blue-500 transition-all"
                  >
                    {formImage ? (
                      <img src={formImage} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <ImageIcon size={28} />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload size={20} className="text-white" />
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">Clique para carregar foto</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Grupo <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><MessageSquare size={18} /></div>
                    <input autoFocus type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Empregos Sorocaba e Região" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contato (WhatsApp ou Link) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><Phone size={18} /></div>
                    <input type="text" value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="Ex: (15) 99999-9999 ou link" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tags Iniciais</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><Hash size={18} /></div>
                    <input type="text" value={formTagsInput} onChange={(e) => setFormTagsInput(e.target.value)} placeholder="Ex: Empregos, TI, Vendas" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-4 text-slate-400"><AlignLeft size={18} /></div>
                    <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} placeholder="Informações do grupo..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all resize-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-white dark:bg-slate-900">
              <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-2xl font-bold text-sm">Cancelar</button>
              <button onClick={handleCreateGroup} disabled={!formName.trim() || !formContact.trim()} className="flex-[1.5] bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all">Criar Grupo</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Join Group */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsJoinModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp">
            {/* Dark Header */}
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-blue-950 shadow-lg shadow-yellow-400/20">
                  <LinkIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Acesso Rápido</h3>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Entrar no Grupo</p>
                </div>
              </div>
              <button onClick={() => setIsJoinModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
            </div>

            <div className="p-8">
              <p className="text-sm text-slate-500 mb-6">Informe o Link de convite ou ID numérico do grupo para ingressar.</p>
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID ou Link do Grupo</label>
                  <input autoFocus type="text" value={joinValue} onChange={(e) => setJoinValue(e.target.value)} placeholder="Ex: chat.whatsapp.com/..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsJoinModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-2xl font-bold text-sm">Cancelar</button>
                  <button onClick={handleJoinGroup} className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Confirmar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Tag to Group */}
      {taggingGroup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setTaggingGroup(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp">
            {/* Dark Header */}
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-blue-950 shadow-lg shadow-yellow-400/20">
                  <TagIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Categorizar</h3>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">{taggingGroup.name}</p>
                </div>
              </div>
              <button onClick={() => setTaggingGroup(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
            </div>

            <div className="p-8">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Tags Disponíveis</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {availableTags.map(tag => {
                  const isSelected = taggingGroup.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTagInGroup(taggingGroup, tag)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                        ${isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-500'
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setTaggingGroup(null)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">Finalizar e Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Global Tag Manager */}
      {isTagsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsTagsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp">
            {/* Dark Header */}
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-blue-950 shadow-lg shadow-yellow-400/20">
                  <Hash size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Gerenciar Tags</h3>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Banco Global</p>
                </div>
              </div>
              <button onClick={() => setIsTagsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
            </div>

            <div className="p-8">
              <div className="flex gap-2 mb-6">
                <input type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addGlobalTag()} placeholder="Nome da nova tag..." className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-5 py-3.5 text-sm outline-none focus:ring-2 ring-blue-500" />
                <button onClick={addGlobalTag} className="p-3.5 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all"><Plus size={20} /></button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {availableTags.map((tag, idx) => (
                  <div key={tag} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group border border-slate-100 dark:border-slate-800">
                    {editingTagIndex === idx ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editingTagValue}
                          onChange={(e) => setEditingTagValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditedTag(tag)}
                          className="flex-1 bg-white dark:bg-slate-700 border-none rounded-lg px-3 py-1.5 text-sm outline-none ring-1 ring-blue-500 shadow-inner"
                        />
                        <button onClick={() => saveEditedTag(tag)} className="text-blue-600 hover:text-blue-700 transition-colors"><Check size={18} /></button>
                        <button onClick={() => setEditingTagIndex(null)} className="text-slate-400"><X size={18} /></button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200"># {tag}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => startEditingTag(idx, tag)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                          <button onClick={() => deleteGlobalTag(tag)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => setIsTagsModalOpen(false)} className="w-full mt-8 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-2xl font-bold text-sm transition-all hover:bg-slate-200">Fechar Gerenciador</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
