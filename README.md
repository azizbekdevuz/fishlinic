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

## Links

- [GitHub Repository](https://github.com/azizbekdevuz/fishlinic)
- [Portfolio](https://portfolio-next-silk-two.vercel.app/)
- [LinkedIn](https://www.linkedin.com/in/azizbek-arzikulov)

## Documentation

For detailed architecture and technical documentation, see [architecture.md](./architecture.md).

---

© 2025 Team Fishlinic - Sejong University Capstone Project
