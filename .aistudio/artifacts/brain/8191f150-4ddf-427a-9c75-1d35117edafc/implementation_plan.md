# Sincronización Automática y Desatendida con Google Sheets en Google Drive

Plan estructurado para automatizar completamente la conexión y guardado de datos de aprendices en Google Drive sin requerir clics manuales ni configuraciones recurrentes.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisiones confirmadas durante la fase de aclaración para gobernar la implementación:

- **Momento del Disparador Automático**: La sincronización se ejecutará automáticamente en el instante en que el aprendiz **aprueba la evaluación final de inducción y genera su certificado oficial**.
- **Gestión de la Conexión Desatendida**: Reconexión transparente y automática. El sistema detectará la sesión activa de Google y el ID de la hoja de cálculo existente, renovando el canal de comunicación en segundo plano sin desplegar modales molestos ni pedir configuraciones recurrentes.
- **Feedback Visual**: Notificación *toast* discreta y elegante en la esquina inferior con icono verde institucional que confirma el guardado en Google Drive sin interrumpir la visualización del certificado ni el flujo del usuario.

---

## 1. Overview & Core Concept

- **Qué hace**: Automatiza el ciclo completo de persistencia institucional. Cuando un aprendiz culmina con éxito su evaluación del Reglamento del Aprendiz (Acuerdo 009 de 2024), el prototipo toma de inmediato sus datos (identificación, regional, centro, ficha, puntaje, código de certificado y timestamp), verifica o genera la hoja de cálculo en Google Drive y añade la fila de registro sin requerir intervención manual del instructor ni del aprendiz.
- **Audiencia objetivo**: Aprendices e Instructores/Coordinadores de formación del SENA que necesitan que las evidencias y caracterización de inducción se registren automáticamente en una hoja compartida institucionalmente.
- **Valor clave**: Cero fricción operativa; elimina el error humano y la necesidad de recordar hacer clic en botones de sincronización o lidiar con ventanas de confirmación repetitivas.

---

## 2. User Experience & Visual Design

- **Flujo de Usuario Automatizado**:
  1. El aprendiz presenta la evaluación final de inducción.
  2. Al responder correctamente $\ge 80\%$, el sistema ejecuta `handlePassEvaluation`.
  3. En paralelo a la generación del certificado y confeti, el servicio en segundo plano detecta la sesión de Google y envía de forma asíncrona el registro a Google Sheets.
  4. Aparece un toast sutil en la parte inferior: *"✓ Registro de inducción guardado automáticamente en Google Drive"*, incluyendo un botón sutil para abrir la hoja directamente si se desea consultar.
  5. En el **Panel de Instructor**, la ficha se actualiza automáticamente mostrando el badge de sincronización en verde para ese aprendiz sin requerir recargar la página.

- **Identidad Visual & Estilo**:
  - Respeto riguroso de la paleta institucional SENA: Verde principal (`#39A900`), acentos esmeralda oscuro (`#1B5E20`) y neutros limpios.
  - Soporte impecable tanto en Modo Claro como en Modo Oscuro (con el efecto de desenfoque y resplandor ambiental azul ya configurado).
  - Cero "pills" estáticas saturadas: los estados de sincronización se presentan como tipografía limpia con indicadores de color minimalistas y semánticos.

- **Interacción & Animación**:
  - Transición fluida del toast mediante animación de entrada/salida fade-slide.
  - Indicador de estado en segundo plano (spinner miniatura mientras se realiza la petición, seguido del check verde).

---

## 3. Key Product Decisions & Trade-Offs

- **Estrategia de Autenticación Continua (Silent Auth & Auto-Reconnect)**:
  - *Enfoque*: Inicializar el oyente de autenticación de Google al cargar la aplicación. Si el usuario ya autorizó previamente la aplicación en su navegador, el token se obtiene de inmediato en memoria y se almacena la referencia del archivo en `localStorage` (`sena_induction_google_sheet_id`).
  - *Por qué*: Evita abrir popups intrusivos cada vez que se quiere guardar un registro.
  - *Alternativa descartada*: Pedir confirmación modal en cada guardado. Se descartó porque el usuario solicitó específicamente no tener que intervenir en el prototipo continuamente.

- **Cola de Reintento Desconectado (Offline / Pending Queue)**:
  - *Enfoque*: Si en el momento de la evaluación no hay conexión a internet o el token de Google expiró temporalmente, el registro del aprendiz se encola localmente como `pendiente_drive`. Tan pronto se restablezca la conexión o la sesión, el sistema procesa la cola automáticamente.
  - *Por qué*: Garantiza que ningún certificado aprobado se pierda por fallas transitorias de red.

---

## 4. Technical Architecture & Data Strategy

### Diagrama del Sistema y Flujo de Sincronización Automática

```
┌────────────────────────────────────────────────────────────────────────┐
│                          FLUID USER INTERFACE                          │
│                                                                        │
│  [ QuizCertification ] ──( Aprobación >=80% )──> [ handlePassEvaluation ]
│                                                               │        
└───────────────────────────────────────────────────────────────┼────────┘
                                                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 BACKGROUND AUTO-SYNC ORCHESTRATOR                      │
│                                                                        │
│  1. Invocación Asíncrona (no bloquea UI de Certificado)                │
│  2. Obtiene Access Token en memoria vía Firebase Google Auth           │
│  3. Resuelve ID de Hoja de Cálculo (Caché local o Búsqueda en Drive)   │
│  4. Inyecta fila: [ Timestamp, Nombre, Doc, Ficha, %, CertID, XP... ]  │
│                                                               │        
└──────────────────────────────────────┬────────────────────────┼────────┘
                                       │                        ▼
                                       │    ┌────────────────────────────┐
                                       │    │    GOOGLE WORKSPACE API    │
                                       │    │                            │
                                       │    │  • Drive API v3 (Verifica) │
                                       │    │  • Sheets API v4 (Append)  │
                                       │    └─────────────┬──────────────┘
                                       ▼                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 FEEDBACK & STATUS SYNCHRONIZATION                      │
│                                                                        │
│  • Emite Toast discreto: "✓ Guardado automáticamente en Google Drive" │
│  • Actualiza estado de Ficha en InstructorDashboard                    │
│  • Registra ID de documento en sena_drive_synced_learner_ids          │
└────────────────────────────────────────────────────────────────────────┘
```

### Componentes y Módulos a Actualizar:

1. **`src/services/googleSheetsService.ts`**:
   - Función optimizada `autoSyncLearnerToDrive(record: LearnerSheetRecord)`: orquesta la obtención del token, resolución de la hoja de cálculo existente (o creación transparente si es la primera vez) y adición de la fila de datos en una sola llamada desatendida.
   - Manejo de cola de contingencia local en caso de desconexión momentánea.

2. **`src/services/googleAuth.ts`**:
   - Mejorar `initAuth` y añadir función de reconexión silenciosa (`silentSignInOrPrompt`) para asegurar que el token esté disponible al instante en que el aprendiz complete la prueba.

3. **`src/App.tsx`**:
   - Enlazar `handlePassEvaluation` para disparar `autoSyncLearnerToDrive` de forma completamente automática en segundo plano.
   - Renderizar el toast discreto de notificación de sincronización automática.

4. **`src/components/InstructorDashboard.tsx`**:
   - Reflejar en tiempo real la sincronización automática de los aprendices sin requerir acciones manuales por parte del docente.

5. **`src/components/CertificateView.tsx`**:
   - Mostrar el estado *"Sincronizado automáticamente en Google Drive"* junto con el enlace directo para visualizar la hoja, sin necesidad de que el estudiante pulse botones adicionales.
