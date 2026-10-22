import { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  AlertTriangle, 
  Scale, 
  Award, 
  Check, 
  Lock, 
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import { 
  Badge, 
  SENA_RIGHTS, 
  SENA_DUTIES, 
  SENA_PROHIBITIONS, 
  SENA_CHAPTERS, 
  LearnerProfile 
} from '../data/senaData';
import { playSound } from '../utils/audio';

interface InductionPathProps {
  learner: LearnerProfile;
  badges: Badge[];
  xp: number;
  onAddXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  soundEnabled: boolean;
  onGoToEvaluation: () => void;
  onGoToCases: () => void;
  onGoToRegulation: () => void;
  hasCertificate: boolean;
  isDarkMode?: boolean;
}

export function InductionPath({
  learner,
  badges,
  xp,
  onAddXp,
  onUnlockBadge,
  soundEnabled,
  onGoToEvaluation,
  onGoToCases,
  onGoToRegulation,
  hasCertificate,
  isDarkMode = false
}: InductionPathProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [activeRightCategory, setActiveRightCategory] = useState<string>('Todos');

  const completeStep = (stepNumber: number, xpReward: number, badgeId?: string) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps(prev => [...prev, stepNumber]);
      onAddXp(xpReward, `Completado Nivel ${stepNumber}`);
      playSound('levelup', soundEnabled);
      if (badgeId) {
        onUnlockBadge(badgeId);
      }
    }
    // Advance to next stage if available
    if (stepNumber < 5) {
      setActiveStage(stepNumber + 1);
    }
  };

  const stages = [
    {
      id: 1,
      title: "Bienvenida & Acuerdo 009 de 2024",
      subtitle: "Naturaleza de la Formación Profesional Integral (FPI)",
      icon: BookOpen,
      color: "from-emerald-500 to-green-600",
      xp: 100,
      badgeId: "b-rights"
    },
    {
      id: 2,
      title: "Carta de Tus Derechos",
      subtitle: "Garantías formativas, bienestar y representación",
      icon: ShieldCheck,
      color: "from-blue-500 to-indigo-600",
      xp: 120,
      badgeId: "b-rights"
    },
    {
      id: 3,
      title: "Decálogo de Tus Deberes & SST",
      subtitle: "Asistencia, carné institucional, uso de EPP y respeto",
      icon: Award,
      color: "from-amber-500 to-orange-600",
      xp: 150,
      badgeId: "b-duties"
    },
    {
      id: 4,
      title: "Zona de Prohibiciones & Prevención",
      subtitle: "Cero tolerancia al acoso, plagio y faltas disciplinarias",
      icon: AlertTriangle,
      color: "from-rose-500 to-red-600",
      xp: 150
    },
    {
      id: 5,
      title: "Debido Proceso & Medidas Formativas",
      subtitle: "Comité de Evaluación, planes de mejora y descargos",
      icon: Scale,
      color: "from-purple-500 to-violet-600",
      xp: 180
    }
  ];

  const progressPercentage = Math.round((completedSteps.length / 5) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-[#143718] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#39A900]/30 border border-[#39A900]/50 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Inducción Oficial para Aprendices SENA</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hola, <span className="text-[#39A900]">{learner.fullName.split(' ')[0]}</span>. Prepárate para triunfar en el SENA.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            El <strong>Acuerdo 009 de 2024</strong> es tu carta de navegación. A través de este recorrido interactivo 
            comprenderás tus derechos, deberes y garantías, acumularás insignias y obtendrás tu 
            <strong> Certificado de Inducción</strong> al superar la evaluación.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Progreso Ruta</span>
              <p className="text-lg font-black text-white">{progressPercentage}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Experiencia (XP)</span>
              <p className="text-lg font-black text-amber-400">{xp} pts</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Ficha SENA</span>
              <p className="text-lg font-black text-emerald-300 truncate">{learner.fichaNumber}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Estado</span>
              <p className="text-lg font-black text-white">
                {hasCertificate ? "Certificado" : "En Inducción"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper Tabs */}
      <div className={`${
        isDarkMode 
          ? 'bg-[#081022]/90 border-blue-900/40 shadow-xl shadow-blue-950/30' 
          : 'bg-white border-slate-200 shadow-sm'
      } rounded-2xl p-4 sm:p-6 border transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-100' : 'text-slate-900'}`}>
            Etapas de la Inducción al Reglamento
          </h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isDarkMode ? 'text-emerald-300 bg-emerald-950/60 border-emerald-700/50' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}>
            Nivel {activeStage} de 5
          </span>
        </div>

        {/* Stepper buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {stages.map((stage) => {
            const isCompleted = completedSteps.includes(stage.id);
            const isActive = activeStage === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  setActiveStage(stage.id);
                  playSound('click', soundEnabled);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                  isActive
                    ? isDarkMode 
                      ? 'border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-500/30 shadow-xs' 
                      : 'border-[#39A900] bg-emerald-50/70 ring-2 ring-[#39A900]/20 shadow-xs'
                    : isCompleted
                    ? isDarkMode
                      ? 'border-blue-900/50 bg-[#0d1830] hover:bg-blue-950/70 text-slate-200'
                      : 'border-emerald-200 bg-white hover:bg-slate-50'
                    : isDarkMode
                    ? 'border-blue-950/60 bg-[#070D1B]/60 hover:bg-slate-900 text-slate-400'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg text-white ${
                    isActive ? 'bg-[#39A900]' : isCompleted ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#39A900]" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Paso {stage.id}</span>
                  )}
                </div>
                <h4 className={`text-xs font-bold line-clamp-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stage.title}</h4>
                <p className={`text-[10px] line-clamp-1 mt-0.5 ${isDarkMode ? 'text-blue-300/60' : 'text-slate-500'}`}>{stage.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Active Stage Content Panel */}
      <div className={`${
        isDarkMode 
          ? 'bg-[#081022]/90 border-blue-900/40 shadow-xl shadow-blue-950/30 text-slate-100' 
          : 'bg-white border-slate-200 shadow-sm text-slate-800'
      } rounded-2xl border overflow-hidden transition-colors duration-300`}>
        {/* Stage 1: Bienvenida e Historia Normativa */}
        {activeStage === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-[#39A900] uppercase tracking-wider">
                  Etapa 1: Fundamentación Institucional
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Bienvenida y Acuerdo No. 009 de 2024
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conoce las bases de la Formación Profesional Integral del SENA
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>+100 XP</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 leading-relaxed">
              <div className="space-y-4">
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-[#39A900]" />
                    ¿Qué es el Acuerdo 009 de 2024?
                  </h4>
                  <p className="text-xs text-emerald-900/90 leading-relaxed">
                    Es el nuevo Reglamento del Aprendiz adoptado por el Consejo Directivo Nacional del SENA. 
                    Reemplaza regulaciones anteriores y moderniza las normas para incluir entornos digitales (Zajuna, Sofía Plus), 
                    enfoque de derechos humanos, no discriminación y prevención de violencias de género.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Pilares de la Formación Profesional Integral:
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#39A900] font-bold">✓</span>
                      <span><strong>Saber (Conocimiento):</strong> Dominio conceptual y tecnológico de tu especialidad.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#39A900] font-bold">✓</span>
                      <span><strong>Saber Hacer (Destreza):</strong> Práctica en talleres reales y etapa productiva empresarial.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#39A900] font-bold">✓</span>
                      <span><strong>Saber Ser (Actitud y Ética):</strong> Convivencia pacífica, honestidad, puntualidad y respeto ciudadano.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Las Dos Grandes Etapas de tu Formación:
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-blue-700">1. Etapa Lectiva:</span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Desarrollo de competencias en ambientes de aprendizaje presenciales o virtuales con instructores SENA.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-emerald-700">2. Etapa Productiva:</span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Aplicación en empresas mediante Contrato de Aprendizaje, Proyecto Productivo, Pasantía o Vínculo Laboral.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Al confirmar la lectura asimilas las bases formativas.
              </span>
              <button
                onClick={() => completeStep(1, 100, "b-rights")}
                className="px-5 py-2.5 bg-[#39A900] hover:bg-[#2e8800] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>¡Entendido! Avanzar al Paso 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Derechos del Aprendiz */}
        {activeStage === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Etapa 2: Garantías y Prerrogativas
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Tus Derechos como Aprendiz SENA
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consagrados en el Capítulo II del Acuerdo 009 de 2024
                </p>
              </div>
              <div className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                <span>+120 XP</span>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {['Todos', 'Académico', 'Bienestar', 'Participación', 'Garantías y Debido Proceso'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveRightCategory(cat)}
                  className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    activeRightCategory === cat
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid of Rights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SENA_RIGHTS
                .filter(r => activeRightCategory === 'Todos' || r.category === activeRightCategory)
                .map((right) => (
                  <div
                    key={right.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        {right.category}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">{right.articleRef}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{right.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{right.description}</p>
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Los derechos se ejercen con responsabilidad y respeto mutuo.
              </span>
              <button
                onClick={() => completeStep(2, 120, "b-rights")}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-700/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Asimilé mis Derechos • Ir a Deberes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Deberes del Aprendiz */}
        {activeStage === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Etapa 3: Responsabilidades y SST
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Decálogo de Deberes del Aprendiz
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compromisos éticos, formativos y de seguridad en el Centro de Formación
                </p>
              </div>
              <div className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>+150 XP</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SENA_DUTIES.map((duty, idx) => (
                <div
                  key={duty.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400 transition-all shadow-xs flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center flex-shrink-0 border border-amber-200">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{duty.title}</h4>
                      <span className="text-[9px] font-mono text-slate-400">{duty.articleRef}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{duty.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Inasistencias Alert Callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
              <span className="font-bold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Regla de Oro en Asistencia y Justificaciones:
              </span>
              <p className="leading-relaxed">
                Si no puedes asistir por fuerza mayor médica o calamidad justificada, tienes un plazo máximo de 
                <strong> 3 días hábiles siguientes al reintegro</strong> para radicar tu soporte ante la Coordinación Académica 
                o tu instructor de ficha, evitando así la deserción formativa.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                El cumplimiento de los deberes asegura tu permanencia exitosa.
              </span>
              <button
                onClick={() => completeStep(3, 150, "b-duties")}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-700/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Acepto mis Deberes • Ir a Prohibiciones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Prohibiciones & Prevención */}
        {activeStage === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Etapa 4: Zona de Advertencia Disciplinaria
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Prohibiciones y Clasificación de Faltas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conductas no permitidas y causales de cancelación de matrícula
                </p>
              </div>
              <div className="bg-rose-50 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>+150 XP</span>
              </div>
            </div>

            <div className="space-y-3">
              {SENA_PROHIBITIONS.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/60 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.severity === 'Gravísima' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        Falta {p.severity}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{p.articleRef}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{p.description}</p>
                  <div className="text-[11px] font-medium text-red-900 bg-white/70 p-2 rounded-lg border border-red-200/60">
                    <strong className="text-red-700">Consecuencia formativa:</strong> {p.consequence}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                El SENA promueve ambientes sanos, seguros y libres de violencia.
              </span>
              <button
                onClick={() => completeStep(4, 150)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-700/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Comprendido • Ir a Debido Proceso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 5: Debido Proceso & Comité */}
        {activeStage === 5 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Etapa 5: Justicia Formativa y Garantías
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Debido Proceso y Comité de Evaluación y Seguimiento
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cómo se investigan las faltas y cuáles son las medidas pedagógicas
                </p>
              </div>
              <div className="bg-purple-50 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
                <span>+180 XP</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/40 space-y-3">
                <h4 className="font-bold text-purple-950 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-600" />
                  Ruta del Debido Proceso (Art. 29 C.P.)
                </h4>
                <ol className="space-y-2 list-decimal list-inside text-slate-700 leading-relaxed">
                  <li><strong>Informe o Queja:</strong> Reporte documentado del instructor o testigo.</li>
                  <li><strong>Notificación Formal:</strong> Citación oficial al aprendiz con descripción de los hechos.</li>
                  <li><strong>Sesión del Comité:</strong> Audiencia con derecho a rendir descargos y aportar pruebas testimoniales o documentales.</li>
                  <li><strong>Concepto Motivado:</strong> Recomendación del comité al Subdirector de Centro.</li>
                  <li><strong>Acto Administrativo:</strong> Resolución del Subdirector debidamente motivada.</li>
                  <li><strong>Recurso de Reposición:</strong> Oportunidad de controvertir la sanción en los términos legales.</li>
                </ol>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Tipos de Medidas Formativas vs Sanciones:
                </h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="font-bold text-emerald-800">1. Medidas Formativas (Preventivas):</span>
                    <p className="text-slate-600 mt-0.5">
                      Llamado de atención verbal y Planes de Mejoramiento Académico o Disciplinario concertados.
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="font-bold text-amber-800">2. Condicionamiento de Matrícula:</span>
                    <p className="text-slate-600 mt-0.5">
                      Pérdida temporal de ciertos estímulos; el aprendiz continúa en observación estricta.
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 rounded-lg border border-red-200">
                    <span className="font-bold text-red-800">3. Cancelación de Matrícula:</span>
                    <p className="text-slate-600 mt-0.5">
                      Desvinculación definitiva del SENA con inhabilidad temporal para ingresar a nuevos programas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={onGoToCases}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Probar el Simulador de Casos Prácticos</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  completeStep(5, 180);
                  onGoToEvaluation();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#247000] to-[#39A900] hover:from-[#1b5500] hover:to-[#2e8800] text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>¡Ruta Completada! Iniciar Evaluación de Certificación</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Badges / Insignias Section */}
      <div className={`${
        isDarkMode 
          ? 'bg-[#081022]/90 border-blue-900/40 shadow-xl shadow-blue-950/30' 
          : 'bg-slate-50 border-slate-200'
      } rounded-2xl p-6 border transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-100' : 'text-slate-900'}`}>
              Tus Insignias y Logros Gamificados
            </h3>
          </div>
          <span className={`text-xs ${isDarkMode ? 'text-blue-300/70' : 'text-slate-500'}`}>
            Desbloquea las 4 medallas para certificar tu inducción
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-all text-center space-y-2 ${
                badge.unlocked
                  ? isDarkMode
                    ? 'bg-[#0E1A34] border-emerald-500/50 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30 text-slate-100'
                    : 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
                  : isDarkMode
                  ? 'bg-[#060D1A]/60 border-blue-950/60 opacity-60 text-slate-400'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner">
                {badge.unlocked ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md animate-bounce">
                    <Star className="w-6 h-6 fill-white" />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-300 text-slate-500'
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                )}
              </div>
              <h4 className={`text-xs font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{badge.title}</h4>
              <p className={`text-[10px] leading-tight ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{badge.description}</p>
              <div className="pt-1">
                {badge.unlocked ? (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    isDarkMode 
                      ? 'text-emerald-300 bg-emerald-950/60 border-emerald-700/50' 
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    ¡Desbloqueada!
                  </span>
                ) : (
                  <span className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Bloqueada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
