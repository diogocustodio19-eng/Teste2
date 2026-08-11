import React, { useState, useMemo } from 'react';
import { Contact, Category, FilterState, SortBy } from '../types';
import { ContactCard } from './ContactCard';
import { 
  Search, 
  Filter, 
  Star, 
  LayoutGrid, 
  List as ListIcon, 
  UserX, 
  Trash2, 
  CheckSquare, 
  Square, 
  ArrowUpDown,
  XCircle
} from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  onCardClick: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact, e: React.MouseEvent) => void;
  onEdit: (contact: Contact, e: React.MouseEvent) => void;
  onDelete: (contact: Contact, e: React.MouseEvent) => void;
  onBulkDelete: (ids: string[]) => void;
  onAddNewContact: () => void;
}

const CATEGORIES: (Category | 'Todos')[] = ['Todos', 'Trabalho', 'Pessoal', 'Família', 'Cliente', 'Outro'];

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onCardClick,
  onToggleFavorite,
  onEdit,
  onDelete,
  onBulkDelete,
  onAddNewContact,
}) => {
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    category: 'Todos',
    onlyFavorites: false,
    sortBy: 'name_asc',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filter & Sort Logic
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        // Search term
        const term = filter.search.toLowerCase().trim();
        if (term) {
          const matchName = c.name.toLowerCase().includes(term);
          const matchPhone = c.phone.includes(term);
          const matchEmail = c.email?.toLowerCase().includes(term);
          const matchCompany = c.company?.toLowerCase().includes(term);
          const matchNotes = c.notes?.toLowerCase().includes(term);
          if (!matchName && !matchPhone && !matchEmail && !matchCompany && !matchNotes) {
            return false;
          }
        }

        // Category filter
        if (filter.category !== 'Todos' && c.category !== filter.category) {
          return false;
        }

        // Only favorites
        if (filter.onlyFavorites && !c.is_favorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'name_asc') {
          return a.name.localeCompare(b.name, 'pt-BR');
        }
        if (filter.sortBy === 'name_desc') {
          return b.name.localeCompare(a.name, 'pt-BR');
        }
        if (filter.sortBy === 'created_recent') {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        }
        if (filter.sortBy === 'favorites_first') {
          if (a.is_favorite === b.is_favorite) {
            return a.name.localeCompare(b.name, 'pt-BR');
          }
          return a.is_favorite ? -1 : 1;
        }
        if (filter.sortBy === 'company') {
          const compA = a.company || 'zzz';
          const compB = b.company || 'zzz';
          return compA.localeCompare(compB, 'pt-BR');
        }
        return 0;
      });
  }, [contacts, filter]);

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map((c) => c.id));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} contatos selecionados?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  const clearFilters = () => {
    setFilter({
      search: '',
      category: 'Todos',
      onlyFavorites: false,
      sortBy: 'name_asc',
    });
  };

  const hasActiveFilters = filter.search || filter.category !== 'Todos' || filter.onlyFavorites;

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="bg-[#1E293B] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        
        {/* Top Row: Search + View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Buscar por nome, telefone, e-mail, empresa..."
              className="w-full pl-10 pr-9 py-2 text-sm bg-slate-900 text-slate-100 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none transition-all placeholder:text-slate-500"
            />
            {filter.search && (
              <button
                onClick={() => setFilter((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Sort + View Mode + Selection Mode */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={filter.sortBy}
                onChange={(e) => setFilter((prev) => ({ ...prev, sortBy: e.target.value as SortBy }))}
                className="pl-8 pr-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-800 outline-none cursor-pointer"
              >
                <option value="name_asc">Nome (A - Z)</option>
                <option value="name_desc">Nome (Z - A)</option>
                <option value="favorites_first">Favoritos Primeiro</option>
                <option value="created_recent">Mais Recentes</option>
                <option value="company">Por Empresa</option>
              </select>
            </div>

            {/* Grid / List Toggle */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#1E293B] text-[#3ECF8E] shadow-2xs' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-[#1E293B] text-[#3ECF8E] shadow-2xs' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização em Lista"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Multi-Select Mode Toggle */}
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className={`p-2 rounded-xl text-xs font-mono border transition-colors flex items-center gap-1 ${
                isSelectionMode
                  ? 'bg-[#3ECF8E]/20 border-[#3ECF8E] text-[#3ECF8E]'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Seleção em lote"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden md:inline">Selecionar</span>
            </button>

          </div>

        </div>

        {/* Bottom Row: Category Pills + Only Favorites */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#3ECF8E]" /> Categoria:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter((prev) => ({ ...prev, category: cat }))}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                  filter.category === cat
                    ? 'bg-[#3ECF8E] text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Only Favorites Button & Clear Filters */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setFilter((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                filter.onlyFavorites
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filter.onlyFavorites ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              <span>Favoritos</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-mono text-slate-400 hover:text-[#3ECF8E] underline px-1"
              >
                Limpar filtros
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Selection Mode Toolbar */}
      {isSelectionMode && (
        <div className="bg-slate-800 text-slate-100 p-3.5 rounded-2xl flex items-center justify-between border border-slate-700 shadow-md animate-fade-in">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-xl transition-colors"
            >
              {selectedIds.length === filteredContacts.length && filteredContacts.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#3ECF8E]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedIds.length === filteredContacts.length && filteredContacts.length > 0
                  ? 'Desmarcar Todos'
                  : 'Selecionar Todos'}
              </span>
            </button>

            <span className="text-xs font-mono text-slate-300">
              {selectedIds.length} {selectedIds.length === 1 ? 'item selecionado' : 'itens selecionados'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkDeleteClick}
              disabled={selectedIds.length === 0}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Selecionados</span>
            </button>
            
            <button
              onClick={() => setIsSelectionMode(false)}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Contact Cards Container */}
      {filteredContacts.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
              : 'space-y-2.5'
          }
        >
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              viewMode={viewMode}
              isSelected={selectedIds.includes(contact.id)}
              isSelectionActive={isSelectionMode}
              onSelectToggle={handleSelectToggle}
              onCardClick={onCardClick}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#1E293B] rounded-3xl p-12 text-center border border-slate-800 shadow-md max-w-md mx-auto my-8">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-700">
            <UserX className="w-8 h-8 text-[#3ECF8E]" />
          </div>
          
          <h3 className="text-base font-bold text-white mb-1">
            Nenhum contato encontrado
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            {hasActiveFilters
              ? 'Nenhum resultado corresponde aos filtros aplicados. Tente ajustar sua busca.'
              : 'Sua lista de contatos está vazia no momento. Adicione seu primeiro contato!'}
          </p>

          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono rounded-xl transition-colors"
            >
              Limpar Filtros de Busca
            </button>
          ) : (
            <button
              onClick={onAddNewContact}
              className="px-5 py-2.5 bg-[#3ECF8E] hover:bg-[#34b27b] text-slate-950 text-xs font-mono font-bold rounded-xl shadow-sm transition-colors"
            >
              Cadastrar Primeiro Contato
            </button>
          )}
        </div>
      )}

    </div>
  );
};
