
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
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
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Smile,
  Eraser,
  Save,
  Trash
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
  status_create_group?: number;
  privacy: boolean;
}

interface GruposProps {
  externalTrigger?: number;
  isWhatsAppConnected: boolean;
  onOpenConnect: () => void;
}

export const Grupos: React.FC<GruposProps> = ({ externalTrigger, isWhatsAppConnected, onOpenConnect }) => {
  const { user } = useAuth();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [taggingGroup, setTaggingGroup] = useState<Group | null>(null);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false); // Mobile Search State
  const [editingTagValue, setEditingTagValue] = useState('');


  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [imageDraft, setImageDraft] = useState('');
  const [selectedFileDetails, setSelectedFileDetails] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRefDetails = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [joinValue, setJoinValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showMyGroups, setShowMyGroups] = useState(false);

  // Form for creation



  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };


  // Global tags management
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const [groups, setGroups] = useState<Group[]>([]);

  const handleClearDescription = () => {
    setDescriptionDraft('');
  };

  const addEmoji = (emoji: string) => {
    setDescriptionDraft(prev => prev + emoji);
  };

  // ...

  const commonEmojis = ['😀', '😂', '😍', '🔥', '👍', '🙏', '🤝', '💼', '🚀', '📢', '✅', '❌', '⚠️', '🎉', '👋', '🌟', '💡', '💰', '📅', '📍'];

  // ...

  const handleGroupClick = (group: Group) => {
    if (!group.isAdmin) return;

    if (!isWhatsAppConnected) {
      showAlert('Atenção', 'Conecte o WhatsApp para editar grupos.', 'warning');
      return;
    }
    setSelectedGroup(group);
    setDescriptionDraft(group.description || '');
    setNameDraft(group.name);
    setImageDraft(group.image);
    setSelectedFileDetails(null);
    setShowEmojiPicker(false);
  };

  const handleImageUploadDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileDetails(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDraft(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  const handleSaveDetails = async () => {
    if (!selectedGroup) return;
    if (!selectedGroup.isAdmin) {
      showAlert('Permissão Negada', 'Você não tem permissão para editar este grupo.', 'error');
      return;
    }

    try {
      let imageUrl = selectedGroup.image;

      if (selectedFileDetails && user) {
        const fileExt = selectedFileDetails.name.split('.').pop();
        const fileName = `${Date.now()}-updated.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('group-logos')
          .upload(filePath, selectedFileDetails);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('group-logos')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('whatsapp_groups')
        .update({
          description: descriptionDraft,
          name_group: nameDraft,
          image: imageUrl
        })
        .eq('id', selectedGroup.id);

      if (error) throw error;

      // Update local state
      const updatedGroup = { ...selectedGroup, description: descriptionDraft, name: nameDraft, image: imageUrl };
      setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g));
      setSelectedGroup(updatedGroup);
      showAlert('Sucesso', 'Grupo atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Error updating group:', error);
      showAlert('Erro', 'Erro ao atualizar grupo.', 'error');
    }
  };


  // ... in return JSX ...





  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (searchQuery) {
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]);

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

      // Fetch Groups with Tags (Optimized)
      if (user) {
        const { data: groupsData, error } = await supabase
          .from('whatsapp_groups')
          .select(`
            id, name_group, image, total, admin, link_invite, description, created_at, status_create_group, privacy,
            whatsapp_groups_tags (
              tags_group (
                name
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (groupsData) {
          // ... mapping logic remains the same (assumes variable name is 'groupsData')
          const mappedGroups: Group[] = groupsData.map((g: any) => ({
            id: g.id,
            name: g.name_group,
            image: g.image || `https://picsum.photos/seed/${g.id}/200/200`,
            membersCount: g.total || 0,
            isAdmin: g.admin || false,
            link: g.link_invite || '',
            contact: '',
            description: g.description || '',
            tags: g.whatsapp_groups_tags.map((t: any) => t.tags_group.name),
            status_create_group: g.status_create_group,
            privacy: g.privacy !== undefined ? g.privacy : false
          }));
          setGroups(mappedGroups);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsSyncing(false);
    }
  };



  useEffect(() => {
    // Check for persistent update state on mount
    const updateStart = localStorage.getItem('group_update_start');
    if (updateStart) {
      const timeElapsed = Date.now() - parseInt(updateStart);
      const TIMEOUT_MS = 180000; // 3 minutes timeout

      if (timeElapsed < TIMEOUT_MS) {
        setIsUpdating(true);
        // Re-attach listeners or polling if valid (optional, but good for UX)
        // For simplicity, we just block the UI until they refresh or timeout logic kicks in
        // Realistically, the "fetchData" polling logic below handles the "check if done" part

        // We set a timeout to clear this state locally if it expires while they are on the page
        const remainingTime = TIMEOUT_MS - timeElapsed;
        setTimeout(() => {
          setIsUpdating(false);
          localStorage.removeItem('group_update_start');
          fetchData();
        }, remainingTime);
      } else {
        localStorage.removeItem('group_update_start');
      }
    }
  }, []);

  const handleUpdateGroups = async () => {
    if (isUpdating) return;
    if (!isWhatsAppConnected) {
      showAlert('Atenção', 'Conecte o WhatsApp para atualizar os grupos.', 'warning');
      return;
    }
    if (!user) return;

    setIsUpdating(true);
    localStorage.setItem('group_update_start', Date.now().toString());

    try {
      // 1. Call Webhook
      await fetch('https://webhook.leppsconecta.com.br/webhook/1772f550-b77c-4b09-b1ff-a5a460723ce3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          type: 'update_groups'
        })
      });

      // 2. Setup Realtime Listener or Polling Strategy
      // We wait for up to 3 minutes
      const TIMEOUT_MS = 180000;

      if (groups.length === 0) {
        const channel = supabase
          .channel('groups-update')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'whatsapp_groups',
              filter: `user_id=eq.${user.id}`
            },
            async (payload) => {
              console.log('Realtime update received!', payload);
              await fetchData();
              setIsUpdating(false);
              localStorage.removeItem('group_update_start');
              supabase.removeChannel(channel);
            }
          )
          .subscribe();

        // Safety Timeout (3 minutes)
        setTimeout(async () => {
          if (localStorage.getItem('group_update_start')) {
            setIsUpdating(false);
            localStorage.removeItem('group_update_start');
            supabase.removeChannel(channel);

            await fetchData();

            const { count } = await supabase.from('whatsapp_groups').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
            if (!count || count === 0) {
              showAlert('Aviso', 'Nenhum grupo encontrado após 3 minutos. Verifique seu WhatsApp.', 'info');
            }
          }
        }, TIMEOUT_MS);

      } else {
        const updateStartTime = parseInt(localStorage.getItem('group_update_start') || Date.now().toString());

        const pollInterval = setInterval(async () => {
          // Check for any record created AFTER the update started
          const { data: latestGroups, error } = await supabase
            .from('whatsapp_groups')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (latestGroups && latestGroups.length > 0) {
            const latestDate = new Date(latestGroups[0].created_at).getTime();
            // If latest group is newer than our start time (with a small buffer for clock skew, e.g., -5s)
            if (latestDate > (updateStartTime - 5000)) {
              clearInterval(pollInterval);
              await fetchData();
              setIsUpdating(false);
              localStorage.removeItem('group_update_start');
              showAlert('Sucesso', 'Novos grupos detectados!', 'success');
            }
          }
        }, 3000); // Check every 3s

        // Hard Stop after 3 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isUpdating) {
            setIsUpdating(false);
            localStorage.removeItem('group_update_start');
            fetchData(); // One last fetch
            // Optional: warn if nothing found?
          }
        }, TIMEOUT_MS);
      }

    } catch (error) {
      console.error('Error updating groups:', error);
      showAlert('Erro', 'Erro ao solicitar atualização.', 'error');
      setIsUpdating(false);
      localStorage.removeItem('group_update_start');
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









  const handleJoinGroup = () => {
    if (!joinValue.trim()) return;
    showAlert('Info', `Solicitação enviada para o grupo: ${joinValue}`, 'info');
    setJoinValue('');
    setIsJoinModalOpen(false);
  };

  const copyLink = (group: Group) => {
    navigator.clipboard.writeText(group.link);
    setCopiedId(group.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Tag Group Actions
  // Tag Group Actions
  const toggleTagInGroup = async (group: Group, tag: string) => {
    if (!isWhatsAppConnected) {
      showAlert('Atenção', 'Conecte o WhatsApp para gerenciar tags.', 'warning');
      return;
    }
    if (!user) return;
    const hasTag = group.tags.includes(tag);

    // Optimistic update - executed immediately
    const updatedTags = hasTag
      ? group.tags.filter(t => t !== tag)
      : [...group.tags, tag];

    const updatedGroup = { ...group, tags: updatedTags };

    setGroups(prevGroups => prevGroups.map(g => g.id === group.id ? updatedGroup : g));

    if (taggingGroup && taggingGroup.id === group.id) {
      setTaggingGroup(updatedGroup);
    }

    try {
      // Get Tag ID
      const { data: tagRef } = await supabase
        .from('tags_group')
        .select('id')
        .eq('name', tag)
        .single();

      if (!tagRef) {
        throw new Error('Tag not found');
      }

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

    } catch (error) {
      console.error('Error toggling tag:', error);
      // Revert on error
      const revertedTags = hasTag
        ? [...group.tags, tag]  // Re-add if it was removed
        : group.tags.filter(t => t !== tag); // Remove if it was added

      const revertedGroup = { ...group, tags: revertedTags };

      setGroups(prevGroups => prevGroups.map(g => g.id === group.id ? revertedGroup : g));
      if (taggingGroup && taggingGroup.id === group.id) {
        setTaggingGroup(revertedGroup);
      }
      showAlert('Erro', 'Falha ao atualizar tag. Tente novamente.', 'error');
    }
  };

  // Global Tag Manager Actions
  const addGlobalTag = async () => {
    if (!isWhatsAppConnected) {
      alert('Conecte o WhatsApp para gerenciar tags.');
      return;
    }
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
    if (!isWhatsAppConnected) {
      alert('Conecte o WhatsApp para gerenciar tags.');
      return;
    }
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
    if (!isWhatsAppConnected) {
      alert('Conecte o WhatsApp para gerenciar tags.');
      return;
    }
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
    <div className="space-y-4 md:space-y-8 animate-fadeIn">
      {/* Search and Action Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Search Input - Expanding (Desktop Only) */}
        <div ref={searchContainerRef} className="hidden md:flex relative flex-1 w-full group">
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




          {/* Join Button Removed */}


          <button
            onClick={handleUpdateGroups}
            disabled={isUpdating}
            className="hidden md:flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''} />
            <span>{isUpdating ? 'Atualizando...' : 'Atualizar'}</span>
          </button>


        </div>
      </div>

      {/* Filtering Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-4 no-scrollbar">
        <button
          onClick={() => { setSelectedTag(null); setShowMyGroups(false); }}
          className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2
            ${selectedTag === null && !showMyGroups
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600'
            }`}
        >
          Todos
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${selectedTag === null && !showMyGroups ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
            {groups.length}
          </span>
        </button>


        {availableTags.map(tag => {
          const count = groups.filter(g => g.tags.includes(tag)).length;
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(isSelected ? null : tag)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2 group
                ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600'
                }`}
            >
              # {tag}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Actions: Search + Create Button */}
      <div className="md:hidden flex items-center justify-between gap-3 w-full px-2">
        {/* Expandable Search */}
        <div className={`relative transition-all duration-300 ease-out flex-1`}>
          <button
            onClick={() => setIsSearchExpanded(true)}
            className={`absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-blue-600 transition-all ${isSearchExpanded ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100 shadow-sm'}`}
          >
            <Search size={20} />
          </button>

          <div className={`relative w-full transition-all duration-300 ${isSearchExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all"
              onBlur={() => !searchQuery && setIsSearchExpanded(false)}
              autoFocus={isSearchExpanded}
            />
            {(searchQuery || isSearchExpanded) && (
              <button
                onClick={() => { setSearchQuery(''); setIsSearchExpanded(false); }}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>



        {/* Mobile Update Button */}
        <button
          onClick={handleUpdateGroups}
          disabled={isUpdating}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm active:scale-95 whitespace-nowrap overflow-hidden ${isSearchExpanded ? 'w-0 px-0 opacity-0' : 'flex-initial opacity-100'}`}
        >
          <RefreshCw size={16} className={`flex-shrink-0 ${isUpdating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Groups Grid */}
      {/* Groups Grid or Empty State */}
      {filteredGroups.length === 0 || isUpdating ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
          {(searchQuery || selectedTag || showMyGroups) ? (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search size={40} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhum resultado encontrado</h3>
                <p className="text-sm text-slate-500">Tente buscar por outro termo ou remova os filtros.</p>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setSelectedTag(null); setShowMyGroups(false); }}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-300 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-6 max-w-md px-4">
              {!isWhatsAppConnected ? (
                <>
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-600 animate-pulse">
                    <Smartphone size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Conecte seu WhatsApp</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Conecte seu whatsapp para carregar os grupos disponíveis.</p>
                  </div>
                  <button
                    onClick={onOpenConnect}
                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                  >
                    Conectar WhatsApp Agora
                  </button>
                </>
              ) : (
                <>
                  {isSyncing || isUpdating ? (
                    <>
                      <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-600 animate-spin">
                        <RefreshCw size={48} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">
                          {isUpdating ? 'Atualizando Grupos' : 'Sincronizando...'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          {isUpdating
                            ? 'Carregando novos grupos, aguarde o registro no banco de dados.'
                            : 'Buscando grupos no servidor...'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Users size={48} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">Nenhum Grupo Encontrado</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          Não encontramos grupos no banco de dados.
                          <br />
                          Clique em <strong>ATUALIZAR</strong> para buscar.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleGroupClick(group)}
              className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-all duration-300 group overflow-hidden flex flex-col items-center text-center relative hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 ${group.isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {/* Admin Badge - Top Left */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
                {/* Creation Badge Removed - Replaced by Overlay */}
                {group.isAdmin && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black px-3 py-1.5 rounded-xl shadow-sm uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                    Admin
                  </span>
                )}
              </div>

              {/* Tag Button Top Right */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); setTaggingGroup(group); }}
                  className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
                  title="Adicionar Tag"
                >
                  <TagIcon size={16} />
                </button>
              </div>

              {/* Group Thumbnail (Circular) */}
              <div className="relative mb-4 mt-2">
                <div className="w-28 h-28 rounded-full p-1 border-2 border-blue-100 dark:border-slate-800 group-hover:border-blue-500 transition-colors flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                  {group.image === 'sem_image' ? (
                    <span className="text-[10px] font-bold text-slate-400 uppercase text-center leading-tight px-2">
                      Sem exibição
                    </span>
                  ) : (
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTagInGroup(group, tag);
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

              {/* Privacy Message - Subtle above Ver Conversas */}
              {group.privacy && !group.isAdmin && (
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-red-500/80 dark:text-red-400/80 whitespace-nowrap">
                    Somente admin pode interagir
                  </span>
                </div>
              )}

              {/* Buttons */}
              <button
                onClick={(e) => { e.stopPropagation(); copyLink(group); }}
                disabled={group.link === 'link_indisponível'}
                className={`w-full mt-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed
                  ${group.link === 'link_indisponível'
                    ? 'bg-red-500 text-white shadow-red-500/20'
                    : copiedId === group.id
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'}`}
              >
                {group.link === 'link_indisponível' ? (
                  <>Link Indisponível <X size={14} /></>
                ) : (
                  <>Link do Grupo {copiedId === group.id ? <Check size={14} /> : <Copy size={14} />}</>
                )}
              </button>


            </div>
          ))}
        </div>
      )}

      {/* Modal: Group Details & Description */}
      {
        selectedGroup && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedGroup(null)} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">
              <div className="p-8 text-white flex flex-col items-center justify-center relative flex-shrink-0 overflow-hidden">
                {/* Blurred Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={imageDraft || selectedGroup.image}
                    className="w-full h-full object-cover blur-xl scale-110 opacity-60"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-blue-950/80" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center w-full">
                  <button onClick={() => setSelectedGroup(null)} className="absolute -top-4 -right-4 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>

                  <div className="w-24 h-24 rounded-full border-4 border-white/20 p-1 overflow-hidden relative group cursor-pointer mb-4 shadow-lg">
                    {selectedGroup.isAdmin && (
                      <>
                        <input
                          type="file"
                          ref={fileInputRefDetails}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUploadDetails}
                        />
                        <div
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={() => fileInputRefDetails.current?.click()}
                        >
                          <Upload size={24} className="text-white" />
                        </div>
                      </>
                    )}
                    <img src={imageDraft || selectedGroup.image} className="w-full h-full object-cover rounded-full" alt="" />
                  </div>

                  <h3 className="text-2xl font-bold text-center drop-shadow-md">{selectedGroup.name}</h3>
                </div>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                {/* Name Field */}
                <div className="mb-6">
                  <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-500 font-bold mb-2 block">Nome do Grupo</label>
                  {selectedGroup.isAdmin ? (
                    <input
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 ring-blue-500 border border-slate-100 dark:border-slate-800 transition-all"
                      placeholder="Nome do grupo..."
                    />
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 opacity-75">
                      {selectedGroup.name}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-500 font-bold mb-2 block">Descrição</label>

                  {selectedGroup.isAdmin ? (
                    <div className="relative">
                      <textarea
                        value={descriptionDraft}
                        onChange={(e) => setDescriptionDraft(e.target.value)}
                        rows={6}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 ring-blue-500 resize-none border border-slate-100 dark:border-slate-800"
                        placeholder="Adicione uma descrição..."
                      />

                      {/* Toolbar */}
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                            title="Emojis"
                          >
                            <Smile size={18} />
                          </button>

                          {/* Emoji Picker Popover */}
                          {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 w-64 grid grid-cols-5 gap-2 z-50">
                              {commonEmojis.map(emoji => (
                                <button key={emoji} onClick={() => addEmoji(emoji)} className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-lg transition-colors">
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleClearDescription}
                          className="p-2 hover:bg-rose-100 hover:text-rose-500 rounded-lg text-slate-400 transition-colors"
                          title="Limpar"
                        >
                          <Eraser size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-sm text-slate-600 dark:text-slate-400 min-h-[100px] whitespace-pre-wrap">
                      {selectedGroup.description || "Sem descrição disponível."}
                    </div>
                  )}
                </div>
              </div>

              {selectedGroup.isAdmin && (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                  <button onClick={() => setSelectedGroup(null)} className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-white transition-all">Cancelar</button>
                  <button onClick={handleSaveDetails} className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Save size={16} />
                    Salvar Alterações
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }



      {/* Modal: Update Info */}


      {/* Modal: Join Group */}
      {
        isJoinModalOpen && (
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
        )
      }

      {/* Modal: Categorize / Manage Tags */}
      {
        taggingGroup && (
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
        )
      }

      {/* Standardized Alert Modal */}
      {
        alertConfig.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeAlert} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-scaleUp">
              <div className={`p-8 flex flex-col items-center text-center relative overflow-hidden`}>
                {/* Background Status Color Accent */}
                <div className={`absolute top-0 left-0 right-0 h-32 opacity-10 
                ${alertConfig.type === 'success' ? 'bg-emerald-500' : ''}
                ${alertConfig.type === 'error' ? 'bg-rose-500' : ''}
                ${alertConfig.type === 'warning' ? 'bg-amber-500' : ''}
                ${alertConfig.type === 'info' ? 'bg-blue-500' : ''}
              `} />

                <div className={`
                w-20 h-20 rounded-full flex items-center justify-center mb-6 relative z-10
                ${alertConfig.type === 'success' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' : ''}
                ${alertConfig.type === 'error' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : ''}
                ${alertConfig.type === 'warning' ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' : ''}
                ${alertConfig.type === 'info' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' : ''}
              `}>
                  {alertConfig.type === 'success' && <CheckCircle2 size={40} strokeWidth={2.5} />}
                  {alertConfig.type === 'error' && <AlertCircle size={40} strokeWidth={2.5} />}
                  {alertConfig.type === 'warning' && <AlertCircle size={40} strokeWidth={2.5} />}
                  {alertConfig.type === 'info' && <div className="text-3xl font-bold">i</div>}
                </div>

                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{alertConfig.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 relative z-10 px-4">
                  {alertConfig.message}
                </p>

                <button
                  onClick={closeAlert}
                  className={`
                  w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 relative z-10
                  ${alertConfig.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600' : ''}
                  ${alertConfig.type === 'error' ? 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600' : ''}
                  ${alertConfig.type === 'warning' ? 'bg-amber-500 shadow-amber-500/20 hover:bg-amber-600' : ''}
                  ${alertConfig.type === 'info' ? 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-700' : ''}
                `}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};
