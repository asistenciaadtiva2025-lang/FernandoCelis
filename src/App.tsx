import { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  LearnerModal 
} from './components/LearnerModal';
import { 
  InductionPath 
} from './components/InductionPath';
import { 
  RegulationExplorer 
} from './components/RegulationExplorer';
import { 
  DilemmasSimulator 
} from './components/DilemmasSimulator';
import { 
  QuizCertification 
} from './components/QuizCertification';
import { 
  CertificateView 
} from './components/CertificateView';
import { 
  InstructorDashboard 
} from './components/InstructorDashboard';
import { 
  LearnerProfile, 
  Badge, 
  INITIAL_BADGES, 
  SENA_REGULATION_INFO 
} from './data/senaData';
import { playSound } from './utils/audio';
import { getAccessToken, initAuth } from './services/googleAuth';
import { autoSyncLearnerToDrive, LearnerSheetRecord } from './services/googleSheetsService';
import { InstructorAccessModal } from './components/InstructorAccessModal';
import { RoleLandingPage } from './components/RoleLandingPage';
import { CheckCircle2, ExternalLink, X, Lock, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'sena_induccion_app_v1';

export default function App() {
  // Show Landing Page for Role Selection on startup or when explicitly requested
  const [showLandingPage, setShowLandingPage] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // Skip landing page only if direct parameter is true
      if (params.get('direct') === 'true') return false;
      const sessionRoleSelected = sessionStorage.getItem('sena_session_role_selected');
      if (sessionRoleSelected === 'true') return false;
    }
    return true; // Default to landing page to avoid role confusion
  });

  // Role Management: 'aprendiz' | 'instructor'
  const [userRole, setUserRole] = useState<'aprendiz' | 'instructor'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rolParam = params.get('rol');
      if (rolParam === 'aprendiz') return 'aprendiz';
      if (rolParam === 'instructor') return 'instructor';
      const saved = localStorage.getItem('sena_user_role');
      if (saved === 'instructor') return 'instructor';
    }
    return 'aprendiz';
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('rol') === 'instructor') return 'instructor';
      const saved = localStorage.getItem('sena_user_role');
      if (saved === 'instructor') return 'instructor';
    }
    return 'ruta';
  });

  const [isInstructorView, setIsInstructorView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('rol') === 'instructor') return true;
      const saved = localStorage.getItem('sena_user_role');
      if (saved === 'instructor') return true;
    }
    return false;
  });

  const [isLearnerModalOpen, setIsLearnerModalOpen] = useState<boolean>(false);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Dark Mode State with Blue Ambient Glow
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_darkMode`);
    if (saved !== null) return saved === 'true';
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  // Apprentice Profile
  const [learner, setLearner] = useState<LearnerProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_learner`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      fullName: "Juan David Gómez Montoya",
      docType: "CC",
      docNumber: "1036985412",
      regional: "Antioquia",
      centerName: "Centro de Tecnología de la Manufactura Avanzada",
      programName: "Tecnólogo en Análisis y Desarrollo de Software (ADSO)",
      fichaNumber: "2894512",
      email: "jdgomez@soy.sena.edu.co",
      avatarId: "spiderman"
    };
  });

  // Gamification State
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_xp`);
    return saved ? parseInt(saved, 10) : 150;
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_streak`);
    return saved ? parseInt(saved, 10) : 3;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_badges`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_BADGES;
  });

  // Certificate State
  const [hasCertificate, setHasCertificate] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_hasCert`) === 'true';
  });

  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_score`);
    return saved ? parseInt(saved, 10) : 90;
  });

  const [completedAt, setCompletedAt] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_completedAt`) || new Date().toISOString().split('T')[0];
  });

  const [certificateId, setCertificateId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_certId`);
    if (saved) return saved;
    return `SENA-2024-REG-${learner.docNumber}-A009`;
  });

  // Automated Google Drive Sync Toast State
  const [syncToast, setSyncToast] = useState<{
    show: boolean;
    message: string;
    sheetUrl?: string;
  } | null>(null);

  // Initialize Auth Listener in Background
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, []);

  // Auto-dismiss sync toast after 7 seconds
  useEffect(() => {
    if (syncToast?.show) {
      const timer = setTimeout(() => {
        setSyncToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [syncToast]);

  // Save changes to localStorage & update DOM
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_learner`, JSON.stringify(learner));
    localStorage.setItem(`${STORAGE_KEY}_xp`, xp.toString());
    localStorage.setItem(`${STORAGE_KEY}_streak`, streak.toString());
    localStorage.setItem(`${STORAGE_KEY}_badges`, JSON.stringify(badges));
    localStorage.setItem(`${STORAGE_KEY}_hasCert`, hasCertificate ? 'true' : 'false');
    localStorage.setItem(`${STORAGE_KEY}_score`, score.toString());
    localStorage.setItem(`${STORAGE_KEY}_completedAt`, completedAt);
    localStorage.setItem(`${STORAGE_KEY}_certId`, certificateId);
    localStorage.setItem(`${STORAGE_KEY}_darkMode`, isDarkMode ? 'true' : 'false');

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [learner, xp, streak, badges, hasCertificate, score, completedAt, certificateId, isDarkMode]);

  // Check URL params for role on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rolParam = params.get('rol');
      if (rolParam === 'instructor') {
        const isAuth = localStorage.getItem('sena_instructor_auth') === 'true';
        if (isAuth) {
          setUserRole('instructor');
          setIsInstructorView(true);
          setActiveTab('instructor');
        } else {
          setIsInstructorModalOpen(true);
        }
      } else if (rolParam === 'aprendiz') {
        setUserRole('aprendiz');
        setIsInstructorView(false);
        if (activeTab === 'instructor') setActiveTab('ruta');
      }
    }
  }, []);

  const handleSelectAprendizFromLanding = (profile: LearnerProfile) => {
    setLearner(profile);
    setCertificateId(`SENA-2024-REG-${profile.docNumber}-A009`);
    setUserRole('aprendiz');
    setIsInstructorView(false);
    setActiveTab('ruta');
    setShowLandingPage(false);
    sessionStorage.setItem('sena_session_role_selected', 'true');
    localStorage.setItem('sena_user_role', 'aprendiz');
    localStorage.setItem(`${STORAGE_KEY}_learner`, JSON.stringify(profile));
  };

  const handleSelectInstructorFromLanding = () => {
    localStorage.setItem('sena_instructor_auth', 'true');
    localStorage.setItem('sena_user_role', 'instructor');
    sessionStorage.setItem('sena_session_role_selected', 'true');
    setUserRole('instructor');
    setIsInstructorView(true);
    setActiveTab('instructor');
    setShowLandingPage(false);
  };

  const handleOpenRoleLanding = () => {
    setShowLandingPage(true);
    playSound('click', soundEnabled);
  };

  const handleEnterInstructorMode = () => {
    localStorage.setItem('sena_instructor_auth', 'true');
    localStorage.setItem('sena_user_role', 'instructor');
    setUserRole('instructor');
    setIsInstructorView(true);
    setActiveTab('instructor');
    setIsInstructorModalOpen(false);
    playSound('correct', soundEnabled);
  };

  const handleExitInstructorMode = () => {
    setIsInstructorView(false);
    setActiveTab('ruta');
    playSound('click', soundEnabled);
  };

  const handleLogoutInstructor = () => {
    localStorage.removeItem('sena_instructor_auth');
    localStorage.setItem('sena_user_role', 'aprendiz');
    setUserRole('aprendiz');
    setIsInstructorView(false);
    setActiveTab('ruta');
    setShowLandingPage(true);
    sessionStorage.removeItem('sena_session_role_selected');
    playSound('click', soundEnabled);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    playSound('click', soundEnabled);
  };

  const addXp = (amount: number, reason: string) => {
    setXp(prev => prev + amount);
    setStreak(prev => prev + 1);
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev =>
      prev.map(b => (b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b))
    );
  };

  const handlePassEvaluation = (obtainedScore: number) => {
    setScore(obtainedScore);
    setHasCertificate(true);
    const dateStr = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCompletedAt(dateStr);
    const newId = `SENA-2024-REG-${learner.docNumber}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCertificateId(newId);
    setActiveTab('certificado');

    // Build the Learner Sheet Record for Google Drive
    const record: LearnerSheetRecord = {
      timestamp: new Date().toLocaleString('es-CO'),
      fullName: learner.fullName,
      docType: learner.docType,
      docNumber: learner.docNumber,
      regional: learner.regional,
      centerName: learner.centerName,
      programName: learner.programName,
      fichaNumber: learner.fichaNumber,
      score: `${obtainedScore}%`,
      status: "Certificado Aprobado",
      certificateId: newId,
      xp: xp + 200,
      badgesEarned: "Inducción Completa (Acuerdo 009 de 2024)",
      email: learner.email || "aprendiz@soy.sena.edu.co"
    };

    // 100% Automated Background Sync to Google Drive / Sheets
    getAccessToken().then(async (token) => {
      try {
        const res = await autoSyncLearnerToDrive(token, record);
        if (res.success) {
          setSyncToast({
            show: true,
            message: res.queued 
              ? "Registro de inducción guardado localmente (se sincronizará automáticamente con Google Drive)"
              : "✓ Registro de inducción guardado automáticamente en Google Drive",
            sheetUrl: res.spreadsheetUrl
          });
        }
      } catch (syncErr) {
        console.warn("Automated sync notification caught:", syncErr);
      }
    });
  };

  const handleSaveLearnerProfile = (updated: LearnerProfile) => {
    setLearner(updated);
    setCertificateId(`SENA-2024-REG-${updated.docNumber}-A009`);
    playSound('correct', soundEnabled);
  };

  // Dedicated Landing Page for Role Selection (Learner vs Instructor)
  if (showLandingPage) {
    return (
      <RoleLandingPage
        currentLearner={learner}
        onSelectAprendiz={handleSelectAprendizFromLanding}
        onSelectInstructor={handleSelectInstructorFromLanding}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    );
  }

  return (
    <div className={`min-h-screen relative flex flex-col font-sans selection:bg-[#39A900] selection:text-white transition-colors duration-500 overflow-x-hidden ${
      isDarkMode 
        ? 'dark-blur-screen-effect text-slate-100' 
        : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Frosted Glass Screen Blur Effect for Dark Mode */}
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden no-print">
          {/* Ambient Glow Orb 1 (Emerald/Cyan blur) */}
          <div className="absolute -top-36 -right-36 w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[130px] animate-blur-orb-1" />
          
          {/* Ambient Glow Orb 2 (Royal Blue/Indigo blur) */}
          <div className="absolute top-1/3 -left-36 w-[620px] h-[620px] rounded-full bg-blue-600/25 blur-[150px] animate-blur-orb-2" />
          
          {/* Ambient Glow Orb 3 (Violet/Sky blur) */}
          <div className="absolute -bottom-36 right-1/4 w-[650px] h-[650px] rounded-full bg-indigo-600/20 blur-[140px] animate-blur-orb-3" />
          
          {/* Global Frosted Glass Surface Blur Diffuser */}
          <div className="absolute inset-0 backdrop-blur-[45px] pointer-events-none" />

          {/* Vignette for Contrast & Focus */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(4,9,20,0.6)_100%)] pointer-events-none" />
        </div>
      )}

      {/* Navbar with full status and controls (Top-Right Dark Mode Toggle) */}
      <div className="relative z-40">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          learner={learner}
          onEditProfile={() => setIsLearnerModalOpen(true)}
          xp={xp}
          streak={streak}
          badges={badges}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          isInstructorView={isInstructorView}
          setIsInstructorView={(val) => {
            setIsInstructorView(val);
            if (val) setActiveTab('instructor');
            else if (activeTab === 'instructor') setActiveTab('ruta');
          }}
          hasCertificate={hasCertificate}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          userRole={userRole}
          onRequestInstructorAccess={() => setIsInstructorModalOpen(true)}
          onSwitchToLearnerView={handleExitInstructorMode}
          onLogoutInstructor={handleLogoutInstructor}
          onOpenRoleLanding={handleOpenRoleLanding}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* View Router */}
        {activeTab === 'ruta' && (
          <InductionPath
            learner={learner}
            badges={badges}
            xp={xp}
            onAddXp={addXp}
            onUnlockBadge={unlockBadge}
            soundEnabled={soundEnabled}
            onGoToEvaluation={() => setActiveTab('evaluacion')}
            onGoToCases={() => setActiveTab('casos')}
            onGoToRegulation={() => setActiveTab('reglamento')}
            hasCertificate={hasCertificate}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'reglamento' && (
          <RegulationExplorer isDarkMode={isDarkMode} />
        )}

        {activeTab === 'casos' && (
          <DilemmasSimulator
            onAddXp={addXp}
            onUnlockBadge={unlockBadge}
            soundEnabled={soundEnabled}
            onProceedToQuiz={() => setActiveTab('evaluacion')}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'evaluacion' && (
          <QuizCertification
            learner={learner}
            soundEnabled={soundEnabled}
            onAddXp={addXp}
            onUnlockBadge={unlockBadge}
            onPassEvaluation={handlePassEvaluation}
            onReviewRegulations={() => setActiveTab('reglamento')}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'certificado' && (
          hasCertificate ? (
            <CertificateView
              learner={learner}
              score={score}
              completedAt={completedAt}
              certificateId={certificateId}
              soundEnabled={soundEnabled}
              onRetakeQuiz={() => setActiveTab('evaluacion')}
              onGoToExplorer={() => setActiveTab('reglamento')}
              isDarkMode={isDarkMode}
              userRole={userRole}
            />
          ) : (
            <div className={`max-w-2xl mx-auto rounded-3xl p-8 text-center space-y-4 border transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-[#081022]/90 border-blue-900/40 shadow-xl shadow-blue-950/40 text-slate-100' 
                : 'bg-white border-slate-200 shadow-sm text-slate-800'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold ${
                isDarkMode ? 'bg-amber-950/60 text-amber-400 border border-amber-600/40' : 'bg-amber-50 text-amber-600'
              }`}>
                ⚠️
              </div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Certificado Aún No Desbloqueado
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-blue-200/70' : 'text-slate-600'}`}>
                Para obtener tu <strong>Certificado Oficial de Inducción al Reglamento del Aprendiz (Acuerdo 009 de 2024)</strong>, 
                debes presentar y aprobar la evaluación final con un puntaje mínimo del <strong>80%</strong>.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('evaluacion')}
                  className="px-6 py-2.5 bg-[#39A900] hover:bg-[#2d8500] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Presentar la Evaluación Ahora
                </button>
                <button
                  onClick={() => setActiveTab('ruta')}
                  className={`px-4 py-2.5 rounded-xl font-medium text-xs border transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'border-blue-900/60 hover:bg-slate-800 text-slate-200' 
                      : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Repasar Ruta de Inducción
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'instructor' && (
          <InstructorDashboard
            currentLearner={learner}
            hasCertificate={hasCertificate}
            score={score}
            certificateId={certificateId}
            completedAt={completedAt}
            onViewStudentCertificate={() => setActiveTab('certificado')}
            isDarkMode={isDarkMode}
            onSwitchToLearnerView={handleExitInstructorMode}
            onLogoutInstructor={handleLogoutInstructor}
          />
        )}
      </main>

      {/* Footer (Hidden during printing) */}
      <footer className={`no-print relative z-10 mt-auto border-t py-6 text-xs transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-[#060D1E]/95 border-blue-900/40 text-blue-300/60' 
          : 'bg-white border-slate-200/80 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-[#1B5E20]'}`}>SENA COLOMBIA</span>
            <span>•</span>
            <span>Reglamento del Aprendiz — Acuerdo No. 009 de 2024</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[11px] opacity-75 hidden md:block">
              Formación Profesional Integral gratuita, incluyente y con enfoque de derechos humanos.
            </p>
            <button
              onClick={handleOpenRoleLanding}
              className="text-[11px] font-bold text-slate-500 hover:text-[#39A900] dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Volver a la pantalla de selección de rol"
            >
              <span>⇄ Cambiar de Rol</span>
            </button>
            {userRole === 'aprendiz' && (
              <button
                onClick={() => setIsInstructorModalOpen(true)}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#39A900] dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Ingreso protegido para docentes e instructores con clave Sena1234"
              >
                <Lock className="w-3 h-3 text-[#39A900]" />
                <span>Acceso Instructor (Sena1234)</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Profile Edit Modal */}
      <LearnerModal
        isOpen={isLearnerModalOpen}
        onClose={() => setIsLearnerModalOpen(false)}
        learner={learner}
        onSave={handleSaveLearnerProfile}
        isDarkMode={isDarkMode}
      />

      {/* Instructor Protected Access Modal */}
      <InstructorAccessModal
        isOpen={isInstructorModalOpen}
        onClose={() => setIsInstructorModalOpen(false)}
        onSuccess={handleEnterInstructorMode}
        isDarkMode={isDarkMode}
        soundEnabled={soundEnabled}
      />

      {/* Discrete Automatic Sync Toast Notification */}
      {syncToast && syncToast.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md animate-in slide-in-from-bottom-5 duration-300 no-print">
          <div className={`p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start sm:items-center justify-between gap-3 ${
            isDarkMode 
              ? 'bg-[#060D1E]/95 border-emerald-500/50 text-slate-100 shadow-emerald-950/60 ring-1 ring-emerald-500/30' 
              : 'bg-white/95 border-emerald-500/40 text-slate-800 shadow-emerald-900/15'
          }`}>
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#39A900]/20 text-[#39A900] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <CheckCircle2 className="w-5 h-5 text-[#39A900]" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold leading-tight">{syncToast.message}</p>
                {syncToast.sheetUrl && (
                  <div className="pt-0.5">
                    <a
                      href={syncToast.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-[#39A900] hover:text-[#2d8500] dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
                    >
                      <span>Abrir Hoja de Cálculo en Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

