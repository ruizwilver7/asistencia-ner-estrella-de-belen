# 🏫 Sistema de Asistencia Escolar - NER Estrella de Belén

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)

Aplicación web interactiva desarrollada para la gestión y consolidación diaria de asistencia escolar de los 6 centros educativos pertenecientes al **Núcleo Educativo Rural (NER) Estrella de Belén**, adaptada al formato oficial de reporte en Excel.

---

## 🌐 Publicación en GitHub Pages (Acceso en Línea para Docentes)

Este proyecto es **100% estático (Frontend)** y no requiere bases de datos externas ni servidores complejos. Para que todos los docentes puedan acceder desde sus celulares, tablets o computadoras a través de un enlace web gratuito de GitHub, sigue estos pasos:

### Paso 1: Subir este proyecto a un repositorio en GitHub
1. Inicia sesión en [GitHub.com](https://github.com) y crea un nuevo repositorio (por ejemplo, `asistencia-ner-estrella-de-belen`).
2. Sube los archivos de este proyecto al repositorio.

### Paso 2: Activar GitHub Pages
1. En tu repositorio de GitHub, haz clic en la pestaña **Settings** (Configuración) en la parte superior.
2. En la columna lateral izquierda, haz clic en **Pages**.
3. En la sección **Build and deployment**:
   - **Source**: Selecciona `Deploy from a branch`.
   - **Branch**: Selecciona `main` (o `master`) y la carpeta `/ (root)`.
4. Haz clic en **Save** (Guardar).
5. En 1 a 2 minutos, GitHub te entregará el enlace web oficial en vivo (por ejemplo: `https://tu-usuario.github.io/asistencia-ner-estrella-de-belen/`). ¡Comparte ese enlace con los docentes!

---

## 🏫 Centros Educativos Atendidos

| Nº | Código de Centro | Nombre del Centro Educativo | Modalidades y Turnos |
|---|---|---|---|
| **1** | **17692** | Centro Escolar Estrella de Belén | Preescolar Formal Matutino, Primaria Regular Matutino (1º y 2º), Primaria Regular Vespertino (3º a 6º), Secundaria Diurna Matutino (7º a 11º) |
| **2** | **22988** | Alfonso Cortés | Preescolar Comunitario Multinivel, Primaria Multigrado Matutino |
| **3** | **23066** | La Concepción | Preescolar Comunitario Multinivel, Primaria Multigrado Matutino |
| **4** | **25448** | Juan Pablo II | Preescolar Comunitario Multinivel, Primaria Multigrado Matutino |
| **5** | **26353** | Centro Escolar Ernesto Cardenal | Preescolar Comunitario Multinivel, Primaria Multigrado Matutino |
| **6** | **67239** | Centro Escolar Otto de la Rocha | Preescolar Comunitario Multinivel, Primaria Multigrado Matutino |

---

## ⚙️ Reglas y Funcionalidades Principales

### 1. Vista Exclusiva para Docentes
- **Acceso directo y sencillo**: Los docentes eligen la tarjeta de su centro educativo y registran la asistencia de sus estudiantes en una tabla compacta adaptada a celulares y pantallas pequeñas.
- **Validación Estricta**: No permite guardar si la asistencia de estudiantes supera la matrícula actual de esa modalidad (las casillas se alertan en rojo y muestran el detalle de la inconsistencia).

### 2. Gestión de Ausencias Docentes y Resta Automática
- Los docentes pueden registrar las inasistencias (**Docentes Justificados** y **Docentes Injustificados**).
- **Resta Automática de Asistencia Docente**: El sistema resta automáticamente las inasistencias de la plantilla del centro (`Docentes Asistieron = Plantilla - (Justificados + Injustificados)`).
- **Regla de Asistencia Docente en 0**: Si la asistencia docente de una modalidad llega a 0 (por ausencia total de maestros o plantilla en 0), la **Matrícula Actual y la Asistencia de Estudiantes se colocan automáticamente en 0** y sus casillas se bloquean para garantizar la coherencia de la información.

### 3. Cierre Diario a las 2:30 PM y Descarga Automática de Excel
- **Horario Límite**: A partir de las 2:30 PM (14:30 hrs), el registro se cierra para docentes mostrando únicamente el aviso:
  > **SISTEMA CERRADO POR EL DÍA DE HOY (Horario límite: 2:30 PM)**
- **Descarga Automática de Excel**: Al cumplirse las 2:30 PM, el sistema genera y descarga automáticamente el archivo Excel oficial (`Asistencia_NER_Estrella_de_Belen_YYYY-MM-DD.xlsx`).

### 4. Reinicio a Medianoche (00:00 Horas)
- A las 00:00 hrs, el sistema se habilita para el nuevo día y **restablece automáticamente la Matrícula Actual** a la matrícula oficial guardada por Dirección. Si un docente hizo modificaciones de matrícula durante el día, estas no alteran la base oficial.

### 5. Acceso Dirección (Consolidado General y Matrícula Permanente)
- **PIN de Seguridad**: `1234`.
- **Consolidado General**: Muestra el consolidado de las 6 escuelas en tiempo real con porcentajes de asistencia y totales del NER.
- **Edición Permanente**: La Dirección puede modificar las matrículas base oficiales y la cantidad de docentes de cualquier escuela. Al guardar en Dirección, estos valores quedan guardados permanentemente.

---

## 📊 Formato Oficial del Excel Generado

El archivo descargado contiene un diseño estructurado con los colores y tablas requeridas:
1. **Cuadro 1: ASISTENCIA DIARIA ESTUDIANTES**:
   - Cabecera con Núcleo, Fecha, Código Único, Centro, Modalidad, Turno.
   - Columnas de **Matrícula** (M, F, Total).
   - Columnas de **Asistencia** (M, F, Total).
   - Columnas de **Porcentaje** (M, F, Total).
   - Fila de **TOTAL NER**.
2. **Cuadro 2: ASISTENCIA DIARIA DOCENTES**:
   - Cantidad de Docentes (Plantilla oficial).
   - Docentes Asistieron (con ausencias descontadas).
   - Docentes Justificados e Injustificados.
   - Porcentajes y Fila de **TOTAL NER**.

---

## 💻 Ejecución Local (Offline sin Internet)

1. Haz doble clic en el archivo [`iniciar.bat`](file:///C:/Users/ruizw/.gemini/antigravity/scratch/asistencia-escolar/iniciar.bat).
2. Se abrirá automáticamente tu navegador en `http://localhost:3000`.
3. También puedes abrir directamente el archivo `index.html` en cualquier navegador web.
