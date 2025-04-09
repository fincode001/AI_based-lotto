@echo off
chcp 65001 >nul
setlocal

REM ▶ 현재 경로를 프로젝트 최상단으로 설정
cd /d %~dp0

echo [⚙] AI 로또 프로젝트 실행 준비 중...

REM ▶ 가상환경 확인 (없으면 생성)
if not exist "venv\" (
    echo [📦] 가상환경이 없어 새로 만듭니다...
    python -m venv venv
)

REM ▶ 가상환경 활성화
call venv\Scripts\activate

REM ▶ 필수 라이브러리 설치
echo [📚] 필요한 패키지를 설치합니다...
pip install --upgrade pip >nul
pip install flask flask-cors >nul

REM ▶ 서버 실행 전 recommended.json 존재 확인
if not exist "backend\recommended.json" (
    echo [❗] 추천번호 파일 recommended.json이 없습니다!
    echo [‼] 서버가 실행되지 않을 수 있습니다.
    pause
    exit /b
)

REM ▶ 서버 실행 (비동기)
start "Flask Server" cmd /k "cd backend && ..\venv\Scripts\activate && python lotto_analysis.py"

REM ▶ HTML 자동 실행
timeout /t 2 >nul
start index.html

echo.
echo [✅] 시뮬레이터가 실행 중입니다. 브라우저를 확인하세요!
pause

