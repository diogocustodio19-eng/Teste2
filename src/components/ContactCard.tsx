import React from 'react';
import { Contact } from '../types';
import { 
  Star, 
  Phone, 
  Mail, 
  Building2, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  MapPin 
} from 'lucide-react';
import { CATEGORY_COLORS, getInitials, getCleanPhoneForWhatsapp } from '../utils/categoryColors';

interface ContactCardProps {
  contact: Contact;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  isSelectionActive?: boolean;
  onSelectToggle?: (id: string) => void;
  onCardClick: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact, e: React.MouseEvent) => void;
  onEdit: (contact: Contact, e: React.MouseEvent) => void;
  onDelete: (contact: Contact, e: React.MouseEvent) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  viewMode,
  isSelected,
  isSelectionActive,
  onSelectToggle,
  onCardClick,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const categoryStyle = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Outro;
  const whatsappNumber = getCleanPhoneForWhatsapp(contact.phone);

  if (viewMode === 'list') {
    return (
      <div
        id={`contact-item-${contact.id}`}
        onClick={() => onCardClick(contact)}
        className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border bg-[#1E293B] hover:border-[#3ECF8E]/40 hover:bg-slate-800/80 transition-all cursor-pointer relative ${
          isSelected ? 'border-[#3ECF8E] bg-[#3ECF8E]/10' : 'border-slate-800'
        }`}
      >
        {/* Left side: Checkbox + Avatar + Info */}
        <div className="flex items-center space-x-3.5 min-w-0 pr-2">
          {/* Checkbox */}
          {isSelectionActive && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectToggle?.(contact.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-[#3ECF8E] rounded border-slate-700 bg-slate-900 focus:ring-[#3ECF8E] cursor-pointer"
            />
          )}

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs border border-white/10"
            style={{ backgroundColor: contact.avatar_color || '#3b82f6' }}
          >
            {contact.avatar_url ? (
              <img
                src={contact.avatar_url}
                alt={contact.name}
                className="w-full h-full rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              getInitials(contact.name)
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-100 text-sm truncate group-hover:text-[#3ECF8E] transition-colors">
                {contact.name}
              </h3>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                {contact.category}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5 truncate font-mono">
              <span className="flex items-center gap-1 truncate">
                <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                {contact.phone}
              </span>
              {contact.email && (
                <span className="hidden sm:flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                  {contact.email}
                </span>
              )}
              {contact.company && (
                <span className="hidden md:flex items-center gap-1 truncate text-slate-500">
                  <Building2 className="w-3 h-3 text-slate-600 shrink-0" />
                  {contact.company}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Quick Actions & Menu */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          
          {/* WhatsApp Direct */}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-[#3ECF8E] hover:bg-[#3ECF8E]/10 rounded-lg transition-colors"
              title="Conversar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          {/* Favorite Toggle */}
          <button
            onClick={(e) => onToggleFavorite(contact, e)}
            className={`p-2 rounded-lg transition-colors ${
              contact.is_favorite
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-600 hover:text-amber-400 hover:bg-slate-800'
            }`}
            title={contact.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 top-full mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 py-1 font-mono text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    setShowMenu(false);
                    onEdit(contact, e);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    setShowMenu(false);
                    onDelete(contact, e);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      id={`contact-card-${contact.id}`}
      onClick={() => onCardClick(contact)}
      className={`group relative flex flex-col p-5 rounded-2xl border bg-[#1E293B] hover:border-[#3ECF8E]/40 hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'border-[#3ECF8E] bg-[#3ECF8E]/10' : 'border-slate-800'
      }`}
    >
      {/* Top Bar: Selection Checkbox + Category + Star */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isSelectionActive && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectToggle?.(contact.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-[#3ECF8E] rounded border-slate-700 bg-slate-900 focus:ring-[#3ECF8E] cursor-pointer"
            />
          )}
          <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
            {contact.category}
          </span>
        </div>

        <button
          onClick={(e) => onToggleFavorite(contact, e)}
          className={`p-1.5 rounded-lg transition-colors ${
            contact.is_favorite
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-slate-600 hover:text-amber-400 hover:bg-slate-800'
          }`}
          title={contact.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Avatar & Name */}
      <div className="flex items-center space-x-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm border border-white/10"
          style={{ backgroundColor: contact.avatar_color || '#3b82f6' }}
        >
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.name}
              className="w-full h-full rounded-xl object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            getInitials(contact.name)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-100 text-base leading-snug truncate group-hover:text-[#3ECF8E] transition-colors">
            {contact.name}
          </h3>
          {contact.company ? (
            <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
              {contact.role ? `${contact.role} na ` : ''}{contact.company}
            </p>
          ) : (
            <p className="text-xs text-slate-500 truncate mt-0.5">Sem empresa cadastrada</p>
          )}
        </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-2 py-3 border-t border-slate-800/80 text-xs text-slate-300 font-mono flex-1">
        <div className="flex items-center gap-2 truncate">
          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-medium text-slate-200">{contact.phone}</span>
        </div>

        {contact.email && (
          <div className="flex items-center gap-2 truncate text-slate-400">
            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}

        {contact.address && (
          <div className="flex items-center gap-2 truncate text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="truncate">{contact.address}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] hover:bg-[#3ECF8E]/20 text-xs font-mono font-medium transition-colors"
              title="Abrir WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Enviar E-mail"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => onEdit(contact, e)}
            className="p-1.5 text-slate-400 hover:text-[#3ECF8E] hover:bg-slate-800 rounded-lg transition-colors"
            title="Editar contato"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => onDelete(contact, e)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Excluir contato"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
