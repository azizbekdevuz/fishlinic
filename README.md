# Fishlinic - Smart Aquaculture Management System

A comprehensive IoT-based water quality monitoring system with AI-powered insights, developed as a Sejong University Capstone project.

## Features

- 🌊 **Real-Time Monitoring**: Live telemetry data (pH, temperature, dissolved oxygen)
- 🤖 **AI-Powered Analysis**: Machine learning-based water quality prediction
- 💬 **AI Assistant**: Veronica - conversational AI assistant for aquarium management
- 📊 **Interactive Dashboard**: Charts, gauges, and real-time visualizations
- 🔐 **Multi-Provider Auth**: Email/Password, Google, and Kakao OAuth
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 📤 **Data Export**: CSV/JSON export functionality
- 🎥 **Camera Integration**: Live camera feed support
- 🍽️ **Feeder Control**: Automated feeding system control

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Express.js, Socket.IO
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: FastAPI (Python), Ollama (LLM)
- **Hardware**: Arduino with sensors (pH, temperature, DO)
- **Authentication**: NextAuth.js (Credentials, Google, Kakao)

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Python 3.8+ (for AI service)
- Arduino hardware (optional - mock data available)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/azizbekdevuz/fishlinic.git
cd fishlinic
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies (for AI service)
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fishlinic"

# NextAuth
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# Hardware (optional)
SERIAL_PATH="auto"  # or "COM3" on Windows, "/dev/ttyACM0" on Linux
SERIAL_BAUD=9600

# AI Service
AI_BASE_URL="http://localhost:8000"
OLLAMA_URL="http://localhost:11434"

# WebSocket
NEXT_PUBLIC_WS_URL="http://localhost:4000"
```

### 4. Set Up Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Open Prisma Studio
pnpm db:studio
```

### 5. Run Development Servers

**Option A: Run all services together**
```bash
pnpm dev
```

**Option B: Run services separately**

Terminal 1 - Web App:
```bash
pnpm dev:ui
```

Terminal 2 - Mock Server (Serial Bridge):
```bash
pnpm dev:bridge
```

Terminal 3 - AI Service:
```bash
cd ai-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

### 6. Access the Application

- **Web App**: http://localhost:3000
- **Mock Server API**: http://localhost:4000
- **AI Service API**: http://localhost:8000
- **Prisma Studio**: http://localhost:5555 (if running)

## Project Structure

```
fishlinic/
├── app/                    # Next.js application
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── dashboard/         # Dashboard page
│   ├── vassistant/        # AI assistant page
│   └── ...
├── mock-server/           # Serial bridge server
├── ai-service/            # Python AI service
├── arduino-code/          # Arduino firmware
├── prisma/                # Database schema
└── public/                # Static assets
```

## Available Scripts

### Development
- `pnpm dev` - Run all services (web + bridge)
- `pnpm dev:ui` - Run Next.js web app only
- `pnpm dev:bridge` - Run mock server only

### Database
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

### Production
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm start:prod:all` - Start all production services

## Hardware Setup

### Arduino Connection

1. Upload `arduino-code/Working_Fishlinic_Code/Working_Fishlinic_Code.ino` to your Arduino
2. Connect sensors:
   - pH sensor
   - Temperature sensor
   - Dissolved oxygen sensor
3. Connect Arduino to computer via USB
4. Set `SERIAL_PATH` in `.env` (or use "auto" for auto-detection)

### Mock Data Mode

If no hardware is connected, the system automatically generates mock data for testing.

## Usage

### Dashboard

1. Sign up or sign in at `/auth/signin`
2. Verify your email (if required)
3. Access the dashboard at `/dashboard`
4. View real-time telemetry data, charts, and gauges

### AI Assistant (Veronica)

1. Navigate to `/vassistant`
2. Click "Initiate Assistant"
3. Ask questions about your aquarium
4. Request water quality reports

### Account Management

- Profile: `/profile`
- Settings: `/settings`
- Account: `/account`

## API Endpoints

### Telemetry
- `GET /api/telemetry/latest` - Get latest telemetry data
- `POST /api/telemetry/save` - Save telemetry data
- `GET /api/telemetry/export` - Export telemetry data

### Assistant
- `POST /api/assistant/initiate` - Initialize AI assistant
- `POST /api/assistant/ask` - Ask question to assistant
- `GET /api/assistant/status` - Get assistant status

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verification/generate` - Generate verification token
- `POST /api/auth/verification/complete` - Complete verification

### Feeder Control (Public API)

The feeder API is publicly accessible with rate limiting. All endpoints support CORS and can be called from external services (e.g., Python virtual assistant).

**Base URL**: `https://your-dashboard.vercel.app/api/feeder` (production) or `http://localhost:3000/api/feeder` (development)

**Rate Limits**:
- Maximum 3 requests per 10 seconds
- Maximum 5 requests per 30 minutes
- Maximum 15 requests per 1 minute

**CORS**: All origins allowed by default (configurable via `ALLOWED_ORIGINS` environment variable)

#### 1. Feed Now

Trigger an immediate feed operation.

**Endpoint**: `POST /api/feeder/feed`

**Request Body**:
```json
{
  "duration": 2,  // Number of cycles (1-5)
  "source": "api"  // Optional: source identifier
}
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "action": "feed",
  "cycles": 2,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "hardware": {
    "main": true,
    "secondary": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid duration (must be 1-5)
- `429 Too Many Requests`: Rate limit exceeded
- `503 Service Unavailable`: Feeder hardware not connected

**Example** (Python):
```python
import requests

response = requests.post(
    "https://your-dashboard.vercel.app/api/feeder/feed",
    json={"duration": 2, "source": "python-va"},
    headers={"Content-Type": "application/json"}
)
print(response.json())
```

#### 2. List Schedules

Get all scheduled feeding times.

**Endpoint**: `GET /api/feeder/schedule`

**Response** (200 OK):
```json
{
  "status": "ok",
  "schedules": [
    {
      "id": "uuid-here",
      "name": "Morning Feed",
      "cron": "07:30",
      "duration": 2,
      "next_run": "2025-01-16T07:30:00.000Z"
    }
  ]
}
```

**Example** (Python):
```python
response = requests.get("https://your-dashboard.vercel.app/api/feeder/schedule")
schedules = response.json()["schedules"]
for s in schedules:
    print(f"{s['name']} at {s['cron']}")
```

#### 3. Add Schedule

Create a new scheduled feed.

**Endpoint**: `POST /api/feeder/schedule`

**Request Body**:
```json
{
  "name": "Evening Feed",  // Optional
  "cron": "18:00",         // Time in HH:MM format
  "duration": 3            // Number of cycles (1-5)
}
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "id": "uuid-here",
  "name": "Evening Feed",
  "cron": "18:00",
  "cycles": 3
}
```

**Error Responses**:
- `400 Bad Request`: Invalid cron format or duration
- `429 Too Many Requests`: Rate limit exceeded

**Example** (Python):
```python
response = requests.post(
    "https://your-dashboard.vercel.app/api/feeder/schedule",
    json={
        "name": "Evening Feed",
        "cron": "18:00",
        "duration": 3
    }
)
print(response.json())
```

#### 4. Delete Schedule

Remove a scheduled feed.

**Endpoint**: `DELETE /api/feeder/schedule/{id}`

**Response** (200 OK):
```json
{
  "status": "ok",
  "deleted": "uuid-here"
}
```

**Error Responses**:
- `404 Not Found`: Schedule not found
- `429 Too Many Requests`: Rate limit exceeded

**Example** (Python):
```python
schedule_id = "uuid-here"
response = requests.delete(
    f"https://your-dashboard.vercel.app/api/feeder/schedule/{schedule_id}"
)
print(response.json())
```

#### 5. Get Feeder Status

Get overall feeder system status including hardware connection and schedules.

**Endpoint**: `GET /api/feeder/status`

**Response** (200 OK):
```json
{
  "device": "fish-feeder",
  "hardware": {
    "connected": true,
    "main": true,
    "secondary": true
  },
  "last_feed": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "source": "api",
    "success": true,
    "details": "duration=2s"
  },
  "schedules": [
    {
      "id": "uuid-here",
      "name": "Morning Feed",
      "cron": "07:30",
      "duration": 2,
      "next_run": "2025-01-16T07:30:00.000Z"
    }
  ]
}
```

**Example** (Python):
```python
response = requests.get("https://your-dashboard.vercel.app/api/feeder/status")
status = response.json()
print(f"Hardware connected: {status['hardware']['connected']}")
print(f"Last feed: {status['last_feed']['timestamp']}")
```

#### 6. Get Hardware Status

Get only the hardware connection status.

**Endpoint**: `GET /api/feeder/feed-status`

**Response** (200 OK):
```json
{
  "connected": true,
  "main": true,
  "secondary": true,
  "mockMode": false
}
```

**Example** (Python):
```python
response = requests.get("https://your-dashboard.vercel.app/api/feeder/feed-status")
hw = response.json()
if hw["connected"]:
    print("Feeder hardware is ready")
else:
    print("Feeder hardware not connected")
```

#### Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "error": "Error message here",
  "retryAfter": 60  // For rate limit errors (seconds)
}
```

**HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `429`: Too Many Requests (rate limit exceeded)
- `503`: Service Unavailable (hardware not connected)
- `500`: Internal Server Error

#### Configuration

To customize CORS origins, set the `ALLOWED_ORIGINS` environment variable:

```env
# Allow all origins (default)
ALLOWED_ORIGINS="*"

# Allow specific origins
ALLOWED_ORIGINS="https://example.com,https://another.com,http://localhost:3000"
```

## Troubleshooting

### Serial Port Issues
- Ensure Arduino Serial Monitor is closed
- Check COM port in Device Manager (Windows) or `/dev/` (Linux/Mac)
- Verify baud rate matches (default: 9600)
- Try setting `SERIAL_PATH` explicitly in `.env`

### Database Connection
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Run `pnpm db:push` to sync schema

### AI Service Not Responding
- Check if Python service is running on port 8000
- Verify `AI_BASE_URL` in `.env`
- Check AI service logs for errors

### Socket.IO Connection Issues
- Ensure mock server is running on port 4000
- Verify `NEXT_PUBLIC_WS_URL` in `.env`
- Check CORS settings in mock server

## Contributing

This is a Capstone project, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is developed for educational purposes as part of Sejong University Capstone Design Course.

## Team

- **Developer**: Azizbek Arzikulov
- **Institution**: Sejong University
- **Course**: Capstone Design Course 2025

**Other team members**:
- **Leader**: Tran Dai Viet Hung
- **Hardware Engineer**: Azizjon Kamoliddinov
- **AI Software Development Team**: Nomungerel Mijiddor & Phyo Thiri Khaing

## Links

- [GitHub Repository](https://github.com/azizbekdevuz/fishlinic)
- [Portfolio](https://portfolio-next-silk-two.vercel.app/)
- [LinkedIn](https://www.linkedin.com/in/azizbek-arzikulov)

## Documentation

For detailed architecture and technical documentation, see [architecture.md](./architecture.md).

---

© 2025 Team Fishlinic - Sejong University Capstone Project
