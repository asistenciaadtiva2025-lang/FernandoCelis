import { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  HelpCircle, 
  Timer, 
  Sparkles,
  BookOpen,
  Check,
  AlertTriangle
} from 'lucide-react';
import { SENA_QUIZ_QUESTIONS, QuizQuestion, LearnerProfile } from '../data/senaData';
import { playSound } from '../utils/audio';

interface QuizCertificationProps {
  learner: LearnerProfile;
  soundEnabled: boolean;
  onAddXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  onPassEvaluation: (score: number) => void;
  onReviewRegulations: () => void;
  isDarkMode?: boolean;
}

export function QuizCertification({
  learner,
  soundEnabled,
  onAddXp,
  onUnlockBadge,
  onPassEvaluation,
  onReviewRegulations,
  isDarkMode = false
}: QuizCertificationProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion: QuizQuestion = SENA_QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedAnswer(index);
    playSound('click', soundEnabled);
  };

  const handleSubmitStep = () => {
    if (selectedAnswer === null || hasSubmittedAnswer) return;
    setHasSubmittedAnswer(true);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      playSound('correct', soundEnabled);
      onAddXp(25, `Acierto en evaluación: ${currentQuestion.module}`);
    } else {
      playSound('wrong', soundEnabled);
    }

    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }));
  };

  const handleNextQuestion = () => {
    if (currentIdx < SENA_QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setHasSubmittedAnswer(false);
    } else {
      // Calculate final score
      let correctCount = 0;
      SENA_QUIZ_QUESTIONS.forEach(q => {
        const ans = userAnswers[q.id] ?? (q.id === currentQuestion.id ? selectedAnswer : null);
        if (ans === q.correctAnswer) {
          correctCount++;
        }
      });
      const finalScorePercentage = Math.round((correctCount / SENA_QUIZ_QUESTIONS.length) * 100);
      setIsCompleted(true);

      if (finalScorePercentage >= 80) {
        playSound('complete', soundEnabled);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        onAddXp(250, "Aprobación de Evaluación Oficial de Inducción SENA");
        onUnlockBadge("b-certified");
        onPassEvaluation(finalScorePercentage);
      } else {
        playSound('wrong', soundEnabled);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setHasSubmittedAnswer(false);
    setUserAnswers({});
    setIsCompleted(false);
  };

  // Calculate final results if finished
  let totalCorrect = 0;
  SENA_QUIZ_QUESTIONS.forEach(q => {
    if (userAnswers[q.id] === q.correctAnswer) totalCorrect++;
  });
  const scorePercent = Math.round((totalCorrect / SENA_QUIZ_QUESTIONS.length) * 100);
  const isApproved = scorePercent >= 80;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#247000] to-[#39A900] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-100">
            <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Evaluación Oficial de Inducción • Acuerdo 009 de 2024</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Prueba de Conocimientos en el Reglamento
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Responde 10 preguntas fundamentales sobre derechos, deberes, prohibiciones y debido proceso. 
            Se requiere un puntaje mínimo del <strong>80%</strong> para obtener tu Certificado Oficial.
          </p>
        </div>
      </div>

      {!isCompleted ? (
        /* Active Question Card */
        <div className={`${
          isDarkMode 
            ? 'bg-[#081022]/90 border-blue-900/40 shadow-xl shadow-blue-950/30 text-slate-100' 
            : 'bg-white border-slate-200 shadow-sm text-slate-800'
        } rounded-3xl p-6 sm:p-8 border space-y-6 transition-colors duration-300`}>
          {/* Progress bar and counter */}
          <div className="space-y-2">
            <div className={`flex items-center justify-between text-xs font-bold ${isDarkMode ? 'text-blue-300/70' : 'text-slate-500'}`}>
              <span>Pregunta {currentIdx + 1} de {SENA_QUIZ_QUESTIONS.length}</span>
              <span className={`px-2 py-0.5 rounded-full border uppercase text-[10px] ${
                isDarkMode 
                  ? 'text-emerald-300 bg-emerald-950/60 border-emerald-700/50' 
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                Módulo: {currentQuestion.module.replace('_', ' ')}
              </span>
            </div>
            <div className={`w-full rounded-full h-2.5 overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-blue-950' : 'bg-slate-100'}`}>
              <div 
                className="bg-[#39A900] h-2.5 rounded-full transition-all duration-300 shadow-sm shadow-emerald-500/50"
                style={{ width: `${((currentIdx + 1) / SENA_QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question text */}
          <h3 className={`text-base sm:text-lg font-bold leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {currentQuestion.question}
          </h3>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              let style = isDarkMode 
                ? "border-blue-950/70 bg-[#070D1B] text-slate-200 hover:border-blue-500/50 hover:bg-blue-950/50" 
                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700";

              if (isSelected && !hasSubmittedAnswer) {
                style = isDarkMode 
                  ? "border-[#39A900] bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-500/30 font-medium" 
                  : "border-[#39A900] bg-emerald-50 text-emerald-950 ring-2 ring-[#39A900]/20 font-medium";
              }

              if (hasSubmittedAnswer) {
                if (idx === currentQuestion.correctAnswer) {
                  style = isDarkMode
                    ? "border-emerald-500 bg-emerald-950/70 text-emerald-200 font-semibold ring-2 ring-emerald-500/40"
                    : "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-500/30";
                } else if (isSelected && idx !== currentQuestion.correctAnswer) {
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
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasSubmittedAnswer}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3.5 cursor-pointer ${style}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                    hasSubmittedAnswer && idx === currentQuestion.correctAnswer
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : hasSubmittedAnswer && isSelected && idx !== currentQuestion.correctAnswer
                      ? 'bg-red-600 border-red-600 text-white'
                      : isSelected
                      ? 'border-[#39A900] bg-[#39A900] text-white'
                      : isDarkMode
                      ? 'border-blue-900 text-blue-300'
                      : 'border-slate-300 text-slate-500'
                  }`}>
                    {hasSubmittedAnswer && idx === currentQuestion.correctAnswer ? (
                      <Check className="w-3 h-3" />
                    ) : hasSubmittedAnswer && isSelected && idx !== currentQuestion.correctAnswer ? (
                      <span>✕</span>
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </div>
                  <span className="flex-1 leading-snug">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Formative Feedback Box */}
          {hasSubmittedAnswer && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? isDarkMode ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : isDarkMode ? 'bg-amber-950/50 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>¡Respuesta Correcta! (+25 XP)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Respuesta Incorrecta</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">{currentQuestion.explanation}</p>
              <p className="text-[10px] font-mono font-semibold opacity-75 pt-1">
                Referencia: {currentQuestion.normativeReference}
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className={`pt-4 border-t flex items-center justify-between ${isDarkMode ? 'border-blue-900/40' : 'border-slate-100'}`}>
            <span className={`text-xs ${isDarkMode ? 'text-blue-300/60' : 'text-slate-400'}`}>
              Aprendiz: {learner.fullName.split(' ')[0]} • Ficha {learner.fichaNumber}
            </span>

            {!hasSubmittedAnswer ? (
              <button
                onClick={handleSubmitStep}
                disabled={selectedAnswer === null}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  selectedAnswer !== null
                    ? 'bg-[#39A900] text-white hover:bg-[#2e8800] shadow-md shadow-emerald-700/20 cursor-pointer'
                    : isDarkMode ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Confirmar Respuesta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <span>
                  {currentIdx === SENA_QUIZ_QUESTIONS.length - 1 ? "Ver Calificación Final" : "Siguiente Pregunta"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className={`${
          isDarkMode 
            ? 'bg-[#081022]/90 border-blue-900/40 shadow-xl shadow-blue-950/30 text-slate-100' 
            : 'bg-white border-slate-200 shadow-sm text-slate-800'
        } rounded-3xl p-8 border text-center space-y-6 transition-colors duration-300`}>
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg">
            {isApproved ? (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-[#39A900] text-white flex items-center justify-center animate-bounce shadow-emerald-500/30">
                <Award className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-950/60 text-amber-400 border border-amber-600/40 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
              isApproved 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50' 
                : 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
            }`}>
              {isApproved ? "¡APROBADO CON ÉXITO!" : "INTENTO NO SUPERADO (MÍNIMO 80%)"}
            </span>

            <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Calificación Obtenida: <span className={isApproved ? "text-[#39A900]" : "text-amber-500"}>{scorePercent}%</span>
            </h3>

            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              {isApproved ? (
                <>
                  Has acertado <strong>{totalCorrect} de {SENA_QUIZ_QUESTIONS.length}</strong> preguntas. 
                  Tu conocimiento del Reglamento del Aprendiz (Acuerdo 009 de 2024) es sobresaliente. 
                  ¡Tu <strong>Certificado Oficial</strong> ya está listo para ser impreso o descargado!
                </>
              ) : (
                <>
                  Has acertado <strong>{totalCorrect} de {SENA_QUIZ_QUESTIONS.length}</strong> preguntas. 
                  Para garantizar que todos los aprendices conozcan sus derechos y deberes, necesitas al menos el 80%. 
                  ¡Repasa los módulos y vuelve a intentarlo!
                </>
              )}
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver a intentar</span>
            </button>

            <button
              onClick={onReviewRegulations}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#39A900]" />
              <span>Repasar Artículos del Reglamento</span>
            </button>

            {isApproved && (
              <button
                onClick={() => onPassEvaluation(scorePercent)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#247000] to-[#39A900] hover:from-[#1d5c00] hover:to-[#2e8800] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-700/20 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Ver Mi Certificado Oficial</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
