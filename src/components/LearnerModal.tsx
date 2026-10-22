import { useState } from 'react';
import { X, UserCheck, Save, Sparkles } from 'lucide-react';
import { LearnerProfile, SENA_REGIONALES, SENA_CENTROS_EJEMPLO } from '../data/senaData';

interface LearnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: LearnerProfile;
  onSave: (updated: LearnerProfile) => void;
  isDarkMode?: boolean;
}

export function LearnerModal({ isOpen, onClose, learner, onSave, isDarkMode = false }: LearnerModalProps) {
  const [formData, setFormData] = useState<LearnerProfile>({ ...learner });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const inputStyle = isDarkMode
    ? "w-full px-3.5 py-2.5 rounded-xl border border-blue-900/60 bg-[#0F172A] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 text-sm font-medium outline-hidden transition-all shadow-inner"
    : "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-[#39A900] focus:ring-2 focus:ring-[#39A900]/20 text-slate-800 text-sm font-medium outline-hidden transition-all";

  const labelStyle = isDarkMode
    ? "block text-xs font-bold text-blue-300 uppercase tracking-wider mb-1"
    : "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#0B132B] border border-blue-500/30 shadow-blue-950/50 text-slate-100' 
          : 'bg-white border border-slate-100 text-slate-800'
      }`}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#247000] to-[#39A900] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Datos del Aprendiz SENA</h3>
                <p className="text-xs text-emerald-100">
                  Esta información se reflejará directamente en tu Certificado Oficial de Inducción
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className={labelStyle}>
              Nombre Completo del Aprendiz *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={inputStyle}
              placeholder="Ej: Laura Camila Rodríguez Sánchez"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelStyle}>
                Tipo Doc. *
              </label>
              <select
                value={formData.docType}
                onChange={(e) => setFormData({ ...formData, docType: e.target.value as any })}
                className={inputStyle}
              >
                <option value="CC">Cédula de Ciudadanía (C.C.)</option>
                <option value="TI">Tarjeta de Identidad (T.I.)</option>
                <option value="CE">Cédula de Extranjería (C.E.)</option>
                <option value="PPT">Permiso de Protección Temporal (PPT)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelStyle}>
                Número de Documento *
              </label>
              <input
                type="text"
                required
                value={formData.docNumber}
                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                className={inputStyle}
                placeholder="Ej: 1020304050"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>
                Regional SENA *
              </label>
              <select
                value={formData.regional}
                onChange={(e) => setFormData({ ...formData, regional: e.target.value })}
                className={inputStyle}
              >
                {SENA_REGIONALES.map((reg) => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle}>
                Número de Ficha *
              </label>
              <input
                type="text"
                required
                value={formData.fichaNumber}
                onChange={(e) => setFormData({ ...formData, fichaNumber: e.target.value })}
                className={inputStyle}
                placeholder="Ej: 2894512"
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>
              Programa de Formación *
            </label>
            <input
              type="text"
              required
              value={formData.programName}
              onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
              className={inputStyle}
              placeholder="Ej: Análisis y Desarrollo de Software (ADSO)"
            />
          </div>

          <div>
            <label className={labelStyle}>
              Centro de Formación *
            </label>
            <input
              type="text"
              required
              value={formData.centerName}
              onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
              list="centros-list"
              className={inputStyle}
              placeholder="Ej: Centro de Gestión de Mercados, Logística y TI"
            />
            <datalist id="centros-list">
              {SENA_CENTROS_EJEMPLO.map((c, i) => (
                <option key={i} value={c} />
              ))}
            </datalist>
          </div>

          {/* Quick preset button */}
          <div className={`flex items-center justify-between pt-3 border-t ${isDarkMode ? 'border-blue-900/40' : 'border-slate-100'}`}>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  fullName: "Juan David Gómez Montoya",
                  docType: "CC",
                  docNumber: "1036985412",
                  regional: "Antioquia",
                  centerName: "Centro de Tecnología de la Manufactura Avanzada",
                  programName: "Tecnólogo en Análisis y Desarrollo de Software (ADSO)",
                  fichaNumber: "2894512",
                  email: "jdgomez@soy.sena.edu.co",
                  avatarId: "spiderman"
                });
              }}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cargar datos de ejemplo
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#39A900] hover:bg-[#2e8800] rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Ficha
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
