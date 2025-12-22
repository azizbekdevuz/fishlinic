# Getting Started with Fishlinic

> **A complete step-by-step guide for first-time developers**

This guide will walk you through setting up the Fishlinic project from scratch, even if you've never used these technologies before.

---

## Prerequisites Checklist

Before starting, make sure you have these installed on your computer:

| Software | Version | Download Link | How to Check |
|----------|---------|---------------|--------------|
| Node.js | 18 or higher | https://nodejs.org | `node --version` |
| pnpm | 8 or higher | See below | `pnpm --version` |
| Git | Any recent | https://git-scm.com | `git --version` |
| PostgreSQL | 14 or higher | https://www.postgresql.org | `psql --version` |
| Python | 3.8 or higher | https://www.python.org | `python --version` |
| VS Code | Latest | https://code.visualstudio.com | (optional but recommended) |

### Installing pnpm

After installing Node.js, install pnpm:

```bash
npm install -g pnpm
```

### Installing PostgreSQL

**Windows:**
1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer, remember the password you set for 'postgres' user
3. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## Step 1: Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
# Navigate to where you want the project
cd ~/Projects  # or wherever you keep projects

# Clone the repository
git clone https://github.com/azizbekdevuz/fishlinic.git

# Enter the project directory
cd fishlinic
```

**Verify:** You should see folders like `app/`, `mock-server/`, `prisma/`, etc.

---

## Step 2: Install Node.js Dependencies

```bash
pnpm install
```

This will take a few minutes to download all packages.

**Expected output:** You should see progress bars and then a success message with no errors.

**If you see errors:**
- Try deleting `node_modules/` and `pnpm-lock.yaml`, then run again
- Make sure you're using Node.js 18 or higher

---

## Step 3: Set Up the Database

### 3.1 Create a Database

**Option A: Using pgAdmin (GUI)**
1. Open pgAdmin (installed with PostgreSQL)
2. Right-click on "Databases" → "Create" → "Database"
3. Name it `fishlinic`
4. Click "Save"

**Option B: Using Command Line**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE fishlinic;

# Exit
\q
```

### 3.2 Get Your Connection String

Your connection string format is:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

For local development with default settings:
```
postgresql://postgres:yourpassword@localhost:5432/fishlinic
```

Replace `yourpassword` with the password you set during PostgreSQL installation.

---

## Step 4: Configure Environment Variables

### 4.1 Create the .env File

Copy the example file:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell) / Mac / Linux
cp .env.example .env
```

### 4.2 Edit the .env File

Open `.env` in your code editor and fill in the values:

```env
# ===========================================
# DATABASE - Required
# ===========================================
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/fishlinic"

# ===========================================
# AUTHENTICATION - Required
# ===========================================
# Generate a random string (32+ characters)
# You can use: openssl rand -base64 32
AUTH_SECRET="paste-a-random-32-character-string-here"
NEXTAUTH_URL="http://localhost:3000"

# ===========================================
# OAUTH PROVIDERS - Optional (for social login)
# ===========================================
# Get these from Google Cloud Console
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Get these from Kakao Developers
# https://developers.kakao.com/console/app
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""

# ===========================================
# HARDWARE - Optional
# ===========================================
# Set to "auto" for automatic detection
# Or specify like "COM3" (Windows) or "/dev/ttyACM0" (Linux/Mac)
SERIAL_PATH="auto"
SERIAL_BAUD=9600

# ===========================================
# AI SERVICE - Optional
# ===========================================
AI_BASE_URL="http://localhost:8000"
OLLAMA_URL="http://localhost:11434"

# ===========================================
# WEBSOCKET - Required
# ===========================================
NEXT_PUBLIC_WS_URL="http://localhost:4000"
```

### 4.3 Generate AUTH_SECRET

**Option A: Online Generator**
Go to https://generate-secret.vercel.app/32 and copy the result.

**Option B: Command Line (Mac/Linux)**
```bash
openssl rand -base64 32
```

**Option C: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 5: Initialize the Database

Generate the Prisma client and create database tables:

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (creates tables)
pnpm db:push
```

**Expected output:**
```
Your database is now in sync with your Prisma schema.
```

**Verify:** You can open Prisma Studio to see your tables:
```bash
pnpm db:studio
```
This opens a browser window showing your database structure.

---

## Step 6: Run the Development Server

### Option A: Run All Services Together (Recommended)

```bash
pnpm dev
```

This starts:
- Next.js web app on http://localhost:3000
- Mock server on http://localhost:4000

### Option B: Run Services Separately

**Terminal 1 - Web App:**
```bash
pnpm dev:ui
```

**Terminal 2 - Mock Server:**
```bash
pnpm dev:bridge
```

**Terminal 3 - AI Service (Optional):**
```bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

---

## Step 7: Access the Application

1. Open your browser
2. Go to http://localhost:3000
3. You should see the Fishlinic landing page!

### First-Time User Flow:

1. Click "Get Started" or "Sign Up"
2. Create an account with email/password
3. (Skip email verification for now - it works without real email setup)
4. Access the dashboard at http://localhost:3000/dashboard

---

## Step 8: Verify Everything Works

### Checklist:

| Feature | How to Test | Expected Result |
|---------|-------------|-----------------|
| Dashboard loads | Go to /dashboard | Charts and gauges appear |
| Real-time updates | Watch the charts | Data updates every 2-3 seconds |
| Connection status | Check top-right | Shows "Connected" (green) |
| Mock data | Look at readings | pH ~7, Temp ~25°C, DO ~6.5 |
| Feeder panel | Click "Feed Now" | Shows feeding animation |
| AI Assistant | Go to /vassistant | Chat interface loads |

**If real-time updates aren't working:**
1. Check the mock server is running (port 4000)
2. Check browser console (F12) for WebSocket errors
3. Verify `NEXT_PUBLIC_WS_URL` in `.env`

---

## Optional: Set Up OAuth Providers

### Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy Client ID and Client Secret to `.env`

### Kakao OAuth

1. Go to https://developers.kakao.com/
2. Create an application
3. Go to "Product Settings" → "Kakao Login"
4. Enable Kakao Login
5. Add redirect URI:
   ```
   http://localhost:3000/api/auth/callback/kakao
   ```
6. Copy REST API Key (Client ID) and Client Secret to `.env`

---

## Optional: Set Up AI Assistant (Ollama)

For the AI assistant (Veronica) to work:

### Install Ollama

**Windows:**
Download from https://ollama.ai and run installer

**Mac:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Start Ollama and Download Model

```bash
# Start Ollama server
ollama serve

# In another terminal, download the model
ollama pull qwen2.5:3b
```

### Verify

1. Check Ollama is running: http://localhost:11434
2. Go to /vassistant in your app
3. Click "Initiate Assistant"
4. Try asking: "What is a good pH level for freshwater fish?"

---

## Optional: Set Up Arduino Hardware

If you have the physical hardware:

### Required Components

- Arduino Uno or compatible board
- pH sensor module
- Temperature sensor (DS18B20 or similar)
- Dissolved oxygen sensor
- Servo motor (for feeder)
- USB cable

### Upload Arduino Code

1. Open Arduino IDE
2. Open `arduino-code/Working_Fishlinic_Code/Working_Fishlinic_Code.ino`
3. Select your board and port
4. Click Upload

### Configure Serial Path

Find your Arduino port:

**Windows:**
1. Open Device Manager
2. Look under "Ports (COM & LPT)"
3. Note the COM number (e.g., COM3)
4. Set in `.env`: `SERIAL_PATH="COM3"`

**Mac:**
```bash
ls /dev/cu.usb*
# Set in .env: SERIAL_PATH="/dev/cu.usbmodem14201"
```

**Linux:**
```bash
ls /dev/ttyACM*
# Set in .env: SERIAL_PATH="/dev/ttyACM0"
```

### Restart Mock Server

```bash
pnpm dev:bridge
```

You should see: "Serial port connected: COM3 (or your port)"

---

## Project Structure Quick Reference

```
fishlinic/
├── app/                    # Main Next.js application
│   ├── api/               # Backend API routes
│   ├── components/        # React UI components
│   ├── dashboard/         # Dashboard page
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and helpers
├── mock-server/           # Arduino bridge server
├── ai-service/            # Python AI service
├── arduino-code/          # Arduino firmware
├── prisma/                # Database schema
├── public/                # Static files
├── .env                   # Environment variables (secrets!)
└── package.json           # Dependencies and scripts
```

---

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm dev:ui` | Start only Next.js web app |
| `pnpm dev:bridge` | Start only mock server |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open database GUI |
| `pnpm build` | Build for production |
| `pnpm lint` | Check code for errors |

---

## Troubleshooting Common Issues

### "ECONNREFUSED" - Database Connection Failed

**Problem:** Can't connect to PostgreSQL

**Solutions:**
1. Make sure PostgreSQL is running:
   - Windows: Check Services app
   - Mac: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`
2. Verify DATABASE_URL in `.env` is correct
3. Check the password is correct (no special characters that need escaping)

### "Module not found" Errors

**Problem:** Missing packages

**Solution:**
```bash
pnpm install
```

### "Prisma client not generated"

**Problem:** Database queries fail

**Solution:**
```bash
pnpm db:generate
```

### Page Shows "Loading..." Forever

**Problem:** Frontend can't connect to backend

**Solutions:**
1. Check all services are running
2. Look at browser console (F12) for errors
3. Try refreshing the page
4. Restart the development server

### OAuth Callback Error

**Problem:** Google/Kakao login fails with redirect error

**Solutions:**
1. Check redirect URIs in provider console match exactly
2. Verify client ID and secret in `.env`
3. Make sure NEXTAUTH_URL matches your URL

### WebSocket Connection Failed

**Problem:** Real-time updates not working

**Solutions:**
1. Check mock server is running on port 4000
2. Verify NEXT_PUBLIC_WS_URL in `.env`
3. Check browser console for WebSocket errors
4. Try a different browser

---

## Getting Help

### If You're Stuck

1. **Check the error message** - Usually tells you what's wrong
2. **Search the error** - Google or Stack Overflow
3. **Check GitHub Issues** - https://github.com/azizbekdevuz/fishlinic/issues
4. **Ask your TA or professor** - Don't struggle alone!

### Useful Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Prisma Docs:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Next Steps

Once everything is running:

1. **Explore the dashboard** - Click around and see all features
2. **Read STUDENT_GUIDE.md** - Understand the codebase
3. **Watch the video** - If available, watch the project walkthrough
4. **Try making changes** - Start with small modifications
5. **Read the architecture** - See `architecture.md` for deep technical details

---

## Quick Verification Checklist

Before starting development, verify everything works:

- [ ] `pnpm dev` starts without errors
- [ ] http://localhost:3000 shows the landing page
- [ ] Can sign up with email/password
- [ ] Dashboard shows real-time data
- [ ] Charts update every few seconds
- [ ] "Connected" status shows (green indicator)
- [ ] Feeder panel is visible
- [ ] Can click "Feed Now" without errors
- [ ] `/vassistant` page loads

If all boxes are checked, you're ready to start developing!

---

*Happy coding! Remember: everyone struggles at first, but you'll get it!*

---

*Created for Fishlinic Capstone Project - Sejong University 2025*
