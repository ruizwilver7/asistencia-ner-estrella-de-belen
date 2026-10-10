/**
 * SISTEMA DE ASISTENCIA NER ESTRELLA DE BELÉN
 * Formato oficial unificado idéntico al consolidado oficial.
 * Descarga automática a las 2:30 PM y restablecimiento a matrícula oficial de Dirección.
 */

(function () {
  'use strict';

  // 1. CONFIGURACIÓN MAESTRA DE LOS 6 CENTROS (DATOS REALES DEL FORMATO OFICIAL DEL USUARIO)
  const INITIAL_SCHOOLS_CONFIG = [
    {
      id: '17692',
      num: '1',
      code: '17692',
      name: 'CENTRO ESCOLAR ESTRELLA DE BELEN',
      shortName: 'Estrella de Belén',
      modalities: [
        {
          id: 'eb-pre-form',
          name: 'PREESCOLAR FORMAL MULTINIVEL',
          turno: 'MATUTINO',
          baseMatM: 32,
          baseMatF: 23,
          baseDocM: 0,
          baseDocF: 1
        },
        {
          id: 'eb-prim-mat',
          name: 'PRIMARIA REGULAR',
          turno: 'MATUTINO',
          baseMatM: 50,
          baseMatF: 37,
          baseDocM: 0,
          baseDocF: 2
        },
        {
          id: 'eb-prim-vesp',
          name: 'PRIMARIA REGULAR',
          turno: 'VESPERTINO',
          baseMatM: 43,
          baseMatF: 62,
          baseDocM: 1,
          baseDocF: 2
        },
        {
          id: 'eb-sec-mat',
          name: 'SECUNDARIA DIURNA',
          turno: 'MATUTINO',
          baseMatM: 28,
          baseMatF: 43,
          baseDocM: 3,
          baseDocF: 3
        }
      ]
    },
    {
      id: '22988',
      num: '2',
      code: '22988',
      name: 'ALFONSO CORTES',
      shortName: 'Alfonso Cortés',
      modalities: [
        {
          id: 'ac-pre-com',
          name: 'PREESCOLAR COMUNITARIO MULTINIVEL',
          turno: 'MATUTINO',
          baseMatM: 5,
          baseMatF: 9,
          baseDocM: 0,
          baseDocF: 1
        },
        {
          id: 'ac-prim-multi',
          name: 'PRIMARIA MULTIGRADO',
          turno: 'MATUTINO',
          baseMatM: 43,
          baseMatF: 46,
          baseDocM: 0,
          baseDocF: 2
        }
      ]
    },
    {
      id: '23066',
      num: '3',
      code: '23066',
      name: 'LA CONCEPCION',
      shortName: 'La Concepción',
      modalities: [
        {
          id: 'lc-pre-com',
          name: 'PREESCOLAR COMUNITARIO MULTINIVEL',
          turno: 'MATUTINO',
          baseMatM: 9,
          baseMatF: 7,
          baseDocM: 0,
          baseDocF: 1
        },
        {
          id: 'lc-prim-multi',
          name: 'PRIMARIA MULTIGRADO',
          turno: 'MATUTINO',
          baseMatM: 31,
          baseMatF: 32,
          baseDocM: 1,
          baseDocF: 1
        }
      ]
    },
    {
      id: '25448',
      num: '4',
      code: '25448',
      name: 'JUAN PABLO II',
      shortName: 'Juan Pablo II',
      modalities: [
        {
          id: 'jp-pre-com',
          name: 'PREESCOLAR COMUNITARIO MULTINIVEL',
          turno: 'MATUTINO',
          baseMatM: 9,
          baseMatF: 10,
          baseDocM: 0,
          baseDocF: 1
        },
        {
          id: 'jp-prim-multi',
          name: 'PRIMARIA MULTIGRADO',
          turno: 'MATUTINO',
          baseMatM: 27,
          baseMatF: 29,
          baseDocM: 0,
          baseDocF: 1
        }
      ]
    },
    {
      id: '26353',
      num: '5',
      code: '26353',
      name: 'CENTRO ESCOLAR ERNESTO CARDENAL',
      shortName: 'Ernesto Cardenal',
      modalities: [
        {
          id: 'ec-pre-com',
          name: 'PREESCOLAR COMUNITARIO MULTINIVEL',
          turno: 'MATUTINO',
          baseMatM: 4,
          baseMatF: 9,
          baseDocM: 0,
          baseDocF: 1
        },
        {
          id: 'ec-prim-multi',
          name: 'PRIMARIA MULTIGRADO',
          turno: 'MATUTINO',
          baseMatM: 42,
          baseMatF: 31,
          baseDocM: 2,
          baseDocF: 0
        }
      ]
    },
    {
      id: '67239',
      num: '6',
      code: '67239',
      name: 'CENTRO ESCOLAR OTTO DE LA ROCHA',
      shortName: 'Otto de la Rocha',
      modalities: [
        {
          id: 'or-pre-com',
          name: 'PREESCOLAR COMUNITARIO MULTINIVEL',
          turno: 'MATUTINO',
          baseMatM: 0,
          baseMatF: 0,
          baseDocM: 0,
          baseDocF: 1
        },
        {
          id: 'or-prim-multi',
          name: 'PRIMARIA MULTIGRADO',
          turno: 'MATUTINO',
          baseMatM: 26,
          baseMatF: 24,
          baseDocM: 1,
          baseDocF: 1
        }
      ]
    }
  ];

  const STORAGE_KEYS = {
    SCHOOLS_BASE: 'ner_schools_base_v3',
    DAILY_ATTENDANCE: 'ner_daily_attendance_v3',
    LAST_ACTIVE_DATE: 'ner_last_active_date_v3',
    AUTOSAVED_LOG: 'ner_autosaved_log_v3',
    GOOGLE_SHEET_URL: 'ner_google_sheet_url_v1',
    MANUAL_LOCK_MODE: 'ner_manual_lock_mode_v3'
  };

  // URL oficial de sincronización en la nube con Google Sheets
  const CONFIG_DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyUiX0rfX_pHYaupOxB_aV3V3bzjut9sJxfa7BE9WE6AlspOV29Ncl655rKMKn9K0Iq/exec';

  const ADMIN_PIN = 'Arnel2007';

  // ESTADO GLOBAL
  const state = {
    schools: [],
    selectedSchoolId: '17692',
    currentDateStr: '',
    isLocked: false,
    manualLockMode: 'auto', // 'auto' (sigue reloj 2:30 PM), 'unlocked' (forzado abierto por Dir), 'locked' (forzado cerrado por Dir)
    currentRole: 'docente', // 'docente' o 'admin'
    adminEditMatricula: false,
    dailyAttendance: {},
    autoSavedLog: {}, // Control de descargas automáticas por fecha
    cloudUrl: '',
    cloudStatus: 'unconfigured', // 'synced', 'syncing', 'offline', 'unconfigured'
    lastCloudSyncTime: null
  };

  /**
   * Inicialización del sistema
   */
  function init() {
    loadBaseConfig();
    updateDateAndCheckMidnightReset();
    loadStoredDailyData();
    loadManualLockConfig();
    initCloudConfig();
    setupClockTimer();
    setupCloudAutoSyncTimer();
    renderSchoolsTiles();
    renderTeacherTable();
    checkTimeLockout();

    // Comprobación inicial de datos en la nube (Google Sheets)
    if (state.cloudUrl) {
      fetchCloudData(false);
    } else {
      updateCloudSyncBadge('unconfigured', 'Nube: Sin Configurar (Local)');
    }

    console.log('Sistema Asistencia NER Inicializado');
  }

  function loadBaseConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCHOOLS_BASE);
      if (stored) {
        state.schools = JSON.parse(stored);
      } else {
        state.schools = JSON.parse(JSON.stringify(INITIAL_SCHOOLS_CONFIG));
        saveBaseConfig();
      }
    } catch (e) {
      state.schools = JSON.parse(JSON.stringify(INITIAL_SCHOOLS_CONFIG));
    }
  }

  function saveBaseConfig() {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS_BASE, JSON.stringify(state.schools));
  }

  /**
   * REGLA DE REINICIO A LAS 00:00 (MEDIANOCHE):
   * Cada nuevo día, la matrícula actual SIEMPRE vuelve al estado oficial
   * editado/guardado en Dirección, ignorando modificaciones temporales del día anterior.
   */
  function updateDateAndCheckMidnightReset() {
    const now = getEffectiveCurrentTime();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE);

    if (lastDate && lastDate !== todayStr) {
      console.log(`Nuevo día detectado (${todayStr}). Restableciendo Matrícula Actual a la matrícula oficial de Dirección.`);
      showToast(`Nuevo día escolar (${todayStr}). Matrícula restablecida a los valores oficiales de Dirección.`);
      state.manualLockMode = 'auto';
      localStorage.removeItem(STORAGE_KEYS.MANUAL_LOCK_MODE);
    }

    state.currentDateStr = todayStr;
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, todayStr);
  }

  function loadManualLockConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MANUAL_LOCK_MODE);
      if (saved === 'locked' || saved === 'unlocked' || saved === 'auto') {
        state.manualLockMode = saved;
      } else {
        state.manualLockMode = 'auto';
      }
    } catch (e) {
      state.manualLockMode = 'auto';
    }
  }

  function loadStoredDailyData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_ATTENDANCE);
      state.dailyAttendance = stored ? JSON.parse(stored) : {};

      const storedLog = localStorage.getItem(STORAGE_KEYS.AUTOSAVED_LOG);
      state.autoSavedLog = storedLog ? JSON.parse(storedLog) : {};
    } catch (e) {
      state.dailyAttendance = {};
      state.autoSavedLog = {};
    }
  }

  function saveDailyData() {
    localStorage.setItem(STORAGE_KEYS.DAILY_ATTENDANCE, JSON.stringify(state.dailyAttendance));
  }

  function saveAutoSavedLog() {
    localStorage.setItem(STORAGE_KEYS.AUTOSAVED_LOG, JSON.stringify(state.autoSavedLog));
  }

  /* ========================================================================== */
  /* MÓDULO DE SINCRONIZACIÓN EN LA NUBE (GOOGLE SHEETS / GOOGLE APPS SCRIPT)   */
  /* ========================================================================== */

  function initCloudConfig() {
    try {
      let savedUrl = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEET_URL);
      if (!savedUrl || savedUrl.trim() === '') {
        savedUrl = CONFIG_DEFAULT_GOOGLE_SHEET_URL;
        if (savedUrl) {
          localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEET_URL, savedUrl);
        }
      }
      state.cloudUrl = (savedUrl || '').trim();

      const inputUrl = document.getElementById('inputGoogleWebAppUrl');
      if (inputUrl) {
        inputUrl.value = state.cloudUrl;
      }
    } catch (e) {
      console.warn('Error al leer URL de la nube en localStorage:', e);
    }
  }

  function updateCloudSyncBadge(status, text) {
    state.cloudStatus = status;

    const badge = document.getElementById('cloudSyncBadge');
    const badgeText = document.getElementById('cloudSyncText');
    if (badge && badgeText) {
      badge.className = `status-indicator-badge ${status}`;
      badgeText.textContent = text;
    }

    const adminBadge = document.getElementById('adminCloudStatusBadge');
    const adminBadgeText = document.getElementById('adminCloudStatusText');
    if (adminBadge && adminBadgeText) {
      adminBadge.className = `status-indicator-badge ${status}`;
      adminBadgeText.textContent = text;
    }
  }

  async function fetchCloudData(isManual = false) {
    if (!state.cloudUrl) {
      updateCloudSyncBadge('unconfigured', 'Nube: Sin Configurar (Local)');
      if (isManual) {
        showToast('⚠️ Ingresa y guarda la URL de Google Apps Script en el Panel de Dirección.');
      }
      return;
    }

    updateCloudSyncBadge('syncing', 'Nube: Sincronizando...');

    try {
      const sep = state.cloudUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${state.cloudUrl}${sep}action=getData&_nocache=${Date.now()}`;

      const res = await fetch(fetchUrl);
      const result = await res.json();

      if (result && result.status === 'success' && result.data) {
        const remoteState = result.data;
        let changesApplied = false;

        // 1. Sincronizar catálogo base oficial de escuelas (matrícula oficial y plantilla)
        if (remoteState.schools && Array.isArray(remoteState.schools) && remoteState.schools.length > 0) {
          state.schools = remoteState.schools;
          saveBaseConfig();
          changesApplied = true;
        }

        // 2. Sincronizar asistencias del día actual
        if (remoteState.dailyAttendance && typeof remoteState.dailyAttendance === 'object') {
          if (!state.dailyAttendance[state.currentDateStr]) {
            state.dailyAttendance[state.currentDateStr] = {};
          }
          if (remoteState.dailyAttendance[state.currentDateStr]) {
            state.dailyAttendance[state.currentDateStr] = {
              ...state.dailyAttendance[state.currentDateStr],
              ...remoteState.dailyAttendance[state.currentDateStr]
            };
            saveDailyData();
            changesApplied = true;
          }
        }

        // 3. Sincronizar estado de bloqueo del sistema desde la nube
        if (remoteState.manualLockMode !== undefined && remoteState.manualLockMode !== null) {
          if (state.manualLockMode !== remoteState.manualLockMode) {
            state.manualLockMode = remoteState.manualLockMode;
            if (state.manualLockMode === 'auto') {
              localStorage.removeItem(STORAGE_KEYS.MANUAL_LOCK_MODE);
            } else {
              localStorage.setItem(STORAGE_KEYS.MANUAL_LOCK_MODE, state.manualLockMode);
            }
            checkTimeLockout();
          }
        }

        const nowTime = new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit', hour12: true });
        state.lastCloudSyncTime = nowTime;
        updateCloudSyncBadge('synced', `Nube: Al día (${nowTime})`);

        const syncInfo = document.getElementById('cloudLastSyncInfo');
        if (syncInfo) {
          syncInfo.textContent = `Última sincronización exitosa: Hoy a las ${nowTime}`;
        }

        if (changesApplied) {
          renderSchoolsTiles();
          renderTeacherTable();
          if (state.currentRole === 'admin') {
            renderGlobalConsolidatedTable();
          }
        }

        if (isManual) {
          showToast(`✓ Datos sincronizados con Google Sheets (${nowTime})`);
        }
      } else {
        const nowTime = new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit', hour12: true });
        state.lastCloudSyncTime = nowTime;
        updateCloudSyncBadge('synced', `Nube: Conectado (${nowTime})`);

        const syncInfo = document.getElementById('cloudLastSyncInfo');
        if (syncInfo) {
          syncInfo.textContent = `Conexión activa con Google Sheets (${nowTime})`;
        }
        if (isManual) {
          showToast(`✓ Conexión con Google Sheets verificada correctamente.`);
        }
      }
    } catch (err) {
      console.warn('No se pudo conectar a Google Sheets:', err);
      updateCloudSyncBadge('offline', 'Nube: Modo Local (Offline)');
      if (isManual) {
        showToast('⚠️ No se pudo conectar a Google Sheets. Los datos se guardan de forma segura en este dispositivo.');
      }
    }
  }

  async function syncToCloudDailyAttendance(school, modalitiesData, nowTimeStr) {
    if (!state.cloudUrl) {
      updateCloudSyncBadge('unconfigured', 'Nube: Sin Configurar (Local)');
      return;
    }

    updateCloudSyncBadge('syncing', 'Nube: Guardando...');

    const records = school.modalities.map(mod => {
      const mData = modalitiesData[mod.id] || {};
      const matM = mData.matM || 0;
      const matF = mData.matF || 0;
      const matT = matM + matF;
      const asistM = mData.asistM || 0;
      const asistF = mData.asistF || 0;
      const asistT = asistM + asistF;
      const pct = matT > 0 ? ((asistT / matT) * 100).toFixed(1) : '0.0';
      const docAsistM = mData.docAsistM || 0;
      const docAsistF = mData.docAsistF || 0;
      const docAsistT = docAsistM + docAsistF;
      const docJustM = mData.docJustM || 0;
      const docJustF = mData.docJustF || 0;
      const docJustT = docJustM + docJustF;
      const docInjustM = mData.docInjustM || 0;
      const docInjustF = mData.docInjustF || 0;
      const docInjustT = docInjustM + docInjustF;

      return {
        schoolId: school.id,
        schoolName: school.name,
        modalityId: mod.id,
        modalityName: mod.name,
        turno: mod.turno,
        matM,
        matF,
        matT,
        asistM,
        asistF,
        asistT,
        pct,
        docAsistM,
        docAsistF,
        docAsistT,
        docJustM,
        docJustF,
        docJustT,
        docInjustM,
        docInjustF,
        docInjustT
      };
    });

    const payload = {
      action: 'saveDailyAttendance',
      date: state.currentDateStr,
      time: nowTimeStr,
      schoolId: school.id,
      schoolName: school.name,
      records: records,
      syncState: {
        schools: state.schools,
        dailyAttendance: state.dailyAttendance,
        lastActiveDate: state.currentDateStr,
        manualLockMode: state.manualLockMode
      }
    };

    try {
      const res = await fetch(state.cloudUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        const timeBadge = new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit', hour12: true });
        state.lastCloudSyncTime = timeBadge;
        updateCloudSyncBadge('synced', `Nube: Guardado (${timeBadge})`);

        const feedback = document.getElementById('saveFeedbackText');
        if (feedback) {
          feedback.textContent = `✓ Guardado localmente y sincronizado en Google Sheets (${timeBadge})`;
        }
        const syncInfo = document.getElementById('cloudLastSyncInfo');
        if (syncInfo) {
          syncInfo.textContent = `Última sincronización exitosa: Hoy a las ${timeBadge}`;
        }
      } else {
        updateCloudSyncBadge('offline', 'Nube: Guardado local (Offline)');
      }
    } catch (err) {
      console.warn('Error al enviar a Google Sheets:', err);
      updateCloudSyncBadge('offline', 'Nube: Guardado local (Offline)');
    }
  }

  async function syncToCloudBaseConfig() {
    if (!state.cloudUrl) return;

    updateCloudSyncBadge('syncing', 'Nube: Actualizando matrícula base...');

    const payload = {
      action: 'saveBaseConfig',
      schools: state.schools,
      syncState: {
        schools: state.schools,
        dailyAttendance: state.dailyAttendance,
        lastActiveDate: state.currentDateStr,
        manualLockMode: state.manualLockMode
      }
    };

    try {
      const res = await fetch(state.cloudUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        const timeBadge = new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit', hour12: true });
        updateCloudSyncBadge('synced', `Nube: Al día (${timeBadge})`);
        showToast('✓ Matrículas oficiales guardadas y sincronizadas en Google Sheets.');
      }
    } catch (err) {
      console.warn('Error al sincronizar base config con Google Sheets:', err);
      updateCloudSyncBadge('offline', 'Nube: Guardado local (Offline)');
    }
  }

  function saveGoogleCloudUrl() {
    const input = document.getElementById('inputGoogleWebAppUrl');
    if (!input) return;
    const url = input.value.trim();
    if (url && !url.startsWith('http')) {
      showToast('⚠️ La URL debe comenzar con https://script.google.com/...');
      return;
    }

    state.cloudUrl = url;
    localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEET_URL, url);

    if (url) {
      showToast('✓ URL guardada. Comprobando conexión con Google Sheets...');
      fetchCloudData(true);
    } else {
      updateCloudSyncBadge('unconfigured', 'Nube: Sin Configurar (Local)');
      showToast('ℹ️ Modo en la nube desactivado. Operando localmente.');
    }
  }

  function toggleCloudInstructions() {
    const box = document.getElementById('cloudInstructionsBox');
    if (box) {
      box.classList.toggle('hidden');
    }
  }

  function triggerCloudSync(isManual = true) {
    fetchCloudData(isManual);
  }

  function setupCloudAutoSyncTimer() {
    // Sincronización automática periódica en segundo plano cada 2 minutos
    setInterval(() => {
      if (state.cloudUrl && !state.isLocked) {
        const activeEl = document.activeElement;
        const isEditing = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        if (!isEditing) {
          fetchCloudData(false);
        }
      }
    }, 120000);
  }

  function getEffectiveCurrentTime() {
    return new Date();
  }

  /**
   * Control de bloqueo del sistema: Soporta modo Automático (Límite 2:30 PM),
   * y Modo Manual desde Dirección (Desbloqueo forzado o Bloqueo forzado).
   */
  function checkTimeLockout() {
    const now = getEffectiveCurrentTime();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const isPastDeadline = hours > 14 || (hours === 14 && minutes >= 30);

    let isLockedEffective = false;
    let lockReason = '';

    if (state.manualLockMode === 'locked') {
      isLockedEffective = true;
      lockReason = 'manual_locked';
    } else if (state.manualLockMode === 'unlocked') {
      isLockedEffective = false;
      lockReason = 'manual_unlocked';
    } else {
      isLockedEffective = isPastDeadline;
      lockReason = isPastDeadline ? 'auto_deadline' : 'auto_open';
    }

    state.isLocked = isLockedEffective;

    const badge = document.getElementById('systemLockBadge');
    const badgeText = document.getElementById('systemStatusText');
    const lockBanner = document.getElementById('lockBanner');
    const lockBannerTitle = document.getElementById('lockBannerTitle');
    const saveBtn = document.getElementById('btnSaveAttendanceDocente');

    if (state.isLocked) {
      if (badge) badge.className = 'status-indicator-badge closed';
      if (badgeText) {
        badgeText.textContent = lockReason === 'manual_locked' ? 'Cerrado (Por Dirección)' : 'Cerrado (Límite 2:30 PM)';
      }
      if (lockBanner) {
        lockBanner.classList.remove('hidden');
        if (lockBannerTitle) {
          lockBannerTitle.textContent = lockReason === 'manual_locked'
            ? 'SISTEMA CERRADO MANUALMENTE POR DIRECCIÓN'
            : 'SISTEMA CERRADO POR EL DÍA DE HOY (Horario límite: 2:30 PM)';
        }
      }
      updateLockBannerRole();
      if (saveBtn) saveBtn.disabled = true;

      // DESCARGA AUTOMÁTICA DE EXCEL A LAS 2:30 PM (solo en cierre automático)
      if (lockReason === 'auto_deadline') {
        triggerAutomaticDailyExcelSave();
      }
    } else {
      if (badge) badge.className = 'status-indicator-badge open';
      if (badgeText) {
        badgeText.textContent = lockReason === 'manual_unlocked'
          ? 'Abierto (Desbloqueado por Dirección)'
          : 'Abierto para Registro';
      }
      if (lockBanner) lockBanner.classList.add('hidden');
      if (saveBtn) saveBtn.disabled = false;
    }

    const inputs = document.querySelectorAll('#teacherTableBody input:not([readonly]), #teacherMobileTablesContainer input:not([readonly])');
    inputs.forEach(input => {
      if (state.isLocked) {
        input.disabled = true;
      } else {
        if (!input.classList.contains('input-zero-locked')) {
          input.disabled = false;
        }
      }
    });

    updateAdminLockControlsUI();
  }

  /**
   * Actualiza el botón e indicador de bloqueo/desbloqueo manual en el Panel de Dirección
   */
  function updateAdminLockControlsUI() {
    const badge = document.getElementById('adminLockModeBadge');
    const btn = document.getElementById('btnToggleManualLock');
    const btnText = document.getElementById('adminLockBtnText');
    const icon = document.getElementById('adminLockBtnIcon');
    const resetBtn = document.getElementById('btnResetAutoLock');

    if (!btn || !btnText) return;

    if (state.isLocked) {
      btn.className = 'btn btn-success';
      btnText.textContent = '🔓 Desbloquear Sistema (Abrir Registro)';
      if (icon) {
        icon.innerHTML = '<path d="M7 11V7a5 5 0 0 1 9.9-1"></path><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>';
      }
      if (badge) {
        if (state.manualLockMode === 'locked') {
          badge.textContent = 'Estado: Cerrado Manualmente por Dirección';
          badge.className = 'admin-lock-badge-info badge-locked-manual';
        } else {
          badge.textContent = 'Estado: Cerrado Automático (Horario 2:30 PM)';
          badge.className = 'admin-lock-badge-info badge-locked-auto';
        }
      }
    } else {
      btn.className = 'btn btn-danger';
      btnText.textContent = '🔒 Bloquear Sistema Manualmente';
      if (icon) {
        icon.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>';
      }
      if (badge) {
        if (state.manualLockMode === 'unlocked') {
          badge.textContent = 'Estado: Abierto Manualmente por Dirección';
          badge.className = 'admin-lock-badge-info badge-unlocked-manual';
        } else {
          badge.textContent = 'Estado: Horario Automático (Abierto)';
          badge.className = 'admin-lock-badge-info badge-open-auto';
        }
      }
    }

    if (resetBtn) {
      if (state.manualLockMode !== 'auto') {
        resetBtn.classList.remove('hidden');
      } else {
        resetBtn.classList.add('hidden');
      }
    }
  }

  function toggleManualSystemLock() {
    if (state.isLocked) {
      state.manualLockMode = 'unlocked';
      localStorage.setItem(STORAGE_KEYS.MANUAL_LOCK_MODE, 'unlocked');
      showToast('🔓 Sistema DESBLOQUEADO por Dirección. Se ha habilitado el registro de asistencia.');
    } else {
      state.manualLockMode = 'locked';
      localStorage.setItem(STORAGE_KEYS.MANUAL_LOCK_MODE, 'locked');
      showToast('🔒 Sistema BLOQUEADO manualmente por Dirección. El registro ha sido cerrado.');
    }
    checkTimeLockout();
    syncLockStateToCloud();
  }

  function resetSystemLockToAuto() {
    state.manualLockMode = 'auto';
    localStorage.removeItem(STORAGE_KEYS.MANUAL_LOCK_MODE);
    showToast('⏰ Sistema restablecido al horario automático normal (límite 2:30 PM).');
    checkTimeLockout();
    syncLockStateToCloud();
  }

  async function syncLockStateToCloud() {
    if (!state.cloudUrl) return;
    try {
      const payload = {
        action: 'syncLockMode',
        syncState: {
          schools: state.schools,
          dailyAttendance: state.dailyAttendance,
          lastActiveDate: state.currentDateStr,
          manualLockMode: state.manualLockMode
        }
      };
      await fetch(state.cloudUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Error al sincronizar estado de bloqueo con la nube:', e);
    }
  }

  /**
   * Muestra la explicación técnica del cierre solo en Dirección,
   * manteniendo el aviso limpio y puntual para los docentes.
   */
  function updateLockBannerRole() {
    const details = document.getElementById('lockBannerDetails');
    if (details) {
      if (state.currentRole === 'admin') {
        details.style.display = 'block';
      } else {
        details.style.display = 'none';
      }
    }
  }

  /**
   * Guarda y descarga automáticamente el Excel oficial cuando llega la hora límite
   */
  function triggerAutomaticDailyExcelSave() {
    const todayKey = state.currentDateStr;
    if (!state.autoSavedLog[todayKey]) {
      state.autoSavedLog[todayKey] = true;
      saveAutoSavedLog();

      console.log(`Hora límite alcanzada. Generando y descargando automáticamente el archivo Excel oficial.`);
      downloadDailyExcel(true);
      if (state.currentRole === 'admin') {
        showToast('🕒 Cierre de las 2:30 PM: El reporte oficial de Excel se ha guardado y descargado automáticamente.');
      }
    }
  }

  function setupClockTimer() {
    function tick() {
      const now = getEffectiveCurrentTime();
      const timeStr = now.toLocaleTimeString('es-NI', { hour12: true });
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = now.toLocaleDateString('es-NI', dateOptions);

      const clockEl = document.getElementById('liveClock');
      const dateEl = document.getElementById('liveDate');

      if (clockEl) clockEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;

      checkTimeLockout();
    }
    tick();
    setInterval(tick, 1000);
  }

  /**
   * TARJETAS DE SELECCIÓN DE CENTROS
   */
  function renderSchoolsTiles() {
    const container = document.getElementById('schoolsTilesGrid');
    if (!container) return;

    container.innerHTML = '';
    const todayData = getTodayAttendance();

    state.schools.forEach(school => {
      const isSelected = school.id === state.selectedSchoolId;
      const schoolRecord = todayData && todayData[school.id] && todayData[school.id].saved;

      const card = document.createElement('div');
      card.className = `school-tile-card ${isSelected ? 'active' : ''}`;
      card.onclick = () => selectSchool(school.id);

      card.innerHTML = `
        <div class="tile-top-row">
          <span class="tile-code">Cód. ${school.code}</span>
          <span class="tile-status ${schoolRecord ? 'saved' : 'pending'}">
            ${schoolRecord ? '✓ Guardado' : '⏳ Pendiente'}
          </span>
        </div>
        <div class="tile-name">${school.shortName || school.name}</div>
        <div class="tile-meta">${school.modalities.length} ${school.modalities.length === 1 ? 'modalidad' : 'modalidades'}</div>
      `;

      container.appendChild(card);
    });
  }

  function selectSchool(schoolId) {
    if (state.selectedSchoolId !== schoolId) {
      saveCurrentInputsToMemory(state.selectedSchoolId);
      state.selectedSchoolId = schoolId;
    }
    renderSchoolsTiles();
    renderTeacherTable();

    // Reubicar de forma automática y suave hacia la tabla de llenado del centro seleccionado
    const cardArea = document.getElementById('cardAreaAsistencia');
    if (cardArea) {
      cardArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // HELPERS DE SINCRONIZACIÓN ENTRE VISTA ESCRITORIO Y VISTA TELÉFONO
  function getFieldVal(fieldId) {
    const el = document.getElementById(fieldId) || document.getElementById(`mob-${fieldId}`);
    return el ? el.value : '';
  }

  function setBothVal(fieldId, val) {
    const desk = document.getElementById(fieldId);
    const mob = document.getElementById(`mob-${fieldId}`);
    if (desk) desk.value = val;
    if (mob) mob.value = val;
  }

  function toggleBothClass(fieldId, className, condition) {
    const desk = document.getElementById(fieldId);
    const mob = document.getElementById(`mob-${fieldId}`);
    if (desk) {
      if (condition) desk.classList.add(className); else desk.classList.remove(className);
    }
    if (mob) {
      if (condition) mob.classList.add(className); else mob.classList.remove(className);
    }
  }

  function setBothProp(fieldId, prop, val) {
    const desk = document.getElementById(fieldId);
    const mob = document.getElementById(`mob-${fieldId}`);
    if (desk) desk[prop] = val;
    if (mob) mob[prop] = val;
  }

  function handleFieldInput(inputEl, modId, field) {
    const val = inputEl.value;
    const isMob = inputEl.id.startsWith('mob-');
    const companionId = isMob ? inputEl.id.replace('mob-', '') : `mob-${inputEl.id}`;
    const companion = document.getElementById(companionId);
    if (companion && companion.value !== val) {
      companion.value = val;
    }
    recalculateRow(modId);
  }

  function saveCurrentInputsToMemory(schoolId) {
    const school = state.schools.find(s => s.id === schoolId);
    if (!school) return;
    const todayData = getTodayAttendance();
    if (!todayData[school.id]) {
      todayData[school.id] = { modalities: {}, saved: false };
    }
    if (!todayData[school.id].modalities) {
      todayData[school.id].modalities = {};
    }

    school.modalities.forEach(mod => {
      const matMStr = getFieldVal(`mat-m-${mod.id}`);
      const matFStr = getFieldVal(`mat-f-${mod.id}`);
      const asistMStr = getFieldVal(`asist-m-${mod.id}`);
      const asistFStr = getFieldVal(`asist-f-${mod.id}`);
      const docJustMStr = getFieldVal(`doc-just-m-${mod.id}`);
      const docJustFStr = getFieldVal(`doc-just-f-${mod.id}`);
      const docInjustMStr = getFieldVal(`doc-injust-m-${mod.id}`);
      const docInjustFStr = getFieldVal(`doc-injust-f-${mod.id}`);

      if (matMStr !== '' || asistMStr !== '' || docJustMStr !== '') {
        if (!todayData[school.id].modalities[mod.id]) {
          todayData[school.id].modalities[mod.id] = {};
        }
        const m = todayData[school.id].modalities[mod.id];
        m.matM = parseInt(matMStr, 10) || 0;
        m.matF = parseInt(matFStr, 10) || 0;
        m.asistM = asistMStr === '' ? '' : (parseInt(asistMStr, 10) || 0);
        m.asistF = asistFStr === '' ? '' : (parseInt(asistFStr, 10) || 0);
        m.docJustM = parseInt(docJustMStr, 10) || 0;
        m.docJustF = parseInt(docJustFStr, 10) || 0;
        m.docInjustM = parseInt(docInjustMStr, 10) || 0;
        m.docInjustF = parseInt(docInjustFStr, 10) || 0;

        const baseM = mod.baseDocM || 0;
        const baseF = mod.baseDocF || 0;
        m.docAsistM = Math.max(0, baseM - (m.docJustM + m.docInjustM));
        m.docAsistF = Math.max(0, baseF - (m.docJustF + m.docInjustF));
      }
    });
  }

  function getTodayAttendance() {
    if (!state.dailyAttendance[state.currentDateStr]) {
      state.dailyAttendance[state.currentDateStr] = {};
    }
    return state.dailyAttendance[state.currentDateStr];
  }

  /**
   * RENDERIZA LA TABLA DE ASISTENCIA DEL DOCENTE:
   * 1. Vista Pantalla Ancha (> 768px): Tabla horizontal completa con estilo El Cuá.
   * 2. Vista Teléfono (<= 768px): Tablas separadas apiladas por modalidad, adaptadas al ancho de pantalla y con casillas grandes.
   */
  function renderTeacherTable() {
    const school = state.schools.find(s => s.id === state.selectedSchoolId);
    if (!school) return;

    const codeEl = document.getElementById('teacherCurrentCode');
    const titleEl = document.getElementById('teacherTableTitle');
    if (codeEl) codeEl.textContent = `Cód: ${school.code}`;
    if (titleEl) titleEl.textContent = `${school.name}`;

    const todayData = getTodayAttendance();
    const schoolRecord = todayData[school.id] || { modalities: {}, saved: false };

    const statusBadge = document.getElementById('teacherSavedStatusBadge');
    if (statusBadge) {
      statusBadge.textContent = schoolRecord.saved ? `✓ Guardado Hoy (${schoolRecord.savedAt || ''})` : '⏳ Pendiente de Guardar';
      statusBadge.className = schoolRecord.saved ? 'tag-status saved' : 'tag-status';
    }

    const tbody = document.getElementById('teacherTableBody');
    if (tbody) tbody.innerHTML = '';

    const mobContainer = document.getElementById('teacherMobileTablesContainer');
    if (mobContainer) mobContainer.innerHTML = '';

    school.modalities.forEach(mod => {
      const modData = (schoolRecord.modalities && schoolRecord.modalities[mod.id]) || null;

      // Docentes justificados
      const docJustM = modData ? (modData.docJustM !== undefined ? modData.docJustM : 0) : 0;
      const docJustF = modData ? (modData.docJustF !== undefined ? modData.docJustF : 0) : 0;
      const docJustT = (parseInt(docJustM, 10) || 0) + (parseInt(docJustF, 10) || 0);

      // Docentes injustificados
      const docInjustM = modData ? (modData.docInjustM !== undefined ? modData.docInjustM : 0) : 0;
      const docInjustF = modData ? (modData.docInjustF !== undefined ? modData.docInjustF : 0) : 0;
      const docInjustT = (parseInt(docInjustM, 10) || 0) + (parseInt(docInjustF, 10) || 0);

      // Docentes asistieron: Resta automática de ausencias de la plantilla
      const docAsistM = modData && modData.docAsistM !== undefined 
        ? modData.docAsistM 
        : Math.max(0, mod.baseDocM - (docJustM + docInjustM));
      const docAsistF = modData && modData.docAsistF !== undefined 
        ? modData.docAsistF 
        : Math.max(0, mod.baseDocF - (docJustF + docInjustF));
      const docAsistT = (parseInt(docAsistM, 10) || 0) + (parseInt(docAsistF, 10) || 0);
      const hasDocenteAtendiendo = docAsistT > 0;

      // Matrícula: usa la de hoy si ya la editó, sino SIEMPRE toma la matrícula base oficial de Dirección
      // REGLA: Si la asistencia de docente llega a 0, la matrícula actual es 0
      let matM = modData && modData.matM !== undefined ? modData.matM : mod.baseMatM;
      let matF = modData && modData.matF !== undefined ? modData.matF : mod.baseMatF;
      if (!hasDocenteAtendiendo) {
        matM = 0;
        matF = 0;
      }
      const matT = matM + matF;

      // Asistencia estudiantes (M, F, T): si no hay docente, es 0
      let asistM = modData ? (modData.asistM !== undefined ? modData.asistM : '') : '';
      let asistF = modData ? (modData.asistF !== undefined ? modData.asistF : '') : '';
      if (!hasDocenteAtendiendo) {
        asistM = 0;
        asistF = 0;
      }
      const asistMNum = parseInt(asistM, 10) || 0;
      const asistFNum = parseInt(asistF, 10) || 0;
      const asistT = (asistM !== '' || asistF !== '') ? (asistMNum + asistFNum) : 0;

      // % Asistencia
      let pct = 0;
      if (matT > 0 && (asistM !== '' || asistF !== '')) {
        pct = Math.round((asistT / matT) * 1000) / 10;
      }

      // ========================================================
      // 1. FILA DE ESCRITORIO (TABLA COMPLETA HORIZONTAL)
      // ========================================================
      if (tbody) {
        const tr = document.createElement('tr');
        tr.id = `row-${mod.id}`;
        tr.innerHTML = `
          <td class="col-modalidad">
            <strong>${mod.name}</strong>
          </td>
          <td class="col-turno">
            ${mod.turno}
          </td>

          <!-- MATRÍCULA ACTUAL (M, F editables; T inalterable) -->
          <td class="mat">
            <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input mat-input ${!hasDocenteAtendiendo ? 'input-zero-locked' : ''}" id="mat-m-${mod.id}" data-mod="${mod.id}" data-field="matM" value="${matM}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'matM')" onfocus="this.select()" ${state.isLocked || !hasDocenteAtendiendo ? 'disabled' : ''} ${!hasDocenteAtendiendo ? 'title="Sin docente atendiendo esta modalidad. Matrícula fijada en 0."' : ''}>
          </td>
          <td class="mat">
            <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input mat-input ${!hasDocenteAtendiendo ? 'input-zero-locked' : ''}" id="mat-f-${mod.id}" data-mod="${mod.id}" data-field="matF" value="${matF}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'matF')" onfocus="this.select()" ${state.isLocked || !hasDocenteAtendiendo ? 'disabled' : ''} ${!hasDocenteAtendiendo ? 'title="Sin docente atendiendo esta modalidad. Matrícula fijada en 0."' : ''}>
          </td>
          <td class="calc">
            <input type="text" class="cua-input calc-input" id="mat-t-${mod.id}" value="${matT}" readonly tabindex="-1">
          </td>

          <!-- ASISTENCIA ESTUDIANTES (M, F editables; T inalterable) -->
          <td class="asist">
            <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input asist-input ${!hasDocenteAtendiendo ? 'input-zero-locked' : ''}" id="asist-m-${mod.id}" data-mod="${mod.id}" data-field="asistM" placeholder="0" value="${asistM}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'asistM')" onfocus="this.select()" ${state.isLocked || !hasDocenteAtendiendo ? 'disabled' : ''} ${!hasDocenteAtendiendo ? 'title="Sin docente atendiendo esta modalidad. Asistencia fijada en 0."' : ''}>
          </td>
          <td class="asist">
            <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input asist-input ${!hasDocenteAtendiendo ? 'input-zero-locked' : ''}" id="asist-f-${mod.id}" data-mod="${mod.id}" data-field="asistF" placeholder="0" value="${asistF}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'asistF')" onfocus="this.select()" ${state.isLocked || !hasDocenteAtendiendo ? 'disabled' : ''} ${!hasDocenteAtendiendo ? 'title="Sin docente atendiendo esta modalidad. Asistencia fijada en 0."' : ''}>
          </td>
          <td class="calc">
            <input type="text" class="cua-input calc-input" id="asist-t-${mod.id}" value="${asistT}" readonly tabindex="-1">
          </td>

          <!-- % ASISTENCIA -->
          <td class="calc">
            <span class="pct-cell-badge ${pct >= 85 ? 'pct-high' : (pct >= 70 ? 'pct-med' : 'pct-low')}" id="pct-${mod.id}">${pct.toFixed(1)}%</span>
          </td>

          <!-- DOCENTES ASISTIERON -->
          <td class="calc">
            <input type="text" class="cua-input calc-input" id="doc-asist-m-${mod.id}" value="${docAsistM}" readonly tabindex="-1" title="Plantilla: ${mod.baseDocM}. Se descuentan ausencias automáticamente.">
          </td>
          <td class="calc">
            <input type="text" class="cua-input calc-input" id="doc-asist-f-${mod.id}" value="${docAsistF}" readonly tabindex="-1" title="Plantilla: ${mod.baseDocF}. Se descuentan ausencias automáticamente.">
          </td>
          <td class="calc">
            <input type="text" class="cua-input calc-input bold-total" id="doc-asist-t-${mod.id}" value="${docAsistT}" readonly tabindex="-1">
          </td>

          <!-- DOCENTES JUSTIFICADOS -->
          <td class="doc">
            <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input doc-input" id="doc-just-m-${mod.id}" data-mod="${mod.id}" data-field="docJustM" value="${docJustM}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'docJustM')" onfocus="this.select()" ${state.isLocked ? 'disabled' : ''}>
          </td>
          <td class="doc">
            <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input doc-input" id="doc-just-f-${mod.id}" data-mod="${mod.id}" data-field="docJustF" value="${docJustF}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'docJustF')" onfocus="this.select()" ${state.isLocked ? 'disabled' : ''}>
          </td>
          <td class="calc">
            <input type="text" class="cua-input calc-input" id="doc-just-t-${mod.id}" value="${docJustT}" readonly tabindex="-1">
          </td>

          <!-- DOCENTES INJUSTIFICADOS -->
          <td class="doc">
            <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input doc-input" id="doc-injust-m-${mod.id}" data-mod="${mod.id}" data-field="docInjustM" value="${docInjustM}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'docInjustM')" onfocus="this.select()" ${state.isLocked ? 'disabled' : ''}>
          </td>
          <td class="doc">
            <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input doc-input" id="doc-injust-f-${mod.id}" data-mod="${mod.id}" data-field="docInjustF" value="${docInjustF}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'docInjustF')" onfocus="this.select()" ${state.isLocked ? 'disabled' : ''}>
          </td>
          <td class="calc">
            <input type="text" class="cua-input calc-input" id="doc-injust-t-${mod.id}" value="${docInjustT}" readonly tabindex="-1">
          </td>
        `;
        tbody.appendChild(tr);
      }

      // ========================================================
      // 2. VISTA TELÉFONO: TABLA SEPARADA Y VERTICAL PARA CADA MODALIDAD
      // ========================================================
      if (mobContainer) {
        const mobBlock = document.createElement('div');
        mobBlock.className = 'mobile-modality-block';
        mobBlock.id = `mob-block-${mod.id}`;
        mobBlock.innerHTML = `
          <div class="mob-mod-header">
            <div class="mob-mod-title-box">
              <span class="mob-mod-badge">Modalidad</span>
              <h3 class="mob-mod-name">${mod.name}</h3>
            </div>
            <div class="mob-mod-meta-box">
              <span class="mob-mod-turno">${mod.turno}</span>
              <span class="pct-cell-badge ${pct >= 85 ? 'pct-high' : (pct >= 70 ? 'pct-med' : 'pct-low')}" id="mob-pct-${mod.id}">${pct.toFixed(1)}%</span>
            </div>
          </div>

          <div class="mob-zero-doc-alert" id="mob-alert-zero-${mod.id}" style="${!hasDocenteAtendiendo ? 'display: flex;' : 'display: none;'}">
            <span>⚠️</span>
            <span><strong>Sin docente atendiendo esta modalidad.</strong> Matrícula y Asistencia fijadas automáticamente en 0.</span>
          </div>

          <div class="mob-table-card">
            <table class="mob-subtabla">
              <thead>
                <tr>
                  <th class="mob-th-concepto">Concepto</th>
                  <th class="mob-th-m">Varones (M)</th>
                  <th class="mob-th-f">Mujeres (F)</th>
                  <th class="mob-th-t">Total (T)</th>
                </tr>
              </thead>
              <tbody>
                <!-- 1. MATRÍCULA ACTUAL -->
                <tr class="mob-row-mat">
                  <td class="mob-td-label">
                    <span class="mob-dot mat-dot"></span>
                    <strong>Matrícula</strong>
                    <small>Editable</small>
                  </td>
                  <td>
                    <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input mat-input mob-input ${!hasDocenteAtendiendo ? 'input-zero-locked' : ''}" id="mob-mat-m-${mod.id}" data-mod="${mod.id}" data-field="matM" value="${matM}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'matM')" onfocus="this.select()" ${state.isLocked || !hasDocenteAtendiendo ? 'disabled' : ''} ${!hasDocenteAtendiendo ? 'title="Sin docente atendiendo"' : ''}>
                  </td>
                  <td>
                    <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input mat-input mob-input ${!hasDocenteAtendiendo ? 'input-zero-locked' : ''}" id="mob-mat-f-${mod.id}" data-mod="${mod.id}" data-field="matF" value="${matF}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'matF')" onfocus="this.select()" ${state.isLocked || !hasDocenteAtendiendo ? 'disabled' : ''} ${!hasDocenteAtendiendo ? 'title="Sin docente atendiendo"' : ''}>
                  </td>
                  <td>
                    <input type="text" class="cua-input calc-input mob-input" id="mob-mat-t-${mod.id}" value="${matT}" readonly tabindex="-1">
                  </td>
                </tr>

                <!-- 2. ASISTENCIA ESTUDIANTES -->
                <tr class="mob-row-asist">
                  <td class="mob-td-label">
                    <span class="mob-dot asist-dot"></span>
                    <strong>Asistencia</strong>
                    <small>De hoy (≤ Matrícula)</small>
                  </td>
                  <td>
                    <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input asist-input mob-input ${!hasDocenteAtendiendo ? 'input-zero-locked' : ''}" id="mob-asist-m-${mod.id}" data-mod="${mod.id}" data-field="asistM" placeholder="0" value="${asistM}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'asistM')" onfocus="this.select()" ${state.isLocked || !hasDocenteAtendiendo ? 'disabled' : ''} ${!hasDocenteAtendiendo ? 'title="Sin docente atendiendo"' : ''}>
                  </td>
                  <td>
                    <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input asist-input mob-input ${!hasDocenteAtendiendo ? 'input-zero-locked' : ''}" id="mob-asist-f-${mod.id}" data-mod="${mod.id}" data-field="asistF" placeholder="0" value="${asistF}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'asistF')" onfocus="this.select()" ${state.isLocked || !hasDocenteAtendiendo ? 'disabled' : ''} ${!hasDocenteAtendiendo ? 'title="Sin docente atendiendo"' : ''}>
                  </td>
                  <td>
                    <input type="text" class="cua-input calc-input mob-input" id="mob-asist-t-${mod.id}" value="${asistT}" readonly tabindex="-1">
                  </td>
                </tr>

                <!-- 3. DOCENTES ASISTIERON -->
                <tr class="mob-row-doc-asist">
                  <td class="mob-td-label">
                    <span class="mob-dot doc-asist-dot"></span>
                    <strong>Docentes Asistieron</strong>
                    <small>Plantilla: ${mod.baseDocM + mod.baseDocF} (${mod.baseDocM}M, ${mod.baseDocF}F)</small>
                  </td>
                  <td>
                    <input type="text" class="cua-input calc-input mob-input" id="mob-doc-asist-m-${mod.id}" value="${docAsistM}" readonly tabindex="-1" title="Plantilla: ${mod.baseDocM}">
                  </td>
                  <td>
                    <input type="text" class="cua-input calc-input mob-input" id="mob-doc-asist-f-${mod.id}" value="${docAsistF}" readonly tabindex="-1" title="Plantilla: ${mod.baseDocF}">
                  </td>
                  <td>
                    <input type="text" class="cua-input calc-input bold-total mob-input" id="mob-doc-asist-t-${mod.id}" value="${docAsistT}" readonly tabindex="-1">
                  </td>
                </tr>

                <!-- 4. DOCENTES JUSTIFICADOS -->
                <tr class="mob-row-doc-just">
                  <td class="mob-td-label">
                    <span class="mob-dot doc-dot"></span>
                    <strong>Docentes Justificados</strong>
                    <small>Permisos oficiales</small>
                  </td>
                  <td>
                    <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input doc-input mob-input" id="mob-doc-just-m-${mod.id}" data-mod="${mod.id}" data-field="docJustM" value="${docJustM}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'docJustM')" onfocus="this.select()" ${state.isLocked ? 'disabled' : ''}>
                  </td>
                  <td>
                    <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input doc-input mob-input" id="mob-doc-just-f-${mod.id}" data-mod="${mod.id}" data-field="docJustF" value="${docJustF}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'docJustF')" onfocus="this.select()" ${state.isLocked ? 'disabled' : ''}>
                  </td>
                  <td>
                    <input type="text" class="cua-input calc-input mob-input" id="mob-doc-just-t-${mod.id}" value="${docJustT}" readonly tabindex="-1">
                  </td>
                </tr>

                <!-- 5. DOCENTES INJUSTIFICADOS -->
                <tr class="mob-row-doc-injust">
                  <td class="mob-td-label">
                    <span class="mob-dot doc-dot"></span>
                    <strong>Docentes Injustificados</strong>
                    <small>Faltas</small>
                  </td>
                  <td>
                    <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input doc-input mob-input" id="mob-doc-injust-m-${mod.id}" data-mod="${mod.id}" data-field="docInjustM" value="${docInjustM}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'docInjustM')" onfocus="this.select()" ${state.isLocked ? 'disabled' : ''}>
                  </td>
                  <td>
                    <input type="number" min="0" inputmode="numeric" pattern="[0-9]*" class="cua-input doc-input mob-input" id="mob-doc-injust-f-${mod.id}" data-mod="${mod.id}" data-field="docInjustF" value="${docInjustF}" oninput="window.app.handleFieldInput(this, '${mod.id}', 'docInjustF')" onfocus="this.select()" ${state.isLocked ? 'disabled' : ''}>
                  </td>
                  <td>
                    <input type="text" class="cua-input calc-input mob-input" id="mob-doc-injust-t-${mod.id}" value="${docInjustT}" readonly tabindex="-1">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        mobContainer.appendChild(mobBlock);
      }

      // Calcular validación de fila inicial
      recalculateRow(mod.id);
    });

    recalculateTeacherTotals();
  }

  /**
   * RECALCULAR FILA ACTIVA Y VALIDACIÓN ESTRICTA (ASISTENCIA <= MATRÍCULA Y DOCENTES AUSENTES <= PLANTILLA)
   * Actualiza simultáneamente los campos de escritorio y de la tabla de teléfono.
   */
  function recalculateRow(modId) {
    const school = state.schools.find(s => s.id === state.selectedSchoolId);
    const mod = school ? school.modalities.find(m => m.id === modId) : null;
    const baseDocM = mod ? mod.baseDocM : 0;
    const baseDocF = mod ? mod.baseDocF : 0;

    // Docentes Justificados
    const docJustM = parseInt(getFieldVal(`doc-just-m-${modId}`), 10) || 0;
    const docJustF = parseInt(getFieldVal(`doc-just-f-${modId}`), 10) || 0;
    const docJustT = docJustM + docJustF;
    setBothVal(`doc-just-t-${modId}`, docJustT);

    // Docentes Injustificados
    const docInjustM = parseInt(getFieldVal(`doc-injust-m-${modId}`), 10) || 0;
    const docInjustF = parseInt(getFieldVal(`doc-injust-f-${modId}`), 10) || 0;
    const docInjustT = docInjustM + docInjustF;
    setBothVal(`doc-injust-t-${modId}`, docInjustT);

    // CÁLCULO AUTOMÁTICO DE DOCENTES ASISTIERON:
    // Asistieron = Plantilla - (Justificados + Injustificados)
    const docAusentesM = docJustM + docInjustM;
    const docAusentesF = docJustF + docInjustF;
    const docAsistM = Math.max(0, baseDocM - docAusentesM);
    const docAsistF = Math.max(0, baseDocF - docAusentesF);
    const docAsistT = docAsistM + docAsistF;
    setBothVal(`doc-asist-m-${modId}`, docAsistM);
    setBothVal(`doc-asist-f-${modId}`, docAsistF);
    setBothVal(`doc-asist-t-${modId}`, docAsistT);

    const hasDocenteAtendiendo = docAsistT > 0;
    const mobAlert = document.getElementById(`mob-alert-zero-${modId}`);

    // REGLA: Si la asistencia de docente llega a 0, la matrícula actual queda en 0
    // y se bloquea el ingreso de matrícula y asistencia para esa modalidad.
    if (!hasDocenteAtendiendo) {
      setBothVal(`mat-m-${modId}`, 0);
      setBothVal(`mat-f-${modId}`, 0);
      setBothProp(`mat-m-${modId}`, 'disabled', true);
      setBothProp(`mat-f-${modId}`, 'disabled', true);
      toggleBothClass(`mat-m-${modId}`, 'input-zero-locked', true);
      toggleBothClass(`mat-f-${modId}`, 'input-zero-locked', true);
      setBothProp(`mat-m-${modId}`, 'title', 'Sin docente atendiendo esta modalidad. Matrícula fijada en 0.');
      setBothProp(`mat-f-${modId}`, 'title', 'Sin docente atendiendo esta modalidad. Matrícula fijada en 0.');

      setBothVal(`asist-m-${modId}`, 0);
      setBothVal(`asist-f-${modId}`, 0);
      setBothProp(`asist-m-${modId}`, 'disabled', true);
      setBothProp(`asist-f-${modId}`, 'disabled', true);
      toggleBothClass(`asist-m-${modId}`, 'input-zero-locked', true);
      toggleBothClass(`asist-f-${modId}`, 'input-zero-locked', true);
      setBothProp(`asist-m-${modId}`, 'title', 'Sin docente atendiendo esta modalidad. Asistencia fijada en 0.');
      setBothProp(`asist-f-${modId}`, 'title', 'Sin docente atendiendo esta modalidad. Asistencia fijada en 0.');

      toggleBothClass(`asist-m-${modId}`, 'input-error', false);
      toggleBothClass(`asist-f-${modId}`, 'input-error', false);

      if (mobAlert) mobAlert.style.display = 'flex';
    } else {
      const matMEl = document.getElementById(`mat-m-${modId}`) || document.getElementById(`mob-mat-m-${modId}`);
      if (matMEl && matMEl.classList.contains('input-zero-locked')) {
        toggleBothClass(`mat-m-${modId}`, 'input-zero-locked', false);
        toggleBothClass(`mat-f-${modId}`, 'input-zero-locked', false);
        setBothProp(`mat-m-${modId}`, 'title', '');
        setBothProp(`mat-f-${modId}`, 'title', '');

        toggleBothClass(`asist-m-${modId}`, 'input-zero-locked', false);
        toggleBothClass(`asist-f-${modId}`, 'input-zero-locked', false);
        setBothProp(`asist-m-${modId}`, 'title', '');
        setBothProp(`asist-f-${modId}`, 'title', '');

        if (!state.isLocked) {
          setBothProp(`mat-m-${modId}`, 'disabled', false);
          setBothProp(`mat-f-${modId}`, 'disabled', false);
          setBothProp(`asist-m-${modId}`, 'disabled', false);
          setBothProp(`asist-f-${modId}`, 'disabled', false);
        }

        setBothVal(`mat-m-${modId}`, mod ? mod.baseMatM : 0);
        setBothVal(`mat-f-${modId}`, mod ? mod.baseMatF : 0);
        setBothVal(`asist-m-${modId}`, '');
        setBothVal(`asist-f-${modId}`, '');
      }
      if (mobAlert) mobAlert.style.display = 'none';
    }

    const matM = parseInt(getFieldVal(`mat-m-${modId}`), 10) || 0;
    const matF = parseInt(getFieldVal(`mat-f-${modId}`), 10) || 0;
    const matT = matM + matF;
    setBothVal(`mat-t-${modId}`, matT);

    const asistMStr = getFieldVal(`asist-m-${modId}`);
    const asistFStr = getFieldVal(`asist-f-${modId}`);
    const asistM = parseInt(asistMStr, 10) || 0;
    const asistF = parseInt(asistFStr, 10) || 0;
    const asistT = (asistMStr !== '' || asistFStr !== '') ? (asistM + asistF) : 0;
    setBothVal(`asist-t-${modId}`, asistT);

    // Validación visual de error
    if (hasDocenteAtendiendo) {
      const errAsistM = asistMStr !== '' && asistM > matM;
      toggleBothClass(`asist-m-${modId}`, 'input-error', errAsistM);
      setBothProp(`asist-m-${modId}`, 'title', errAsistM ? `Error: Asistencia masculina (${asistM}) supera matrícula (${matM})` : '');

      const errAsistF = asistFStr !== '' && asistF > matF;
      toggleBothClass(`asist-f-${modId}`, 'input-error', errAsistF);
      setBothProp(`asist-f-${modId}`, 'title', errAsistF ? `Error: Asistencia femenina (${asistF}) supera matrícula (${matF})` : '');
    }

    // Porcentaje
    let pct = 0;
    if (matT > 0 && (asistMStr !== '' || asistFStr !== '')) {
      pct = Math.round((asistT / matT) * 1000) / 10;
    }
    const pctClass = pct >= 85 ? 'pct-high' : (pct >= 70 ? 'pct-med' : 'pct-low');
    const pctText = `${pct.toFixed(1)}%`;

    const pctBadgeDesk = document.getElementById(`pct-${modId}`);
    if (pctBadgeDesk) {
      pctBadgeDesk.textContent = pctText;
      pctBadgeDesk.className = `pct-cell-badge ${pctClass}`;
    }
    const pctBadgeMob = document.getElementById(`mob-pct-${modId}`);
    if (pctBadgeMob) {
      pctBadgeMob.textContent = pctText;
      pctBadgeMob.className = `pct-cell-badge ${pctClass}`;
    }

    // VALIDACIÓN VISUAL DOCENTES AUSENTES NO SUPEREN LA PLANTILLA
    const errDocM = (docJustM + docInjustM) > baseDocM;
    toggleBothClass(`doc-just-m-${modId}`, 'input-error', errDocM);
    toggleBothClass(`doc-injust-m-${modId}`, 'input-error', errDocM);
    setBothProp(`doc-just-m-${modId}`, 'title', errDocM ? `Error: Docentes varones ausentes (${docJustM + docInjustM}) superan plantilla (${baseDocM})` : '');

    const errDocF = (docJustF + docInjustF) > baseDocF;
    toggleBothClass(`doc-just-f-${modId}`, 'input-error', errDocF);
    toggleBothClass(`doc-injust-f-${modId}`, 'input-error', errDocF);
    setBothProp(`doc-just-f-${modId}`, 'title', errDocF ? `Error: Docentes mujeres ausentes (${docJustF + docInjustF}) superan plantilla (${baseDocF})` : '');

    // Mantener la memoria de hoy actualizada
    const todayData = getTodayAttendance();
    if (school) {
      if (!todayData[school.id]) todayData[school.id] = { modalities: {}, saved: false };
      if (!todayData[school.id].modalities) todayData[school.id].modalities = {};
      todayData[school.id].modalities[modId] = {
        matM,
        matF,
        asistM: asistMStr === '' ? '' : asistM,
        asistF: asistFStr === '' ? '' : asistF,
        docJustM,
        docJustF,
        docInjustM,
        docInjustF,
        docAsistM,
        docAsistF
      };
    }

    checkSchoolValidationAlerts();
    recalculateTeacherTotals();
  }

  function checkSchoolValidationAlerts() {
    const school = state.schools.find(s => s.id === state.selectedSchoolId);
    if (!school) return;

    const errors = validateSchoolAttendance(school);
    const alertBox = document.getElementById('validationAlertBox');
    const alertMsg = document.getElementById('validationAlertMsg');

    if (errors.length > 0) {
      alertBox.classList.remove('hidden');
      alertMsg.innerHTML = `
        <strong>⚠️ No es posible guardar mientras existan inconsistencias en el reporte:</strong>
        <ul style="margin: 0.25rem 0 0 1rem; padding: 0;">
          ${errors.map(err => `<li>${err.msg}</li>`).join('')}
        </ul>
      `;
    } else {
      alertBox.classList.add('hidden');
    }
  }

  function validateSchoolAttendance(school) {
    const errors = [];

    school.modalities.forEach(mod => {
      const docJustM = parseInt(getFieldVal(`doc-just-m-${mod.id}`), 10) || 0;
      const docInjustM = parseInt(getFieldVal(`doc-injust-m-${mod.id}`), 10) || 0;
      const docAusentesM = docJustM + docInjustM;
      if (docAusentesM > mod.baseDocM) {
        errors.push({
          modId: mod.id,
          fieldId: `doc-just-m-${mod.id}`,
          msg: `En <strong>${mod.name}</strong> los docentes varones ausentes (${docAusentesM}) superan la plantilla del centro (${mod.baseDocM}).`
        });
      }

      const docJustF = parseInt(getFieldVal(`doc-just-f-${mod.id}`), 10) || 0;
      const docInjustF = parseInt(getFieldVal(`doc-injust-f-${mod.id}`), 10) || 0;
      const docAusentesF = docJustF + docInjustF;
      if (docAusentesF > mod.baseDocF) {
        errors.push({
          modId: mod.id,
          fieldId: `doc-just-f-${mod.id}`,
          msg: `En <strong>${mod.name}</strong> las docentes mujeres ausentes (${docAusentesF}) superan la plantilla del centro (${mod.baseDocF}).`
        });
      }

      const docAsistM = Math.max(0, mod.baseDocM - docAusentesM);
      const docAsistF = Math.max(0, mod.baseDocF - docAusentesF);
      const docAsistT = docAsistM + docAsistF;

      const matM = parseInt(getFieldVal(`mat-m-${mod.id}`), 10) || 0;
      const matF = parseInt(getFieldVal(`mat-f-${mod.id}`), 10) || 0;

      const asistMStr = getFieldVal(`asist-m-${mod.id}`);
      const asistFStr = getFieldVal(`asist-f-${mod.id}`);
      const asistM = parseInt(asistMStr, 10) || 0;
      const asistF = parseInt(asistFStr, 10) || 0;

      if (docAsistT === 0 && (matM > 0 || matF > 0 || asistM > 0 || asistF > 0)) {
        errors.push({
          modId: mod.id,
          fieldId: `doc-just-m-${mod.id}`,
          msg: `En <strong>${mod.name}</strong> la asistencia docente es 0. La matrícula y la asistencia deben permanecer en 0 ya que no hay docentes atendiendo la modalidad.`
        });
      }

      if (docAsistT > 0) {
        if (asistMStr !== '' && asistM > matM) {
          errors.push({
            modId: mod.id,
            fieldId: `asist-m-${mod.id}`,
            msg: `En <strong>${mod.name}</strong> la asistencia masculina (${asistM}) supera la matrícula (${matM}).`
          });
        }

        if (asistFStr !== '' && asistF > matF) {
          errors.push({
            modId: mod.id,
            fieldId: `asist-f-${mod.id}`,
            msg: `En <strong>${mod.name}</strong> la asistencia femenina (${asistF}) supera la matrícula (${matF}).`
          });
        }
      }
    });

    return errors;
  }

  function recalculateTeacherTotals() {
    const school = state.schools.find(s => s.id === state.selectedSchoolId);
    if (!school) return;

    let totMatM = 0, totMatF = 0, totMatT = 0;
    let totAsistM = 0, totAsistF = 0, totAsistT = 0;
    let totDocAsistM = 0, totDocAsistF = 0, totDocAsistT = 0;
    let totDocJustM = 0, totDocJustF = 0, totDocJustT = 0;
    let totDocInjustM = 0, totDocInjustF = 0, totDocInjustT = 0;

    school.modalities.forEach(mod => {
      const matM = parseInt(getFieldVal(`mat-m-${mod.id}`), 10) || 0;
      const matF = parseInt(getFieldVal(`mat-f-${mod.id}`), 10) || 0;
      totMatM += matM;
      totMatF += matF;
      totMatT += (matM + matF);

      const asistM = parseInt(getFieldVal(`asist-m-${mod.id}`), 10) || 0;
      const asistF = parseInt(getFieldVal(`asist-f-${mod.id}`), 10) || 0;
      totAsistM += asistM;
      totAsistF += asistF;
      totAsistT += (asistM + asistF);

      const docAsistM = parseInt(getFieldVal(`doc-asist-m-${mod.id}`), 10) || 0;
      const docAsistF = parseInt(getFieldVal(`doc-asist-f-${mod.id}`), 10) || 0;
      totDocAsistM += docAsistM;
      totDocAsistF += docAsistF;
      totDocAsistT += (docAsistM + docAsistF);

      const docJustM = parseInt(getFieldVal(`doc-just-m-${mod.id}`), 10) || 0;
      const docJustF = parseInt(getFieldVal(`doc-just-f-${mod.id}`), 10) || 0;
      totDocJustM += docJustM;
      totDocJustF += docJustF;
      totDocJustT += (docJustM + docJustF);

      const docInjustM = parseInt(getFieldVal(`doc-injust-m-${mod.id}`), 10) || 0;
      const docInjustF = parseInt(getFieldVal(`doc-injust-f-${mod.id}`), 10) || 0;
      totDocInjustM += docInjustM;
      totDocInjustF += docInjustF;
      totDocInjustT += (docInjustM + docInjustF);
    });

    let overallPct = 0;
    if (totMatT > 0) {
      overallPct = Math.round((totAsistT / totMatT) * 1000) / 10;
    }

    // 1. Actualizar pie de tabla en vista escritorio
    const tfoot = document.getElementById('teacherTableFooter');
    if (tfoot) {
      tfoot.innerHTML = `
        <td colspan="2" class="col-modalidad sticky-footer-col" style="text-align: right; font-weight: 800; padding-right: 0.6rem;">TOTAL:</td>
        <td class="tfoot-total-val">${totMatM}</td>
        <td class="tfoot-total-val">${totMatF}</td>
        <td class="tfoot-total-val highlight-total">${totMatT}</td>

        <td class="tfoot-total-val">${totAsistM}</td>
        <td class="tfoot-total-val">${totAsistF}</td>
        <td class="tfoot-total-val highlight-total">${totAsistT}</td>

        <td class="tfoot-total-val"><span class="pct-cell-badge pct-high">${overallPct.toFixed(1)}%</span></td>

        <td class="tfoot-total-val">${totDocAsistM}</td>
        <td class="tfoot-total-val">${totDocAsistF}</td>
        <td class="tfoot-total-val highlight-total">${totDocAsistT}</td>

        <td class="tfoot-total-val">${totDocJustM}</td>
        <td class="tfoot-total-val">${totDocJustF}</td>
        <td class="tfoot-total-val highlight-total">${totDocJustT}</td>

        <td class="tfoot-total-val">${totDocInjustM}</td>
        <td class="tfoot-total-val">${totDocInjustF}</td>
        <td class="tfoot-total-val highlight-total">${totDocInjustT}</td>
      `;
    }

    // 2. Actualizar resumen de totales en vista teléfono
    const mobMat = document.getElementById('mobSummaryTotalMat');
    const mobAsist = document.getElementById('mobSummaryTotalAsist');
    const mobPct = document.getElementById('mobSummaryTotalPct');
    const mobDoc = document.getElementById('mobSummaryTotalDoc');

    if (mobMat) mobMat.textContent = `${totMatT}`;
    if (mobAsist) mobAsist.textContent = `${totAsistT}`;
    if (mobPct) {
      mobPct.textContent = `${overallPct.toFixed(1)}%`;
      mobPct.className = `pct-cell-badge ${overallPct >= 85 ? 'pct-high' : (overallPct >= 70 ? 'pct-med' : 'pct-low')}`;
    }
    if (mobDoc) mobDoc.textContent = `${totDocAsistT} pres.`;
  }

  /**
   * Guarda la asistencia del centro seleccionado con validación estricta
   */
  function saveCurrentSchoolAttendance() {
    if (state.isLocked) {
      alert('SISTEMA CERRADO POR EL DÍA DE HOY (Horario límite: 2:30 PM)');
      return;
    }

    const school = state.schools.find(s => s.id === state.selectedSchoolId);
    if (!school) return;

    const errors = validateSchoolAttendance(school);
    if (errors.length > 0) {
      const errorMsgPlain = errors.map(e => '• ' + e.msg.replace(/<[^>]*>?/gm, '')).join('\n');
      alert(`⚠️ NO SE PUEDE GUARDAR LA ASISTENCIA:\n\n${errorMsgPlain}\n\nPor favor corrija las casillas marcadas en rojo.`);

      const isMobile = window.innerWidth <= 768;
      const targetFocusId = isMobile ? `mob-${errors[0].fieldId}` : errors[0].fieldId;
      const firstInvalidInput = document.getElementById(targetFocusId) || document.getElementById(errors[0].fieldId);
      if (firstInvalidInput) {
        firstInvalidInput.focus();
        firstInvalidInput.select();
      }
      return;
    }

    const todayData = getTodayAttendance();
    const modalitiesData = {};

    school.modalities.forEach(mod => {
      const docAsistM = parseInt(getFieldVal(`doc-asist-m-${mod.id}`), 10) || 0;
      const docAsistF = parseInt(getFieldVal(`doc-asist-f-${mod.id}`), 10) || 0;
      const docAsistT = docAsistM + docAsistF;

      let matM = parseInt(getFieldVal(`mat-m-${mod.id}`), 10) || 0;
      let matF = parseInt(getFieldVal(`mat-f-${mod.id}`), 10) || 0;
      let asistM = parseInt(getFieldVal(`asist-m-${mod.id}`), 10) || 0;
      let asistF = parseInt(getFieldVal(`asist-f-${mod.id}`), 10) || 0;

      if (docAsistT === 0) {
        matM = 0;
        matF = 0;
        asistM = 0;
        asistF = 0;
      }

      modalitiesData[mod.id] = {
        matM,
        matF,
        asistM,
        asistF,
        docAsistM,
        docAsistF,
        docJustM: parseInt(getFieldVal(`doc-just-m-${mod.id}`), 10) || 0,
        docJustF: parseInt(getFieldVal(`doc-just-f-${mod.id}`), 10) || 0,
        docInjustM: parseInt(getFieldVal(`doc-injust-m-${mod.id}`), 10) || 0,
        docInjustF: parseInt(getFieldVal(`doc-injust-f-${mod.id}`), 10) || 0
      };
    });

    const nowTimeStr = new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit', hour12: true });

    todayData[school.id] = {
      saved: true,
      savedAt: nowTimeStr,
      modalities: modalitiesData
    };

    saveDailyData();
    renderSchoolsTiles();

    const statusBadge = document.getElementById('teacherSavedStatusBadge');
    if (statusBadge) {
      statusBadge.textContent = `✓ Guardado Hoy (${nowTimeStr})`;
      statusBadge.className = 'tag-status saved';
    }

    const feedback = document.getElementById('saveFeedbackText');
    if (feedback) {
      feedback.textContent = `✓ Datos guardados exitosamente a las ${nowTimeStr}`;
      setTimeout(() => { feedback.textContent = ''; }, 4500);
    }

    showToast(`✓ Asistencia guardada correctamente para ${school.name}`);

    // Sincronizar en la nube con Google Sheets en segundo plano
    syncToCloudDailyAttendance(school, modalitiesData, nowTimeStr);
  }

  /**
   * Acceso a Dirección (Consolidado General)
   */
  function toggleAdminAccess() {
    if (state.currentRole === 'docente') {
      const pin = prompt('Ingrese el código PIN de Dirección para acceder al Consolidado General:', '');
      if (pin === null) return;
      if (pin.trim() !== ADMIN_PIN) {
        alert('PIN de acceso incorrecto.');
        return;
      }
      state.currentRole = 'admin';
      state.adminEditMatricula = false;
      document.getElementById('view-docente').classList.remove('active');
      document.getElementById('view-admin').classList.add('active');
      document.getElementById('roleButtonText').textContent = 'Volver a Vista Docente';
      updateLockBannerRole();
      renderGlobalConsolidatedTable();
    } else {
      if (state.adminEditMatricula) {
        saveAdminEditedMatricula();
        state.adminEditMatricula = false;
        const btn = document.getElementById('btnToggleEditMatricula');
        if (btn) btn.className = 'btn btn-warning';
        const btnText = document.getElementById('btnEditMatText');
        if (btnText) btnText.textContent = 'Editar Matrícula y Docentes';
        const indicator = document.getElementById('editModeIndicator');
        if (indicator) indicator.classList.add('hidden');
      }
      state.currentRole = 'docente';
      document.getElementById('view-admin').classList.remove('active');
      document.getElementById('view-docente').classList.add('active');
      document.getElementById('roleButtonText').textContent = 'Vista Dirección (Consolidado)';
      updateLockBannerRole();
      renderSchoolsTiles();
      renderTeacherTable();
    }
  }

  /**
   * EDICIÓN DE MATRÍCULA Y DOCENTES DESDE DIRECCIÓN
   * Guarda la matrícula definitiva y la cantidad de docentes permanente que serán predeterminadas siempre.
   */
  function toggleAdminEditMatricula() {
    const btn = document.getElementById('btnToggleEditMatricula');
    const btnText = document.getElementById('btnEditMatText');
    const indicator = document.getElementById('editModeIndicator');

    if (!state.adminEditMatricula) {
      state.adminEditMatricula = true;
      btn.className = 'btn btn-success';
      btnText.textContent = 'Guardar Matrículas y Docentes';
      indicator.classList.remove('hidden');
      indicator.textContent = 'Modo Edición Activado: Puede alterar las matrículas y la cantidad de docentes de cada escuela. Estos valores se guardarán de forma permanente.';
      renderGlobalConsolidatedTable();
      showToast('Modo edición activado: Modifique los números de matrícula y docentes oficiales.');
    } else {
      saveAdminEditedMatricula();
      state.adminEditMatricula = false;
      btn.className = 'btn btn-warning';
      btnText.textContent = 'Editar Matrícula y Docentes';
      indicator.classList.add('hidden');
      renderGlobalConsolidatedTable();
    }
  }

  function saveAdminEditedMatricula() {
    const todayData = getTodayAttendance();

    state.schools.forEach(school => {
      if (!todayData[school.id]) {
        todayData[school.id] = { modalities: {}, saved: false };
      }
      if (!todayData[school.id].modalities) {
        todayData[school.id].modalities = {};
      }

      school.modalities.forEach(mod => {
        const inputMatM = document.getElementById(`admin-mat-m-${school.id}-${mod.id}`);
        const inputMatF = document.getElementById(`admin-mat-f-${school.id}-${mod.id}`);
        const inputDocM = document.getElementById(`admin-doc-m-${school.id}-${mod.id}`);
        const inputDocF = document.getElementById(`admin-doc-f-${school.id}-${mod.id}`);

        if (inputMatM && inputMatF) {
          const newMatM = parseInt(inputMatM.value, 10);
          const newMatF = parseInt(inputMatF.value, 10);

          if (!isNaN(newMatM)) mod.baseMatM = newMatM;
          if (!isNaN(newMatF)) mod.baseMatF = newMatF;

          // ACTUALIZAR SIEMPRE el día de hoy con la nueva matrícula oficial permanente
          if (!todayData[school.id].modalities[mod.id]) {
            todayData[school.id].modalities[mod.id] = {};
          }
          todayData[school.id].modalities[mod.id].matM = mod.baseMatM;
          todayData[school.id].modalities[mod.id].matF = mod.baseMatF;
        }

        if (inputDocM && inputDocF) {
          const newDocM = parseInt(inputDocM.value, 10);
          const newDocF = parseInt(inputDocF.value, 10);

          if (!isNaN(newDocM)) mod.baseDocM = newDocM;
          if (!isNaN(newDocF)) mod.baseDocF = newDocF;

          if (todayData[school.id].modalities[mod.id]) {
            const mData = todayData[school.id].modalities[mod.id];
            const jM = mData.docJustM || 0;
            const jF = mData.docJustF || 0;
            const ijM = mData.docInjustM || 0;
            const ijF = mData.docInjustF || 0;
            mData.docAsistM = Math.max(0, mod.baseDocM - (jM + ijM));
            mData.docAsistF = Math.max(0, mod.baseDocF - (jF + ijF));
          }
        }
      });
    });

    saveBaseConfig();
    saveDailyData();
    showToast(`✓ Matrículas oficiales y plantilla docente guardadas permanentemente.`);

    // Sincronizar en la nube con Google Sheets en segundo plano
    syncToCloudBaseConfig();
  }

  /**
   * RENDERIZA EL CONSOLIDADO GENERAL (DIRECCIÓN)
   */
  function renderGlobalConsolidatedTable() {
    const tbody = document.getElementById('globalNerTableBody');
    const tfoot = document.getElementById('globalNerTableFooter');
    if (!tbody) return;

    tbody.innerHTML = '';
    const todayData = getTodayAttendance();

    let totNerMatM = 0, totNerMatF = 0, totNerMatT = 0;
    let totNerAsistM = 0, totNerAsistF = 0, totNerAsistT = 0;
    let totNerBaseDocM = 0, totNerBaseDocF = 0, totNerBaseDocT = 0;
    let totNerDocAsistM = 0, totNerDocAsistF = 0, totNerDocAsistT = 0;
    let totNerDocJustM = 0, totNerDocJustF = 0, totNerDocJustT = 0;
    let totNerDocInjustM = 0, totNerDocInjustF = 0, totNerDocInjustT = 0;
    let reportedCount = 0;

    state.schools.forEach((school, schoolIdx) => {
      const schoolRecord = todayData[school.id] || { modalities: {}, saved: false };
      if (schoolRecord.saved) reportedCount++;

      school.modalities.forEach((mod, modIdx) => {
        const modData = schoolRecord.modalities && schoolRecord.modalities[mod.id];

        const baseDocM = mod.baseDocM;
        const baseDocF = mod.baseDocF;
        const baseDocT = baseDocM + baseDocF;

        const docJustM = modData ? (modData.docJustM || 0) : 0;
        const docJustF = modData ? (modData.docJustF || 0) : 0;
        const docJustT = docJustM + docJustF;

        const docInjustM = modData ? (modData.docInjustM || 0) : 0;
        const docInjustF = modData ? (modData.docInjustF || 0) : 0;
        const docInjustT = docInjustM + docInjustF;

        const docAsistM = modData && modData.docAsistM !== undefined 
          ? modData.docAsistM 
          : Math.max(0, baseDocM - (docJustM + docInjustM));
        const docAsistF = modData && modData.docAsistF !== undefined 
          ? modData.docAsistF 
          : Math.max(0, baseDocF - (docJustF + docInjustF));
        const docAsistT = docAsistM + docAsistF;

        let matM = modData && modData.matM !== undefined ? modData.matM : mod.baseMatM;
        let matF = modData && modData.matF !== undefined ? modData.matF : mod.baseMatF;
        let asistM = modData ? (modData.asistM || 0) : 0;
        let asistF = modData ? (modData.asistF || 0) : 0;

        // Si la asistencia de docente llega a 0 (y no estamos en modo edición de plantilla oficial de Dirección):
        if (docAsistT === 0 && !state.adminEditMatricula) {
          matM = 0;
          matF = 0;
          asistM = 0;
          asistF = 0;
        }

        const matT = matM + matF;
        const asistT = asistM + asistF;

        const pctM = matM > 0 ? ((asistM / matM) * 100).toFixed(1) : '0.0';
        const pctF = matF > 0 ? ((asistF / matF) * 100).toFixed(1) : '0.0';
        const pctT = matT > 0 ? ((asistT / matT) * 100).toFixed(1) : '0.0';

        totNerMatM += matM; totNerMatF += matF; totNerMatT += matT;
        totNerAsistM += asistM; totNerAsistF += asistF; totNerAsistT += asistT;
        totNerBaseDocM += baseDocM; totNerBaseDocF += baseDocF; totNerBaseDocT += baseDocT;
        totNerDocAsistM += docAsistM; totNerDocAsistF += docAsistF; totNerDocAsistT += docAsistT;
        totNerDocJustM += docJustM; totNerDocJustF += docJustF; totNerDocJustT += docJustT;
        totNerDocInjustM += docInjustM; totNerDocInjustF += docInjustF; totNerDocInjustT += docInjustT;

        const tr = document.createElement('tr');
        if (modIdx === 0) tr.className = 'school-group-start';

        const matriculaCellsHtml = state.adminEditMatricula ? `
          <td><input type="number" min="0" inputmode="numeric" pattern="[0-9]*" onfocus="this.select()" class="admin-mat-input" id="admin-mat-m-${school.id}-${mod.id}" value="${mod.baseMatM}"></td>
          <td><input type="number" min="0" inputmode="numeric" pattern="[0-9]*" onfocus="this.select()" class="admin-mat-input" id="admin-mat-f-${school.id}-${mod.id}" value="${mod.baseMatF}"></td>
          <td style="font-weight:800; background:#e2e8f0;">${mod.baseMatM + mod.baseMatF}</td>
        ` : `
          <td>${matM}</td>
          <td>${matF}</td>
          <td style="font-weight:700; background:#f1f5f9;">${matT}</td>
        `;

        const baseDocCellsHtml = state.adminEditMatricula ? `
          <td><input type="number" min="0" inputmode="numeric" pattern="[0-9]*" onfocus="this.select()" class="admin-doc-input" id="admin-doc-m-${school.id}-${mod.id}" value="${baseDocM}"></td>
          <td><input type="number" min="0" inputmode="numeric" pattern="[0-9]*" onfocus="this.select()" class="admin-doc-input" id="admin-doc-f-${school.id}-${mod.id}" value="${baseDocF}"></td>
          <td style="font-weight:800; background:#e2e8f0;">${baseDocT}</td>
        ` : `
          <td>${baseDocM}</td>
          <td>${baseDocF}</td>
          <td style="font-weight:700; background:#f1f5f9;">${baseDocT}</td>
        `;

        tr.innerHTML = `
          <td>${modIdx === 0 ? school.num : ''}</td>
          <td>${modIdx === 0 ? `<strong>${school.code}</strong>` : ''}</td>
          <td>${modIdx === 0 ? `<strong>${school.name}</strong>` : ''}</td>
          <td style="text-align: left; padding-left: 0.5rem;">${mod.name}</td>
          <td>${mod.turno}</td>

          ${matriculaCellsHtml}

          <td>${asistM}</td><td>${asistF}</td><td style="font-weight:700; background:#f1f5f9;">${asistT}</td>
          <td>${pctM}%</td><td>${pctF}%</td><td style="font-weight:700; background:#f1f5f9;">${pctT}%</td>

          ${baseDocCellsHtml}

          <td>${docAsistM}</td><td>${docAsistF}</td><td style="font-weight:700; background:#f1f5f9;">${docAsistT}</td>
          <td>${docJustM}</td><td>${docJustF}</td><td style="font-weight:700; background:#f1f5f9;">${docJustT}</td>
          <td>${docInjustM}</td><td>${docInjustF}</td><td style="font-weight:700; background:#f1f5f9;">${docInjustT}</td>
        `;
        tbody.appendChild(tr);
      });
    });

    let overallNerPct = 0;
    if (totNerMatT > 0) {
      overallNerPct = (Math.round((totNerAsistT / totNerMatT) * 1000) / 10).toFixed(1);
    }
    const totPctM = totNerMatM > 0 ? ((totNerAsistM / totNerMatM) * 100).toFixed(1) : '0.0';
    const totPctF = totNerMatF > 0 ? ((totNerAsistF / totNerMatF) * 100).toFixed(1) : '0.0';

    if (tfoot) {
      tfoot.innerHTML = `
        <td colspan="5" style="text-align: right; font-weight: 800; padding-right: 0.6rem;">TOTAL NER (6 CENTROS):</td>
        <td class="tfoot-total-val">${totNerMatM}</td>
        <td class="tfoot-total-val">${totNerMatF}</td>
        <td class="tfoot-total-val" style="background:#1e293b;">${totNerMatT}</td>

        <td class="tfoot-total-val">${totNerAsistM}</td>
        <td class="tfoot-total-val">${totNerAsistF}</td>
        <td class="tfoot-total-val" style="background:#1e293b;">${totNerAsistT}</td>

        <td class="tfoot-total-val">${totPctM}%</td>
        <td class="tfoot-total-val">${totPctF}%</td>
        <td class="tfoot-total-val" style="background:#1e293b;">${overallNerPct}%</td>

        <td class="tfoot-total-val">${totNerBaseDocM}</td>
        <td class="tfoot-total-val">${totNerBaseDocF}</td>
        <td class="tfoot-total-val" style="background:#1e293b;">${totNerBaseDocT}</td>

        <td class="tfoot-total-val">${totNerDocAsistM}</td>
        <td class="tfoot-total-val">${totNerDocAsistF}</td>
        <td class="tfoot-total-val" style="background:#1e293b;">${totNerDocAsistT}</td>

        <td class="tfoot-total-val">${totNerDocJustM}</td>
        <td class="tfoot-total-val">${totNerDocJustF}</td>
        <td class="tfoot-total-val" style="background:#1e293b;">${totNerDocJustT}</td>

        <td class="tfoot-total-val">${totNerDocInjustM}</td>
        <td class="tfoot-total-val">${totNerDocInjustF}</td>
        <td class="tfoot-total-val" style="background:#1e293b;">${totNerDocInjustT}</td>
      `;
    }

    document.getElementById('adminKpiTotalMatricula').textContent = totNerMatT;
    document.getElementById('adminKpiMatriculaSub').textContent = `M: ${totNerMatM} | F: ${totNerMatF}`;

    document.getElementById('adminKpiTotalAsistencia').textContent = totNerAsistT;
    document.getElementById('adminKpiAsistenciaSub').textContent = `M: ${totNerAsistM} | F: ${totNerAsistF}`;

    document.getElementById('adminKpiPorcentaje').textContent = `${overallNerPct}%`;

    document.getElementById('adminKpiDocentesAsist').textContent = totNerDocAsistT;
    document.getElementById('adminKpiDocentesAusentes').textContent = `${totNerDocJustT} just. / ${totNerDocInjustT} injust. (de ${totNerBaseDocT} en plantilla)`;

    document.getElementById('adminCentrosReportadosBadge').textContent = `${reportedCount} / ${state.schools.length} Centros Guardados`;
  }

  /**
   * EXPORTACIÓN DE EXCEL CON EL DISEÑO Y FORMATO OFICIAL (UN VERDADERO CUADRO)
   * Utiliza ExcelJS para aplicar cuadrículas nítidas, colores oficiales en encabezados,
   * celdas combinadas y formatos porcentuales profesionales.
   */
  async function downloadDailyExcel(isAutomatic = false) {
    if (typeof ExcelJS === 'undefined') {
      if (!isAutomatic) alert('La biblioteca de Excel aún se está cargando. Intente en unos segundos.');
      return;
    }

    try {
      const wb = new ExcelJS.Workbook();
      wb.creator = 'MINED - Núcleo Educativo Rural Estrella de Belén';
      wb.created = new Date();

      const ws = wb.addWorksheet('ASISTENCIA DIARIA NER');
      ws.views = [{ showGridLines: true }];

      // Anchos de columna optimizados
      ws.columns = [
        { width: 3 },  // A
        { width: 3 },  // B
        { width: 5 },  // C: Nº
        { width: 16 }, // D: CODIGO UNICO
        { width: 38 }, // E: CENTRO EDUCATIVO
        { width: 38 }, // F: MODALIDAD
        { width: 14 }, // G: TURNO
        { width: 7 },  // H: Mat M
        { width: 7 },  // I: Mat F
        { width: 8.5 },// J: Mat Total
        { width: 7 },  // K: Asist M
        { width: 7 },  // L: Asist F
        { width: 8.5 },// M: Asist Total
        { width: 10 }, // N: Pct M
        { width: 10 }, // O: Pct F
        { width: 10 }, // P: Pct Total
        { width: 38 }, // Q: Justificacion / Observaciones
        { width: 9 },  // R: Doc Pct M
        { width: 9 },  // S: Doc Pct F
        { width: 9 }   // T: Doc Pct Total
      ];

      function styleRange(wsheet, sRow, sCol, eRow, eCol, style) {
        for (let r = sRow; r <= eRow; r++) {
          for (let c = sCol; c <= eCol; c++) {
            const cell = wsheet.getCell(r, c);
            if (style.font) cell.font = style.font;
            if (style.fill) cell.fill = style.fill;
            if (style.border) cell.border = style.border;
            if (style.alignment) cell.alignment = style.alignment;
            if (style.numFmt) cell.numFmt = style.numFmt;
          }
        }
      }

      const thinBorder = {
        top: { style: 'thin', color: { argb: 'FF595959' } },
        left: { style: 'thin', color: { argb: 'FF595959' } },
        bottom: { style: 'thin', color: { argb: 'FF595959' } },
        right: { style: 'thin', color: { argb: 'FF595959' } }
      };

      const totalBorder = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'double', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      const todayData = getTodayAttendance();

      // ==========================================
      // 1. TABLA: ASISTENCIA DIARIA ESTUDIANTES
      // ==========================================
      ws.getCell('C3').value = 'ASISTENCIA DIARIA ESTUDIANTES';
      ws.getCell('C3').font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF1F4E78' } };

      ws.getCell('C4').value = 'NUCLEO';
      ws.getCell('C4').font = { name: 'Arial', size: 10, bold: true };
      ws.getCell('E4').value = 'ESTRELLA DE BELEN';
      ws.getCell('E4').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1F4E78' } };

      ws.getCell('C5').value = 'FECHA:';
      ws.getCell('C5').font = { name: 'Arial', size: 10, bold: true };
      ws.getCell('E5').value = state.currentDateStr;
      ws.getCell('E5').font = { name: 'Arial', size: 10, bold: true };

      // Encabezados fusionados fila 6 y 7
      ws.mergeCells('C6:C7'); ws.getCell('C6').value = 'Nº';
      ws.mergeCells('D6:D7'); ws.getCell('D6').value = 'CODIGO UNICO';
      ws.mergeCells('E6:E7'); ws.getCell('E6').value = 'CENTRO EDUCATIVO';
      ws.mergeCells('F6:F7'); ws.getCell('F6').value = 'MODALIDAD';
      ws.mergeCells('G6:G7'); ws.getCell('G6').value = 'TURNO';
      ws.mergeCells('H6:J6'); ws.getCell('H6').value = 'MATRICULA';
      ws.mergeCells('K6:M6'); ws.getCell('K6').value = 'ASISTENCIA';
      ws.mergeCells('N6:P6'); ws.getCell('N6').value = 'PORCENTAJE';
      ws.mergeCells('Q6:Q7'); ws.getCell('Q6').value = 'JUSTIFICACION DE LA BAJA ASISTENCIA / OBSERVACIONES';

      // Estilos de encabezados fila 6 y 7
      styleRange(ws, 6, 3, 7, 7, {
        font: { name: 'Arial', size: 9, bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEDED' } },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: thinBorder
      });

      styleRange(ws, 6, 8, 6, 10, {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1F4E78' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      });

      styleRange(ws, 6, 11, 6, 13, {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF276A3C' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      });

      styleRange(ws, 6, 14, 6, 16, {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF833C0C' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      });

      styleRange(ws, 6, 17, 7, 17, {
        font: { name: 'Arial', size: 8, bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEDED' } },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: thinBorder
      });

      // Sub-encabezados M, F, Total fila 7
      const subHeaders = [
        { c: 8, t: 'M', bg: 'FFEBF1F5' }, { c: 9, t: 'F', bg: 'FFEBF1F5' }, { c: 10, t: 'Total', bg: 'FFEBF1F5' },
        { c: 11, t: 'M', bg: 'FFF2F7F0' }, { c: 12, t: 'F', bg: 'FFF2F7F0' }, { c: 13, t: 'Total', bg: 'FFF2F7F0' },
        { c: 14, t: 'M', bg: 'FFFFF9E6' }, { c: 15, t: 'F', bg: 'FFFFF9E6' }, { c: 16, t: 'Total', bg: 'FFFFF9E6' }
      ];
      subHeaders.forEach(s => {
        ws.getCell(7, s.c).value = s.t;
        styleRange(ws, 7, s.c, 7, s.c, {
          font: { name: 'Arial', size: 9, bold: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: s.bg } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: thinBorder
        });
      });

      // Filas de datos de Estudiantes (Fila 8 a 21)
      let currentRow = 8;
      let totMatM = 0, totMatF = 0, totMatT = 0;
      let totAsistM = 0, totAsistF = 0, totAsistT = 0;

      state.schools.forEach(school => {
        const schoolRecord = todayData[school.id] || { modalities: {} };
        const startR = currentRow;
        const modCount = school.modalities.length;
        const endR = startR + modCount - 1;

        school.modalities.forEach((mod, idx) => {
          const modData = schoolRecord.modalities && schoolRecord.modalities[mod.id];
          const r = currentRow;

          const baseDocM = mod.baseDocM;
          const baseDocF = mod.baseDocF;
          const docJustM = modData ? (modData.docJustM || 0) : 0;
          const docJustF = modData ? (modData.docJustF || 0) : 0;
          const docInjustM = modData ? (modData.docInjustM || 0) : 0;
          const docInjustF = modData ? (modData.docInjustF || 0) : 0;

          const docAsistM = modData && modData.docAsistM !== undefined 
            ? modData.docAsistM 
            : Math.max(0, baseDocM - (docJustM + docInjustM));
          const docAsistF = modData && modData.docAsistF !== undefined 
            ? modData.docAsistF 
            : Math.max(0, baseDocF - (docJustF + docInjustF));
          const docAsistT = docAsistM + docAsistF;

          let matM = modData && modData.matM !== undefined ? modData.matM : mod.baseMatM;
          let matF = modData && modData.matF !== undefined ? modData.matF : mod.baseMatF;
          let asistM = modData ? (modData.asistM || 0) : 0;
          let asistF = modData ? (modData.asistF || 0) : 0;

          if (docAsistT === 0) {
            matM = 0;
            matF = 0;
            asistM = 0;
            asistF = 0;
          }

          const matT = matM + matF;
          const asistT = asistM + asistF;

          const pctM = matM > 0 ? (asistM / matM) : 0;
          const pctF = matF > 0 ? (asistF / matF) : 0;
          const pctT = matT > 0 ? (asistT / matT) : 0;

          totMatM += matM; totMatF += matF; totMatT += matT;
          totAsistM += asistM; totAsistF += asistF; totAsistT += asistT;

          // Asignar valores
          ws.getCell(r, 6).value = mod.name;
          ws.getCell(r, 7).value = mod.turno;

          ws.getCell(r, 8).value = matM;
          ws.getCell(r, 9).value = matF;
          ws.getCell(r, 10).value = matT;

          ws.getCell(r, 11).value = asistM;
          ws.getCell(r, 12).value = asistF;
          ws.getCell(r, 13).value = asistT;

          ws.getCell(r, 14).value = pctM;
          ws.getCell(r, 15).value = pctF;
          ws.getCell(r, 16).value = pctT;

          ws.getCell(r, 17).value = '';

          // Estilo de fila de datos
          styleRange(ws, r, 6, r, 7, {
            font: { name: 'Arial', size: 9 },
            alignment: { horizontal: idx === 0 ? 'left' : 'left', vertical: 'middle' },
            border: thinBorder
          });
          ws.getCell(r, 7).alignment = { horizontal: 'center', vertical: 'middle' };

          styleRange(ws, r, 8, r, 13, {
            font: { name: 'Arial', size: 9 },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: thinBorder,
            numFmt: '#,##0'
          });

          // Celdas de totales destacados
          ws.getCell(r, 10).font = { name: 'Arial', size: 9, bold: true };
          ws.getCell(r, 10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F7' } };
          ws.getCell(r, 13).font = { name: 'Arial', size: 9, bold: true };
          ws.getCell(r, 13).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F7' } };

          styleRange(ws, r, 14, r, 16, {
            font: { name: 'Arial', size: 9 },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: thinBorder,
            numFmt: '0.00"%"'
          });
          ws.getCell(r, 16).font = { name: 'Arial', size: 9, bold: true };
          ws.getCell(r, 16).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9E6' } };

          styleRange(ws, r, 17, r, 17, {
            font: { name: 'Arial', size: 9 },
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: thinBorder
          });

          currentRow++;
        });

        // Combinar C, D, E por escuela
        ws.mergeCells(startR, 3, endR, 3);
        ws.getCell(startR, 3).value = school.num;

        ws.mergeCells(startR, 4, endR, 4);
        ws.getCell(startR, 4).value = school.code;

        ws.mergeCells(startR, 5, endR, 5);
        ws.getCell(startR, 5).value = school.name;

        styleRange(ws, startR, 3, endR, 3, {
          font: { name: 'Arial', size: 9, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: thinBorder
        });
        styleRange(ws, startR, 4, endR, 4, {
          font: { name: 'Arial', size: 9, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: thinBorder
        });
        styleRange(ws, startR, 5, endR, 5, {
          font: { name: 'Arial', size: 9, bold: true },
          alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
          border: thinBorder
        });
      });

      // FILA TOTAL NER ESTUDIANTES (Fila 22)
      const totRowEst = currentRow;
      ws.mergeCells(totRowEst, 3, totRowEst, 7);
      ws.getCell(totRowEst, 3).value = 'TOTAL NER';

      const totPctM = totMatM > 0 ? (totAsistM / totMatM) : 0;
      const totPctF = totMatF > 0 ? (totAsistF / totMatF) : 0;
      const totPctT = totMatT > 0 ? (totAsistT / totMatT) : 0;

      ws.getCell(totRowEst, 8).value = totMatM;
      ws.getCell(totRowEst, 9).value = totMatF;
      ws.getCell(totRowEst, 10).value = totMatT;

      ws.getCell(totRowEst, 11).value = totAsistM;
      ws.getCell(totRowEst, 12).value = totAsistF;
      ws.getCell(totRowEst, 13).value = totAsistT;

      ws.getCell(totRowEst, 14).value = totPctM;
      ws.getCell(totRowEst, 15).value = totPctF;
      ws.getCell(totRowEst, 16).value = totPctT;
      ws.getCell(totRowEst, 17).value = '';

      styleRange(ws, totRowEst, 3, totRowEst, 17, {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1F4E78' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: totalBorder
      });
      ws.getCell(totRowEst, 3).alignment = { horizontal: 'center', vertical: 'middle' };

      [8, 9, 10, 11, 12, 13].forEach(c => ws.getCell(totRowEst, c).numFmt = '#,##0');
      [14, 15, 16].forEach(c => ws.getCell(totRowEst, c).numFmt = '0.00"%"');

      // ==========================================
      // 2. TABLA: ASISTENCIA DIARIA DOCENTES
      // ==========================================
      currentRow += 3; // Espacio entre tablas (Fila 25)
      const startDocRow = currentRow;

      const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      const curDateObj = getEffectiveCurrentTime();
      const dayName = dayNames[curDateObj.getDay()];
      const dateFormatted = `${String(curDateObj.getDate()).padStart(2, '0')}/${String(curDateObj.getMonth() + 1).padStart(2, '0')}/${curDateObj.getFullYear()}`;

      ws.getCell(startDocRow, 3).value = 'ASISTENCIA DIARIA DOCENTES';
      ws.getCell(startDocRow, 3).font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF1F4E78' } };
      ws.getCell(startDocRow, 5).value = `${dayName} ${dateFormatted}`;
      ws.getCell(startDocRow, 5).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1F4E78' } };

      ws.getCell(startDocRow + 1, 3).value = 'NUCLEO';
      ws.getCell(startDocRow + 1, 3).font = { name: 'Arial', size: 10, bold: true };

      ws.getCell(startDocRow + 2, 3).value = 'FECHA:';
      ws.getCell(startDocRow + 2, 3).font = { name: 'Arial', size: 10, bold: true };
      ws.getCell(startDocRow + 2, 5).value = state.currentDateStr;
      ws.getCell(startDocRow + 2, 5).font = { name: 'Arial', size: 10, bold: true };

      ws.mergeCells(startDocRow + 2, 18, startDocRow + 2, 20);
      ws.getCell(startDocRow + 2, 18).value = 'PORCENTAJE';
      styleRange(ws, startDocRow + 2, 18, startDocRow + 2, 20, {
        font: { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1F4E78' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      });

      // Encabezados Docentes Fila startDocRow + 3 y + 4
      const hDocR1 = startDocRow + 3;
      const hDocR2 = startDocRow + 4;

      ws.mergeCells(hDocR1, 3, hDocR2, 3); ws.getCell(hDocR1, 3).value = 'Nº';
      ws.mergeCells(hDocR1, 4, hDocR2, 4); ws.getCell(hDocR1, 4).value = 'CODIGO UNICO';
      ws.mergeCells(hDocR1, 5, hDocR2, 5); ws.getCell(hDocR1, 5).value = 'CENTRO EDUCATIVO';
      ws.mergeCells(hDocR1, 6, hDocR2, 6); ws.getCell(hDocR1, 6).value = 'MODALIDAD';
      ws.mergeCells(hDocR1, 7, hDocR2, 7); ws.getCell(hDocR1, 7).value = 'TURNO';

      ws.mergeCells(hDocR1, 8, hDocR1, 10); ws.getCell(hDocR1, 8).value = 'CANTIDAD DE DOCENTES';
      ws.mergeCells(hDocR1, 11, hDocR1, 13); ws.getCell(hDocR1, 11).value = 'ASISTENCIA';
      ws.mergeCells(hDocR1, 14, hDocR1, 15); ws.getCell(hDocR1, 14).value = 'JUSTIFICADOS';
      ws.mergeCells(hDocR1, 16, hDocR1, 17); ws.getCell(hDocR1, 16).value = 'INJUSTIFICADOS';
      ws.mergeCells(hDocR1, 18, hDocR1, 20); ws.getCell(hDocR1, 18).value = '';

      styleRange(ws, hDocR1, 3, hDocR2, 7, {
        font: { name: 'Arial', size: 9, bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEDED' } },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: thinBorder
      });

      styleRange(ws, hDocR1, 8, hDocR1, 10, {
        font: { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1F4E78' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      });

      styleRange(ws, hDocR1, 11, hDocR1, 13, {
        font: { name: 'Arial', size: 9, bold: true, color: { argb: 'FF276A3C' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      });

      styleRange(ws, hDocR1, 14, hDocR1, 15, {
        font: { name: 'Arial', size: 9, bold: true, color: { argb: 'FF833C0C' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      });

      styleRange(ws, hDocR1, 16, hDocR1, 17, {
        font: { name: 'Arial', size: 9, bold: true, color: { argb: 'FFC00000' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      });

      // Subheaders Docentes fila hDocR2
      const docSubHeaders = [
        { c: 8, t: 'M', bg: 'FFEBF1F5' }, { c: 9, t: 'F', bg: 'FFEBF1F5' }, { c: 10, t: 'Total', bg: 'FFEBF1F5' },
        { c: 11, t: 'M', bg: 'FFF2F7F0' }, { c: 12, t: 'F', bg: 'FFF2F7F0' }, { c: 13, t: 'Total', bg: 'FFF2F7F0' },
        { c: 14, t: 'M', bg: 'FFFFF9E6' }, { c: 15, t: 'F', bg: 'FFFFF9E6' },
        { c: 16, t: 'M', bg: 'FFFDF2EC' }, { c: 17, t: 'F', bg: 'FFFDF2EC' },
        { c: 18, t: 'M', bg: 'FFEBF1F5' }, { c: 19, t: 'F', bg: 'FFEBF1F5' }, { c: 20, t: 'Total', bg: 'FFEBF1F5' }
      ];

      docSubHeaders.forEach(s => {
        ws.getCell(hDocR2, s.c).value = s.t;
        styleRange(ws, hDocR2, s.c, hDocR2, s.c, {
          font: { name: 'Arial', size: 9, bold: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: s.bg } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: thinBorder
        });
      });

      // Filas de datos Docentes
      currentRow = hDocR2 + 1;
      let totDocCantM = 0, totDocCantF = 0, totDocCantT = 0;
      let totDocAsistM = 0, totDocAsistF = 0, totDocAsistT = 0;
      let totDocJustM = 0, totDocJustF = 0;
      let totDocInjustM = 0, totDocInjustF = 0;

      state.schools.forEach(school => {
        const schoolRecord = todayData[school.id] || { modalities: {} };
        const startR = currentRow;
        const modCount = school.modalities.length;
        const endR = startR + modCount - 1;

        school.modalities.forEach(mod => {
          const modData = schoolRecord.modalities && schoolRecord.modalities[mod.id];
          const r = currentRow;

          const cantM = mod.baseDocM;
          const cantF = mod.baseDocF;
          const cantT = cantM + cantF;

          const asistM = modData && modData.docAsistM !== undefined ? modData.docAsistM : mod.baseDocM;
          const asistF = modData && modData.docAsistF !== undefined ? modData.docAsistF : mod.baseDocF;
          const asistT = asistM + asistF;

          const justM = modData && modData.docJustM !== undefined ? modData.docJustM : 0;
          const justF = modData && modData.docJustF !== undefined ? modData.docJustF : 0;

          const injustM = modData && modData.docInjustM !== undefined ? modData.docInjustM : 0;
          const injustF = modData && modData.docInjustF !== undefined ? modData.docInjustF : 0;

          const pctM = cantM > 0 ? (asistM / cantM) : (asistM > 0 ? 1 : '');
          const pctF = cantF > 0 ? (asistF / cantF) : (asistF > 0 ? 1 : '');
          const pctT = cantT > 0 ? (asistT / cantT) : 1;

          totDocCantM += cantM; totDocCantF += cantF; totDocCantT += cantT;
          totDocAsistM += asistM; totDocAsistF += asistF; totDocAsistT += asistT;
          totDocJustM += justM; totDocJustF += justF;
          totDocInjustM += injustM; totDocInjustF += injustF;

          ws.getCell(r, 6).value = mod.name;
          ws.getCell(r, 7).value = mod.turno;

          ws.getCell(r, 8).value = cantM;
          ws.getCell(r, 9).value = cantF;
          ws.getCell(r, 10).value = cantT;

          ws.getCell(r, 11).value = asistM;
          ws.getCell(r, 12).value = asistF;
          ws.getCell(r, 13).value = asistT;

          ws.getCell(r, 14).value = justM > 0 ? justM : '';
          ws.getCell(r, 15).value = justF > 0 ? justF : '';
          ws.getCell(r, 16).value = injustM > 0 ? injustM : '';
          ws.getCell(r, 17).value = injustF > 0 ? injustF : '';

          ws.getCell(r, 18).value = pctM;
          ws.getCell(r, 19).value = pctF;
          ws.getCell(r, 20).value = pctT;

          styleRange(ws, r, 6, r, 7, {
            font: { name: 'Arial', size: 9 },
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: thinBorder
          });
          ws.getCell(r, 7).alignment = { horizontal: 'center', vertical: 'middle' };

          styleRange(ws, r, 8, r, 17, {
            font: { name: 'Arial', size: 9 },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: thinBorder,
            numFmt: '#,##0'
          });

          ws.getCell(r, 10).font = { name: 'Arial', size: 9, bold: true };
          ws.getCell(r, 10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F7' } };
          ws.getCell(r, 13).font = { name: 'Arial', size: 9, bold: true };
          ws.getCell(r, 13).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F7' } };

          styleRange(ws, r, 18, r, 20, {
            font: { name: 'Arial', size: 9 },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: thinBorder,
            numFmt: '0.00"%"'
          });
          ws.getCell(r, 20).font = { name: 'Arial', size: 9, bold: true };
          ws.getCell(r, 20).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF1F5' } };

          currentRow++;
        });

        // Combinar C, D, E por escuela
        ws.mergeCells(startR, 3, endR, 3); ws.getCell(startR, 3).value = school.num;
        ws.mergeCells(startR, 4, endR, 4); ws.getCell(startR, 4).value = school.code;
        ws.mergeCells(startR, 5, endR, 5); ws.getCell(startR, 5).value = school.name;

        styleRange(ws, startR, 3, endR, 3, {
          font: { name: 'Arial', size: 9, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: thinBorder
        });
        styleRange(ws, startR, 4, endR, 4, {
          font: { name: 'Arial', size: 9, bold: true },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: thinBorder
        });
        styleRange(ws, startR, 5, endR, 5, {
          font: { name: 'Arial', size: 9, bold: true },
          alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
          border: thinBorder
        });
      });

      // FILA TOTAL NER DOCENTES
      const totRowDoc = currentRow;
      ws.mergeCells(totRowDoc, 3, totRowDoc, 7);
      ws.getCell(totRowDoc, 3).value = 'TOTAL NER';

      const totDocPctM = totDocCantM > 0 ? (totDocAsistM / totDocCantM) : 1;
      const totDocPctF = totDocCantF > 0 ? (totDocAsistF / totDocCantF) : 1;
      const totDocPctT = totDocCantT > 0 ? (totDocAsistT / totDocCantT) : 1;

      ws.getCell(totRowDoc, 8).value = totDocCantM;
      ws.getCell(totRowDoc, 9).value = totDocCantF;
      ws.getCell(totRowDoc, 10).value = totDocCantT;

      ws.getCell(totRowDoc, 11).value = totDocAsistM;
      ws.getCell(totRowDoc, 12).value = totDocAsistF;
      ws.getCell(totRowDoc, 13).value = totDocAsistT;

      ws.getCell(totRowDoc, 14).value = totDocJustM > 0 ? totDocJustM : '';
      ws.getCell(totRowDoc, 15).value = totDocJustF > 0 ? totDocJustF : '';
      ws.getCell(totRowDoc, 16).value = totDocInjustM > 0 ? totDocInjustM : '';
      ws.getCell(totRowDoc, 17).value = totDocInjustF > 0 ? totDocInjustF : '';

      ws.getCell(totRowDoc, 18).value = totDocPctM;
      ws.getCell(totRowDoc, 19).value = totDocPctF;
      ws.getCell(totRowDoc, 20).value = totDocPctT;

      styleRange(ws, totRowDoc, 3, totRowDoc, 20, {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1F4E78' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: totalBorder
      });
      ws.getCell(totRowDoc, 3).alignment = { horizontal: 'center', vertical: 'middle' };

      [8, 9, 10, 11, 12, 13].forEach(c => ws.getCell(totRowDoc, c).numFmt = '#,##0');
      [18, 19, 20].forEach(c => ws.getCell(totRowDoc, c).numFmt = '0.00"%"');

      // GENERAR BUFFER Y DESCARGAR
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `Asistencia_NER_Estrella_de_Belen_${state.currentDateStr}.xlsx`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = downloadUrl;
      downloadAnchor.download = fileName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      window.URL.revokeObjectURL(downloadUrl);

      if (!isAutomatic) {
        showToast(`✓ Archivo Excel generado: ${fileName}`);
      }
    } catch (err) {
      console.error('Error generando archivo Excel:', err);
      if (!isAutomatic) {
        alert('Hubo un error al generar el archivo Excel con formato: ' + err.message);
      }
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
  }

  // EXPOSICIÓN AL ENTORNO GLOBAL
  window.app = {
    init,
    selectSchool,
    recalculateRow,
    handleFieldInput,
    saveCurrentSchoolAttendance,
    toggleAdminAccess,
    toggleAdminEditMatricula,
    downloadDailyExcel,
    saveGoogleCloudUrl,
    toggleCloudInstructions,
    triggerCloudSync,
    toggleManualSystemLock,
    resetSystemLockToAuto
  };

  document.addEventListener('DOMContentLoaded', init);
})();
