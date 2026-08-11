import { Contact } from '../types';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'contacts_app_local_data';

const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'sample-1',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    name: 'Ana Silva',
    phone: '(11) 98765-4321',
    email: 'ana.silva@exemplo.com.br',
    category: 'Trabalho',
    company: 'Tech Solutions',
    role: 'Gerente de Projetos',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    notes: 'Contato principal para desenvolvimento de software e integrações.',
    avatar_color: '#3b82f6',
    is_favorite: true,
  },
  {
    id: 'sample-2',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    name: 'Carlos Eduardo Santos',
    phone: '(21) 99887-6655',
    email: 'carlos.santos@email.com',
    category: 'Pessoal',
    company: '',
    role: '',
    address: 'Rio de Janeiro, RJ',
    notes: 'Amigo da faculdade.',
    avatar_color: '#10b981',
    is_favorite: false,
  },
  {
    id: 'sample-3',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    name: 'Mariana Costa',
    phone: '(31) 97123-8899',
    email: 'mariana.costa@empresa.com',
    category: 'Cliente',
    company: 'Distribuidora Costa & Filhos',
    role: 'Diretora Comercial',
    address: 'Belo Horizonte, MG',
    notes: 'Interessada no plano enterprise do produto.',
    avatar_color: '#f59e0b',
    is_favorite: true,
  },
  {
    id: 'sample-4',
    created_at: new Date().toISOString(),
    name: 'Roberto Oliveira',
    phone: '(41) 98877-1122',
    email: 'roberto.fam@gmail.com',
    category: 'Família',
    company: '',
    role: '',
    address: 'Curitiba, PR',
    notes: 'Tio Roberto.',
    avatar_color: '#ec4899',
    is_favorite: false,
  }
];

// Helper to get local contacts
function getLocalContacts(): Contact[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_CONTACTS));
    return SAMPLE_CONTACTS;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler contatos do localStorage:', err);
    return SAMPLE_CONTACTS;
  }
}

// Helper to save local contacts
function saveLocalContacts(contacts: Contact[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
}

export async function fetchContacts(): Promise<{ contacts: Contact[]; source: 'supabase' | 'local'; error?: string }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  if (client && config.isConfigured) {
    try {
      const { data, error } = await client
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar contatos no Supabase:', error.message);
        return { 
          contacts: getLocalContacts(), 
          source: 'local', 
          error: `Supabase: ${error.message}. Exibindo dados locais.` 
        };
      }

      return { contacts: data as Contact[], source: 'supabase' };
    } catch (err: any) {
      console.error('Falha de conexão com Supabase:', err);
      return { 
        contacts: getLocalContacts(), 
        source: 'local', 
        error: `Falha ao conectar com Supabase: ${err.message || 'Erro desconhecido'}. Exibindo dados locais.` 
      };
    }
  }

  // Local fallback
  return { contacts: getLocalContacts(), source: 'local' };
}

export async function createContact(newContact: Omit<Contact, 'id' | 'created_at'>): Promise<{ contact: Contact; source: 'supabase' | 'local'; error?: string }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  const now = new Date().toISOString();
  const contactToSave = {
    ...newContact,
    created_at: now,
    updated_at: now,
    avatar_color: newContact.avatar_color || getRandomColor(),
  };

  if (client && config.isConfigured) {
    try {
      const { data, error } = await client
        .from('contacts')
        .insert([contactToSave])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { contact: data as Contact, source: 'supabase' };
    } catch (err: any) {
      console.warn('Fallback para local ao criar contato:', err);
      // Save locally as fallback
      const local = getLocalContacts();
      const localContact: Contact = { ...contactToSave, id: 'local-' + Date.now() };
      saveLocalContacts([localContact, ...local]);
      return { contact: localContact, source: 'local', error: `Salvo localmente (Erro Supabase: ${err.message})` };
    }
  }

  // Save locally
  const local = getLocalContacts();
  const localContact: Contact = { ...contactToSave, id: 'local-' + Date.now() };
  const updated = [localContact, ...local];
  saveLocalContacts(updated);
  return { contact: localContact, source: 'local' };
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<{ contact: Contact | null; source: 'supabase' | 'local'; error?: string }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  const updatedAt = new Date().toISOString();
  const payload = { ...updates, updated_at: updatedAt };

  if (client && config.isConfigured && !id.startsWith('local-')) {
    try {
      const { data, error } = await client
        .from('contacts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { contact: data as Contact, source: 'supabase' };
    } catch (err: any) {
      console.warn('Erro ao atualizar no Supabase, tentando local:', err);
    }
  }

  // Local update
  const local = getLocalContacts();
  let updatedContact: Contact | null = null;
  const updatedList = local.map((c) => {
    if (c.id === id) {
      updatedContact = { ...c, ...payload };
      return updatedContact;
    }
    return c;
  });

  saveLocalContacts(updatedList);
  return { contact: updatedContact, source: 'local' };
}

export async function deleteContact(id: string): Promise<{ success: boolean; source: 'supabase' | 'local'; error?: string }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  if (client && config.isConfigured && !id.startsWith('local-')) {
    try {
      const { error } = await client
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, source: 'supabase' };
    } catch (err: any) {
      console.warn('Erro ao deletar do Supabase:', err);
    }
  }

  // Local delete
  const local = getLocalContacts();
  const filtered = local.filter((c) => c.id !== id);
  saveLocalContacts(filtered);
  return { success: true, source: 'local' };
}

export async function toggleFavoriteContact(id: string, is_favorite: boolean): Promise<boolean> {
  const res = await updateContact(id, { is_favorite });
  return Boolean(res.contact);
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL e Chave Anon são obrigatórias.' };
  }

  try {
    const tempClient = createClient(url, anonKey);
    const { data, error } = await tempClient.from('contacts').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { 
          success: false, 
          message: 'Conectado com sucesso ao Supabase! Porém, a tabela "contacts" ainda não foi criada. Crie a tabela usando o script SQL abaixo.' 
        };
      }
      return { success: false, message: `Erro ao consultar a tabela: ${error.message}` };
    }

    return { success: true, message: 'Conexão estabelecida com sucesso com a tabela "contacts" no Supabase!' };
  } catch (err: any) {
    return { success: false, message: `Falha de conexão: ${err.message || 'Verifique se a URL está correta.'}` };
  }
}

export async function syncLocalContactsToSupabase(): Promise<{ syncedCount: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { syncedCount: 0, error: 'Supabase não está configurado.' };

  const local = getLocalContacts();
  if (local.length === 0) return { syncedCount: 0 };

  let count = 0;
  for (const c of local) {
    const { id, created_at, ...cleanContact } = c;
    try {
      const { error } = await client.from('contacts').insert([cleanContact]);
      if (!error) count++;
    } catch (e) {
      console.error('Erro ao sincronizar item:', c.name, e);
    }
  }

  return { syncedCount: count };
}

function getRandomColor(): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#6366f1', // indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
