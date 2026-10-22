import { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { googleSignIn } from '../services/googleAuth';
import { playSound } from '../utils/audio';

interface InstructorAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode?: boolean;
  soundEnabled?: boolean;
}

const DEFAULT_PINS = ['Sena1234', 'sena1234', 'SENA1234', '1234', 'SENA2024', 'sena2024', 'instructor'];

export function InstructorAccessModal({
  isOpen,
  onClose,
  onSuccess,
  isDarkMode = false,
  soundEnabled = true
}: InstructorAccessModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleValidatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = pin.trim();
    if (!trimmed) {
      setError('Por favor ingrese la clave de acceso de instructor (Sena1234).');
      return;
    }

    if (DEFAULT_PINS.includes(trimmed)) {
      playSound('correct', soundEnabled);
      localStorage.setItem('sena_instructor_auth', 'true');
      localStorage.setItem('sena_user_role', 'instructor');
      onSuccess();
      onClose();
    } else {
      playSound('wrong', soundEnabled);
      setError('Clave incorrecta. Use la clave institucional asignada: Sena1234');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await googleSignIn();
      if (res?.user) {
        playSound('correct', soundEnabled);
        localStorage.setItem('sena_instructor_auth', 'true');
        localStorage.setItem('sena_user_role', 'instructor');
        localStorage.setItem('sena_instructor_email', res.user.email || '');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all duration-300 relative ${
          isDarkMode 
            ? 'bg-[#0A1224] border-blue-900/60 text-slate-100 shadow-blue-950/60' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#39A900]/15 text-[#39A900] flex items-center justify-center shrink-0 border border-[#39A900]/30 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#39A900] bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Acceso Restringido
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Panel de Instructor / Coordinador
            </h3>
          </div>
        </div>

        <p className={`text-xs leading-relaxed mb-5 ${isDarkMode ? 'text-blue-200/70' : 'text-slate-600'}`}>
          Esta área contiene privilegios administrativos para gestionar fichas, sincronizar registros con 
          <strong> Google Drive / Sheets</strong> y generar enlaces para aprendices.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Form */}
        <form onSubmit={handleValidatePin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Clave de Acceso Institucional (PIN)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ingrese la clave (ej: Sena1234)"
                autoFocus
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#39A900] ${
                  isDarkMode 
                    ? 'bg-[#0E1A33] border-blue-900/60 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            {/* Quick helper for instructor */}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Clave institucional asignada:</span>
              <button
                type="button"
                onClick={() => setPin('Sena1234')}
                className="font-bold text-[#39A900] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Usar Sena1234
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#39A900] hover:bg-[#2d8500] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Ingresar al Panel de Instructor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Alternative Google Sign-in */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-blue-900/40 text-center space-y-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            O autentíquese directamente con su cuenta Google institucional:
          </p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isDarkMode 
                ? 'border-blue-900/60 bg-blue-950/40 text-blue-200 hover:bg-blue-900/60' 
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#39A900]" />
            <span>{isLoading ? 'Autenticando...' : 'Iniciar con Google Workspace'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
