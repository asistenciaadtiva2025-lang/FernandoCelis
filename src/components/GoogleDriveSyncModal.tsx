import { useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  ShieldCheck,
  CloudCheck,
  UploadCloud
} from 'lucide-react';
import { LearnerSheetRecord } from '../services/googleSheetsService';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSync: () => Promise<void>;
  recordsToSync: LearnerSheetRecord[];
  isSyncing: boolean;
  spreadsheetUrl: string | null;
  userEmail: string | null;
  isDarkMode?: boolean;
}

export function GoogleDriveSyncModal({
  isOpen,
  onClose,
  onConfirmSync,
  recordsToSync,
  isSyncing,
  spreadsheetUrl,
  userEmail,
  isDarkMode = false
}: GoogleDriveSyncModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border transition-all ${
        isDarkMode 
          ? 'bg-[#0B1426] border-blue-900/60 text-slate-100 shadow-blue-950/60' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#39A900] p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  Sincronización con Google Drive & Sheets
                </h3>
                <p className="text-xs text-emerald-100">
                  Almacenamiento institucional en la nube
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSyncing}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
            isDarkMode ? 'bg-[#0E1A33] border-blue-900/40 text-blue-100' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#39A900]" />
              Confirmación de Registro y Escritura en Google Drive
            </p>
            <p>
              Estás a punto de enviar y registrar los datos de <strong>{recordsToSync.length} aprendiz(ces)</strong> 
              en la hoja de cálculo <em>"SENA - Registro de Inducción de Aprendices (Acuerdo 009 de 2024)"</em> 
              alojada en la cuenta de Google Drive: <strong>{userEmail || "Conectada"}</strong>.
            </p>
          </div>

          {/* List of records to be appended */}
          <div className="space-y-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDarkMode ? 'text-blue-300' : 'text-slate-500'
            }`}>
              Aprendices a registrar:
            </span>
            <div className={`max-h-36 overflow-y-auto rounded-xl border p-2 space-y-1 text-xs divide-y ${
              isDarkMode ? 'bg-[#080E1C] border-blue-950/80 divide-blue-950 text-slate-200' : 'bg-slate-50 border-slate-200 divide-slate-100 text-slate-700'
            }`}>
              {recordsToSync.map((rec, i) => (
                <div key={i} className="pt-1 first:pt-0 flex items-center justify-between py-1">
                  <div>
                    <p className="font-bold">{rec.fullName}</p>
                    <p className="text-[10px] opacity-75">{rec.docType} {rec.docNumber} • Ficha {rec.fichaNumber}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {rec.score}% ({rec.status})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {spreadsheetUrl && (
            <div className="pt-1">
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#39A900] hover:text-[#2d8500] font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Hoja de Cálculo actual en Google Drive</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-end gap-3 ${
          isDarkMode ? 'border-blue-900/40 bg-[#081020]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSyncing}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmSync}
            disabled={isSyncing}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#39A900] hover:bg-[#2e8800] rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando en Google Drive...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Confirmar y Guardar en Google Sheets</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
