@ECHO OFF

REM
REM Setup the script to run from the application without making a copy
REM of the script
REM

SETLOCAL EnableDelayedExpansion

IF "%UXPS_COMMANDS_DIR%" == "" (
    SET UXPS_COMMANDS_DIR=%~dp0
)

PUSHD "%UXPS_COMMANDS_DIR%.."
SET PROJECT_ROOT_DIR=%cd%\
POPD

CALL setTarget.bat

PUSHD "%PROJECT_ROOT_DIR%"

IF NOT EXIST "%TARGET_APP_SCRIPT_DIR%" (

    ECHO.
    ECHO Cannot find %TARGET_APP_SCRIPT_DIR%
    ECHO.
    ECHO Make sure you have launched Adobe %TARGET_APP% %TARGET_CC_VERSION% on this computer at least once.
    ECHO.

) ELSE (

    ECHO.
    ECHO Removing directory "%TARGET_SCRIPT_ROOT_DIR%"
    ECHO.

    RD /s /q "%TARGET_SCRIPT_ROOT_DIR%" >NUL 2>&1

    ECHO.
    ECHO Recreating directory "%TARGET_SCRIPT_ROOT_DIR%"
    ECHO.

    MKDIR "%TARGET_SCRIPT_ROOT_DIR%"

    ECHO.
    ECHO Creating temporary symbolic links to the script and its 'helpers' directory inside directory "%TARGET_SCRIPT_ROOT_DIR%"
    ECHO.

    MKLINK /H "%TARGET_SCRIPT_ROOT_DIR%%DESPACED_TARGET_NAME%.js" "%PROJECT_ROOT_DIR%%DESPACED_TARGET_NAME%.js"
    MKLINK /H "%TARGET_SCRIPT_ROOT_DIR%run_as_UXPScript.%TARGET_FILENAME_EXTENSION%" "%PROJECT_ROOT_DIR%run_as_UXPScript.%TARGET_FILENAME_EXTENSION%"
    MKLINK /H "%TARGET_SCRIPT_ROOT_DIR%run_as_ExtendScript.jsx" "%PROJECT_ROOT_DIR%run_as_ExtendScript.jsx"
    MKLINK /J "%TARGET_SCRIPT_ROOT_DIR%%DESPACED_TARGET_NAME%_helpers" "%PROJECT_ROOT_DIR%%DESPACED_TARGET_NAME%_helpers"

    ECHO.
    ECHO Debug install done.
    ECHO.

)

POPD

ECHO.
SET /P REPLY=Press [Enter] to finalize 
