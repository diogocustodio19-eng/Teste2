import React, { useState, useEffect } from 'react';
import { SupabaseConfig } from '../types';
import { 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  getSupabaseConfig 
} from '../lib/supabase';
import { testSupabaseConnection, syncLocalContactsToSupabase } from '../services/contactService';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Code2, 
  Save, 
  Trash2, 
  ShieldCheck 
} from 'lucide-react';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
  onOpenSqlModal: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
  onOpenSqlModal,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTestResult(null);
      setSyncMessage('');
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    saveSupabaseConfig(url.trim(), anonKey.trim());
    onConfigUpdated();
    onClose();
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigUpdated();
  };

  const handleSyncLocal = async () => {
    setSyncing(true);
    setSyncMessage('');
    const res = await syncLocalContactsToSupabase();
    setSyncing(false);

    if (res.error) {
      setSyncMessage(`Erro: ${res.error}`);
    } else {
      setSyncMessage(`Sucesso! ${res.syncedCount} contatos locais foram migrados para o Supabase.`);
      onConfigUpdated();
    }
  };

  if (!isOpen) return null;

  const isConfigured = Boolean(url && anonKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-[#1E293B] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-800 my-8 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#3ECF8E]/10 rounded-xl text-[#3ECF8E] border border-[#3ECF8E]/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Configuração do Supabase</h2>
              <p className="text-xs text-slate-400 font-sans">
                Conecte seu banco de dados PostgreSQL do Supabase
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

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Quick Info Box */}
          <div className="p-4 bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 rounded-2xl flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#3ECF8E] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 space-y-1 font-mono">
              <p className="font-bold text-[#3ECF8E]">Como obter suas credenciais gratuitamente:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-300">
                <li>Acesse o <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold text-[#3ECF8E] hover:text-emerald-300 inline-flex items-center gap-0.5">Supabase.com <ExternalLink className="w-3 h-3" /></a></li>
                <li>Crie ou selecione seu projeto gratuito</li>
                <li>Vá em <strong>Project Settings → API</strong></li>
                <li>Copie a <strong>Project URL</strong> e a <strong>anon / public key</strong></li>
              </ol>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://sua-id-do-projeto.supabase.co"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none font-mono placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                Anon / Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <textarea
                rows={3}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-[#3ECF8E]/20 focus:border-[#3ECF8E] outline-none font-mono resize-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Test & Result Section */}
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !url || !anonKey}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3ECF8E]" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-[#3ECF8E]" />
                )}
                <span>{testing ? 'Testando Conexão...' : 'Testar Conexão'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSqlModal();
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
                <span>Ver Script SQL</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 text-xs rounded-xl border flex items-start gap-2.5 font-mono ${
                  testResult.success
                    ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E]'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Migration / Sync Section */}
          {isConfigured && (
            <div className="pt-3 border-t border-slate-800">
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-200">Sincronizar Contatos Locais</h4>
                  <p className="text-[11px] text-slate-400">
                    Envie os contatos salvos no modo local para o Supabase
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncLocal}
                  disabled={syncing}
                  className="px-3 py-1.5 bg-[#3ECF8E] hover:bg-[#34b27b] text-slate-950 font-bold text-xs font-mono rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                </button>
              </div>

              {syncMessage && (
                <p className="text-xs text-[#3ECF8E] font-mono font-medium mt-2 px-1">
                  {syncMessage}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between font-mono">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Chaves</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#3ECF8E] hover:bg-[#34b27b] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar e Usar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
