
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
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [taggingGroup, setTaggingGroup] = useState<Group | null>(null);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [joinValue, setJoinValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showMyGroups, setShowMyGroups] = useState(false);

  // Form for creation
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTagsInput, setFormTagsInput] = useState('');

  // Global tags management
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (externalTrigger && externalTrigger > 0) {
      openCreateModal();
    }
  }, [externalTrigger]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    // We allow fetching even if not logged in (public read), but user check is good practice if intended for private. 
    // RLS allows public read for authenticated users.
    setIsSyncing(true);
    try {
      // Fetch Tags
      const { data: tagsData } = await supabase
        .from('tags_group')
        .select('name')
        .order('name');

      if (tagsData) {
        setAvailableTags(tagsData.map(t => t.name));
      }

      // Fetch Groups with Tags
      const { data: groupsData, error } = await supabase
        .from('whatsapp_groups')
        .select(`
          *,
          whatsapp_groups_tags (
            tags_group (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (groupsData) {
        const mappedGroups: Group[] = groupsData.map((g: any) => ({
          id: g.id,
          name: g.name_group,
          image: `https://picsum.photos/seed/${g.id}/200/200`, // Placeholder as DB has no image
          membersCount: g.total || 0,
          isAdmin: g.admin || false,
          link: g.link_invite || '',
          contact: '', // Database doesn't have contact/phone column separate from link/description
          description: g.description || '',
          tags: g.whatsapp_groups_tags.map((t: any) => t.tags_group.name)
        }));
        setGroups(mappedGroups);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? g.tags.includes(selectedTag) : true;
    const matchesMyGroups = showMyGroups ? g.isAdmin : true;
    return matchesSearch && matchesTag && matchesMyGroups;
  });

  const handleSyncGroups = () => {
    fetchData();
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

  const handleCreateGroup = async () => {
    if (!formName.trim() || !formContact.trim() || !user) return;

    try {
      // 1. Create Group
      const { data: groupData, error: groupError } = await supabase
        .from('whatsapp_groups')
        .insert({
          user_id: user.id,
          name_group: formName,
          link_invite: formContact,
          description: formDescription,
          admin: true, // User created it, so they are admin
          total: 1
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Handle Tags
      const tags = formTagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (tags.length > 0) {
        for (const tagName of tags) {
          let tagId;
          const { data: existingTag } = await supabase
            .from('tags_group')
            .select('id')
            .eq('name', tagName)
            .single();

          if (existingTag) {
            tagId = existingTag.id;
          } else {
            const { data: newTag } = await supabase
              .from('tags_group')
              .insert({ user_id: user.id, name: tagName })
              .select('id')
              .single();
            tagId = newTag?.id;
          }

          if (tagId) {
            await supabase
              .from('whatsapp_groups_tags')
              .insert({ group_id: groupData.id, tag_id: tagId });
          }
        }
      }

      await fetchData();
      setIsCreateModalOpen(false);

    } catch (error) {
      console.error('Error creating group:', error);
      alert('Erro ao criar grupo. Tente novamente.');
    }
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
  const toggleTagInGroup = async (group: Group, tag: string) => {
    if (!user) return;
    const hasTag = group.tags.includes(tag);

    try {
      // Get Tag ID
      const { data: tagRef } = await supabase
        .from('tags_group')
        .select('id')
        .eq('name', tag)
        .single();

      if (!tagRef) return;

      if (hasTag) {
        // Remove
        await supabase
          .from('whatsapp_groups_tags')
          .delete()
          .eq('group_id', group.id)
          .eq('tag_id', tagRef.id);
      } else {
        // Add
        await supabase
          .from('whatsapp_groups_tags')
          .insert({ group_id: group.id, tag_id: tagRef.id });
      }

      // Optimistic update
      const updatedTags = hasTag
        ? group.tags.filter(t => t !== tag)
        : [...group.tags, tag];

      const updatedGroup = { ...group, tags: updatedTags };

      setGroups(groups.map(g => g.id === group.id ? updatedGroup : g));

      if (taggingGroup && taggingGroup.id === group.id) {
        setTaggingGroup(updatedGroup);
      }

    } catch (error) {
      console.error('Error toggling tag:', error);
      fetchData(); // Revert on error
    }
  };

  // Global Tag Manager Actions
  const addGlobalTag = async () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !availableTags.includes(trimmed) && user) {
      try {
        await supabase
          .from('tags_group')
          .insert({ user_id: user.id, name: trimmed });

        setAvailableTags([...availableTags, trimmed]);
        setNewTagInput('');
      } catch (error) {
        console.error('Error adding tag:', error);
      }
    }
  };

  const deleteGlobalTag = async (tag: string) => {
    if (confirm(`Remover a tag "#${tag}" globalmente?`) && user) {
      try {
        const { data: tagRef } = await supabase
          .from('tags_group')
          .select('id')
          .eq('name', tag)
          .single();

        if (tagRef) {
          await supabase
            .from('tags_group')
            .delete()
            .eq('id', tagRef.id);

          setAvailableTags(availableTags.filter(t => t !== tag));
          setGroups(groups.map(g => ({ ...g, tags: g.tags.filter(t => t !== tag) })));
          if (selectedTag === tag) setSelectedTag(null);
        }
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  const startEditingTag = (index: number, value: string) => {
    setEditingTagIndex(index);
    setEditingTagValue(value);
  };

  const saveEditedTag = async (oldTag: string) => {
    const newValue = editingTagValue.trim();
    if (newValue && newValue !== oldTag && user) {
      try {
        const { data: tagRef } = await supabase
          .from('tags_group')
          .select('id')
          .eq('name', oldTag)
          .single();

        if (tagRef) {
          await supabase
            .from('tags_group')
            .update({ name: newValue })
            .eq('id', tagRef.id);

          const updatedList = [...availableTags];
          updatedList[editingTagIndex!] = newValue;
          setAvailableTags(updatedList);

          setGroups(groups.map(g => ({
            ...g,
            tags: g.tags.map(t => t === oldTag ? newValue : t)
          })));

          if (selectedTag === oldTag) setSelectedTag(newValue);
        }
      } catch (error) {
        console.error('Error updating tag:', error);
      }
    }
    setEditingTagIndex(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search and Action Bar */}
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
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleSyncGroups}
            disabled={isSyncing}
            className={`flex items-center justify-center gap-2 px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm active:scale-95 whitespace-nowrap ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Atualizar Grupos"
          >
            <RotateCw size={18} className={isSyncing ? 'animate-spin text-blue-600' : ''} />
            <span className="hidden sm:inline">{isSyncing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>



          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <LinkIcon size={18} />
            <span className="hidden sm:inline">Entrar</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Criar</span>
          </button>
        </div>
      </div>

      {/* Tag Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => { setSelectedTag(null); setShowMyGroups(false); }}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2
            ${selectedTag === null && !showMyGroups
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500'
            }`}
        >
          Todos
          <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${selectedTag === null && !showMyGroups ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {groups.length}
          </span>
        </button>
        {/* Removed redundant "Meus Grupos" button as RLS now enforces ownership for all visible groups */}

        {availableTags.map(tag => {
          const count = groups.filter(g => g.tags.includes(tag)).length;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2
                ${selectedTag === tag
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500'
                }`}
            >
              # {tag}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${selectedTag === tag ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-all duration-300 group overflow-hidden flex flex-col items-center text-center relative"
          >
            {/* Admin Badge - Top Left */}
            {group.isAdmin && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-sm uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                  Admin
                </span>
              </div>
            )}

            {/* Tag Button Top Right */}
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
            <div className="relative mb-4 mt-2">
              <div className="w-28 h-28 rounded-full p-1 border-2 border-blue-100 dark:border-slate-800 group-hover:border-blue-500 transition-colors">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 w-full space-y-3">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white truncate px-2 leading-tight">
                {group.name}
              </h4>
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider">
                <Users size={12} className="text-blue-500" />
                <span>{group.membersCount.toLocaleString()} participantes</span>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-4 min-h-[24px]">
                {group.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (confirm(`Remover a tag "${tag}" deste grupo?`)) {
                        toggleTagInGroup(group, tag);
                      }
                    }}
                    className="group/tag relative bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-500 hover:pr-6 transition-all"
                    title="Clique para remover"
                  >
                    {tag}
                    <span className="absolute right-1.5 opacity-0 group-hover/tag:opacity-100 transition-opacity">
                      <X size={10} />
                    </span>
                  </button>
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
                  <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Nome do Grupo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><MessageSquare size={18} /></div>
                    <input autoFocus type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Empregos Sorocaba e Região" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Contato (WhatsApp ou Link) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><Phone size={18} /></div>
                    <input type="text" value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="Ex: (15) 99999-9999 ou link" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Tags Iniciais</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400"><Hash size={18} /></div>
                    <input type="text" value={formTagsInput} onChange={(e) => setFormTagsInput(e.target.value)} placeholder="Ex: Empregos, TI, Vendas" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Descrição</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-4 text-slate-400"><AlignLeft size={18} /></div>
                    <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} placeholder="Informações do grupo..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-white dark:bg-slate-900">
              <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
              <button onClick={handleCreateGroup} disabled={!formName.trim() || !formContact.trim()} className="flex-[1.5] bg-blue-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all">Criar Grupo</button>
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
                  <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">ID ou Link do Grupo</label>
                  <input autoFocus type="text" value={joinValue} onChange={(e) => setJoinValue(e.target.value)} placeholder="Ex: chat.whatsapp.com/..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsJoinModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                  <button onClick={handleJoinGroup} className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Confirmar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Categorize / Manage Tags */}
      {taggingGroup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setTaggingGroup(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[85vh]">
            {/* Dark Header */}
            <div className="p-6 bg-blue-950 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-blue-950 shadow-lg shadow-yellow-400/20">
                  <TagIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Tags</h3>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">{taggingGroup.name}</p>
                </div>
              </div>
              <button onClick={() => setTaggingGroup(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              {/* Create New Tag */}
              <div className="flex gap-2 mb-6 flex-shrink-0">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGlobalTag()}
                  placeholder="Nova tag..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500 placeholder:text-slate-400"
                />
                <button
                  onClick={addGlobalTag}
                  disabled={!newTagInput.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                </button>
              </div>

              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex-shrink-0">Selecione para Adicionar</p>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                {availableTags.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Nenhuma tag criada.
                  </div>
                ) : (
                  availableTags.map((tag, idx) => {
                    const isSelected = taggingGroup.tags.includes(tag);
                    const isEditing = editingTagIndex === idx;

                    return (
                      <div key={tag} className={`group flex items-center justify-between p-2 rounded-xl border transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                        {isEditing ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              autoFocus
                              type="text"
                              value={editingTagValue}
                              onChange={(e) => setEditingTagValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEditedTag(tag)}
                              className="flex-1 bg-white dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-sm outline-none ring-1 ring-blue-500"
                            />
                            <button onClick={() => saveEditedTag(tag)} className="text-blue-600 p-1"><Check size={16} /></button>
                            <button onClick={() => setEditingTagIndex(null)} className="text-slate-400 p-1"><X size={16} /></button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleTagInGroup(taggingGroup, tag)}
                              className="flex-1 text-left flex items-center gap-3"
                            >
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                              <span className={`text-sm font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{tag}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button onClick={() => startEditingTag(idx, tag)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"><Edit3 size={14} /></button>
                              <button onClick={() => deleteGlobalTag(tag)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setTaggingGroup(null)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">Concluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
