import React, { useState, useEffect, useCallback } from 'react';
import { Contact, SupabaseConfig } from './types';
import { 
  fetchContacts, 
  createContact, 
  updateContact, 
  deleteContact, 
  toggleFavoriteContact 
} from './services/contactService';
import { getSupabaseConfig } from './lib/supabase';
import { Header } from './components/Header';
import { ContactList } from './components/ContactList';
import { ContactFormModal } from './components/ContactFormModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { ImportExportModal } from './components/ImportExportModal';
import { RefreshCw, Database, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Modals state
  const [selectedContactDetail, setSelectedContactDetail] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Contacts
  const loadContactsData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const config = getSupabaseConfig();
    setSupabaseConfig(config);

    const res = await fetchContacts();
    setContacts(res.contacts);
    setDataSource(res.source);
    if (res.error) {
      setErrorMessage(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContactsData();
  }, [loadContactsData]);

  // Handle Save (Create or Update)
  const handleSaveContact = async (
    contactData: Omit<Contact, 'id' | 'created_at'>,
    editingId?: string
  ) => {
    if (editingId) {
      const res = await updateContact(editingId, contactData);
      if (res.contact) {
        showToast('Contato atualizado com sucesso!');
        loadContactsData();
      }
    } else {
      const res = await createContact(contactData);
      if (res.contact) {
        showToast('Novo contato cadastrado com sucesso!');
        loadContactsData();
      }
    }
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = async (contact: Contact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = !contact.is_favorite;
    
    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, is_favorite: newStatus } : c))
    );
    if (selectedContactDetail && selectedContactDetail.id === contact.id) {
      setSelectedContactDetail((prev) => prev ? { ...prev, is_favorite: newStatus } : null);
    }

    await toggleFavoriteContact(contact.id, newStatus);
  };

  // Handle Delete Single Contact
  const handleDeleteContact = async (contact: Contact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir o contato "${contact.name}"?`)) {
      const res = await deleteContact(contact.id);
      if (res.success) {
        showToast('Contato excluído.');
        if (selectedContactDetail?.id === contact.id) {
          setSelectedContactDetail(null);
        }
        loadContactsData();
      }
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await deleteContact(id);
    }
    showToast(`${ids.length} contatos excluídos.`);
    loadContactsData();
  };

  // Handle Bulk Import
  const handleImportContacts = async (
    imported: Omit<Contact, 'id' | 'created_at'>[]
  ): Promise<number> => {
    let count = 0;
    for (const item of imported) {
      const res = await createContact(item);
      if (res.contact) count++;
    }
    loadContactsData();
    showToast(`${count} contatos importados com sucesso!`);
    return count;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 text-slate-100 shadow-2xl border border-[#3ECF8E]/40 animate-slide-up text-xs font-mono font-semibold">
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-[#3ECF8E] shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        supabaseConfig={supabaseConfig}
        dataSource={dataSource}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onOpenImportExport={() => setIsImportExportModalOpen(true)}
        onOpenAddModal={() => {
          setEditingContact(null);
          setIsFormModalOpen(true);
        }}
        totalContacts={contacts.length}
      />

      {/* Connection Notice / Banner */}
      {errorMessage && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-300 font-mono">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="font-bold underline text-amber-400 hover:text-amber-200 shrink-0"
            >
              Configurar Supabase
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#3ECF8E]" />
            <p className="text-xs font-mono">Carregando seus contatos...</p>
          </div>
        ) : (
          <ContactList
            contacts={contacts}
            onCardClick={(c) => setSelectedContactDetail(c)}
            onToggleFavorite={handleToggleFavorite}
            onEdit={(c, e) => {
              if (e) e.stopPropagation();
              setEditingContact(c);
              setIsFormModalOpen(true);
            }}
            onDelete={handleDeleteContact}
            onBulkDelete={handleBulkDelete}
            onAddNewContact={() => {
              setEditingContact(null);
              setIsFormModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1E293B] border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-400 mt-auto font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} SupaContacts • Sincronização Supabase & Offline Local</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="hover:text-[#3ECF8E] transition-colors underline"
            >
              Script SQL
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-[#3ECF8E] transition-colors underline flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-[#3ECF8E]" />
              <span>Configuração do Banco</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveContact}
        editingContact={editingContact}
        existingContacts={contacts}
      />

      <ContactDetailModal
        contact={selectedContactDetail}
        isOpen={Boolean(selectedContactDetail)}
        onClose={() => setSelectedContactDetail(null)}
        onToggleFavorite={(c) => handleToggleFavorite(c)}
        onEdit={(c) => {
          setEditingContact(c);
          setIsFormModalOpen(true);
        }}
        onDelete={(c) => handleDeleteContact(c)}
      />

      <SupabaseSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onConfigUpdated={loadContactsData}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      <SqlSchemaModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        contacts={contacts}
        onImportContacts={handleImportContacts}
      />

    </div>
  );
}
