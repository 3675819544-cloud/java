@echo off
chcp 936 >nul
setlocal
cd /d %~dp0

echo ============================================
echo  BlockCraft 一键启动（后端 8081 + 前端 5173）
echo ============================================
echo [1/2] 启动后端...
call "%~dp0start-backend.bat"

echo [2/2] 等待后端就绪（约 12 秒）后启动前端...
timeout /t 12 /nobreak >nul

REM 前端在上一层目录的兄弟项目里，用相对路径调用
call "%~dp0..\blockcraft-vue-login9191\start-frontend.bat"

echo.
echo ============================================
echo  全部已启动！
echo  后端：http://localhost:8081  （健康检查 /api/auth/ping）
echo  前端：http://localhost:5173
echo  演示账号：Steve / 123456    Lucy / 123456
echo ============================================
echo  关闭对应的命令行窗口即可停止；或用 stop-all.bat 一键停止。
pause
