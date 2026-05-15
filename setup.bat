@echo off
REM MeetLoom - Development Setup Script (Windows)

echo.
echo 🎯 MeetLoom - Development Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found
echo.

REM Create .env files if they don't exist
echo 📝 Checking environment files...

if not exist "server\.env" (
    echo    Creating server\.env...
    copy server\.env.example server\.env >nul
    echo    ⚠️  Please edit server\.env and add your GROK_API_KEY
) else (
    echo    ✅ server\.env already exists
)

if not exist "client\.env" (
    echo    Creating client\.env...
    copy client\.env.example client\.env >nul
    echo    ✅ client\.env created
) else (
    echo    ✅ client\.env already exists
)

echo.
echo 📦 Installing dependencies...
echo.

REM Install root dependencies
if exist "package.json" (
    echo    Installing root dependencies...
    call npm install --silent
)

REM Install server dependencies
echo    Installing server dependencies...
cd server
call npm install --silent
cd ..

REM Install client dependencies
echo    Installing client dependencies...
cd client
call npm install --silent
cd ..

echo.
echo ✅ Setup complete!
echo.
echo 📖 Next steps:
echo.
echo 1. Edit server\.env and add your GROK_API_KEY
echo    Get one at: https://console.x.ai/
echo.
echo 2. Start the development servers:
echo    npm run dev
echo.
echo 3. Open http://localhost:5173 in your browser
echo.
echo For more details, see QUICKSTART.md
echo.
pause
