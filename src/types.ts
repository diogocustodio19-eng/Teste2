export type Category = 'Pessoal' | 'Trabalho' | 'Família' | 'Cliente' | 'Outro';

export interface Contact {
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  phone: string;
  email?: string;
  category: Category;
  company?: string;
  role?: string;
  address?: string;
  notes?: string;
  avatar_url?: string;
  avatar_color?: string;
  is_favorite: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export type SortBy = 'name_asc' | 'name_desc' | 'created_recent' | 'favorites_first' | 'company';

export interface FilterState {
  search: string;
  category: Category | 'Todos';
  onlyFavorites: boolean;
  sortBy: SortBy;
}
