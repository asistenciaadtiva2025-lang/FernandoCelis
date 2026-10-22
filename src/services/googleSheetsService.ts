export interface LearnerSheetRecord {
  timestamp: string;
  fullName: string;
  docType: string;
  docNumber: string;
  regional: string;
  centerName: string;
  programName: string;
  fichaNumber: string;
  score: string;
  status: string;
  certificateId: string;
  xp: number;
  badgesEarned: string;
  email: string;
}

const DEFAULT_SPREADSHEET_TITLE = "SENA - Registro de Inducción de Aprendices (Acuerdo 009 de 2024)";
const SPREADSHEET_ID_STORAGE_KEY = "sena_induction_google_sheet_id";

export const HEADERS = [
  "Fecha y Hora de Registro",
  "Nombres y Apellidos",
  "Tipo Doc",
  "Número de Documento",
  "Regional SENA",
  "Centro de Formación",
  "Programa de Formación",
  "Número de Ficha",
  "Calificación (%)",
  "Estado de Inducción",
  "Código Único de Certificado",
  "Puntos de Experiencia (XP)",
  "Insignias Obtenidas",
  "Correo Electrónico"
];

/**
 * Searches Google Drive for an existing induction spreadsheet or creates a new one.
 */
export async function findOrCreateSpreadsheet(
  accessToken: string, 
  title: string = DEFAULT_SPREADSHEET_TITLE
): Promise<{ spreadsheetId: string; webViewLink: string; isNew: boolean }> {
  // 1. Check if we already have a saved spreadsheetId in localStorage
  const cachedId = localStorage.getItem(SPREADSHEET_ID_STORAGE_KEY);
  if (cachedId) {
    try {
      const verifyRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cachedId}?fields=spreadsheetId,properties.title`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (verifyRes.ok) {
        return {
          spreadsheetId: cachedId,
          webViewLink: `https://docs.google.com/spreadsheets/d/${cachedId}/edit`,
          isNew: false
        };
      }
    } catch {
      // Continue to search if cached ID is inaccessible
    }
  }

  // 2. Search in Google Drive for file by exact name
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(title)}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,webViewLink)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const file = searchData.files[0];
        localStorage.setItem(SPREADSHEET_ID_STORAGE_KEY, file.id);
        return {
          spreadsheetId: file.id,
          webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
          isNew: false
        };
      }
    }
  } catch (err) {
    console.warn("Could not search Google Drive, proceeding to create sheet:", err);
  }

  // 3. Create a new Google Spreadsheet with stylized headers
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            title: "Aprendices_Inducción_SENA",
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || "No se pudo crear la hoja de cálculo en Google Drive");
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const sheetId = createdData.sheets?.[0]?.properties?.sheetId || 0;

  // Insert Header Row
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Aprendices_Inducción_SENA!A1:N1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [HEADERS]
      })
    }
  );

  // Apply SENA Institutional Styling to Header (Green background, bold white text)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: HEADERS.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.224, green: 0.663, blue: 0.0 }, // #39A900 SENA Green
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    bold: true,
                    fontSize: 10
                  },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: HEADERS.length
              }
            }
          }
        ]
      })
    });
  } catch (styleErr) {
    console.warn("Could not apply formatting to headers:", styleErr);
  }

  localStorage.setItem(SPREADSHEET_ID_STORAGE_KEY, spreadsheetId);
  return {
    spreadsheetId,
    webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    isNew: true
  };
}

/**
 * Appends an apprentice induction record into the Google Sheet.
 */
export async function appendLearnerRecord(
  accessToken: string,
  spreadsheetId: string,
  record: LearnerSheetRecord
): Promise<boolean> {
  const rowData = [
    record.timestamp || new Date().toLocaleString('es-CO'),
    record.fullName,
    record.docType,
    record.docNumber,
    record.regional,
    record.centerName,
    record.programName,
    record.fichaNumber,
    record.score,
    record.status,
    record.certificateId,
    record.xp,
    record.badgesEarned,
    record.email
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Aprendices_Inducción_SENA!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowData]
      })
    }
  );

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error?.message || "Error al registrar aprendiz en Google Sheets");
  }

  return true;
}

/**
 * Appends multiple learner records to Google Sheets in a single batch request.
 */
export async function appendLearnerRecordsBatch(
  accessToken: string,
  spreadsheetId: string,
  records: LearnerSheetRecord[]
): Promise<boolean> {
  if (records.length === 0) return true;
  const rows = records.map(record => [
    record.timestamp || new Date().toLocaleString('es-CO'),
    record.fullName,
    record.docType,
    record.docNumber,
    record.regional,
    record.centerName,
    record.programName,
    record.fichaNumber,
    record.score,
    record.status,
    record.certificateId,
    record.xp,
    record.badgesEarned,
    record.email
  ]);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Aprendices_Inducción_SENA!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error?.message || "Error al sincronizar aprendices en Google Sheets");
  }

  return true;
}

/**
 * Reads existing records from the Google Sheet.
 */
export async function getLearnerRecordsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<string[][]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Aprendices_Inducción_SENA!A2:N`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.values || [];
}

const PENDING_QUEUE_KEY = 'sena_drive_pending_sync_queue';
const SYNCED_IDS_KEY = 'sena_drive_synced_learner_ids';
const LAST_SYNC_KEY = 'sena_drive_last_sync_timestamp';

/**
 * Returns any records queued for offline/pending sync.
 */
export function getPendingSyncRecords(): LearnerSheetRecord[] {
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Enqueues a learner record to be synced automatically when connection/token is restored.
 */
export function enqueuePendingRecord(record: LearnerSheetRecord): void {
  try {
    const current = getPendingSyncRecords();
    const exists = current.some(r => r.docNumber === record.docNumber && r.certificateId === record.certificateId);
    if (!exists) {
      current.push(record);
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.warn("Failed to enqueue pending record:", e);
  }
}

/**
 * Marks a document number as synced in localStorage.
 */
export function markRecordAsSynced(docNumber: string): void {
  try {
    localStorage.setItem(`sena_drive_saved_${docNumber}`, 'true');
    const rawIds = localStorage.getItem(SYNCED_IDS_KEY);
    const ids: string[] = rawIds ? JSON.parse(rawIds) : [];
    if (!ids.includes(docNumber)) {
      ids.push(docNumber);
      localStorage.setItem(SYNCED_IDS_KEY, JSON.stringify(ids));
    }
    localStorage.setItem(LAST_SYNC_KEY, new Date().toLocaleString('es-CO'));
  } catch (e) {
    console.warn("Failed to mark record as synced in storage:", e);
  }
}

/**
 * Flushes any pending offline records to Google Sheets.
 */
export async function flushPendingSyncQueue(accessToken: string): Promise<number> {
  const pending = getPendingSyncRecords();
  if (pending.length === 0) return 0;

  try {
    const sheetRes = await findOrCreateSpreadsheet(accessToken);
    await appendLearnerRecordsBatch(accessToken, sheetRes.spreadsheetId, pending);
    
    // Mark all as synced
    pending.forEach(r => markRecordAsSynced(r.docNumber));
    localStorage.removeItem(PENDING_QUEUE_KEY);
    return pending.length;
  } catch (err) {
    console.warn("Could not flush pending sync queue:", err);
    return 0;
  }
}

/**
 * Automatically syncs a learner record to Google Sheets in Google Drive.
 * Completely unattended: resolves spreadsheet, appends record, marks local storage,
 * and falls back to offline queue if token is currently absent.
 */
export async function autoSyncLearnerToDrive(
  accessToken: string | null,
  record: LearnerSheetRecord
): Promise<{ success: boolean; spreadsheetUrl?: string; queued?: boolean; error?: string }> {
  // If no token is provided right now, enqueue it for transparent sync as soon as session is active
  if (!accessToken) {
    enqueuePendingRecord(record);
    const cachedId = localStorage.getItem(SPREADSHEET_ID_STORAGE_KEY);
    return {
      success: true,
      queued: true,
      spreadsheetUrl: cachedId ? `https://docs.google.com/spreadsheets/d/${cachedId}/edit` : undefined
    };
  }

  try {
    const sheetRes = await findOrCreateSpreadsheet(accessToken);
    await appendLearnerRecord(accessToken, sheetRes.spreadsheetId, record);
    
    markRecordAsSynced(record.docNumber);

    // Also flush any other pending records
    flushPendingSyncQueue(accessToken).catch(() => {});

    return {
      success: true,
      spreadsheetUrl: sheetRes.webViewLink,
      queued: false
    };
  } catch (err: any) {
    console.error("AutoSync to Drive encountered an issue:", err);
    enqueuePendingRecord(record);
    return {
      success: false,
      queued: true,
      error: err.message || "Error al sincronizar con Google Drive"
    };
  }
}
