import { useState } from 'react';
import { 
  Scale, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Check, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { SENA_CASE_STUDIES, SenaCaseStudy } from '../data/senaData';
import { playSound } from '../utils/audio';

interface DilemmasSimulatorProps {
  onAddXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  soundEnabled: boolean;
  onProceedToQuiz: () => void;
  isDarkMode?: boolean;
}

export function DilemmasSimulator({
  onAddXp,
  onUnlockBadge,
  soundEnabled,
  onProceedToQuiz,
  isDarkMode = false
}: DilemmasSimulatorProps) {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [completedCases, setCompletedCases] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const currentCase: SenaCaseStudy = SENA_CASE_STUDIES[currentCaseIndex];

  const handleSelectOption = (optId: string) => {
    if (hasAnswered) return;
    setSelectedOptionId(optId);
  };

  const handleVerify = () => {
    if (!selectedOptionId || hasAnswered) return;
    setHasAnswered(true);

    const chosenOption = currentCase.options.find(o => o.id === selectedOptionId);
    if (chosenOption?.isCorrect) {
      playSound('correct', soundEnabled);
      onAddXp(80, `Dilema resuelto: ${currentCase.title}`);
      setScore(prev => prev + 1);
    } else {
      playSound('wrong', soundEnabled);
    }

    if (!completedCases.includes(currentCase.id)) {
      setCompletedCases(prev => [...prev, currentCase.id]);
    }

    // If completed all cases, unlock badge
    if (completedCases.length + 1 >= SENA_CASE_STUDIES.length) {
      onUnlockBadge('b-cases');
    }
  };

  const handleNext = () => {
    if (currentCaseIndex < SENA_CASE_STUDIES.length - 1) {
      setCurrentCaseIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setHasAnswered(false);
    }
  };

  const handleReset = () => {
    setCurrentCaseIndex(0);
    setSelectedOptionId(null);
    setHasAnswered(false);
    setCompletedCases([]);
    setScore(0);
  };

  const chosenOption = currentCase.options.find(o => o.id === selectedOptionId);
  const isFinished = hasAnswered && currentCaseIndex === SENA_CASE_STUDIES.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-600/60 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
            <Scale className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulador de Casos Reales del Centro de Formación</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tribunal de Convivencia y Dilemas Éticos
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Enfrenta situaciones cotidianas de aprendices en talleres, aulas y ambientes virtuales. 
            Aplica el <strong>Acuerdo 009 de 2024</strong> para tomar la decisión más formativa.
          </p>
        </div>
      </div>

      {/* Case Container */}
      <div className={`${
        isDarkMode 
          ? 'bg-[#081022]/90 border-blue-900/40 shadow-xl shadow-blue-950/30 text-slate-100' 
          : 'bg-white border-slate-200 shadow-sm text-slate-800'
      } rounded-3xl p-6 sm:p-8 border space-y-6 transition-colors duration-300`}>
        {/* Progress & Tags */}
        <div className={`flex items-center justify-between border-b pb-4 ${isDarkMode ? 'border-blue-900/40' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isDarkMode 
                ? 'text-emerald-300 bg-emerald-950/60 border-emerald-700/50' 
                : 'text-emerald-800 bg-emerald-50 border-emerald-200'
            }`}>
              Caso {currentCaseIndex + 1} de {SENA_CASE_STUDIES.length}
            </span>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-blue-300/70' : 'text-slate-500'}`}>
              {currentCase.context}
            </span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isDarkMode 
              ? 'text-amber-300 bg-amber-950/60 border-amber-600/40' 
              : 'text-amber-600 bg-amber-50 border-amber-200'
          }`}>
            Aciertos: {score}/{SENA_CASE_STUDIES.length}
          </span>
        </div>

        {/* Title & Situation Card */}
        <div className="space-y-3">
          <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {currentCase.title}
          </h3>
          <div className={`p-4 rounded-2xl border text-sm leading-relaxed font-normal ${
            isDarkMode 
              ? 'bg-[#0C1527] border-blue-900/50 text-blue-100 shadow-inner' 
              : 'bg-slate-50 border-slate-200/80 text-slate-700'
          }`}>
            <p className="italic">"{currentCase.situation}"</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-300/70' : 'text-slate-500'}`}>
            ¿Cómo debe procederse de acuerdo con el Reglamento del Aprendiz SENA?
          </p>
          
          <div className="space-y-2.5">
            {currentCase.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              let style = isDarkMode 
                ? "border-blue-950/70 bg-[#070D1B] text-slate-200 hover:border-blue-500/50 hover:bg-blue-950/50" 
                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700";

              if (isSelected && !hasAnswered) {
                style = isDarkMode 
                  ? "border-[#39A900] bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-500/30 font-medium" 
                  : "border-[#39A900] bg-emerald-50 text-emerald-950 ring-2 ring-[#39A900]/20 font-medium";
              }

              if (hasAnswered) {
                if (option.isCorrect) {
                  style = isDarkMode
                    ? "border-emerald-500 bg-emerald-950/70 text-emerald-200 font-medium ring-2 ring-emerald-500/40"
                    : "border-emerald-500 bg-emerald-50/90 text-emerald-900 font-medium ring-2 ring-emerald-500/30";
                } else if (isSelected && !option.isCorrect) {
                  style = isDarkMode
                    ? "border-red-500 bg-red-950/60 text-red-200"
                    : "border-red-400 bg-red-50 text-red-900";
                } else {
                  style = isDarkMode 
                    ? "border-blue-950/40 bg-slate-900/30 opacity-40 text-slate-500" 
                    : "border-slate-200 opacity-50 text-slate-400";
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${style}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    hasAnswered && option.isCorrect
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : hasAnswered && isSelected && !option.isCorrect
                      ? 'bg-red-600 border-red-600 text-white'
                      : isSelected
                      ? 'border-[#39A900] bg-[#39A900] text-white'
                      : 'border-slate-300'
                  }`}>
                    {hasAnswered && option.isCorrect && <Check className="w-3.5 h-3.5" />}
                    {hasAnswered && isSelected && !option.isCorrect && <span className="text-[10px] font-bold">✕</span>}
                  </div>
                  <span className="flex-1 leading-snug">{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formative Feedback Explanation once Answered */}
        {hasAnswered && chosenOption && (
          <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
            chosenOption.isCorrect 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {chosenOption.isCorrect ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>¡Decisión Correcta! (+80 XP)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Enfoque a Mejorar</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{chosenOption.explanation}</p>
            <div className="pt-2 border-t border-slate-200/50 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Fundamento: {currentCase.relatedRegulation}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar casos</span>
          </button>

          {!hasAnswered ? (
            <button
              onClick={handleVerify}
              disabled={!selectedOptionId}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                selectedOptionId
                  ? 'bg-[#39A900] text-white hover:bg-[#2e8800] shadow-md shadow-emerald-700/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Verificar Decisión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : !isFinished ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-900/20 cursor-pointer"
            >
              <span>Siguiente Caso</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onProceedToQuiz}
              className="px-6 py-2.5 bg-gradient-to-r from-[#247000] to-[#39A900] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-700/20 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>¡Casos Superados! Ir a la Evaluación de Certificación</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
