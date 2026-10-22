import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Printer, 
  Share2, 
  CheckCircle, 
  Download, 
  Sparkles, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  FileText,
  RotateCcw,
  FileSpreadsheet,
  ExternalLink,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { LearnerProfile } from '../data/senaData';
import { SenaLogo } from './SenaLogo';
import { playSound } from '../utils/audio';
import { googleSignIn, getAccessToken } from '../services/googleAuth';
import { findOrCreateSpreadsheet, appendLearnerRecord, autoSyncLearnerToDrive, LearnerSheetRecord } from '../services/googleSheetsService';
import { GoogleDriveSyncModal } from './GoogleDriveSyncModal';

interface CertificateViewProps {
  learner: LearnerProfile;
  score: number;
  completedAt: string;
  certificateId: string;
  soundEnabled: boolean;
  onRetakeQuiz: () => void;
  onGoToExplorer: () => void;
  isDarkMode?: boolean;
  userRole?: 'aprendiz' | 'instructor';
}

export function CertificateView({
  learner,
  score,
  completedAt,
  certificateId,
  soundEnabled,
  onRetakeQuiz,
  onGoToExplorer,
  isDarkMode = false,
  userRole = 'aprendiz'
}: CertificateViewProps) {
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Google Drive State
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveUrl, setDriveUrl] = useState<string | null>(() => {
    const cachedId = localStorage.getItem("sena_induction_google_sheet_id");
    return cachedId ? `https://docs.google.com/spreadsheets/d/${cachedId}/edit` : null;
  });
  const [isSavedInDrive, setIsSavedInDrive] = useState<boolean>(() => {
    return localStorage.getItem(`sena_drive_saved_${learner.docNumber}`) === 'true';
  });
  const [driveUserEmail, setDriveUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // If not marked as saved, check or attempt silent registration
    const isSaved = localStorage.getItem(`sena_drive_saved_${learner.docNumber}`) === 'true';
    if (!isSaved) {
      getAccessToken().then(async (token) => {
        if (token) {
          const res = await autoSyncLearnerToDrive(token, learnerRecord);
          if (res.success && !res.queued) {
            setIsSavedInDrive(true);
            if (res.spreadsheetUrl) setDriveUrl(res.spreadsheetUrl);
          }
        }
      });
    } else if (!driveUrl) {
      const cachedId = localStorage.getItem("sena_induction_google_sheet_id");
      if (cachedId) {
        setDriveUrl(`https://docs.google.com/spreadsheets/d/${cachedId}/edit`);
      }
    }
  }, [learner.docNumber]);

  const learnerRecord: LearnerSheetRecord = {
    timestamp: new Date().toLocaleString('es-CO'),
    fullName: learner.fullName,
    docType: learner.docType,
    docNumber: learner.docNumber,
    regional: learner.regional,
    centerName: learner.centerName,
    programName: learner.programName,
    fichaNumber: learner.fichaNumber,
    score: `${score}%`,
    status: "Certificado Aprobado",
    certificateId: certificateId,
    xp: 500,
    badgesEarned: "Inducción Completa (Acuerdo 009 de 2024)",
    email: learner.email || "aprendiz@soy.sena.edu.co"
  };

  const handleOpenDriveSync = async () => {
    let token = await getAccessToken();
    if (!token) {
      try {
        const signinRes = await googleSignIn();
        if (signinRes) {
          token = signinRes.accessToken;
          setDriveUserEmail(signinRes.user.email);
        }
      } catch (err) {
        console.error("Google sign in failed:", err);
        return;
      }
    }
    if (token) {
      setIsDriveModalOpen(true);
    }
  };

  const handleConfirmDriveSync = async () => {
    try {
      setIsSyncingDrive(true);
      const token = await getAccessToken();
      if (!token) throw new Error("No hay token activo");

      const sheetRes = await findOrCreateSpreadsheet(token);
      setDriveUrl(sheetRes.webViewLink);

      await appendLearnerRecord(token, sheetRes.spreadsheetId, learnerRecord);
      setIsSavedInDrive(true);
      localStorage.setItem(`sena_drive_saved_${learner.docNumber}`, 'true');
      setIsDriveModalOpen(false);
      playSound('correct', soundEnabled);
    } catch (err: any) {
      console.error("Error saving to Drive:", err);
      alert(err.message || "Error al sincronizar con Google Drive");
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const triggerConfetti = () => {
    playSound('complete', soundEnabled);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#39A900', '#FF6B00', '#2E7D32', '#F59E0B', '#10B981']
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(certificateId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Felicitación / Acciones */}
      <div className="no-print bg-gradient-to-r from-emerald-800 via-[#1B5E20] to-[#2E7D32] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Inducción Completada y Certificada con Éxito</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ¡Felicitaciones, {learner.fullName}!
            </h2>
            <p className="text-sm text-emerald-100 max-w-2xl">
              Has demostrado un dominio sobresaliente del <strong>Reglamento del Aprendiz SENA (Acuerdo 009 de 2024)</strong>. 
              Tu certificado oficial con código de verificación institucional ha sido generado satisfactoriamente.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Printer className="w-4 h-4 text-[#39A900]" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            {/* Google Drive / Google Sheets direct link or sync - INSTRUCTOR ONLY */}
            {userRole === 'instructor' ? (
              isSavedInDrive && driveUrl ? (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-400/50 font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  title="Abrir hoja de cálculo oficial en Google Drive"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#39A900]" />
                  <span>✓ Hoja en Drive</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              ) : (
                <button
                  onClick={handleOpenDriveSync}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    isSavedInDrive
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-400/50'
                      : 'bg-white text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#39A900]" />
                  <span>{isSavedInDrive ? "✓ Registrado en Drive" : "Sincronizar en Drive"}</span>
                </button>
              )
            ) : (
              <div className="px-3.5 py-2.5 rounded-xl bg-black/20 border border-white/20 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Inducción Registrada y Validada</span>
              </div>
            )}

            <button
              onClick={triggerConfetti}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold text-sm border border-emerald-400/40 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Celebrar 🎉</span>
            </button>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-medium text-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copiar código de validación"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado" : "Copiar Código"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Area del Certificado (Lista para Imprimir o Visualizar) */}
      <div className="flex justify-center">
        <div 
          ref={certRef}
          id="certificate-print-area"
          className="print-only-container w-full max-w-4xl bg-white text-slate-800 rounded-3xl shadow-2xl border-8 border-slate-100 p-8 sm:p-12 relative overflow-hidden"
          style={{ minHeight: '640px' }}
        >
          {/* Decorative Corner Ornaments - Certificate Classic Framing */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#39A900] rounded-tl-xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-[#39A900] rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-[#39A900] rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#39A900] rounded-br-xl pointer-events-none" />

          {/* Secondary thin golden inner border */}
          <div className="absolute inset-6 border border-amber-500/40 rounded-2xl pointer-events-none" />
          <div className="absolute inset-7 border border-slate-200 rounded-xl pointer-events-none" />

          {/* Watermark Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
            <SenaLogo className="w-[450px] h-[450px]" monochrome />
          </div>

          {/* Certificate Content Header */}
          <div className="relative z-10 text-center space-y-3">
            {/* Republic of Colombia & SENA branding */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <SenaLogo className="w-16 h-16 drop-shadow-md" />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-black tracking-[0.25em] text-slate-500 uppercase">
                República de Colombia
              </p>
              <p className="text-xs font-bold tracking-[0.2em] text-[#1B5E20] uppercase">
                Ministerio del Trabajo
              </p>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-wider text-slate-900 uppercase">
                Servicio Nacional de Aprendizaje — SENA
              </h1>
              <p className="text-[11px] font-semibold text-slate-600">
                Regional {learner.regional} • {learner.centerName}
              </p>
            </div>

            {/* Certificate Title Badge */}
            <div className="pt-2">
              <div className="inline-block relative">
                <div className="bg-gradient-to-r from-[#247000] via-[#39A900] to-[#247000] text-white px-8 py-2 rounded-full shadow-md">
                  <span className="text-xs sm:text-sm font-cinzel font-bold tracking-[0.15em] uppercase">
                    Certificado de Aprobación de Inducción
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1 italic">
                Reglamento del Aprendiz SENA • Acuerdo No. 009 de 2024
              </p>
            </div>

            {/* "Hace Constar Que:" */}
            <p className="text-xs font-serif-cert italic text-slate-600 pt-2">
              El Centro de Formación Profesional hace constar que el(la) aprendiz:
            </p>

            {/* Learner Name Display */}
            <div className="py-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1B5E20] font-serif-cert tracking-wide underline decoration-[#39A900]/40 decoration-2 underline-offset-8">
                {learner.fullName}
              </h2>
              <p className="text-sm font-semibold text-slate-700 mt-2">
                Identificado(a) con {learner.docType} No. <span className="font-mono text-slate-900">{learner.docNumber}</span>
              </p>
            </div>

            {/* Program & Ficha Details */}
            <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-700 space-y-1">
              <p>
                <span className="font-bold text-slate-900">Programa de Formación:</span> {learner.programName}
              </p>
              <p>
                <span className="font-bold text-slate-900">Ficha de Caracterización:</span> <span className="font-mono font-bold text-[#39A900]">{learner.fichaNumber}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-bold text-slate-900">Calificación Obtenida:</span> <span className="font-bold text-emerald-800">{score}% (APROBADO)</span>
              </p>
            </div>

            {/* Legal / Formative Resolution Text */}
            <p className="text-xs text-slate-600 max-w-2xl mx-auto text-justify leading-relaxed pt-2">
              Cumplió a cabalidad con la ruta de inducción y acreditó los conocimientos en derechos, deberes, prohibiciones, 
              debido proceso, comités de evaluación y protocolos de prevención de violencias de género consagrados en el 
              <strong> Acuerdo 009 de 2024</strong> del Consejo Directivo Nacional del SENA.
            </p>

            {/* Signatures & Security Footer */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center">
              {/* Institutional Signature 1 */}
              <div className="space-y-1 text-center">
                <div className="h-12 flex items-end justify-center">
                  <div className="w-36 border-b-2 border-slate-700 font-serif-cert italic text-slate-600 text-xs pb-1 select-none">
                    Dr. Carlos M. Arango
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Subdirector de Centro</p>
                <p className="text-[10px] text-slate-500">SENA Regional {learner.regional}</p>
              </div>

              {/* Central Seal Badge */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#39A900] flex items-center justify-center p-1 bg-emerald-50 shadow-inner">
                  <div className="w-full h-full rounded-full bg-[#39A900] text-white flex flex-col items-center justify-center text-[8px] font-black tracking-tighter uppercase p-1">
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    <span>VERIFICADO</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-500">
                  {completedAt}
                </span>
              </div>

              {/* Institutional Signature 2 */}
              <div className="space-y-1 text-center">
                <div className="h-12 flex items-end justify-center">
                  <div className="w-36 border-b-2 border-slate-700 font-serif-cert italic text-slate-600 text-xs pb-1 select-none">
                    Msc. Elena Restrepo
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Coordinación de Formación</p>
                <p className="text-[10px] text-slate-500">Gestión Académica y Convivencia</p>
              </div>
            </div>

            {/* Bottom Verification Hash & QR Barcode Area */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-left text-[10px] text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-slate-100 rounded-sm border border-slate-300">
                  <QrCode className="w-8 h-8 text-slate-700" />
                </div>
                <div>
                  <p className="font-mono font-bold text-slate-800">
                    CÓDIGO ÚNICO: <span className="text-[#39A900]">{certificateId}</span>
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Verificación digital de inducción expedida en plataforma educativa SENA
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Lock className="w-3 h-3 text-[#39A900]" />
                  Documento Oficial de Inducción
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom helper navigation */}
      <div className="no-print max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
        <button
          onClick={onRetakeQuiz}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>Volver a presentar la evaluación</span>
        </button>
        <button
          onClick={onGoToExplorer}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#39A900] text-white font-semibold hover:bg-[#2d8500] transition-colors cursor-pointer shadow-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Consultar Artículos del Reglamento</span>
        </button>
      </div>

      {/* Confirmation Modal for Google Drive Induction Sync */}
      <GoogleDriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onConfirmSync={handleConfirmDriveSync}
        recordsToSync={[learnerRecord]}
        isSyncing={isSyncingDrive}
        spreadsheetUrl={driveUrl}
        userEmail={driveUserEmail}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
