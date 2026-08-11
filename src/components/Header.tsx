import React from 'react';
import { 
  Users, 
  Database, 
  UserPlus, 
  Code2, 
  Download, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SupabaseConfig } from '../types';

interface HeaderProps {
  supabaseConfig: SupabaseConfig;
  dataSource: 'supabase' | 'local';
  onOpenSettings: () => void;
  onOpenSqlModal: () => void;
  onOpenImportExport: () => void;
  onOpenAddModal: () => void;
  totalContacts: number;
}

export const Header: React.FC<HeaderProps> = ({
  supabaseConfig,
  dataSource,
  onOpenSettings,
  onOpenSqlModal,
  onOpenImportExport,
  onOpenAddModal,
  totalContacts,
}) => {
  const isSupabaseActive = supabaseConfig.isConfigured && dataSource === 'supabase';

  return (
    <header className="bg-[#1E293B] border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#3ECF8E] rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-sm shrink-0">
              <Users className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  SupaContacts
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-[#3ECF8E] border border-slate-700">
                  {totalContacts} {totalContacts === 1 ? 'contato' : 'contatos'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-sans">
                Gestão de contatos com sincronização Supabase PostgreSQL
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Supabase Status Pill */}
            <button
              id="header-supabase-status-btn"
              onClick={onOpenSettings}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                isSupabaseActive
                  ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/30 hover:bg-[#3ECF8E]/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Clique para configurar o Supabase"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline uppercase tracking-wider text-[10px]">
                {isSupabaseActive ? 'Supabase Conectado' : 'Modo Local'}
              </span>
              {isSupabaseActive ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* SQL Script Quick Access */}
            <button
              id="header-sql-script-btn"
              onClick={onOpenSqlModal}
              className="px-3 py-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors hidden md:flex items-center gap-1.5 text-xs font-medium"
              title="Ver código SQL para criar a tabela no Supabase"
            >
              <Code2 className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span>Script SQL</span>
            </button>

            {/* Import / Export */}
            <button
              id="header-import-export-btn"
              onClick={onOpenImportExport}
              className="px-3 py-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Importar e Exportar Contatos (CSV, JSON, vCard)"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Backup / Exportar</span>
            </button>

            {/* Primary Action: Novo Contato */}
            <button
              id="header-add-contact-btn"
              onClick={onOpenAddModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-slate-950 font-bold text-xs tracking-wide shadow-sm transition-colors active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Contato</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
