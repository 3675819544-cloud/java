@echo off
chcp 936 >nul
cd /d %~dp0
title BlockCraft 前端

REM ============================================================
REM  BlockCraft 前端启动脚本（Vue3 + Vite）
REM  位置：放在前端项目根目录，使用相对路径，双击即可运行。
REM  重要：本机每次开机 node_modules 会被清空，脚本会先 npm install。
REM  请先启动后端（8081）再启动前端（5173）。
REM ============================================================

echo ============================================
echo  BlockCraft 前端启动（端口 5173）
echo ============================================

REM 1) 重新安装依赖（node_modules 每次开机被清空，这里重建）
echo [1/2] 安装依赖（npm install）...
call npm install
if errorlevel 1 (
    echo npm install 失败，请检查网络或 npm 缓存后重试。
    pause
    exit /b 1
)

REM 2) 启动 Vite 开发服务器（新开窗口）
echo [2/2] 启动 Vite 开发服务器（端口 5173）...
start "BlockCraft-Frontend" cmd /k "npm run dev"

echo 已在新窗口启动前端，访问：http://localhost:5173
echo 提示：前端 /api 已代理到 http://localhost:8081
