@echo off
chcp 936 >nul
title BlockCraft 后端停止

echo 正在停止 BlockCraft 后端（端口 8081）...

REM 找到监听 8081 的进程并结束（token 5 = PID）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM 顺手关掉启动时的命令行窗口（按标题匹配）
taskkill /FI "WINDOWTITLE eq BlockCraft-Backend" /F >nul 2>&1

echo 后端已停止。
