@echo off
chcp 936 >nul
setlocal
cd /d %~dp0

set "APP_PORT=8081"
set "JAR=target\springBootTest-0.0.1-SNAPSHOT.jar"

echo ============================================
echo  BlockCraft 后端启动（端口 %APP_PORT%）
echo ============================================

REM 0) 清理占用端口的旧进程（避免重复启动互相打架）
call :killport %APP_PORT%

REM 1) 准备 JDK（机器重置后路径可能变化，自动查找）
if not defined JAVA_HOME (
  if exist "C:\Program Files\Zulu\zulu-21" set "JAVA_HOME=C:\Program Files\Zulu\zulu-21"
)
if not exist "%JAVA_HOME%\bin\java.exe" (
  for /d %%D in ("C:\Program Files\Zulu\zulu-*") do if exist "%%D\bin\java.exe" set "JAVA_HOME=%%D"
)
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo [错误] 未找到 JDK，请安装 Zulu 21 或手动设置 JAVA_HOME 后重试。
  pause
  exit /b 1
)
echo [环境] JAVA_HOME=%JAVA_HOME%

REM 2) 准备 Maven（优先 PATH 上的 mvn，否则自动找 IDEA 内置）
REM    注意：本项目 mvnw 不可用（缺 .mvn/wrapper 配置，且缓存的 Maven 发行版 lib 不完整），
REM    不要浪费时间折腾 mvnw，直接用 IDEA 内置 Maven 或 PATH 的 mvn。
set "MVN=mvn"
where mvn >nul 2>nul
if not errorlevel 1 goto MVN_OK
for /d %%D in ("D:\IntelliJ IDEA*") do if exist "%%D\plugins\maven\lib\maven3\bin\mvn.cmd" set "MVN=%%D\plugins\maven\lib\maven3\bin\mvn.cmd"
for /d %%D in ("C:\Program Files\JetBrains\IntelliJ IDEA*") do if exist "%%D\plugins\maven\lib\maven3\bin\mvn.cmd" set "MVN=%%D\plugins\maven\lib\maven3\bin\mvn.cmd"
if not exist "%MVN%" (
  echo [错误] 未找到 Maven：PATH 没有 mvn，也没找到 IDEA 内置 Maven。请安装 Maven 或 IDEA。
  pause
  exit /b 1
)
:MVN_OK
echo [环境] MVN=%MVN%

REM 3) 打包（target 每次开机被清空，需要重建；若 jar 已存在则跳过，加快二次启动）
if exist "%JAR%" (
  echo [后端] 发现已有 jar，跳过打包（如要强制重建请先删除 target 目录）。
) else (
  echo [后端] 正在打包：mvn -DskipTests clean package（首次约 1~3 分钟）...
  call "%MVN%" -DskipTests clean package
  if errorlevel 1 (
    echo [错误] 后端打包失败，请查看上面的 Maven 报错。
    pause
    exit /b 1
  )
)

REM 4) 关键：清掉 SERVER__PORT 环境变量！
REM    本机/沙箱预设了 SERVER__PORT=56187（沙箱自己的端口，已被占用），
REM    Spring Boot 会读它覆盖 server.port，导致后端起在随机端口而启动失败。
REM    必须清空它，再用 --server.port 钉死 8081。
set "SERVER__PORT="
set "SERVER_PORT="

REM 5) 启动后端（新开一个窗口，关闭该窗口即停止）
echo [后端] 正在启动，稍后访问 http://localhost:%APP_PORT%/api/auth/ping 自检
start "BlockCraft-Backend" "%JAVA_HOME%\bin\java.exe" -jar %JAR% --server.port=%APP_PORT%

echo [后端] 已在新窗口启动，请等待约 15 秒再访问。
goto :eof

REM ---------- 子过程：按端口杀掉占用进程 ----------
:killport
set "P=%1"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%P%" ^| findstr "LISTENING"') do (
  echo [清理] 端口 %P% 被进程 PID=%%a 占用，正在结束...
  taskkill /PID %%a /F >nul 2>&1
)
goto :eof
