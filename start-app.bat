@echo off
echo 🚀 Starting Gamified Task Tracker Application
echo.

echo 📍 Current directory: %cd%
echo.

echo 🔧 Checking if backend is running...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is already running at http://localhost:3001
) else (
    echo 🟡 Backend not running. Starting backend...
    start "Backend Server" cmd /k "npm start"
    echo ⏳ Waiting for backend to start...
    timeout /t 5 /nobreak >nul
)

echo.
echo 🎯 Backend Status Check:
curl -s http://localhost:3001/health
echo.

echo 📱 Starting Frontend...
echo 🌐 Frontend will be available at: http://localhost:3000
echo 🔗 Backend API is available at: http://localhost:3001

cd frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo 🎉 Application Started!
echo.
echo 📋 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo    API Test: http://localhost:3001/health
echo.
echo 🔄 Both servers will open in separate command windows
echo 💡 Press any key to continue...
pause >nul
