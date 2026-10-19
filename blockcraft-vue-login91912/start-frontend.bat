@echo off
chcp 936 >nul
setlocal
cd /d %~dp0

set "APP_PORT=5173"

echo ============================================
echo  BlockCraft 前端启动（端口 %APP_PORT%）
echo ============================================

REM 0) 清理占用 5173 的旧进程（重启或残留时会打架，否则 Vite 会漂到 5174）
call :killport %APP_PORT%

REM 1) 检查 node / npm
where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未找到 node，请安装 Node.js 并加入 PATH 后重试。
  pause
  exit /b 1
)

REM 2) 安装依赖（node_modules 每次开机被清空，必须重建）
if exist "node_modules" (
  echo [前端] 发现 node_modules，跳过 npm install。
) else (
  echo [前端] 正在 npm install（首次需联网，约 1~2 分钟）...
  call npm install
  if errorlevel 1 (
    echo [错误] npm install 失败，请检查网络或 npm 缓存。
    pause
    exit /b 1
  )
)

REM 3) 启动 Vite（新开窗口；--no-open 避免无界面环境强行开浏览器报错）
echo [前端] 正在启动 Vite，访问 http://localhost:%APP_PORT%
start "BlockCraft-Frontend" cmd /k "npm run dev -- --no-open --host"

echo [前端] 已在新窗口启动。
goto :eof

:killport
set "P=%1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%P%" ^| findstr "LISTENING"') do (
  echo [清理] 端口 %P% 被进程 PID=%%a 占用，正在结束...
  taskkill /PID %%a /F >nul 2>&1
)
goto :eof
