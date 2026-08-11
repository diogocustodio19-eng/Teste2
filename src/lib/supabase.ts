/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY_URL = 'contacts_app_supabase_url';
const STORAGE_KEY_KEY = 'contacts_app_supabase_key';

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  const url = localUrl || envUrl;
  const anonKey = localKey || envKey;

  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') && 
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
}

let supabaseInstance: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    supabaseInstance = null;
    return null;
  }

  // Re-instantiate if config changed
  if (!supabaseInstance || currentUrl !== config.url || currentKey !== config.anonKey) {
    currentUrl = config.url;
    currentKey = config.anonKey;
    supabaseInstance = createClient(config.url, config.anonKey);
  }

  return supabaseInstance;
}

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- SCRIPT DE CRIAÇÃO E CONFIGURAÇÃO DE PRIVACIDADE DO BANCO SUPABASE (POSTGRESQL)
-- Execute este script no SQL Editor do seu projeto Supabase (https://app.supabase.com)
-- ==============================================================================

-- 1. Criar Tabela de Contatos com Suporte a Usuários Autenticados
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT DEFAULT 'Outro',
  company TEXT,
  role TEXT,
  address TEXT,
  notes TEXT,
  avatar_url TEXT,
  avatar_color TEXT DEFAULT '#3ECF8E',
  is_favorite BOOLEAN DEFAULT false
);

-- 2. Ativar Segurança em Nível de Linha (Row Level Security - RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE PRIVACIDADE (RLS) - ISOLAMENTO POR USUÁRIO AUTENTICADO

-- Permite que cada usuário leia apenas seus próprios contatos
CREATE POLICY "Usuários podem visualizar apenas seus próprios contatos" 
  ON public.contacts 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Permite que usuários insiram contatos vinculados ao seu ID
CREATE POLICY "Usuários podem criar contatos" 
  ON public.contacts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Permite que cada usuário atualize apenas seus próprios contatos
CREATE POLICY "Usuários podem atualizar apenas seus próprios contatos" 
  ON public.contacts 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Permite que cada usuário exclua apenas seus próprios contatos
CREATE POLICY "Usuários podem excluir apenas seus próprios contatos" 
  ON public.contacts 
  FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 4. ÍNDICES DE DESEMPENHO E PRIVACIDADE
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON public.contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON public.contacts(is_favorite);

-- 5. TRIGGER AUTOMÁTICO PARA ATUALIZAR 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_contacts_updated_at ON public.contacts;
CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. PUBLICAÇÃO REALTIME (OPCIONAL)
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
`;
