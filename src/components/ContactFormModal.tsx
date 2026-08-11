import React, { useState, useEffect } from 'react';
import { Contact, Category } from '../types';
import { X, User, Phone, Mail, Building, MapPin, FileText, Star, AlertTriangle, Check } from 'lucide-react';
import { formatPhoneNumber } from '../utils/categoryColors';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'created_at'>, editingId?: string) => Promise<void>;
  editingContact?: Contact | null;
  existingContacts: Contact[];
}

const CATEGORIES: Category[] = ['Pessoal', 'Trabalho', 'Família', 'Cliente', 'Outro'];

const AVATAR_COLORS = [
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#10b981' },
  { name: 'Âmbar', hex: '#f59e0b' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Roxo', hex: '#8b5cf6' },
  { name: 'Ciano', hex: '#06b6d4' },
  { name: 'Laranja', hex: '#f97316' },
  { name: 'Índigo', hex: '#6366f1' },
];

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingContact,
  existingContacts,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<Category>('Trabalho');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState('#3b82f6');
  const [isFavorite, setIsFavorite] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setPhone(editingContact.phone || '');
      setEmail(editingContact.email || '');
      setCategory(editingContact.category || 'Trabalho');
      setCompany(editingContact.company || '');
      setRole(editingContact.role || '');
      setAddress(editingContact.address || '');
      setNotes(editingContact.notes || '');
      setAvatarColor(editingContact.avatar_color || '#3b82f6');
      setIsFavorite(editingContact.is_favorite || false);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setCategory('Trabalho');
      setCompany('');
      setRole('');
      setAddress('');
      setNotes('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].hex);
      setIsFavorite(false);
    }
    setErrorMessage('');
    setDuplicateWarning('');
  }, [editingContact, isOpen]);

  // Check for duplicates
  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneNumber(val);
    setPhone(formatted);
    checkDuplicates(formatted, email);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    checkDuplicates(phone, val);
  };

  const checkDuplicates = (p: string, e: string) => {
    if (editingContact) return; // Ignore when editing
    const cleanP = p.replace(/\D/g, '');
    const cleanE = e.trim().toLowerCase();

    if (!cleanP && !cleanE) {
      setDuplicateWarning('');
      return;
    }

    const match = existingContacts.find((c) => {
      const matchP = cleanP && c.phone.replace(/\D/g, '') === cleanP;
      const matchE = cleanE && c.email?.trim().toLowerCase() === cleanE;
      return matchP || matchE;
    });

    if (match) {
      setDuplicateWarning(`Atenção: Já existe um contato cadastrado (${match.name}) com este telefone ou e-mail.`);
    } else {
      setDuplicateWarning('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, informe o nome completo do contato.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Por favor, informe o número de telefone.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await onSave(
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          category,
          company: company.trim() || undefined,
          role: role.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
          avatar_color: avatarColor,
          is_favorite: isFavorite,
        },
        editingContact?.id
      );
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar o contato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-[#1E293B] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-800 my-8 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#3ECF8E]/10 text-[#3ECF8E] rounded-xl border border-[#3ECF8E]/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                {editingContact ? 'Atualize as informações do seu contato' : 'Preencha os campos para salvar no banco de dados'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-start gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Avatar Color Picker & Favorite */}
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-400 mb-1.5">
                Cor do Avatar
              </label>
              <div className="flex items-center space-x-1.5">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAvatarColor(c.hex)}
                    className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                      avatarColor === c.hex ? 'scale-125 ring-2 ring-offset-1 ring-offset-slate-900 ring-[#3ECF8E]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {avatarColor === c.hex && <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFavorite ? 'Favorito' : 'Marcar Favorito'}</span>
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
              Nome Completo <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Fernandes"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Phone & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                Telefone / WhatsApp <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none font-mono cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none placeholder:text-slate-500 font-mono"
              />
            </div>
          </div>

          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                Empresa
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nome da empresa"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                Cargo / Função
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Gerente Comercial"
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
              Endereço
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número, Cidade - Estado"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
              Observações
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações relevantes sobre o contato..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-mono font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-[#3ECF8E] hover:bg-[#34b27b] rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Salvando...' : editingContact ? 'Salvar Alterações' : 'Cadastrar Contato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
