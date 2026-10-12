@echo off
chcp 936 >nul
title BlockCraft 一键启动

REM ============================================================
REM  BlockCraft 一键启动（后端 + 前端）
REM  位置：放在后端项目根目录，双击即可先后拉起前后端。
REM  说明：后端 / 前端各自的启动逻辑在各自的 start-*.bat 里，
REM        这里只是按顺序调用它们。前端路径是绝对路径（跨盘符），
REM        如果前端位置变了，改下面这一行即可。
REM ============================================================

set "FRONTEND_START=C:\Users\Administrator\Desktop\java-main\blockcraft-vue-login9191\start-frontend.bat"

echo ============================================
echo  BlockCraft 一键启动
echo ============================================
echo [1/2] 启动后端（端口 8081）...
call "%~dp0start-backend.bat"

echo [2/2] 启动前端（端口 5173）...
call "%FRONTEND_START%"

echo.
echo 全部已启动：
echo   后端接口： http://localhost:8081/api/auth/ping
echo   前端页面： http://localhost:5173
echo 停止请用“停止全部.bat”。
pause
