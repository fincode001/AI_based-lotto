@echo off
cd /d %~dp0

echo [1] 가상환경 실행
call .\venv\Scripts\activate

echo [2] Flask 서버 실행
start cmd /k "cd backend && python lotto_analysis.py"

echo [3] 프론트 index.html 실행 (브라우저)
timeout /t 2 > nul
start http://127.0.0.1:5500/index.html

echo 준비 완료! 브라우저가 열릴 것입니다.
pause
