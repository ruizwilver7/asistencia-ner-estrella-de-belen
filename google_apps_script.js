/**
 * ============================================================================
 * SISTEMA DE CONTROL DE ASISTENCIA DIARIA - NER ESTRELLA DE BELÉN
 * Script de Sincronización en la Nube con Google Sheets (Google Apps Script)
 * ============================================================================
 * 
 * INSTRUCCIONES PARA ACTIVAR ESTE SCRIPT:
 * 1. Abre tu Google Drive (o entra a sheets.google.com).
 * 2. Crea una hoja de cálculo en blanco con el nombre:
 *    "Asistencia NER Estrella de Belen"
 * 3. En el menú superior de la hoja, entra a:
 *    Extensiones -> Apps Script
 * 4. Borra todo el código que aparezca y pega TODO este archivo.
 * 5. Haz clic en el botón azul "Implementar" (arriba a la derecha) -> "Nueva implementación".
 * 6. En el engranaje (Tipo), selecciona: "Aplicación web".
 * 7. Configura lo siguiente:
 *    - Descripción: Sincronización NER Asistencia
 *    - Ejecutar como: "Yo" (tu cuenta de correo)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)
 * 8. Haz clic en "Implementar" y concédele los permisos que te pida Google.
 * 9. Copia la "URL de la aplicación web" (termina en /exec).
 * 10. Pega esa URL en el sistema de Asistencia (en el Panel de Dirección).
 * ============================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var stateSheet = getOrCreateSheet(ss, "SINCRONIZACION_JSON");
    var rawJson = stateSheet.getRange("A1").getValue();
    var data = rawJson ? JSON.parse(rawJson) : null;

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No se recibieron datos en la solicitud POST");
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    // 1. Guardar el estado JSON completo para sincronización rápida entre celulares y computadoras
    if (payload.syncState) {
      var stateSheet = getOrCreateSheet(ss, "SINCRONIZACION_JSON");
      stateSheet.getRange("A1").setValue(JSON.stringify(payload.syncState));
    }

    // 2. Si es registro de asistencia diaria, registrar filas legibles en "Asistencia_Diaria"
    if (action === "saveDailyAttendance" && payload.records && payload.records.length > 0) {
      recordDailyAttendanceRows(ss, payload);
    }

    // 3. Si es actualización de matrícula oficial de Dirección, registrar en "Matricula_Oficial"
    if (action === "saveBaseConfig" && payload.schools) {
      recordBaseConfigRows(ss, payload.schools);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Datos sincronizados correctamente con Google Sheets",
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene una hoja por su nombre o la crea si no existe
 */
function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Registra o actualiza las filas legibles en la hoja "Asistencia_Diaria"
 */
function recordDailyAttendanceRows(ss, payload) {
  var sheet = getOrCreateSheet(ss, "Asistencia_Diaria");
  
  // Encabezados si la hoja está vacía
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Fecha", "Hora", "Código Escuela", "Nombre del Centro", "Modalidad", "Turno",
      "Mat. Varones", "Mat. Mujeres", "Mat. Total",
      "Asist. Varones", "Asist. Mujeres", "Asist. Total", "% Asistencia",
      "Doc. Asist M", "Doc. Asist F", "Doc. Asist T",
      "Doc. Just M", "Doc. Just F", "Doc. Just T",
      "Doc. Injust M", "Doc. Injust F", "Doc. Injust T"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0F3E22");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  var dateStr = payload.date || Utilities.formatDate(new Date(), "GMT-6", "yyyy-MM-dd");
  var timeStr = payload.time || Utilities.formatDate(new Date(), "GMT-6", "hh:mm a");
  var schoolId = payload.schoolId;

  // Si ya existen filas para esta escuela en esta fecha, actualizarlas o eliminarlas primero para no duplicar
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (var i = values.length - 1; i >= 0; i--) {
      var rowDate = values[i][0];
      var rowSchoolId = String(values[i][2]);
      if (rowDate === dateStr && rowSchoolId === String(schoolId)) {
        sheet.deleteRow(i + 2);
      }
    }
  }

  // Insertar los registros actualizados
  var newRows = [];
  for (var k = 0; k < payload.records.length; k++) {
    var r = payload.records[k];
    newRows.push([
      dateStr,
      timeStr,
      r.schoolId,
      r.schoolName,
      r.modalityName,
      r.turno,
      r.matM,
      r.matF,
      r.matT,
      r.asistM,
      r.asistF,
      r.asistT,
      r.pct + "%",
      r.docAsistM,
      r.docAsistF,
      r.docAsistT,
      r.docJustM,
      r.docJustF,
      r.docJustT,
      r.docInjustM,
      r.docInjustF,
      r.docInjustT
    ]);
  }

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
}

/**
 * Guarda el catálogo oficial de matrículas y docentes base en "Matricula_Oficial"
 */
function recordBaseConfigRows(ss, schools) {
  var sheet = getOrCreateSheet(ss, "Matricula_Oficial");
  sheet.clear();

  var headers = [
    "Código Escuela", "Nombre del Centro", "Modalidad", "Turno",
    "Matrícula Base Varones (M)", "Matrícula Base Mujeres (F)", "Matrícula Base Total",
    "Docentes Base Varones (M)", "Docentes Base Mujeres (F)", "Docentes Base Total"
  ];
  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#154734");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);

  var rows = [];
  for (var i = 0; i < schools.length; i++) {
    var sc = schools[i];
    for (var j = 0; j < sc.modalities.length; j++) {
      var m = sc.modalities[j];
      rows.push([
        sc.id,
        sc.name,
        m.name,
        m.turno,
        m.baseMatM || 0,
        m.baseMatF || 0,
        (m.baseMatM || 0) + (m.baseMatF || 0),
        m.baseDocM || 0,
        m.baseDocF || 0,
        (m.baseDocM || 0) + (m.baseDocF || 0)
      ]);
    }
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}
