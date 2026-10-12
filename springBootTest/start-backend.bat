@echo off
chcp 936 >nul
cd /d %~dp0
title BlockCraft 后端

REM ============================================================
REM  BlockCraft 后端启动脚本（Spring Boot + MyBatis-Plus + MySQL）
REM  位置：放在后端项目根目录，使用相对路径，双击即可运行。
REM  重要：本机每次开机 target 会被清空，脚本会重新编译启动。
REM  如需修改本机工具路径，只改下面这三行即可。
REM ============================================================

REM ---- 可配置：本机工具路径（如不同请修改）----
set "JAVA_HOME=C:\Program Files\Zulu\zulu-21"
set "MAVEN=D:\IntelliJ IDEA 2024.3.2.2\plugins\maven\lib\maven3\bin\mvn.cmd"
set "MYSQL=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set "DB_USER=root"
set "DB_PASS=123456"

echo ============================================
echo  BlockCraft 后端启动（端口 8081）
echo ============================================

REM 1) 确保数据库存在（不存在就执行 sql/blockcraft_init.sql 初始化）
echo [1/2] 检查数据库 blockcraft ...
"%MYSQL%" -u%DB_USER% -p%DB_PASS% -e "USE blockcraft" >nul 2>&1
if errorlevel 1 (
    echo   数据库不存在，正在执行 sql/blockcraft_init.sql 初始化 ...
    "%MYSQL%" -u%DB_USER% -p%DB_PASS% --default-character-set=utf8mb4 < "%~dp0sql\blockcraft_init.sql"
    echo   初始化完成。
) else (
    echo   数据库已存在，跳过初始化。
)

REM 2) 编译并启动（新开窗口运行，target 会被重新构建）
echo [2/2] 正在编译并启动后端（端口 8081）...
start "BlockCraft-Backend" cmd /k "cd /d %~dp0 && ""%MAVEN%"" -DskipTests spring-boot:run"

echo 已在新窗口启动后端，约 20 秒后访问：http://localhost:8081/api/auth/ping
echo 启动完成后用 启动全部.bat / 启动前端.bat 拉起前端。
