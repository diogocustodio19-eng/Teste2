import React, { useState } from 'react';
import { Contact } from '../types';
import { 
  X, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  FileText, 
  Star, 
  MessageCircle, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Calendar 
} from 'lucide-react';
import { CATEGORY_COLORS, getInitials, getCleanPhoneForWhatsapp } from '../utils/categoryColors';

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !contact) return null;

  const categoryStyle = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.Outro;
  const whatsappNumber = getCleanPhoneForWhatsapp(contact.phone);

  const handleCopyDetails = () => {
    const text = `Nome: ${contact.name}\nTelefone: ${contact.phone}${
      contact.email ? `\nE-mail: ${contact.email}` : ''
    }${contact.company ? `\nEmpresa: ${contact.company}` : ''}${
      contact.notes ? `\nObservações: ${contact.notes}` : ''
    }`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-[#1E293B] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800 my-8 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div 
          className="relative px-6 pt-8 pb-6 text-white flex flex-col items-center text-center"
          style={{ backgroundColor: contact.avatar_color || '#3b82f6' }}
        >
          {/* Close & Favorite Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => onToggleFavorite(contact)}
              className="p-2 bg-slate-900/40 hover:bg-slate-900/60 rounded-full backdrop-blur-md transition-colors"
              title={contact.is_favorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Star className={`w-5 h-5 ${contact.is_favorite ? 'fill-amber-300 text-amber-300' : 'text-white'}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-900/40 hover:bg-slate-900/60 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Large Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-slate-900/30 border-2 border-white/30 flex items-center justify-center text-3xl font-extrabold shadow-lg mb-3">
            {contact.avatar_url ? (
              <img
                src={contact.avatar_url}
                alt={contact.name}
                className="w-full h-full rounded-2xl object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              getInitials(contact.name)
            )}
          </div>

          <h2 className="text-xl font-bold tracking-tight">{contact.name}</h2>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
              {contact.category}
            </span>
            {contact.company && (
              <span className="text-xs text-white/90 font-sans">
                • {contact.role ? `${contact.role} na ` : ''}{contact.company}
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-900 border-b border-slate-800 text-center font-mono">
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[#3ECF8E] transition-colors group"
            >
              <MessageCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">WhatsApp</span>
            </a>
          ) : (
            <div className="opacity-30 flex flex-col items-center p-2.5 text-slate-500">
              <MessageCircle className="w-5 h-5 mb-1" />
              <span className="text-[10px]">WhatsApp</span>
            </div>
          )}

          <a
            href={`tel:${contact.phone}`}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 transition-colors group"
          >
            <Phone className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold">Ligar</span>
          </a>

          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-purple-400 transition-colors group"
            >
              <Mail className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">E-mail</span>
            </a>
          ) : (
            <div className="opacity-30 flex flex-col items-center p-2.5 text-slate-500">
              <Mail className="w-5 h-5 mb-1" />
              <span className="text-[10px]">E-mail</span>
            </div>
          )}

          <button
            onClick={handleCopyDetails}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors group"
          >
            {copied ? (
              <Check className="w-5 h-5 mb-1 text-[#3ECF8E]" />
            ) : (
              <Copy className="w-5 h-5 mb-1 text-slate-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[10px] font-semibold">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* Detailed Fields */}
        <div className="p-6 space-y-4 text-sm max-h-[50vh] overflow-y-auto">
          {/* Phone */}
          <div className="flex items-start space-x-3">
            <Phone className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-mono font-medium">Telefone / Celular</p>
              <p className="font-semibold text-slate-100 font-mono">{contact.phone}</p>
            </div>
          </div>

          {/* Email */}
          {contact.email && (
            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-mono font-medium">E-mail</p>
                <p className="font-semibold text-slate-100 font-mono break-all">{contact.email}</p>
              </div>
            </div>
          )}

          {/* Company & Role */}
          {contact.company && (
            <div className="flex items-start space-x-3">
              <Building2 className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-mono font-medium">Empresa & Cargo</p>
                <p className="font-semibold text-slate-100">
                  {contact.company} {contact.role ? `(${contact.role})` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Address */}
          {contact.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-mono font-medium">Endereço</p>
                <p className="font-semibold text-slate-100">{contact.address}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="flex items-start space-x-3">
              <FileText className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-mono font-medium">Observações</p>
                <p className="text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 mt-1 text-xs whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          {contact.created_at && (
            <div className="flex items-start space-x-3 pt-2 border-t border-slate-800">
              <Calendar className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-mono font-medium">Data de Cadastro</p>
                <p className="text-xs text-slate-400 font-mono">
                  {new Date(contact.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between font-mono">
          <button
            onClick={() => {
              onDelete(contact);
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>

          <button
            onClick={() => {
              onEdit(contact);
              onClose();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-[#3ECF8E] hover:bg-[#34b27b] rounded-xl shadow-xs transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Contato</span>
          </button>
        </div>
      </div>
    </div>
  );
};
