import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  BookOpen, 
  FileSpreadsheet, 
  Award, 
  Users,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  FileText,
  X
} from 'lucide-react';
import { SenaLogo } from './SenaLogo';
import { VideoTutorialModal } from './VideoTutorialModal';
import { LearnerProfile, SENA_REGIONALES, SENA_CENTROS_EJEMPLO } from '../data/senaData';
import { googleSignIn } from '../services/googleAuth';
import { playSound } from '../utils/audio';

interface RoleLandingPageProps {
  currentLearner: LearnerProfile;
  onSelectAprendiz: (profile: LearnerProfile) => void;
  onSelectInstructor: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const AUTHORIZED_INSTRUCTOR_PASSWORDS = ['Sena1234', 'sena1234', 'SENA1234', '1234', 'SENA2024', 'sena2024'];

export function RoleLandingPage({
  currentLearner,
  onSelectAprendiz,
  onSelectInstructor,
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
}: RoleLandingPageProps) {
  // Learner Characterization Form State
  const [formData, setFormData] = useState<LearnerProfile>({ ...currentLearner });
  const [learnerFormSubmitted, setLearnerFormSubmitted] = useState(false);
  const [learnerError, setLearnerError] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Instructor Password State
  const [instructorPassword, setInstructorPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [instructorError, setInstructorError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Active view toggle on small mobile screens
  const [mobileTab, setMobileTab] = useState<'aprendiz' | 'instructor'>('aprendiz');

  const handleAprendizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLearnerError(null);

    if (!formData.fullName.trim()) {
      setLearnerError('Por favor ingrese el nombre completo del aprendiz.');
      return;
    }
    if (!formData.docNumber.trim()) {
      setLearnerError('Por favor ingrese el número de documento.');
      return;
    }
    if (!formData.fichaNumber.trim()) {
      setLearnerError('Por favor ingrese el número de ficha.');
      return;
    }

    playSound('correct', soundEnabled);
    onSelectAprendiz(formData);
  };

  const handleInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInstructorError(null);

    const trimmed = instructorPassword.trim();
    if (!trimmed) {
      setInstructorError('Por favor ingrese la clave de instructor (Sena1234).');
      return;
    }

    if (AUTHORIZED_INSTRUCTOR_PASSWORDS.includes(trimmed)) {
      playSound('correct', soundEnabled);
      onSelectInstructor();
    } else {
      playSound('wrong', soundEnabled);
      setInstructorError('Clave incorrecta. La clave asignada para instructores es: Sena1234');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setInstructorError(null);
      const res = await googleSignIn();
      if (res?.user) {
        playSound('correct', soundEnabled);
        localStorage.setItem('sena_instructor_auth', 'true');
        localStorage.setItem('sena_instructor_email', res.user.email || '');
        onSelectInstructor();
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setInstructorError(err.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const loadExampleData = () => {
    setFormData({
      fullName: "Juan David Gómez Montoya",
      docType: "CC",
      docNumber: "1036985412",
      regional: "Antioquia",
      centerName: "Centro de Tecnología de la Manufactura Avanzada",
      programName: "Tecnólogo en Análisis y Desarrollo de Software (ADSO)",
      fichaNumber: "2894512",
      email: "jdgomez@soy.sena.edu.co"
    });
    setLearnerError(null);
    playSound('click', soundEnabled);
  };

  const inputClass = isDarkMode
    ? "w-full px-3.5 py-2.5 rounded-xl border border-blue-900/60 bg-[#0c162e] text-slate-100 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-500"
    : "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:border-[#39A900] focus:ring-2 focus:ring-[#39A900]/20 transition-all placeholder:text-slate-400";

  const labelClass = isDarkMode
    ? "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
    : "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${
      isDarkMode 
        ? 'dark-blur-screen-effect text-slate-100' 
        : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Top Bar with Institutional Identity & Settings */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#39A900] text-white py-1.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-black tracking-wider">SENA COLOMBIA</span>
            <span className="text-emerald-200">|</span>
            <span className="text-emerald-100 font-medium">Acuerdo No. 009 de 2024 — Reglamento del Aprendiz</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-1 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={soundEnabled ? "Silenciar sonidos" : "Activar sonidos"}
              aria-label="Alternar sonido"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-blue-950/80 text-amber-300 hover:bg-blue-900 border border-blue-400/50' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              aria-label="Alternar modo visual"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative z-10 pt-8 pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <SenaLogo className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border backdrop-blur-md shadow-xs bg-[#39A900]/10 border-[#39A900]/30 text-[#39A900] dark:bg-emerald-950/80 dark:border-emerald-500/40 dark:text-emerald-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Inducción Integral Institucional</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Bienvenido al Portal de Inducción SENA
        </h1>

        <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${
          isDarkMode ? 'text-blue-200/80' : 'text-slate-600'
        }`}>
          Selecciona tu rol para ingresar. Los <strong>aprendices</strong> ingresan directamente completando sus datos de caracterización sin clave, y los <strong>instructores</strong> acceden con su clave institucional asignada.
        </p>

        {/* Video Tutorial Button */}
        <button
          onClick={() => setIsVideoModalOpen(true)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-xs transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-[#39A900] flex items-center justify-center text-[10px]">▶</div>
          Ver Video Tutorial de Inducción
        </button>

        {/* Video Tutorial Modal with Playback Speed Controls */}
        <VideoTutorialModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl="https://drive.google.com/file/d/19_DcgumyNW0R8CJKVlGtveUF6tmSugzGfbVubh0sH2A/preview"
          driveWebUrl="https://docs.google.com/videos/d/19_DcgumyNW0R8CJKVlGtveUF6tmSugzGfbVubh0sH2A/play?usp=sharing"
          soundEnabled={soundEnabled}
        />

        {/* Mobile View Switcher */}
        <div className="mt-6 flex sm:hidden rounded-xl p-1 bg-slate-200 dark:bg-blue-950/60 max-w-xs mx-auto">
          <button
            onClick={() => setMobileTab('aprendiz')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'aprendiz'
                ? 'bg-[#39A900] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Aprendiz (Sin Clave)
          </button>
          <button
            onClick={() => setMobileTab('instructor')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'instructor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Instructor (Clave)
          </button>
        </div>
      </header>

      {/* Main Role Selection Area (Dual Columns on Desktop) */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* COLUMN 1: ROL APRENDIZ (Sin Clave - Caracterización de Datos)             */}
          {/* ========================================================================= */}
          <div className={`lg:col-span-7 rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden ${
            isVideoModalOpen ? 'hidden' : (mobileTab !== 'aprendiz' ? 'hidden sm:block' : '')
          } ${
            isDarkMode 
              ? 'bg-[#081226]/90 border-emerald-500/30 shadow-emerald-950/30 ring-1 ring-emerald-500/20' 
              : 'bg-white border-slate-200 shadow-slate-200/80 ring-1 ring-slate-100'
          }`}>
            {/* Header Card Aprendiz */}
            <div className="p-6 bg-gradient-to-r from-[#1B5E20] via-[#247000] to-[#39A900] text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                    <span>Acceso Directo • Sin Clave</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-emerald-200 shrink-0" />
                    <span>Ingresar como Aprendiz</span>
                  </h2>
                  <p className="text-xs text-emerald-100 leading-relaxed max-w-lg">
                    Diligencia o verifica tus datos de caracterización para personalizar tu ruta, trivias, retos interactivos y expedir tu Certificado Oficial de Inducción.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de Caracterización Aprendiz */}
            <form onSubmit={handleAprendizSubmit} className="p-6 sm:p-7 space-y-4">
              {learnerError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{learnerError}</span>
                </div>
              )}

              {/* Nombre Completo */}
              <div>
                <label className={labelClass}>
                  Nombre Completo del Aprendiz *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={inputClass}
                  placeholder="Ej: Laura Camila Rodríguez Sánchez"
                />
              </div>

              {/* Tipo y Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>
                    Tipo Doc. *
                  </label>
                  <select
                    value={formData.docType}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="CC">Cédula de Ciudadanía (C.C.)</option>
                    <option value="TI">Tarjeta de Identidad (T.I.)</option>
                    <option value="CE">Cédula de Extranjería (C.E.)</option>
                    <option value="PPT">Permiso Protección Temporal (PPT)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.docNumber}
                    onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                    className={inputClass}
                    placeholder="Ej: 1020304050"
                  />
                </div>
              </div>

              {/* Regional y Ficha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Regional SENA *
                  </label>
                  <select
                    value={formData.regional}
                    onChange={(e) => setFormData({ ...formData, regional: e.target.value })}
                    className={inputClass}
                  >
                    {SENA_REGIONALES.map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Número de Ficha *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fichaNumber}
                    onChange={(e) => setFormData({ ...formData, fichaNumber: e.target.value })}
                    className={inputClass}
                    placeholder="Ej: 2894512"
                  />
                </div>
              </div>

              {/* Programa de Formación */}
              <div>
                <label className={labelClass}>
                  Programa de Formación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  className={inputClass}
                  placeholder="Ej: Tecnólogo en Análisis y Desarrollo de Software (ADSO)"
                />
              </div>

              {/* Centro de Formación */}
              <div>
                <label className={labelClass}>
                  Centro de Formación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.centerName}
                  onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                  list="centros-list-landing"
                  className={inputClass}
                  placeholder="Ej: Centro de Tecnología de la Manufactura Avanzada"
                />
                <datalist id="centros-list-landing">
                  {SENA_CENTROS_EJEMPLO.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className={labelClass}>
                  Correo Institucional o Personal *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                  placeholder="Ej: aprendiz@soy.sena.edu.co"
                />
              </div>

              {/* Quick Preset + Submit */}
              <div className="pt-3 border-t border-slate-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={loadExampleData}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cargar datos de ejemplo</span>
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#39A900] hover:bg-[#2d8500] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Iniciar Inducción de Aprendiz</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* ========================================================================= */}
          {/* COLUMN 2: ROL INSTRUCTOR / COORDINADOR (Requiere Clave Sena1234)         */}
          {/* ========================================================================= */}
          <div className={`lg:col-span-5 rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden flex flex-col ${
            isVideoModalOpen ? 'hidden' : (mobileTab !== 'instructor' ? 'hidden sm:flex' : 'flex')
          } ${
            isDarkMode 
              ? 'bg-[#0A1224]/90 border-blue-600/30 shadow-blue-950/40 ring-1 ring-blue-500/20' 
              : 'bg-white border-blue-200 shadow-blue-900/10 ring-1 ring-blue-100'
          }`}>
            {/* Header Card Instructor */}
            <div className="p-6 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Lock className="w-3 h-3 text-amber-300" />
                  <span>Requiere Clave de Acceso</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
                  <span>Ingresar como Instructor</span>
                </h2>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  Panel reservado para docentes, coordinadores y administradores de la inducción SENA.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
              {/* Feature Highlights for Instructor */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-blue-200">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <span>Sincronización desatendida automática con Google Drive / Sheets</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-blue-200">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>Monitoreo de notas, porcentaje de aprobación y fichas activas</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-blue-200">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span>Generador de actas disciplinarias según Acuerdo 009 de 2024</span>
                </div>
              </div>

              {/* Password Form */}
              <form onSubmit={handleInstructorSubmit} className="space-y-4 pt-4 border-t border-slate-200 dark:border-blue-900/40">
                {instructorError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{instructorError}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelClass}>
                      Clave de Instructor *
                    </label>
                    <button
                      type="button"
                      onClick={() => setInstructorPassword('Sena1234')}
                      className="text-[11px] font-bold text-[#39A900] dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Autocompletar clave
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={instructorPassword}
                      onChange={(e) => setInstructorPassword(e.target.value)}
                      placeholder="Ingrese su clave de acceso"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-mono tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-[#0E1A33] border-blue-900/60 text-white placeholder-slate-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-blue-300/70">
                    Acceso institucional protegido para docentes y coordinadores.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Ingresar al Panel de Instructor</span>
                </button>
              </form>

              {/* Google Alternative Login */}
              <div className="pt-4 border-t border-slate-200 dark:border-blue-900/40 text-center space-y-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  O inicia sesión con tu cuenta Google institucional:
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'border-blue-800/80 bg-blue-950/60 text-blue-200 hover:bg-blue-900' 
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isGoogleLoading ? 'Autenticando...' : 'Acceder con Google Workspace'}</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Institutional Footer */}
      <footer className={`mt-auto py-5 border-t text-xs transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-[#060D1E] border-blue-900/40 text-blue-300/60' 
          : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#39A900] dark:text-emerald-400">SENA COLOMBIA</span>
            <span>•</span>
            <span>Servicio Nacional de Aprendizaje — Dirección General</span>
          </div>
          <p className="text-[11px] opacity-75">
            Reglamento del Aprendiz según Resolución y Acuerdo 009 de 2024.
          </p>
        </div>
      </footer>
    </div>
  );
}
