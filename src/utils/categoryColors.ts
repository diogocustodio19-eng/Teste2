import { Category } from '../types';

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  Trabalho: {
    bg: 'bg-emerald-500/10',
    text: 'text-[#3ECF8E]',
    border: 'border-[#3ECF8E]/30',
  },
  Pessoal: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  },
  Família: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  Cliente: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  Outro: {
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
  },
};

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    // (XX) XXXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    // (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function getCleanPhoneForWhatsapp(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits; // Add Brazil country code if missing
  }
  return digits;
}
