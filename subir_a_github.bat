@echo off
chcp 65001 > nul
title Subir a GitHub - Asistencia NER Estrella de Belén
color 0b

echo ================================================================
echo    SUBIENDO PROYECTO A GITHUB: NER ESTRELLA DE BELÉN
echo ================================================================
echo.

set "MINGIT=%LOCALAPPDATA%\Programs\MinGit\cmd"
set "GH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin"
set "PATH=%MINGIT%;%GH%;%PATH%"

echo [1/3] Verificando archivos y repositorio local...
git.exe add .
git.exe commit -m "feat: Actualizacion y preparacion para despliegue en GitHub" > nul 2>&1

echo [2/3] Configurando enlace remoto...
git.exe remote remove origin > nul 2>&1
git.exe remote add origin https://github.com/ruizwilver7/asistencia-ner-estrella-de-belen.git

echo.
echo [3/3] Conectando con GitHub...
echo.

REM Intento de subida directa
git.exe push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo    ¡ÉXITO TOTAL! EL PROYECTO ESTÁ PUBLICADO EN GITHUB
    echo ================================================================
    echo.
    echo Repositorio: https://github.com/ruizwilver7/asistencia-ner-estrella-de-belen
    echo.
    echo Siguiente paso para habilitar el enlace web para los maestros:
    echo 1. Entra a https://github.com/ruizwilver7/asistencia-ner-estrella-de-belen/settings/pages
    echo 2. En "Branch" elige: main y /(root)
    echo 3. Haz clic en "Save" (Guardar)
    echo 4. ¡Listo! En 1 minuto los maestros podrán entrar desde su celular.
    echo.
) else (
    echo.
    echo ================================================================
    echo    SE REQUIERE AUTORIZACIÓN DE GITHUB
    echo ================================================================
    echo.
    echo Si no has iniciado sesión o el repositorio aún no existe:
    echo.
    echo Presiona cualquier tecla para abrir el inicio de sesión oficial de GitHub
    echo en tu navegador y autorizar la subida automática...
    echo.
    pause > nul
    gh.exe auth login --web -h github.com -p https
    gh.exe auth setup-git
    echo.
    echo Reintentando subida a GitHub...
    git.exe push -u origin main
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ¡Éxito! Subido correctamente.
    ) else (
        echo.
        echo Si el repositorio aún no fue creado en la web, puedes crearlo en:
        echo https://github.com/new con el nombre "asistencia-ner-estrella-de-belen" (Público)
        echo y volver a ejecutar este archivo.
    )
)

echo.
pause
