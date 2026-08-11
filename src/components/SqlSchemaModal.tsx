import React, { useState } from 'react';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';
import { X, Copy, Check, Code2, Terminal, ExternalLink } from 'lucide-react';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-[#1E293B] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-800 my-8 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#3ECF8E]/10 text-[#3ECF8E] rounded-xl border border-[#3ECF8E]/20">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Script SQL para o Supabase</h2>
              <p className="text-xs text-slate-400 font-sans">
                Crie a tabela <code className="text-[#3ECF8E] font-mono">contacts</code> no banco de dados do Supabase
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

        {/* Instructions */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 text-slate-200 rounded-2xl text-xs space-y-1.5 font-mono">
            <h4 className="font-bold text-sm flex items-center gap-1.5 text-[#3ECF8E]">
              <Terminal className="w-4 h-4 text-[#3ECF8E]" /> Passos simples para rodar este script:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>
                Acesse o painel do seu projeto no{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-semibold text-[#3ECF8E] hover:text-emerald-300 inline-flex items-center gap-0.5"
                >
                  Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>No menu lateral, clique em <strong>SQL Editor</strong></li>
              <li>Clique em <strong>New Query</strong>, cole o código abaixo e clique em <strong>Run (Ctrl + Enter)</strong></li>
            </ol>
          </div>

          {/* SQL Editor Block */}
          <div className="relative rounded-2xl bg-slate-950 text-[#3ECF8E] p-4 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 shadow-md border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3ECF8E]" />
                  <span className="text-[#3ECF8E]">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>
            <pre className="pr-24 text-slate-200">{SUPABASE_SQL_SCHEMA}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between font-mono">
          <span className="text-xs text-slate-400">
            A tabela suporta todos os campos: Nome, Telefone, E-mail, Categoria, Empresa, Endereço, Observações e Favoritos.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#3ECF8E] hover:bg-[#34b27b] rounded-xl transition-colors shadow-xs"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
