@echo off
chcp 936 >nul
title BlockCraft 一键停止

REM ============================================================
REM  BlockCraft 一键停止（后端 + 前端）
REM  位置：放在后端项目根目录。前端路径是绝对路径（跨盘符），
REM        如果前端位置变了，改下面这一行即可。
REM ============================================================

set "FRONTEND_STOP=C:\Users\Administrator\Desktop\java-main\blockcraft-vue-login9191\stop-frontend.bat"

echo ============================================
echo  BlockCraft 一键停止
echo ============================================
echo 停止后端（端口 8081）...
call "%~dp0stop-backend.bat"

echo 停止前端（端口 5173）...
call "%FRONTEND_STOP%"

echo 已全部停止。
pause
