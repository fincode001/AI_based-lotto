@echo off
setlocal enabledelayedexpansion

rem 배치 파일이 위치한 루트 폴더를 기준으로 작업합니다.
set "root_folder=%~dp0"

echo 루트 폴더: %root_folder%
echo 빈 하위 폴더 (숨김 파일/폴더 제외)를 검색하여 삭제합니다...

rem /s 옵션으로 모든 하위 폴더를 검색하고, /b 옵션으로 경로만 출력합니다.
rem /ad 옵션은 디렉토리만 대상으로 합니다.
rem sort /r 은 깊은 경로의 폴더부터 처리하도록 역순으로 정렬합니다.
for /f "delims=" %%d in ('dir /ad /b /s "%root_folder%" ^| sort /r') do (
    rem rd 명령어는 비어있는 폴더만 삭제합니다. 숨김 파일이 있어도 비어있지 않은 것으로 간주합니다.
    rd "%%d" 2>nul
    if not errorlevel 1 (
        echo 삭제됨: "%%d"
    ) else (
        rem 삭제되지 않은 경우 (비어있지 않거나 오류 발생) 메시지를 표시하지 않습니다.
        rem 필요한 경우 아래 주석을 해제하여 로그를 남길 수 있습니다.
        rem echo 유지됨: "%%d"
    )
)

echo 작업 완료.
pause 