export interface SenaRight {
  id: string;
  category: 'Académico' | 'Bienestar' | 'Participación' | 'Garantías y Debido Proceso';
  title: string;
  description: string;
  articleRef: string;
  iconName: string;
}

export interface SenaDuty {
  id: string;
  category: 'Académico y Formativo' | 'Convivencia y Respeto' | 'Cuidado de Bienes y SST';
  title: string;
  description: string;
  articleRef: string;
  iconName: string;
}

export interface SenaProhibition {
  id: string;
  title: string;
  severity: 'Grave' | 'Gravísima';
  description: string;
  consequence: string;
  articleRef: string;
}

export interface SenaCaseStudy {
  id: string;
  title: string;
  context: string;
  situation: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  relatedRegulation: string;
}

export interface QuizQuestion {
  id: string;
  module: 'derechos' | 'deberes' | 'prohibiciones' | 'debido_proceso' | 'etapa_productiva';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  normativeReference: string;
}

export interface RegulationChapter {
  number: string;
  title: string;
  summary: string;
  keyArticles: {
    art: string;
    title: string;
    content: string;
  }[];
}

// Recent SENA Regulation: Acuerdo 009 de 2024
export const SENA_REGULATION_INFO = {
  acuerdo: "Acuerdo 009 de 2024",
  nombre: "Reglamento del Aprendiz SENA",
  entidad: "Servicio Nacional de Aprendizaje - SENA",
  vigencia: "Vigente a nivel nacional en todos los Centros de Formación",
  lema: "Formación Profesional Integral con Enfoque de Derechos y Convivencia",
};

export const SENA_CHAPTERS: RegulationChapter[] = [
  {
    number: "Capítulo I",
    title: "Principios, Naturaleza y Definiciones",
    summary: "Establece la naturaleza de la Formación Profesional Integral (FPI), la definición de Aprendiz SENA, el papel de la comunidad educativa y los principios éticos institucionales.",
    keyArticles: [
      {
        art: "Art. 1 - 3",
        title: "Naturaleza de la Formación",
        content: "La Formación Profesional Integral del SENA es un proceso educativo teórico-práctico de carácter integral, orientado al desarrollo de conocimientos técnicos, tecnológicos y de actitudes y valores para la convivencia social y productiva."
      },
      {
        art: "Art. 4",
        title: "Definición del Aprendiz SENA",
        content: "Es toda persona matriculada en los programas de formación profesional del SENA, en cualquiera de sus modalidades (presencial, virtual o a distancia), quien es el protagonista de su propio aprendizaje y formación ética."
      }
    ]
  },
  {
    number: "Capítulo II",
    title: "Derechos del Aprendiz",
    summary: "Garantiza a los aprendices el acceso a la formación de calidad, infraestructura, recursos, debido proceso, libertad de expresión y representación estudiantil.",
    keyArticles: [
      {
        art: "Art. 7",
        title: "Derechos Fundamentales y Formativos",
        content: "Recibir inducción completa, recibir formación integral y actualizada, ser tratado con dignidad, recibir apoyo de bienestar al aprendiz, ser evaluado objetivamente y acceder a los recursos tecnológicos y de biblioteca."
      },
      {
        art: "Art. 8",
        title: "Garantía de Participación y Vocería",
        content: "Elegir y ser elegido como vocero o representante de aprendices, expresar libremente sus ideas en el marco del respeto y formular peticiones respetuosas."
      }
    ]
  },
  {
    number: "Capítulo III",
    title: "Deberes del Aprendiz",
    summary: "Compromisos morales, formativos y de conducta que adquiere el aprendiz al momento de su matrícula para con la comunidad educativa y el país.",
    keyArticles: [
      {
        art: "Art. 9",
        title: "Deberes de Convivencia y Compromiso",
        content: "Portar visiblemente el carné institucional dentro de las sedes y ambientes de formación; utilizar los elementos de protección personal (EPP); cumplir con los horarios y actividades de la etapa lectiva y práctica; respetar la diversidad e integridad de todos los miembros del SENA."
      },
      {
        art: "Art. 10",
        title: "Honestidad Intelectual y Conservación de Bienes",
        content: "Respetar los derechos de autor, evitar el plagio o fraude en evaluaciones, y velar por el buen estado de la infraestructura, equipos, maquinaria y recursos ambientales del SENA."
      }
    ]
  },
  {
    number: "Capítulo IV",
    title: "Prohibiciones Generales",
    summary: "Conductas incompatibles con la formación y que atentan contra la seguridad, la ética o la convivencia de la institución.",
    keyArticles: [
      {
        art: "Art. 11",
        title: "Prohibiciones Disciplinarias y Éticas",
        content: "Ingresar o consumir bebidas alcohólicas o sustancias psicoactivas; portar armas; realizar proselitismo político o religioso coercitivo; suplantar personas; alterar registros de asistencia; comercializar bienes o rifas no autorizadas en el Centro."
      },
      {
        art: "Art. 12",
        title: "Prevención de Acoso y Violencias",
        content: "Queda estrictamente prohibida toda conducta constitutiva de acoso sexual, matoneo (bullying), ciberacoso o discriminación por razones de género, etnia, orientación sexual o religión."
      }
    ]
  },
  {
    number: "Capítulo V",
    title: "Régimen de Faltas y Clasificación",
    summary: "Criterios para calificar las faltas académicas y disciplinarias en leves, graves y gravísimas.",
    keyArticles: [
      {
        art: "Art. 13 - 15",
        title: "Clasificación de Faltas",
        content: "Las faltas pueden ser de carácter académico (incumplimiento en resultados de aprendizaje) o disciplinario (conducta y convivencia). Se gradúan en Leves, Graves o Gravísimas según el impacto, la reiteración, el dolo o culpa y los antecedentes del aprendiz."
      }
    ]
  },
  {
    number: "Capítulo VI",
    title: "Medidas Formativas, Sanciones y Debido Proceso",
    summary: "Mecanismos pedagógicos para corregir desviaciones, sanciones aplicables y el funcionamiento del Comité de Evaluación y Seguimiento.",
    keyArticles: [
      {
        art: "Art. 18",
        title: "Medidas Formativas Pedagógicas",
        content: "Tienen carácter preventivo: Llamado de atención verbal formativo y Planes de mejoramiento académico o disciplinario, orientados a subsanar dificultades sin truncar el proyecto formativo."
      },
      {
        art: "Art. 20 - 24",
        title: "Sanciones y Garantía del Debido Proceso",
        content: "Las sanciones son: Condicionamiento de matrícula o Cancelación definitiva de matrícula. Todo procedimiento disciplinario exige citación formal, derecho a rendir descargos, aportar pruebas, concepto del Comité y derecho al Recurso de Reposición."
      }
    ]
  }
];

export const SENA_RIGHTS: SenaRight[] = [
  {
    id: "r1",
    category: "Académico",
    title: "Inducción Completa y Oportuna",
    description: "Recibir la inducción sobre la institución, el reglamento, los estatutos, los ambientes de aprendizaje y el proyecto formativo al iniciar el programa.",
    articleRef: "Acuerdo 009/2024, Art. 7, Numeral 1",
    iconName: "Compass"
  },
  {
    id: "r2",
    category: "Académico",
    title: "Formación Profesional Integral de Calidad",
    description: "Disfrutar de programas actualizados, orientados por instructores calificados y acordes con las demandas del sector productivo.",
    articleRef: "Acuerdo 009/2024, Art. 7, Numeral 2",
    iconName: "GraduationCap"
  },
  {
    id: "r3",
    category: "Académico",
    title: "Acceso a Infraestructura y Tecnología",
    description: "Hacer uso de talleres, laboratorios, bibliotecas físicas y virtuales (SENALAB, Zajuna, bases de datos) y herramientas tecnológicas necesarias.",
    articleRef: "Acuerdo 009/2024, Art. 7, Numeral 4",
    iconName: "Laptop"
  },
  {
    id: "r4",
    category: "Garantías y Debido Proceso",
    title: "Evaluación Justa y Retroalimentación",
    description: "Conocer los criterios e instrumentos de evaluación con anterioridad, ser evaluado objetivamente y recibir retroalimentación oportuna en los tiempos estipulados.",
    articleRef: "Acuerdo 009/2024, Art. 7, Numeral 6",
    iconName: "CheckCircle2"
  },
  {
    id: "r5",
    category: "Garantías y Debido Proceso",
    title: "Garantía del Debido Proceso",
    description: "Ser escuchado, rendir descargos, presentar pruebas y ejercer el derecho a la defensa y contradicción ante el Comité de Evaluación y Seguimiento.",
    articleRef: "Acuerdo 009/2024, Art. 7, Numeral 9",
    iconName: "Scale"
  },
  {
    id: "r6",
    category: "Bienestar",
    title: "Servicios de Bienestar al Aprendiz",
    description: "Acceder a programas de salud ocupacional, recreación, deportes, cultura, apoyo psicosocial y monitorías formativas.",
    articleRef: "Acuerdo 009/2024, Art. 7, Numeral 5",
    iconName: "HeartHandshake"
  },
  {
    id: "r7",
    category: "Participación",
    title: "Voto, Vocería y Representación",
    description: "Elegir y postularse democráticamente como Vocero de Ficha o Representante de los Aprendices del Centro de Formación ante los órganos directivos.",
    articleRef: "Acuerdo 009/2024, Art. 8",
    iconName: "Users"
  },
  {
    id: "r8",
    category: "Garantías y Debido Proceso",
    title: "Libre de Discriminación y Acoso",
    description: "Ambiente libre de todo tipo de violencia, hostigamiento o discriminación por motivos de género, raza, credo religioso o condición socioeconómica.",
    articleRef: "Acuerdo 009/2024, Art. 7, Numeral 12",
    iconName: "ShieldCheck"
  }
];

export const SENA_DUTIES: SenaDuty[] = [
  {
    id: "d1",
    category: "Convivencia y Respeto",
    title: "Porte Visible del Carné Institucional",
    description: "Portar en lugar visible el carné que lo acredita como aprendiz SENA al ingresar y permanecer en las instalaciones o eventos institucionales.",
    articleRef: "Acuerdo 009/2024, Art. 9, Numeral 1",
    iconName: "IdCard"
  },
  {
    id: "d2",
    category: "Académico y Formativo",
    title: "Puntualidad y Asistencia Activa",
    description: "Cumplir con los horarios pactados tanto en la etapa lectiva como en la etapa productiva, justificando inasistencias en los 3 días hábiles siguientes con soporte.",
    articleRef: "Acuerdo 009/2024, Art. 9, Numeral 3",
    iconName: "Clock"
  },
  {
    id: "d3",
    category: "Cuidado de Bienes y SST",
    title: "Uso Obligatorio de Elementos de Protección (EPP)",
    description: "Utilizar los EPP, uniforme correspondiente y acatar normas de Seguridad y Salud en el Trabajo en talleres, laboratorios y ambientes productivos.",
    articleRef: "Acuerdo 009/2024, Art. 9, Numeral 5",
    iconName: "HardHat"
  },
  {
    id: "d4",
    category: "Académico y Formativo",
    title: "Honestidad Intelectual y Autoría",
    description: "Entregar evidencias de aprendizaje de autoría propia, citando debidamente fuentes bibliográficas y absteniéndose de fraude o plagio.",
    articleRef: "Acuerdo 009/2024, Art. 9, Numeral 7",
    iconName: "BookOpenCheck"
  },
  {
    id: "d5",
    category: "Cuidado de Bienes y SST",
    title: "Preservación y Cuidado de Recursos",
    description: "Hacer uso racional y responsable de maquinaria, computadores, mobiliario, instalaciones y recursos naturales del Centro.",
    articleRef: "Acuerdo 009/2024, Art. 9, Numeral 8",
    iconName: "Wrench"
  },
  {
    id: "d6",
    category: "Convivencia y Respeto",
    title: "Trato Respetuoso y Tolerante",
    description: "Mantener relaciones interpersonales basadas en el respeto mutuo, diálogo, inclusión y no agresión con instructores, compañeros y personal administrativo.",
    articleRef: "Acuerdo 009/2024, Art. 9, Numeral 10",
    iconName: "Smile"
  }
];

export const SENA_PROHIBITIONS: SenaProhibition[] = [
  {
    id: "p1",
    title: "Plagio o Fraude Académico",
    severity: "Grave",
    description: "Copiar total o parcialmente trabajos, evidencias, proyectos de otros aprendices o de fuentes externas sin citación, o suplantar a otro aprendiz en evaluaciones.",
    consequence: "Plan disciplinario, calificación reprobatoria y posible remisión a Comité de Evaluación.",
    articleRef: "Acuerdo 009/2024, Art. 11, Num. 2"
  },
  {
    id: "p2",
    title: "Sustancias Psicoactivas y Alcohol",
    severity: "Gravísima",
    description: "Ingresar, comercializar, portar o consumir bebidas embriagantes o sustancias psicoactivas dentro de las sedes o en actividades formativas externas del SENA.",
    consequence: "Falta gravísima causal directa de Comité y posible Cancelación de Matrícula.",
    articleRef: "Acuerdo 009/2024, Art. 11, Num. 4"
  },
  {
    id: "p3",
    title: "Porte de Armas u Objetos Peligrosos",
    severity: "Gravísima",
    description: "Portar cualquier tipo de arma de fuego, cortopunzante o elementos explosivos dentro de las instalaciones o vehículos institucionales.",
    consequence: "Cancelación inmediata de matrícula y notificación a autoridades judiciales correspondientes.",
    articleRef: "Acuerdo 009/2024, Art. 11, Num. 5"
  },
  {
    id: "p4",
    title: "Acoso, Ciberacoso y Violencias de Género",
    severity: "Gravísima",
    description: "Realizar actos de hostigamiento físico, verbal o digital, acoso sexual, amenazas o conductas discriminatorias contra cualquier miembro de la comunidad SENA.",
    consequence: "Activación inmediata de la Ruta de Atención Integral, medidas cautelares y sanción disciplinaria máxima.",
    articleRef: "Acuerdo 009/2024, Art. 12"
  },
  {
    id: "p5",
    title: "Proselitismo Político o Religioso Coercitivo",
    severity: "Grave",
    description: "Realizar campañas políticas partidistas, proselitismo religioso con presión o venta/rifas lucrativas particulares dentro del Centro sin autorización.",
    consequence: "Llamado de atención escrito y plan de mejoramiento.",
    articleRef: "Acuerdo 009/2024, Art. 11, Num. 8"
  },
  {
    id: "p6",
    title: "Destrucción o Sabotaje de Bienes",
    severity: "Grave",
    description: "Dañar intencionalmente equipos, software institucional, mobiliario, instalaciones o plataformas virtuales (Zajuna / Sofía Plus).",
    consequence: "Reparación del daño económico causado más sanción disciplinaria.",
    articleRef: "Acuerdo 009/2024, Art. 11, Num. 9"
  }
];

export const SENA_CASE_STUDIES: SenaCaseStudy[] = [
  {
    id: "caso-1",
    title: "El Caso del Trabajo Final y la 'Inspiración'",
    context: "Ambiente de Formación - Etapa Lectiva",
    situation: "Carlos debe entregar un proyecto de desarrollo y análisis del mercado. Con poco tiempo, copia párrafos enteros de un blog técnico y del trabajo de un compañero de otra ficha sin citar las fuentes, afirmando que 'todo en internet es público'.",
    options: [
      {
        id: "c1-a",
        text: "Es válido porque en formación técnica se premia la rapidez y la información de internet no tiene dueño.",
        isCorrect: false,
        explanation: "Incorrecto. Todo contenido tiene derechos de autor. En el SENA el respeto a la propiedad intelectual es un deber ineludible."
      },
      {
        id: "c1-b",
        text: "Constituye plagio académico, clasificado como falta que amerita plan de mejoramiento o sanción por el Comité según el Acuerdo 009 de 2024.",
        isCorrect: true,
        explanation: "¡Correcto! El Acuerdo 009 de 2024 sanciona el fraude y plagio académico. Siempre se debe citar al autor y generar análisis propio."
      },
      {
        id: "c1-c",
        text: "Solo es falta si el compañero de la otra ficha pone una demanda penal externa.",
        isCorrect: false,
        explanation: "Incorrecto. Las normas internas del SENA aplican inmediatamente sin necesidad de procesos externos."
      }
    ],
    relatedRegulation: "Capítulo IV - Prohibiciones (Art. 11 Plagio) y Capítulo III - Deberes de Honestidad Intelectual."
  },
  {
    id: "caso-2",
    title: "Inasistencia por Fuerza Mayor y Trámite Oportuno",
    context: "Cumplimiento de Horarios y Registro de Asistencia",
    situation: "Laura presentó un cuadro de fiebre alta y asistió a urgencias de su EPS el día martes. No pudo asistir a sus clases de taller durante dos días.",
    options: [
      {
        id: "c2-a",
        text: "Debe avisar después de 15 días cuando ya esté calificada la falta para evitar que el instructor se entere.",
        isCorrect: false,
        explanation: "Incorrecto. Esperar tanto tiempo puede generar reporte de deserción formativa injustificada."
      },
      {
        id: "c2-b",
        text: "Debe presentar la incapacidad médica formal al instructor dentro de los 3 días hábiles siguientes al reintegro para justificar la inasistencia.",
        isCorrect: true,
        explanation: "¡Correcto! El reglamento del SENA otorga hasta 3 días hábiles posteriores al reintegro para allegar soportes y acordar la entrega de evidencias."
      },
      {
        id: "c2-c",
        text: "Las inasistencias en el SENA nunca se justifican sin importar la causa médica.",
        isCorrect: false,
        explanation: "Incorrecto. El derecho a la salud y el debido proceso garantizan la justificación con soporte válido de EPS o fuerza mayor comprobable."
      }
    ],
    relatedRegulation: "Capítulo III - Deberes de Asistencia y Justificación de Inasistencias (3 días hábiles)."
  },
  {
    id: "caso-3",
    title: "Seguridad en Talleres y Uso de EPP",
    context: "Taller Industrial / Ambiente de Aprendizaje Práctico",
    situation: "Un aprendiz decide quitarse las gafas de seguridad y las botas dieléctricas en el laboratorio porque 'hace mucho calor' y desea terminar rápido el ejercicio de soldadura y circuitos.",
    options: [
      {
        id: "c3-a",
        text: "El instructor debe permitirlo si el aprendiz firma un papel diciendo que asume su propio riesgo.",
        isCorrect: false,
        explanation: "Incorrecto. La seguridad industrial y el cuidado de la vida son de estricto cumplimiento legal e institucional."
      },
      {
        id: "c3-b",
        text: "El uso de los Elementos de Protección Personal (EPP) es un deber obligatorio de seguridad y su omisión pone en riesgo la vida e integridad.",
        isCorrect: true,
        explanation: "¡Correcto! Cumplir las normas de SST y portar los EPP es obligatorio en todos los ambientes y talleres del SENA."
      },
      {
        id: "c3-c",
        text: "Solo es obligatorio si hay una inspección del Ministerio de Trabajo ese mismo día.",
        isCorrect: false,
        explanation: "Incorrecto. Es un deber permanente consagrado en los deberes del aprendiz y las normas de SST."
      }
    ],
    relatedRegulation: "Capítulo III, Art. 9 - Deberes de Seguridad y Salud en el Trabajo (SST)."
  },
  {
    id: "caso-4",
    title: "Activación de la Ruta contra Acoso y Violencia de Género",
    context: "Convivencia y Entorno Formativo Seguro",
    situation: "Una aprendiz está recibiendo mensajes insistentes de contenido intimidatorio y de acoso por redes sociales de un compañero de ficha, afectando su tranquilidad y desempeño.",
    options: [
      {
        id: "c4-a",
        text: "Debe guardar silencio porque lo que pasa en redes sociales no tiene relación con el SENA.",
        isCorrect: false,
        explanation: "Incorrecto. El ciberacoso y las conductas que afecten a miembros de la comunidad formativa están protegidas por la normativa institucional."
      },
      {
        id: "c4-b",
        text: "Puede acudir a Bienestar al Aprendiz, Coordinación Académica o el Comité para activar el Protocolo de Prevención y Atención del Acoso y Violencias Basadas en Género.",
        isCorrect: true,
        explanation: "¡Excelente! El SENA cuenta con un protocolo prioritario para brindar acompañamiento psicosocial, medidas de protección y debido proceso inmediato."
      },
      {
        id: "c4-c",
        text: "Debe responder con insultos públicos para defenderse por sus propios medios.",
        isCorrect: false,
        explanation: "Incorrecto. La agresión mutua distorsiona el debido proceso; se deben usar los canales institucionales de protección."
      }
    ],
    relatedRegulation: "Acuerdo 009 de 2024, Art. 12 - Protocolo Institucional de Prevención y Atención del Acoso y Violencias."
  }
];

export const SENA_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    module: "derechos",
    question: "¿Cuál es la norma reciente que adopta el Reglamento del Aprendiz SENA actualizando sus derechos, deberes y debido proceso?",
    options: [
      "Acuerdo 009 de 2024",
      "Decreto 1072 de 1990",
      "Ley 100 de 1993",
      "Circular 001 de 2010"
    ],
    correctAnswer: 0,
    explanation: "El Acuerdo 009 de 2024 es la normativa oficial reciente que rige la formación profesional integral y la vida formativa del aprendiz SENA.",
    normativeReference: "Acuerdo 009 de 2024 del Consejo Directivo Nacional del SENA"
  },
  {
    id: "q2",
    module: "derechos",
    question: "¿Cuál de los siguientes es un DERECHO fundamental del aprendiz SENA?",
    options: [
      "Faltar a formación sin necesidad de presentar justificación médica",
      "Recibir una inducción completa al iniciar y contar con evaluación formativa justa y objetiva",
      "Elegir el horario de atención de los instructores a criterio personal",
      "Comercializar productos dentro de los talleres sin supervisión"
    ],
    correctAnswer: 1,
    explanation: "El artículo 7 establece como derecho recibir inducción completa, formación de calidad y evaluaciones objetivas con retroalimentación oportuna.",
    normativeReference: "Capítulo II, Art. 7 - Derechos del Aprendiz"
  },
  {
    id: "q3",
    module: "deberes",
    question: "Dentro de las instalaciones del SENA, ¿cómo y cuándo debe portarse el carné institucional?",
    options: [
      "Solo guardado en la billetera por si algún celador lo solicita",
      "Únicamente el día de la graduación de la formación",
      "En un lugar visible en todo momento de permanencia en las instalaciones o eventos oficiales",
      "No es obligatorio portarlo una vez se apruebe la inducción"
    ],
    correctAnswer: 2,
    explanation: "El carné institucional debe portarse de manera visible permanentemente para salvaguardar la seguridad e identidad de la comunidad SENA.",
    normativeReference: "Capítulo III, Art. 9 Numeral 1 - Deberes de Identificación"
  },
  {
    id: "q4",
    module: "deberes",
    question: "¿Cuántos días hábiles tiene un aprendiz para justificar formalmente una inasistencia ante su instructor?",
    options: [
      "Hasta 3 días hábiles siguientes al reintegro a sus actividades",
      "15 días hábiles después del cierre del trimestre",
      "El mismo día antes de las 6:00 a.m. sin excepción",
      "No existe plazo, se puede presentar al final de la formación"
    ],
    correctAnswer: 0,
    explanation: "El reglamento estipula un plazo de hasta tres (3) días hábiles siguientes al reintegro con los respectivos soportes válidos.",
    normativeReference: "Capítulo III - Procedimiento de Justificación de Inasistencias"
  },
  {
    id: "q5",
    module: "prohibiciones",
    question: "¿Qué tipo de falta constituye el ingreso, porte o consumo de sustancias psicoactivas o alcohol en el SENA?",
    options: [
      "Falta leve subsanable con un saludo cordial",
      "Falta gravísima que puede acarrear la cancelación inmediata de la matrícula",
      "No constituye falta si se hace fuera del horario de clase en la cafetería",
      "Una falta que prescribe en 24 horas"
    ],
    correctAnswer: 1,
    explanation: "El ingreso, consumo o comercialización de drogas o alcohol es clasificado como falta gravísima por vulnerar la integridad y la ley.",
    normativeReference: "Capítulo IV, Art. 11 - Prohibiciones y Faltas Gravísimas"
  },
  {
    id: "q6",
    module: "debido_proceso",
    question: "¿Cuál es la instancia encargada de analizar las faltas graves o gravísimas y recomendar medidas o sanciones al Subdirector de Centro?",
    options: [
      "El Comité de Evaluación y Seguimiento del Centro de Formación",
      "La Policía Nacional únicamente",
      "El personero municipal",
      "La empresa patrocinadora de manera unilateral"
    ],
    correctAnswer: 0,
    explanation: "El Comité de Evaluación y Seguimiento es el órgano colegiado que analiza las evidencias, escucha al aprendiz y vela por el debido proceso.",
    normativeReference: "Capítulo VI - Comité de Evaluación y Seguimiento"
  },
  {
    id: "q7",
    module: "debido_proceso",
    question: "Dentro de las garantías del debido proceso, ¿qué derecho tiene el aprendiz una vez notificado de un informe de presunta falta?",
    options: [
      "A ser sancionado sin derecho a hablar para agilizar los trámites",
      "A rendir descargos, aportar pruebas y presentar recurso de reposición frente a la decisión",
      "A no ser evaluado nunca más durante el trimestre",
      "A transferirse de centro inmediatamente sin concluir la investigación"
    ],
    correctAnswer: 1,
    explanation: "El debido proceso (Art. 29 de la Constitución y el Acuerdo 009 de 2024) garantiza el derecho a la defensa, contradicción y recursos de ley.",
    normativeReference: "Capítulo VI - Principios Rectores del Debido Proceso"
  },
  {
    id: "q8",
    module: "prohibiciones",
    question: "¿Qué conducta está estrictamente prohibida en relación con la producción académica y evaluaciones?",
    options: [
      "Pedir libros prestados en la biblioteca del SENA",
      "Trabajar en equipo con compañeros asignados por el instructor",
      "El plagio, copia o suplantación en actividades y evidencias de aprendizaje",
      "Consultar fuentes oficiales en internet debidamente referenciadas"
    ],
    correctAnswer: 2,
    explanation: "El plagio y la suplantación vulneran la ética formativa y los derechos de autor, constituyendo faltas disciplinarias y académicas.",
    normativeReference: "Capítulo IV, Art. 11 Numeral 2"
  },
  {
    id: "q9",
    module: "etapa_productiva",
    question: "¿Cuál es el propósito fundamental de la etapa productiva en el programa de formación del SENA?",
    options: [
      "Tener vacaciones remuneradas sin seguimiento del centro",
      "Aplicar y complementar en un entorno laboral real las competencias desarrolladas en la etapa lectiva",
      "Reemplazar a los instructores en la enseñanza a aprendices nuevos",
      "Pagar una cuota económica al SENA para recibir el título"
    ],
    correctAnswer: 1,
    explanation: "La etapa productiva permite al aprendiz consolidar y validar en contextos reales del sector productivo las competencias adquiridas.",
    normativeReference: "Capítulo V - Etapa Productiva y Alternativas de Cumplimiento"
  },
  {
    id: "q10",
    module: "derechos",
    question: "¿Qué figura de representación democrática eligen los aprendices en cada ficha para canalizar inquietudes formativas?",
    options: [
      "El Representante del Sector Empresarial",
      "El Vocero de Ficha de Aprendices",
      "El Gerente de Calidad",
      "El Auditor Externo de la DIAN"
    ],
    correctAnswer: 1,
    explanation: "El Vocero de Ficha es elegido democráticamente por sus compañeros para dinamizar la comunicación y apoyar la convivencia.",
    normativeReference: "Capítulo II, Art. 8 - Participación y Vocerías"
  }
];

export const SENA_REGIONALES = [
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bogotá D.C.",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada"
];

export const SENA_CENTROS_EJEMPLO = [
  "Centro de Gestión de Mercados, Logística y Tecnologías de la Información",
  "Centro de Electricidad, Electrónica y Telecomunicaciones (CEET)",
  "Centro de Manufactura en Textil y Cuero",
  "Centro de Biotecnología Agropecuaria",
  "Centro de Servicios Financieros",
  "Centro Tecnológico del Mobiliario",
  "Centro de Formación en Actividad Física y Cultura",
  "Centro Minero y Ambiental",
  "Centro Internacional Náutico, Fluvial y Portuario"
];

export interface LearnerProfile {
  fullName: string;
  docType: 'CC' | 'TI' | 'CE' | 'PPT';
  docNumber: string;
  regional: string;
  centerName: string;
  programName: string;
  fichaNumber: string;
  email: string;
  avatarId?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export const INITIAL_BADGES: Badge[] = [
  {
    id: "b-rights",
    title: "Conocedor de Derechos",
    description: "Exploraste y asimilaste los derechos fundamentales del aprendiz SENA.",
    iconName: "ShieldCheck",
    unlocked: false
  },
  {
    id: "b-duties",
    title: "Aprendiz Ejemplar",
    description: "Dominaste los deberes formativos, de convivencia y normas de SST.",
    iconName: "Award",
    unlocked: false
  },
  {
    id: "b-cases",
    title: "Estratega de Convivencia",
    description: "Resolviste exitosamente todos los dilemas éticos y casos prácticos.",
    iconName: "Lightbulb",
    unlocked: false
  },
  {
    id: "b-certified",
    title: "Embajador Integral SENA",
    description: "Aprobaste la evaluación final oficial con puntaje sobresaliente.",
    iconName: "Medal",
    unlocked: false
  }
];
