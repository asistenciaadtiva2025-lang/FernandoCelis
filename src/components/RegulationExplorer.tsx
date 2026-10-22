import { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  ShieldCheck, 
  Award, 
  AlertTriangle, 
  Scale, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  FileText
} from 'lucide-react';
import { 
  SENA_CHAPTERS, 
  SENA_RIGHTS, 
  SENA_DUTIES, 
  SENA_PROHIBITIONS,
  SENA_REGULATION_INFO 
} from '../data/senaData';

export function RegulationExplorer({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'derechos' | 'deberes' | 'prohibiciones' | 'capitulos'>('todos');
  const [expandedChapter, setExpandedChapter] = useState<string | null>("Capítulo I");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const query = searchQuery.toLowerCase().trim();

  // Filtered lists
  const filteredRights = SENA_RIGHTS.filter(r => 
    r.title.toLowerCase().includes(query) ||
    r.description.toLowerCase().includes(query) ||
    r.category.toLowerCase().includes(query) ||
    r.articleRef.toLowerCase().includes(query)
  );

  const filteredDuties = SENA_DUTIES.filter(d => 
    d.title.toLowerCase().includes(query) ||
    d.description.toLowerCase().includes(query) ||
    d.category.toLowerCase().includes(query) ||
    d.articleRef.toLowerCase().includes(query)
  );

  const filteredProhibitions = SENA_PROHIBITIONS.filter(p => 
    p.title.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.severity.toLowerCase().includes(query) ||
    p.consequence.toLowerCase().includes(query)
  );

  const filteredChapters = SENA_CHAPTERS.filter(c =>
    c.title.toLowerCase().includes(query) ||
    c.summary.toLowerCase().includes(query) ||
    c.number.toLowerCase().includes(query) ||
    c.keyArticles.some(a => a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className={`${
        isDarkMode 
          ? 'bg-[#081022]/90 border-blue-900/40 shadow-xl shadow-blue-950/30 text-slate-100' 
          : 'bg-white border-slate-200 shadow-xs text-slate-800'
      } rounded-3xl p-6 sm:p-8 border space-y-4 transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border mb-2 ${
              isDarkMode 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              <BookOpen className="w-3.5 h-3.5 text-[#39A900]" />
              <span>Compendio Normativo Oficial</span>
            </div>
            <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Explorador del Reglamento del Aprendiz SENA
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-blue-200/70' : 'text-slate-600'}`}>
              Consulta en tiempo real artículos, derechos, deberes y debido proceso según el 
              <strong className={isDarkMode ? 'text-emerald-400' : 'text-[#1B5E20]'}> {SENA_REGULATION_INFO.acuerdo}</strong>.
            </p>
          </div>

          <div className="text-right">
            <span className={`text-xs font-bold uppercase tracking-wider block ${isDarkMode ? 'text-blue-300/60' : 'text-slate-500'}`}>
              Estado de la Norma
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block mt-0.5 ${
              isDarkMode ? 'text-emerald-300 bg-emerald-950/60 border-emerald-700/50' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              Vigente en todo Colombia
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por palabra clave: acoso, plagio, carné, EPP, inasistencia, descargos..."
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm outline-hidden transition-all shadow-inner ${
              isDarkMode 
                ? 'border-blue-900/60 bg-[#0C1527] text-slate-100 placeholder-slate-500 focus:bg-[#101D36] focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20' 
                : 'border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-[#39A900] focus:ring-3 focus:ring-[#39A900]/15'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-200 font-bold cursor-pointer"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Categories Tab Selector */}
        <div className={`flex flex-wrap gap-2 pt-2 border-t text-xs font-semibold ${
          isDarkMode ? 'border-blue-900/40' : 'border-slate-100'
        }`}>
          {[
            { id: 'todos', label: 'Ver Todo', icon: FileText },
            { id: 'capitulos', label: 'Capítulos del Reglamento', icon: BookOpen },
            { id: 'derechos', label: 'Derechos del Aprendiz', icon: ShieldCheck },
            { id: 'deberes', label: 'Deberes & SST', icon: Award },
            { id: 'prohibiciones', label: 'Prohibiciones & Faltas', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#39A900] text-white shadow-xs'
                    : isDarkMode
                    ? 'bg-[#0E1A34] text-slate-300 hover:bg-blue-950/80 hover:text-white border border-blue-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapters Accordion */}
      {(filterType === 'todos' || filterType === 'capitulos') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="w-4 h-4 text-[#39A900]" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Estructura por Capítulos (Acuerdo 009 de 2024)
            </h3>
          </div>

          <div className="space-y-3">
            {filteredChapters.map((chap) => {
              const isExpanded = expandedChapter === chap.number;
              return (
                <div
                  key={chap.number}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedChapter(isExpanded ? null : chap.number)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#39A900] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                        {chap.number}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
                        {chap.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{chap.summary}</p>
                    </div>
                    <div className="p-1 rounded-lg text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {chap.summary}
                      </p>

                      <div className="space-y-3">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          Artículos y Definiciones Clave:
                        </span>
                        {chap.keyArticles.map((art, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-3 border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#1B5E20]">{art.art}: {art.title}</span>
                              <button
                                onClick={() => handleCopyText(`art-${chap.number}-${idx}`, `${art.art}: ${art.title} - ${art.content}`)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                                title="Copiar cita textual"
                              >
                                {copiedId === `art-${chap.number}-${idx}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{art.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rights Grid */}
      {(filterType === 'todos' || filterType === 'derechos') && filteredRights.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Derechos Fundamentales del Aprendiz ({filteredRights.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRights.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {r.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{r.articleRef}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{r.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duties Grid */}
      {(filterType === 'todos' || filterType === 'deberes') && filteredDuties.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 px-1">
            <Award className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Deberes y Responsabilidades ({filteredDuties.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDuties.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-amber-400 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {d.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{d.articleRef}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{d.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prohibitions Grid */}
      {(filterType === 'todos' || filterType === 'prohibiciones') && filteredProhibitions.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 px-1">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Prohibiciones y Régimen Sancionatorio ({filteredProhibitions.length})
            </h3>
          </div>

          <div className="space-y-3">
            {filteredProhibitions.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-rose-100 hover:border-rose-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.severity === 'Gravísima' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      Falta {p.severity}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{p.articleRef}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                <div className="bg-red-50 p-2 rounded-lg border border-red-100 text-[11px] text-red-900 font-medium">
                  <strong>Medida aplicable:</strong> {p.consequence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
