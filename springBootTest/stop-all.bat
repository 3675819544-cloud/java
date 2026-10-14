@echo off
chcp 936 >nul
echo 正在停止 BlockCraft（后端 8081 + 前端 5173）...
call :killport 8081
call :killport 5173
taskkill /FI "WINDOWTITLE eq BlockCraft-Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq BlockCraft-Frontend" /F >nul 2>&1
echo 已全部停止。
pause
goto :eof

:killport
set "P=%1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%P%" ^| findstr "LISTENING"') do (
  echo [清理] 端口 %P% 被进程 PID=%%a 占用，正在结束...
  taskkill /PID %%a /F >nul 2>&1
)
goto :eof
