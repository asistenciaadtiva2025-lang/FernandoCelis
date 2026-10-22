import { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  FileSpreadsheet,
  SlidersHorizontal,
  ExternalLink,
  LogOut,
  UploadCloud,
  Check,
  RefreshCw,
  FolderOpen,
  Copy,
  Share2,
  MessageSquare,
  ShieldCheck,
  Link2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { LearnerProfile } from '../data/senaData';
import { 
  googleSignIn, 
  googleLogout, 
  getAccessToken, 
  initAuth 
} from '../services/googleAuth';
import { 
  findOrCreateSpreadsheet, 
  appendLearnerRecordsBatch, 
  LearnerSheetRecord 
} from '../services/googleSheetsService';
import { GoogleDriveSyncModal } from './GoogleDriveSyncModal';

interface InstructorDashboardProps {
  currentLearner: LearnerProfile;
  hasCertificate: boolean;
  score: number;
  certificateId: string;
  completedAt: string;
  onViewStudentCertificate: () => void;
  isDarkMode?: boolean;
  onSwitchToLearnerView?: () => void;
  onLogoutInstructor?: () => void;
}

const LAST_SYNC_KEY = 'sena_drive_last_sync_timestamp';
const SYNCED_IDS_KEY = 'sena_drive_synced_learner_ids';

export function InstructorDashboard({
  currentLearner,
  hasCertificate,
  score,
  certificateId,
  completedAt,
  onViewStudentCertificate,
  isDarkMode = false,
  onSwitchToLearnerView,
  onLogoutInstructor
}: InstructorDashboardProps) {
  const [filter, setFilter] = useState<'todos' | 'certificados' | 'pendientes'>('todos');
  const [search, setSearch] = useState('');

  // Google Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem("sena_induction_google_sheet_id");
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    const id = localStorage.getItem("sena_induction_google_sheet_id");
    return id ? `https://docs.google.com/spreadsheets/d/${id}/edit` : null;
  });
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [modalRecords, setModalRecords] = useState<LearnerSheetRecord[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Track synced learner identifiers
  const [syncedDocNumbers, setSyncedDocNumbers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SYNCED_IDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(LAST_SYNC_KEY);
  });

  // Learner Sharing State
  const [isCopiedLearnerLink, setIsCopiedLearnerLink] = useState(false);
  const [isCopiedInstructorLink, setIsCopiedInstructorLink] = useState(false);
  const [isCopiedWhatsAppMsg, setIsCopiedWhatsAppMsg] = useState(false);

  const CANONICAL_PUBLIC_APP_URL = 'https://ais-pre-msswxe56hhcobiu5rqe4yf-482247421358.us-east5.run.app';

  const getLearnerShareableUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      // If running inside AI Studio development host or localhost, provide canonical public app URL
      if (host.includes('aistudio.google.com') || host.includes('localhost') || host === '') {
        return `${CANONICAL_PUBLIC_APP_URL}/?rol=aprendiz`;
      }
      try {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('rol', 'aprendiz');
        return url.toString();
      } catch {
        return `${CANONICAL_PUBLIC_APP_URL}/?rol=aprendiz`;
      }
    }
    return `${CANONICAL_PUBLIC_APP_URL}/?rol=aprendiz`;
  };

  const getInstructorShareableUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host.includes('aistudio.google.com') || host.includes('localhost') || host === '') {
        return `${CANONICAL_PUBLIC_APP_URL}/?rol=instructor`;
      }
      try {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('rol', 'instructor');
        return url.toString();
      } catch {
        return `${CANONICAL_PUBLIC_APP_URL}/?rol=instructor`;
      }
    }
    return `${CANONICAL_PUBLIC_APP_URL}/?rol=instructor`;
  };

  const handleCopyLearnerLink = () => {
    const url = getLearnerShareableUrl();
    navigator.clipboard.writeText(url);
    setIsCopiedLearnerLink(true);
    setTimeout(() => setIsCopiedLearnerLink(false), 2500);
    showNotification('¡Enlace oficial para aprendices copiado!', 'success');
  };

  const handleCopyInstructorLink = () => {
    const url = getInstructorShareableUrl();
    navigator.clipboard.writeText(url);
    setIsCopiedInstructorLink(true);
    setTimeout(() => setIsCopiedInstructorLink(false), 2500);
    showNotification('¡Enlace de acceso a panel instructor copiado!', 'success');
  };

  const handleCopyWhatsAppMsg = () => {
    const url = getLearnerShareableUrl();
    const msg = `🏛️ *SENA - Inducción al Reglamento del Aprendiz (Acuerdo 009 de 2024)*\n\nEstimados aprendices de la ficha ${currentLearner.fichaNumber} (${currentLearner.programName}), por favor ingresen a la plataforma interactiva para realizar su inducción, simulador de casos y evaluación oficial:\n\n👉 ${url}\n\nAl aprobar con el 80% o más, obtendrán su certificado oficial de inducción debidamente verificado. ¡Muchos éxitos en su formación integral!`;
    navigator.clipboard.writeText(msg);
    setIsCopiedWhatsAppMsg(true);
    setTimeout(() => setIsCopiedWhatsAppMsg(false), 2500);
    showNotification('¡Mensaje con instrucciones para aprendices copiado!', 'success');
  };

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Sample cohort list for Ficha 2894512 including the active user
  const cohort = [
    {
      id: "1",
      name: currentLearner.fullName,
      docType: currentLearner.docType,
      docNumber: currentLearner.docNumber,
      doc: `${currentLearner.docType} ${currentLearner.docNumber}`,
      status: hasCertificate ? "Certificado" : "En Proceso",
      score: hasCertificate ? `${score}%` : "Pendiente",
      date: hasCertificate ? completedAt : "En progreso",
      certCode: hasCertificate ? certificateId : "—",
      xp: 450,
      badges: "Derechos, Deberes, Prohibiciones, Casos, Certificado",
      email: currentLearner.email || "jdgomez@soy.sena.edu.co",
      isCurrentUser: true
    },
    {
      id: "2",
      name: "Andrés Felipe Valencia Ríos",
      docType: "CC",
      docNumber: "1025489632",
      doc: "CC 1025489632",
      status: "Certificado",
      score: "90%",
      date: "2024-10-18",
      certCode: "SENA-2024-REG-1025489632-A009",
      xp: 420,
      badges: "Derechos, Deberes, Prohibiciones, Certificado",
      email: "afvalencia@soy.sena.edu.co",
      isCurrentUser: false
    },
    {
      id: "3",
      name: "María Paula Osorio Cardona",
      docType: "TI",
      docNumber: "1039874561",
      doc: "TI 1039874561",
      status: "Certificado",
      score: "100%",
      date: "2024-10-19",
      certCode: "SENA-2024-REG-1039874561-A009",
      xp: 500,
      badges: "Derechos, Deberes, Prohibiciones, Casos, Certificado, Excelencia",
      email: "mposorio@soy.sena.edu.co",
      isCurrentUser: false
    },
    {
      id: "4",
      name: "Santiago Morales Henao",
      docType: "CC",
      docNumber: "1017456321",
      doc: "CC 1017456321",
      status: "Certificado",
      score: "85%",
      date: "2024-10-19",
      certCode: "SENA-2024-REG-1017456321-A009",
      xp: 380,
      badges: "Derechos, Deberes, Certificado",
      email: "smorales@soy.sena.edu.co",
      isCurrentUser: false
    },
    {
      id: "5",
      name: "Daniela Castaño Restrepo",
      docType: "CC",
      docNumber: "1045612398",
      doc: "CC 1045612398",
      status: "En Proceso",
      score: "Pendiente",
      date: "Iniciado hoy",
      certCode: "—",
      xp: 180,
      badges: "Derechos, Deberes",
      email: "dcastano@soy.sena.edu.co",
      isCurrentUser: false
    },
    {
      id: "6",
      name: "Kevin Alejandro Zapata",
      docType: "TI",
      docNumber: "1022456789",
      doc: "TI 1022456789",
      status: "Pendiente",
      score: "—",
      date: "Sin iniciar",
      certCode: "—",
      xp: 0,
      badges: "Ninguna",
      email: "kazapata@soy.sena.edu.co",
      isCurrentUser: false
    }
  ];

  const filteredCohort = cohort.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.doc.toLowerCase().includes(search.toLowerCase());
    if (filter === 'certificados') return matchesSearch && item.status === 'Certificado';
    if (filter === 'pendientes') return matchesSearch && item.status !== 'Certificado';
    return matchesSearch;
  });

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        showNotification(`Conectado exitosamente con Google como ${res.user.email}`);
        
        // Find or prepare spreadsheet
        const sheetRes = await findOrCreateSpreadsheet(res.accessToken);
        setSpreadsheetId(sheetRes.spreadsheetId);
        setSpreadsheetUrl(sheetRes.webViewLink);
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Error al iniciar sesión con Google', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Google Sign Out
  const handleGoogleLogout = async () => {
    try {
      await googleLogout();
      setGoogleUser(null);
      setSpreadsheetId(null);
      setSpreadsheetUrl(null);
      showNotification('Sesión de Google cerrada', 'info');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Convert cohort item to LearnerSheetRecord
  const toSheetRecord = (item: typeof cohort[0]): LearnerSheetRecord => {
    return {
      timestamp: item.date === 'Sin iniciar' ? 'Pendiente' : new Date().toLocaleString('es-CO'),
      fullName: item.name,
      docType: item.docType,
      docNumber: item.docNumber,
      regional: currentLearner.regional,
      centerName: currentLearner.centerName,
      programName: currentLearner.programName,
      fichaNumber: currentLearner.fichaNumber,
      score: item.score,
      status: item.status,
      certificateId: item.certCode,
      xp: item.xp,
      badgesEarned: item.badges,
      email: item.email
    };
  };

  // Open sync confirmation modal for all learners
  const handleOpenSyncAllModal = async () => {
    const token = await getAccessToken();
    if (!googleUser || !token) {
      await handleGoogleSignIn();
      return;
    }

    const records = cohort.map(toSheetRecord);
    setModalRecords(records);
    setIsSyncModalOpen(true);
  };

  // Open sync confirmation modal for single learner
  const handleOpenSyncSingleModal = async (learnerItem: typeof cohort[0]) => {
    const token = await getAccessToken();
    if (!googleUser || !token) {
      await handleGoogleSignIn();
      return;
    }

    const record = toSheetRecord(learnerItem);
    setModalRecords([record]);
    setIsSyncModalOpen(true);
  };

  // Execute sync after confirmation
  const handleConfirmSync = async () => {
    try {
      setIsSyncing(true);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No hay sesión activa con Google. Inicia sesión nuevamente.');
      }

      // Ensure spreadsheet exists in Google Drive
      const sheet = await findOrCreateSpreadsheet(token);
      setSpreadsheetId(sheet.spreadsheetId);
      setSpreadsheetUrl(sheet.webViewLink);

      // Append records in batch
      await appendLearnerRecordsBatch(token, sheet.spreadsheetId, modalRecords);

      // Update sync state
      const newSynced = Array.from(new Set([...syncedDocNumbers, ...modalRecords.map(r => r.docNumber)]));
      setSyncedDocNumbers(newSynced);
      localStorage.setItem(SYNCED_IDS_KEY, JSON.stringify(newSynced));

      const nowStr = new Date().toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
      setLastSyncTime(nowStr);
      localStorage.setItem(LAST_SYNC_KEY, nowStr);

      setIsSyncModalOpen(false);
      showNotification(`¡Éxito! ${modalRecords.length} aprendiz(ces) registrados en Google Sheets alojado en tu Google Drive.`);
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Error al guardar en Google Sheets', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const exportCSV = () => {
    const headers = "Nombre,Tipo_Doc,Numero_Doc,Estado,Calificacion,Fecha,Codigo_Certificado,Regional,Centro,Programa,Ficha\n";
    const rows = cohort.map(c => `"${c.name}","${c.docType}","${c.docNumber}","${c.status}","${c.score}","${c.date}","${c.certCode}","${currentLearner.regional}","${currentLearner.centerName}","${currentLearner.programName}","${currentLearner.fichaNumber}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Induccion_SENA_Ficha_${currentLearner.fichaNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-lg transition-all ${
          notification.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200'
            : notification.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/80 dark:border-blue-800 dark:text-blue-200'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#39A900]" />
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs underline ml-4 opacity-75 hover:opacity-100 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
        isDarkMode 
          ? 'bg-gradient-to-r from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] border border-blue-900/50 shadow-blue-950/50' 
          : 'bg-slate-900'
      }`}>
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30 mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Gestión Académica e Inducción • Rol Instructor / Coordinador</span>
          </div>
          <h2 className="text-2xl font-black">
            PANEL DE SEGUIMIENTO INDUCCION CSET
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {currentLearner.programName} • Regional {currentLearner.regional}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToLearnerView && (
            <button
              onClick={onSwitchToLearnerView}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Ver el prototipo tal como lo ven los aprendices"
            >
              <Eye className="w-4 h-4" />
              <span>Ver como Aprendiz</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            title="Descargar copia local en CSV"
          >
            <Download className="w-4 h-4" />
            <span>CSV Local</span>
          </button>

          {onLogoutInstructor && (
            <button
              onClick={onLogoutInstructor}
              className="px-3.5 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-rose-800/60 transition-all cursor-pointer"
              title="Cerrar sesión de Instructor y volver a modo aprendiz"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* AVISO IMPORTANTE: DIFERENCIA ENTRE URL DE AI STUDIO Y ENLACE PÚBLICO */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isDarkMode 
          ? 'bg-amber-950/30 border-amber-800/60 text-amber-200' 
          : 'bg-amber-50/90 border-amber-300 text-amber-900 shadow-xs'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <span>¿Por qué ves la URL "aistudio.google.com" en la barra de tu navegador?</span>
            </h4>
            <p className="leading-relaxed opacity-90">
              La dirección que ves arriba en tu navegador (<code className="font-mono text-[11px] px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">aistudio.google.com/apps/8191f150...</code>) es tu <strong>consola privada de desarrollo y edición en Google AI Studio</strong> (donde tienes el chat del asistente y los controles técnicos).
            </p>
            <p className="leading-relaxed font-semibold text-amber-700 dark:text-amber-300">
              ⛔ <strong>NO envíes esa URL a los aprendices:</strong> Les pediría iniciar sesión en Google AI Studio y verían el asistente.
            </p>
            <p className="leading-relaxed font-semibold text-emerald-700 dark:text-emerald-400">
              ✅ <strong>Utiliza el enlace web público oficial</strong> que generamos a continuación para tus aprendices:
            </p>
          </div>
        </div>
      </div>

      {/* CARD: ENLACES COMPARTIBLES (APRENDICES VS INSTRUCTOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* COL 1: ENLACE PÚBLICO PARA APRENDICES */}
        <div className={`rounded-3xl p-6 border shadow-xl transition-all flex flex-col justify-between ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#0F1C36] via-[#0B1528] to-[#0A1224] border-emerald-800/40 shadow-blue-950/50' 
            : 'bg-gradient-to-br from-emerald-50/80 via-white to-green-50/40 border-emerald-300 shadow-emerald-900/5'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#39A900] text-white flex items-center justify-center shadow-md shadow-[#39A900]/30 shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    1. Enlace para los Aprendices
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-[#39A900] px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Público
                  </span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Acceso directo y limpio para realizar la inducción gamificada, casos y certificado.
                </p>
              </div>
            </div>

            {/* URL Display Box */}
            <div className={`p-3 rounded-2xl border font-mono text-xs overflow-hidden ${
              isDarkMode 
                ? 'bg-[#080E1C] border-emerald-900/60 text-emerald-300' 
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900 shadow-inner'
            }`}>
              <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 font-sans">
                <Link2 className="w-3.5 h-3.5 text-[#39A900]" />
                <span>Enlace Web Público (Sin AI Studio):</span>
              </div>
              <div className="select-all break-all font-semibold">
                {getLearnerShareableUrl()}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p>✔️ Los aprendices <strong>NO</strong> verán tu panel de instructor ni el chat de AI Studio.</p>
              <p>✔️ Los aprendices <strong>NO</strong> pueden modificar la hoja de cálculo ni sincronizar Drive.</p>
            </div>
          </div>

          {/* Action Buttons for Learners */}
          <div className="pt-4 mt-2 border-t border-emerald-200/50 dark:border-emerald-900/40 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopyLearnerLink}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#39A900] hover:bg-[#2d8500] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              {isCopiedLearnerLink ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Enlace Aprendices</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyWhatsAppMsg}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? 'bg-blue-950/60 border-blue-800/80 text-blue-200 hover:bg-blue-900/60' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
              title="Copiar mensaje con saludo y enlace para WhatsApp"
            >
              {isCopiedWhatsAppMsg ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span>WhatsApp</span>
                </>
              )}
            </button>

            <a
              href={getLearnerShareableUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-xl border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title="Abrir como aprendiz en nueva pestaña para probar"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* COL 2: ENLACE PRIVADO PARA EL INSTRUCTOR */}
        <div className={`rounded-3xl p-6 border shadow-xl transition-all flex flex-col justify-between ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#0F1C36] via-[#0B1528] to-[#0A1224] border-blue-800/50 shadow-blue-950/50' 
            : 'bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 border-blue-300 shadow-blue-900/5'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    2. Enlace Directo para Ti (Instructor)
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                    PIN: 1234
                  </span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Para entrar directamente a tu panel de seguimiento y sincronización en Google Drive.
                </p>
              </div>
            </div>

            {/* URL Display Box */}
            <div className={`p-3 rounded-2xl border font-mono text-xs overflow-hidden ${
              isDarkMode 
                ? 'bg-[#080E1C] border-blue-900/60 text-blue-300' 
                : 'bg-blue-50/60 border-blue-200 text-blue-900 shadow-inner'
            }`}>
              <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 font-sans">
                <Link2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Enlace Directo para Instructor:</span>
              </div>
              <div className="select-all break-all font-semibold">
                {getInstructorShareableUrl()}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p>🔐 Protegido por PIN de seguridad (<strong>1234</strong>) y cuenta Google.</p>
              <p>📊 Control total: vinculación de Google Sheets, Drive y exportación CSV.</p>
            </div>
          </div>

          {/* Action Buttons for Instructor */}
          <div className="pt-4 mt-2 border-t border-blue-200/50 dark:border-blue-900/40 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopyInstructorLink}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              {isCopiedInstructorLink ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Enlace de Instructor</span>
                </>
              )}
            </button>

            <a
              href={getInstructorShareableUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-xl border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title="Abrir panel de instructor en nueva pestaña"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* GOOGLE DRIVE & GOOGLE SHEETS CLOUD INTEGRATION CARD */}
      <div className={`rounded-3xl p-6 border transition-all ${
        isDarkMode 
          ? 'bg-[#0B1528]/95 border-emerald-900/40 shadow-xl shadow-blue-950/40' 
          : 'bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border-emerald-200 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#39A900] text-white rounded-xl shadow-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Almacenamiento en Google Drive & Google Sheets
                  </h3>
                  <span className="text-[10px] uppercase font-extrabold bg-[#39A900]/20 text-[#39A900] px-2 py-0.5 rounded-full border border-[#39A900]/30">
                    Oficial
                  </span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-blue-200/70' : 'text-slate-600'}`}>
                  Guarda automáticamente y en tiempo real el registro de inducción de los aprendices en una hoja de cálculo institucional en Google Drive.
                </p>
              </div>
            </div>

            {/* Connection and sync status */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
              {googleUser ? (
                <div className="flex items-center gap-2">
                  {googleUser.photoURL ? (
                    <img src={googleUser.photoURL} alt="Google Avatar" className="w-6 h-6 rounded-full border border-emerald-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {googleUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                    Conectado: {googleUser.email}
                  </span>
                  <button
                    onClick={handleGoogleLogout}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 ml-2 cursor-pointer transition-colors"
                    title="Cerrar sesión de Google"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Desconectar</span>
                  </button>
                </div>
              ) : (
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  No has conectado tu cuenta de Google para almacenar en Drive.
                </span>
              )}

              {lastSyncTime && (
                <span className={`text-[11px] ${isDarkMode ? 'text-blue-300/60' : 'text-slate-500'} flex items-center gap-1`}>
                  <Clock className="w-3.5 h-3.5" />
                  Última sincronización: <strong>{lastSyncTime}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Action buttons for Google Drive */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {!googleUser ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {/* Official Google 'G' icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{isAuthLoading ? "Conectando..." : "Conectar Google Drive"}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleOpenSyncAllModal}
                  disabled={isSyncing}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#39A900] hover:bg-[#2d8500] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Sincronizar Ficha con Google Sheets</span>
                </button>

                {spreadsheetUrl && (
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'border-emerald-600/40 text-emerald-300 hover:bg-emerald-950/40 bg-emerald-950/20' 
                          : 'border-emerald-300 text-[#1B5E20] hover:bg-emerald-50 bg-white shadow-xs'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-[#39A900]" />
                      <span>Abrir en Google Drive</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        if (spreadsheetUrl) {
                          navigator.clipboard.writeText(spreadsheetUrl);
                          setIsCopiedUrl(true);
                          setTimeout(() => setIsCopiedUrl(false), 2500);
                        }
                      }}
                      className={`px-3 py-2.5 rounded-xl font-semibold text-xs border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'border-blue-900/60 bg-blue-950/40 text-blue-200 hover:bg-blue-900/50'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Copiar enlace directo de la hoja de cálculo"
                    >
                      {isCopiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopiedUrl ? "¡Enlace Copiado!" : "Copiar Enlace"}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Detailed Sheet URL Banner */}
        {spreadsheetUrl && (
          <div className={`mt-4 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'border-emerald-900/30 text-blue-200/80' : 'border-emerald-100 text-slate-600'
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-bold text-slate-800 dark:text-white shrink-0">Enlace de la Hoja:</span>
              <a 
                href={spreadsheetUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-mono text-[11px] text-[#39A900] hover:underline truncate"
              >
                {spreadsheetUrl}
              </a>
            </div>
            <a
              href="https://drive.google.com/drive/my-drive"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-500 hover:underline shrink-0 flex items-center gap-1 font-semibold"
            >
              <span>Ver mi unidad de Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#0B1528] border-blue-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase">Aprendices en Ficha</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1">{cohort.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">100% caracterizados</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#0B1528] border-emerald-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase">Certificados</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            {cohort.filter(c => c.status === "Certificado").length}
          </p>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Evaluación aprobada</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#0B1528] border-blue-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase">Tasa de Aprobación</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400">
            {Math.round((cohort.filter(c => c.status === "Certificado").length / cohort.length) * 100)}%
          </p>
          <span className="text-[10px] text-blue-500/80 dark:text-blue-400/80 font-medium">Superaron el 80% mínimo</span>
        </div>

        <div className={`p-5 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#0B1528] border-amber-900/40 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase">Sincronizados en Drive</span>
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
            {syncedDocNumbers.length} / {cohort.length}
          </p>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">
            {spreadsheetId ? "Hoja Activa en Drive" : "Pendiente Vincular"}
          </span>
        </div>
      </div>

      {/* Cohort Table */}
      <div className={`rounded-3xl border overflow-hidden transition-colors ${
        isDarkMode ? 'bg-[#0B1528] border-blue-900/40 shadow-xl' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className={`p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDarkMode ? 'border-blue-900/30 bg-[#081020]' : 'border-slate-100 bg-white'
        }`}>
          <div>
            <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Listado de Aprendices Evaluados en Ficha {currentLearner.fichaNumber}
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-blue-200/60' : 'text-slate-500'}`}>
              Haz clic en "Guardar en Drive" para sincronizar registros individuales o utiliza la sincronización general arriba.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por aprendiz..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-8 pr-3 py-1.5 text-xs rounded-xl border outline-hidden w-44 sm:w-56 transition-colors ${
                  isDarkMode 
                    ? 'bg-[#0E1A33] border-blue-900/60 text-slate-100 focus:border-[#39A900]' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#39A900]'
                }`}
              />
            </div>

            <div className={`flex p-0.5 rounded-xl text-xs font-medium ${
              isDarkMode ? 'bg-[#080E1C]' : 'bg-slate-100'
            }`}>
              {(['todos', 'certificados', 'pendientes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    filter === tab 
                      ? (isDarkMode ? 'bg-blue-900/80 font-bold text-white shadow-xs' : 'bg-white font-bold text-slate-900 shadow-xs') 
                      : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`font-bold uppercase tracking-wider border-b ${
              isDarkMode 
                ? 'bg-[#080E1C] text-blue-300/70 border-blue-900/30' 
                : 'bg-slate-50 text-slate-500 border-slate-100'
            }`}>
              <tr>
                <th className="py-3 px-4">Aprendiz</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Estado Inducción</th>
                <th className="py-3 px-4">Puntaje</th>
                <th className="py-3 px-4">Google Drive</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-blue-950 text-slate-200' : 'divide-slate-100 text-slate-800'
            }`}>
              {filteredCohort.map((learner) => {
                const isSynced = syncedDocNumbers.includes(learner.docNumber) || 
                  (typeof window !== 'undefined' && localStorage.getItem(`sena_drive_saved_${learner.docNumber}`) === 'true');
                return (
                  <tr 
                    key={learner.id} 
                    className={
                      learner.isCurrentUser 
                        ? (isDarkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/40') 
                        : (isDarkMode ? 'hover:bg-blue-950/30' : 'hover:bg-slate-50/50')
                    }
                  >
                    <td className="py-3.5 px-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{learner.name}</span>
                        {learner.isCurrentUser && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-black px-1.5 py-0.5 rounded uppercase">
                            Tú (Activo)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] opacity-60 font-normal">{learner.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] opacity-80">{learner.doc}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        learner.status === 'Certificado'
                          ? (isDarkMode ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800')
                          : learner.status === 'En Proceso'
                          ? (isDarkMode ? 'bg-blue-950/80 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800')
                          : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')
                      }`}>
                        {learner.status === 'Certificado' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {learner.status === 'En Proceso' && <Clock className="w-3 h-3 text-blue-500" />}
                        {learner.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">{learner.score}</td>
                    <td className="py-3.5 px-4">
                      {isSynced ? (
                        spreadsheetUrl ? (
                          <a
                            href={spreadsheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#39A900] hover:text-[#2d8500] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 hover:underline"
                            title="Abrir hoja de cálculo oficial en Google Drive"
                          >
                            <Check className="w-3 h-3 text-[#39A900]" />
                            <span>Guardado en Sheets</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#39A900] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>Guardado en Sheets</span>
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>Sin sincronizar</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {learner.status === 'Certificado' && learner.isCurrentUser && (
                          <button
                            onClick={onViewStudentCertificate}
                            className="text-xs font-bold text-[#39A900] hover:text-[#2d8500] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Certificado</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenSyncSingleModal(learner)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                            isSynced
                              ? (isDarkMode ? 'border-blue-900 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-100')
                              : 'border-[#39A900]/40 text-[#39A900] hover:bg-[#39A900]/10'
                          }`}
                          title={isSynced ? "Volver a registrar en Google Sheets" : "Guardar en Google Sheets"}
                        >
                          <UploadCloud className="w-3 h-3" />
                          <span>{isSynced ? "Re-guardar" : "Guardar"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Google Drive & Google Sheets Operations */}
      <GoogleDriveSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onConfirmSync={handleConfirmSync}
        recordsToSync={modalRecords}
        isSyncing={isSyncing}
        spreadsheetUrl={spreadsheetUrl}
        userEmail={googleUser?.email || null}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
