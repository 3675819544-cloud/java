@echo off
chcp 936 >nul
title BlockCraft 前端停止

echo 正在停止 BlockCraft 前端（端口 5173）...

REM 找到监听 5173 的进程并结束（token 5 = PID）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM 顺手关掉启动时的命令行窗口（按标题匹配）
taskkill /FI "WINDOWTITLE eq BlockCraft-Frontend" /F >nul 2>&1

echo 前端已停止。
