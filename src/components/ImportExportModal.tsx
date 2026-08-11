import React, { useState, useRef } from 'react';
import { Contact, Category } from '../types';
import { 
  X, 
  Download, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onImportContacts: (imported: Omit<Contact, 'id' | 'created_at'>[]) => Promise<number>;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onImportContacts,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(contacts, null, 2)
    )}`;
    downloadFile(jsonString, `contatos_backup_${getTimestamp()}.json`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'Categoria', 'Empresa', 'Cargo', 'Endereco', 'Observacoes', 'Favorito'];
    const rows = contacts.map((c) => [
      escapeCSV(c.name),
      escapeCSV(c.phone),
      escapeCSV(c.email || ''),
      escapeCSV(c.category || 'Outro'),
      escapeCSV(c.company || ''),
      escapeCSV(c.role || ''),
      escapeCSV(c.address || ''),
      escapeCSV(c.notes || ''),
      c.is_favorite ? 'Sim' : 'Nao',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `contatos_${getTimestamp()}.csv`);
  };

  // Export vCard (.vcf)
  const handleExportVCard = () => {
    const vcards = contacts.map((c) => {
      const fn = c.name;
      const tel = c.phone.replace(/\D/g, '');
      const email = c.email || '';
      const org = c.company || '';
      const title = c.role || '';

      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${fn}`,
        `TEL;TYPE=CELL:${tel}`,
        email ? `EMAIL;TYPE=INTERNET:${email}` : '',
        org ? `ORG:${org}` : '',
        title ? `TITLE:${title}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    });

    const vcfContent = vcards.join('\n\n');
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `contatos_${getTimestamp()}.vcf`);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTimestamp = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate()
    ).padStart(2, '0')}`;
  };

  const escapeCSV = (str: string) => {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Import File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let parsed: Omit<Contact, 'id' | 'created_at'>[] = [];

        if (file.name.endsWith('.json')) {
          const raw = JSON.parse(text);
          const list = Array.isArray(raw) ? raw : [raw];
          parsed = list.map((item) => ({
            name: item.name || 'Contato Sem Nome',
            phone: item.phone || '',
            email: item.email || undefined,
            category: (item.category as Category) || 'Outro',
            company: item.company || undefined,
            role: item.role || undefined,
            address: item.address || undefined,
            notes: item.notes || undefined,
            is_favorite: Boolean(item.is_favorite),
          }));
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            // Assume CSV headers on line 0
            const rows = lines.slice(1);
            parsed = rows.map((line) => {
              const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
              return {
                name: cols[0] || 'Contato Importado',
                phone: cols[1] || '',
                email: cols[2] || undefined,
                category: (cols[3] as Category) || 'Outro',
                company: cols[4] || undefined,
                role: cols[5] || undefined,
                address: cols[6] || undefined,
                notes: cols[7] || undefined,
                is_favorite: cols[8]?.toLowerCase() === 'sim',
              };
            });
          }
        }

        if (parsed.length === 0) {
          setImportResult('Nenhum contato válido foi encontrado no arquivo.');
        } else {
          const count = await onImportContacts(parsed);
          setImportResult(`Sucesso! ${count} contatos foram importados com sucesso.`);
        }
      } catch (err: any) {
        setImportResult(`Erro ao processar o arquivo: ${err.message}`);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-[#1E293B] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-800 my-8 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="px-6 pt-5 pb-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'export'
                  ? 'bg-[#3ECF8E] text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'import'
                  ? 'bg-[#3ECF8E] text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                <p className="font-bold text-white text-sm tracking-tight mb-0.5">
                  Exportar {contacts.length} contatos
                </p>
                <p>Escolha o formato desejado para baixar o backup dos seus contatos:</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Export CSV */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-[#3ECF8E] rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-[#3ECF8E]/10 text-[#3ECF8E] rounded-xl border border-[#3ECF8E]/20 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Formato Planilha (CSV)</h4>
                      <p className="text-xs text-slate-400 font-sans">Compatível com Excel, Google Sheets e Numbers</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-[#3ECF8E]" />
                </button>

                {/* Export vCard */}
                <button
                  onClick={handleExportVCard}
                  className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-[#3ECF8E] rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 group-hover:scale-105 transition-transform">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Cartão de Visita Mobile (.VCF)</h4>
                      <p className="text-xs text-slate-400 font-sans">Importe direto no iPhone, Android e Google Contacts</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-[#3ECF8E]" />
                </button>

                {/* Export JSON */}
                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-[#3ECF8E] rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Backup Completo (JSON)</h4>
                      <p className="text-xs text-slate-400 font-sans">Preserva todas as propriedades e estrutura de dados</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-[#3ECF8E]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                <p className="font-bold text-white text-sm tracking-tight mb-0.5">
                  Importar novos contatos
                </p>
                <p>Selecione um arquivo .JSON ou .CSV gerado anteriormente para cadastrar em lote:</p>
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-[#3ECF8E] rounded-2xl p-6 text-center bg-slate-900/50 transition-colors">
                <Upload className="w-8 h-8 text-[#3ECF8E] mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200 mb-1 font-mono">
                  Arraste ou selecione seu arquivo
                </p>
                <p className="text-[11px] text-slate-400 mb-4 font-mono">Suporta arquivos .JSON e .CSV</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="import-file-input"
                />

                <label
                  htmlFor="import-file-input"
                  className="inline-flex items-center px-4 py-2 bg-[#3ECF8E] hover:bg-[#34b27b] text-slate-950 text-xs font-bold font-mono rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  {importing ? 'Processando Arquivo...' : 'Escolher Arquivo'}
                </label>
              </div>

              {importResult && (
                <div
                  className={`p-3 text-xs font-mono rounded-xl border flex items-start gap-2 ${
                    importResult.startsWith('Sucesso')
                      ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E]'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {importResult.startsWith('Sucesso') ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3ECF8E] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span>{importResult}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
