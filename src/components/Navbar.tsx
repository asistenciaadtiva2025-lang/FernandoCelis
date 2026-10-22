import { 
  Award, 
  Volume2, 
  VolumeX, 
  User, 
  MapPin, 
  BookOpen, 
  FileCheck2, 
  GraduationCap, 
  SlidersHorizontal,
  Flame,
  Scale,
  Sun,
  Moon,
  ShieldCheck,
  Eye,
  LogOut,
  Lock
} from 'lucide-react';
import { SenaLogo } from './SenaLogo';
import { LearnerProfile, Badge } from '../data/senaData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  learner: LearnerProfile;
  onEditProfile: () => void;
  xp: number;
  streak: number;
  badges: Badge[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  isInstructorView: boolean;
  setIsInstructorView: (val: boolean) => void;
  hasCertificate: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  userRole?: 'aprendiz' | 'instructor';
  onRequestInstructorAccess?: () => void;
  onSwitchToLearnerView?: () => void;
  onLogoutInstructor?: () => void;
  onOpenRoleLanding?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  learner,
  onEditProfile,
  xp,
  streak,
  badges,
  soundEnabled,
  onToggleSound,
  isInstructorView,
  setIsInstructorView,
  hasCertificate,
  isDarkMode,
  onToggleDarkMode,
  userRole = 'aprendiz',
  onRequestInstructorAccess,
  onSwitchToLearnerView,
  onLogoutInstructor,
  onOpenRoleLanding
}: NavbarProps) {
  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#060D1E]/95 border-b border-blue-900/40 shadow-lg shadow-blue-950/40 text-slate-100' 
        : 'bg-white/95 border-b border-slate-200/80 shadow-xs text-slate-800'
    }`}>
      {/* Top micro bar with Colombian SENA official identity */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#39A900] text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold tracking-wide">SENA COLOMBIA</span>
            <span className="text-emerald-200">|</span>
            <span className="text-emerald-100 hidden sm:inline">Reglamento del Aprendiz Actualizado - Acuerdo 009 de 2024</span>
            <span className="text-emerald-100 sm:hidden">Acuerdo 009 de 2024</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-emerald-100 hidden md:inline">
              Regional {learner.regional} • Ficha {learner.fichaNumber}
            </span>

            {/* Quick button to open role landing page / change role */}
            {onOpenRoleLanding && (
              <button
                onClick={onOpenRoleLanding}
                className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-black/25 hover:bg-black/40 text-white transition-colors flex items-center gap-1 cursor-pointer border border-white/20"
                title="Cambiar entre modo Aprendiz e Instructor"
              >
                <span>⇄ Cambiar Rol</span>
              </button>
            )}

            {userRole === 'instructor' ? (
              <div className="flex items-center gap-2">
                <span className="bg-blue-900/90 text-blue-100 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-400/40 shadow-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Modo Instructor Activo</span>
                </span>
                {onSwitchToLearnerView && (
                  <button
                    onClick={onSwitchToLearnerView}
                    className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Previsualizar como Aprendiz"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Vista Aprendiz</span>
                  </button>
                )}
                {onLogoutInstructor && (
                  <button
                    onClick={onLogoutInstructor}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Cerrar sesión de Instructor"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-emerald-950/60 text-emerald-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  Perfil Aprendiz
                </span>
                <button
                  onClick={onRequestInstructorAccess}
                  className="bg-blue-900/90 hover:bg-blue-800 text-blue-100 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-400/50 flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                  title="Ingresar al Panel de Instructor con clave Sena1234"
                >
                  <Lock className="w-3 h-3 text-amber-300" />
                  <span>¿Eres Instructor? (Sena1234)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-18 py-1 gap-3">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('ruta')}>
            <SenaLogo className="w-[60px] h-[60px] drop-shadow-sm flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Inducción<span className="text-[#39A900]">SENA</span>
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  isDarkMode ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  2024
                </span>
              </div>
              <p className={`text-xs font-medium hidden sm:block ${isDarkMode ? 'text-blue-300/70' : 'text-slate-500'}`}>
                Formación Profesional Integral & Convivencia
              </p>
            </div>
          </div>

          {/* Gamification Stats and User Pill */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* XP Points Pill */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs ${
              isDarkMode 
                ? 'bg-amber-950/60 border border-amber-600/40 text-amber-300' 
                : 'bg-amber-50 border border-amber-200 text-amber-900'
            }`}>
              <span className="text-amber-500">⚡</span>
              <span>{xp}</span>
              <span className={`text-[10px] font-medium uppercase ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>XP</span>
            </div>

            {/* Streak Counter */}
            {streak > 0 && (
              <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isDarkMode 
                  ? 'bg-orange-950/60 border border-orange-600/40 text-orange-300' 
                  : 'bg-orange-50 border border-orange-200 text-orange-700'
              }`}>
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
                <span>{streak} Racha</span>
              </div>
            )}

            {/* Badges Count */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/50' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
              onClick={() => setActiveTab('ruta')}
              title={`${unlockedBadgesCount} de ${badges.length} insignias desbloqueadas`}
            >
              <Award className="w-3.5 h-3.5 text-[#39A900]" />
              <span>{unlockedBadgesCount}/{badges.length}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                soundEnabled 
                  ? isDarkMode 
                    ? 'bg-slate-900 text-emerald-400 border-slate-700 hover:bg-slate-800' 
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' 
                  : isDarkMode
                    ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                    : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-600'
              }`}
              title={soundEnabled ? "Silenciar efectos de sonido" : "Activar efectos de sonido"}
              aria-label="Alternar sonido"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark Mode Toggle Button (Top Right Icon) */}
            <button
              onClick={onToggleDarkMode}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-blue-950/90 text-amber-300 border-blue-500/60 shadow-lg shadow-blue-500/25 hover:bg-blue-900 hover:text-amber-200 hover:scale-105' 
                  : 'bg-slate-100 text-blue-700 border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:scale-105'
              }`}
              title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro con Efecto Blur"}
              aria-label="Alternar Modo Oscuro"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.7)]" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 drop-shadow-[0_0_6px_rgba(37,99,235,0.4)]" />
              )}
            </button>

            {/* User Profile Button */}
            <button
              onClick={onEditProfile}
              className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border transition-all text-xs font-medium cursor-pointer ${
                isDarkMode 
                  ? 'border-blue-900/60 bg-blue-950/40 hover:bg-blue-900/60 text-slate-200' 
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
              title="Personalizar mis datos para el certificado"
            >
              <div className="w-6 h-6 rounded-full bg-[#39A900] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {learner.fullName.charAt(0) || "A"}
              </div>
              <span className="hidden md:inline max-w-[120px] truncate">{learner.fullName.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <nav className={`flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t scrollbar-none text-xs sm:text-sm font-medium ${
          isDarkMode ? 'border-blue-900/30' : 'border-slate-100'
        }`}>
          <button
            onClick={() => { setActiveTab('ruta'); setIsInstructorView(false); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'ruta' && !isInstructorView
                ? 'bg-[#39A900] text-white font-semibold shadow-xs'
                : isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-blue-950/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Ruta de Inducción</span>
          </button>

          <button
            onClick={() => { setActiveTab('reglamento'); setIsInstructorView(false); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'reglamento' && !isInstructorView
                ? 'bg-[#39A900] text-white font-semibold shadow-xs'
                : isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-blue-950/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Reglamento Interactivo</span>
          </button>

          <button
            onClick={() => { setActiveTab('casos'); setIsInstructorView(false); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'casos' && !isInstructorView
                ? 'bg-[#39A900] text-white font-semibold shadow-xs'
                : isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-blue-950/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Simulador de Casos</span>
          </button>

          <button
            onClick={() => { setActiveTab('evaluacion'); setIsInstructorView(false); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'evaluacion' && !isInstructorView
                ? 'bg-[#39A900] text-white font-semibold shadow-xs'
                : isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-blue-950/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Evaluación Oficial</span>
          </button>

          <button
            onClick={() => { setActiveTab('certificado'); setIsInstructorView(false); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 relative ${
              activeTab === 'certificado' && !isInstructorView
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : hasCertificate
                ? isDarkMode
                  ? 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 font-semibold border border-amber-600/40'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold border border-amber-200'
                : isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-blue-950/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Mi Certificado</span>
            {hasCertificate && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            )}
          </button>

          {userRole === 'instructor' ? (
            <button
              onClick={() => {
                setActiveTab('instructor');
                setIsInstructorView(true);
              }}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ml-auto font-bold text-xs sm:text-sm cursor-pointer shadow-xs ${
                activeTab === 'instructor'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/60'
                  : isDarkMode
                  ? 'bg-blue-950/70 text-blue-200 hover:bg-blue-900 border border-blue-700/60'
                  : 'bg-blue-100/80 text-blue-900 hover:bg-blue-200 border border-blue-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Panel Instructor & Drive</span>
            </button>
          ) : (
            <button
              onClick={onRequestInstructorAccess}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ml-auto font-bold text-xs sm:text-sm cursor-pointer shadow-xs border ${
                isDarkMode
                  ? 'bg-blue-950/40 border-blue-800/60 text-blue-300 hover:bg-blue-900/60 hover:text-white'
                  : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
              }`}
              title="Acceso protegido para instructores con PIN (1234)"
            >
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              <span>Modo Instructor</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
