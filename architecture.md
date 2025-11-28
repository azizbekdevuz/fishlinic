# Fishlinic - Smart Aquaculture Management System Architecture

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Data Flow](#data-flow)
7. [Authentication & Authorization](#authentication--authorization)
8. [Real-Time Communication](#real-time-communication)
9. [AI Integration](#ai-integration)
10. [Database Schema](#database-schema)
11. [Deployment Architecture](#deployment-architecture)

---

## Overview

Fishlinic is a smart aquaculture monitoring system developed as a Sejong University Capstone project. The system provides real-time water quality monitoring, AI-powered analysis, and intelligent insights for aquarium management.

### Key Features
- **Real-Time Monitoring**: Live telemetry data (pH, temperature, dissolved oxygen)
- **AI-Powered Analysis**: Machine learning-based water quality prediction
- **User Management**: Multi-provider authentication (Email/Password, Google, Kakao)
- **AI Assistant**: Veronica - conversational AI assistant for aquarium management
- **Dashboard**: Comprehensive visualization with charts, gauges, and alerts
- **Hardware Integration**: Arduino-based sensor data collection via serial communication
- **Data Export**: CSV/JSON export functionality
- **Camera Integration**: Live camera feed support
- **Feeder Control**: Automated feeding system control

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │  Socket.IO   │  │   Ollama      │     │
│  │   Web App    │◄─┤   Client     │  │   (AI LLM)    │     │
│  │  (Port 3000) │  └──────────────┘  └──────────────┘     │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                          │                    │
                          │                    │
        ┌─────────────────┘                    └─────────────────┐
        │                                                    │
        ▼                                                    ▼
┌──────────────────────────────────┐        ┌──────────────────────────────┐
│      Next.js Web Application     │        │    Mock Server / Bridge      │
│      (Port 3000)                 │        │    (Port 4000)              │
│                                   │        │                              │
│  ┌────────────────────────────┐  │        │  ┌────────────────────────┐ │
│  │   App Router (Next.js 15)  │  │        │  │   Express Server       │ │
│  │   - Server Components      │  │        │  │   - Serial Port        │ │
│  │   - API Routes             │  │        │  │   - Socket.IO Server   │ │
│  │   - Server Actions         │  │        │  │   - Data Normalization  │ │
│  └────────────────────────────┘  │        │  └────────────────────────┘ │
│                                   │        │                              │
│  ┌────────────────────────────┐  │        └──────────────────────────────┘
│  │   NextAuth.js              │  │                    │
│  │   - Session Management     │  │                    │
│  │   - JWT Strategy         │  │                    ▼
│  └────────────────────────────┘  │        ┌──────────────────────────────┐
│                                   │        │   Arduino Hardware           │
│  ┌────────────────────────────┐  │        │   - pH Sensor               │
│  │   Prisma Client            │  │        │   - Temperature Sensor       │
│  │   - Database ORM           │  │        │   - DO Sensor                │
│  └────────────────────────────┘  │        └──────────────────────────────┘
└───────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │   PostgreSQL Database     │
        │   - User data             │
        │   - Telemetry records     │
        │   - Verification tokens    │
        └───────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│   AI Service │      │  File Storage     │
│   (Port 8000)│      │  (JSONL files)   │
│   FastAPI    │      │  Daily archives  │
└──────────────┘      └──────────────────┘
```

### Component Interaction Flow

```
Arduino → Serial Port → Mock Server → [Normalize] → [AI Enrichment] → Socket.IO → Web App
                                                          │
                                                          ▼
                                                    PostgreSQL DB
                                                          │
                                                          ▼
                                                    File Storage (JSONL)
```

---

## Technology Stack

### Frontend
- **Next.js 15.5.3**: React framework with App Router
- **React 19.1.0**: UI library
- **TypeScript 5.x**: Type safety
- **Tailwind CSS 4.x**: Utility-first CSS framework
- **ECharts**: Data visualization library
- **Socket.IO Client**: Real-time communication
- **NextAuth.js 4.24.13**: Authentication framework
- **Lucide React**: Icon library

### Backend
- **Next.js API Routes**: RESTful API endpoints
- **Express.js 5.1.0**: Mock server framework
- **Socket.IO 4.8.1**: WebSocket server
- **Prisma 6.19.0**: ORM for database access
- **PostgreSQL**: Primary database
- **SerialPort**: Arduino communication

### AI/ML
- **FastAPI**: Python AI service framework
- **Ollama**: Local LLM for AI assistant
- **Heuristic/ML Models**: Water quality prediction

### Authentication Providers
- **Credentials**: Email/password authentication
- **Google OAuth**: Social login
- **Kakao OAuth**: Korean social login

### Infrastructure & Tools
- **pnpm**: Package manager
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Arduino**: Hardware platform

---

## Project Structure

```
fishlinic/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── assistant/          # AI assistant endpoints
│   │   ├── auth/                # Authentication endpoints
│   │   ├── telemetry/           # Telemetry data endpoints
│   │   ├── user/                # User management endpoints
│   │   └── ...
│   ├── components/              # React components
│   │   ├── account/             # Account management
│   │   ├── settings/            # Settings components
│   │   └── ...
│   ├── dashboard/               # Dashboard page
│   ├── vassistant/              # AI assistant page
│   ├── hooks/                   # React hooks
│   ├── lib/                     # Business logic & utilities
│   │   ├── auth.ts              # Auth utilities
│   │   ├── prisma.ts            # Database client
│   │   ├── types.ts             # TypeScript types
│   │   └── ...
│   └── ...
├── mock-server/                 # Serial bridge server
│   ├── src/                     # TypeScript source
│   │   ├── serial.ts            # Serial port handling
│   │   ├── storage.ts           # File storage
│   │   ├── normalize.ts         # Data normalization
│   │   └── ...
│   └── index.ts                 # Entry point
├── ai-service/                  # Python AI service
│   ├── main.py                  # FastAPI application
│   ├── predictor.py             # ML prediction logic
│   └── colab_model.py           # ML model implementation
├── arduino-code/                # Arduino firmware
├── prisma/                      # Database schema
│   └── schema.prisma            # Prisma schema
└── public/                      # Static assets
```

---

## Core Components

### 1. Authentication System

**Architecture**: NextAuth.js with JWT strategy

**Flow**:
1. User initiates login via provider (Credentials/Google/Kakao)
2. NextAuth handles OAuth flow or validates credentials
3. User data fetched/created in PostgreSQL
4. JWT token generated with user info and verification status
5. Session stored in HTTP-only cookie
6. Middleware validates session on protected routes

**Features**:
- Multi-provider authentication
- Email verification system
- Account linking (same email across providers)
- Session management with 30-day expiration
- Protected route middleware

### 2. Telemetry Data Pipeline

**Flow**:
1. **Hardware Collection**: Arduino sensors collect pH, temperature, DO
2. **Serial Communication**: Data sent via SerialPort to mock server
3. **Normalization**: Raw JSON parsed and validated
4. **AI Enrichment**: FastAPI service predicts quality_ai and status_ai
5. **Storage**: 
   - Real-time buffer (in-memory, 200 records)
   - PostgreSQL database (persistent)
   - JSONL files (daily archives)
6. **Distribution**: Socket.IO broadcasts to connected clients
7. **Visualization**: Dashboard displays real-time charts and gauges

**Data Normalization**:
- Accepts multiple key aliases (pH/ph/PH, do_mg_l/do/DO, temp_c/temp/temperature)
- Validates required fields (pH, do_mg_l)
- Clamps values to plausible ranges
- Handles missing optional fields gracefully

### 3. AI Assistant (Veronica)

**Architecture**: Ollama-based conversational AI

**Flow**:
1. User initiates conversation via `/vassistant`
2. Assistant state initialized via `/api/assistant/initiate`
3. User queries sent to `/api/assistant/ask`
4. System checks for water report requests
5. If report requested: Generate from latest telemetry
6. Otherwise: Forward to Ollama with conversation history
7. Response streamed back to client
8. Conversation history maintained (last 10 messages)

**Features**:
- Natural language processing
- Context-aware responses
- Water quality report generation
- Conversation history management
- Text-to-speech support

### 4. AI Water Quality Prediction

**Service**: FastAPI on port 8000

**Input**: pH, temperature (°C), dissolved oxygen (mg/L)
**Output**: 
- `quality_ai`: Score 1-10
- `status_ai`: "good" | "average" | "alert"

**Implementation**:
- Heuristic-based predictor (fallback)
- ML model predictor (Colab-trained, primary)
- Plausibility clamping
- Fast inference (< 600ms timeout)

### 5. Real-Time Communication

**Socket.IO Server** (Port 4000):
- WebSocket connections
- Event-based messaging
- Automatic reconnection
- Room-based targeting (future)

**Events**:
- `telemetry`: New telemetry data
- `telemetry:update`: Latest reading update
- `serial:status`: Hardware connection status

**Client Integration**:
- Singleton Socket.IO client
- Automatic reconnection logic
- Throttled updates (2s default)
- Buffer management (200 records)

---

## Data Flow

### Telemetry Data Flow

```
Arduino Hardware
    │
    │ (Serial JSON: {"pH": 7.2, "temp_c": 25.0, "do_mg_l": 6.5})
    ▼
Mock Server (Serial Port Listener)
    │
    │ (Normalize & Validate)
    ▼
Normalized Telemetry Object
    │
    │ (Parallel Processing)
    ├─→ AI Service (FastAPI) ──→ Enriched with quality_ai, status_ai
    ├─→ PostgreSQL Database ──→ Persistent storage
    ├─→ JSONL File Storage ──→ Daily archives
    └─→ In-Memory Buffer ──→ Real-time access
    │
    │ (Socket.IO Broadcast)
    ▼
Connected Web Clients
    │
    │ (React State Update)
    ▼
Dashboard Visualization
```

### User Authentication Flow

```
User Action (Sign In)
    │
    ├─→ Credentials Provider
    │   │
    │   └─→ Validate Email/Password
    │       └─→ Create/Update Session
    │
    ├─→ Google OAuth
    │   │
    │   └─→ OAuth Flow
    │       └─→ Fetch/Create User
    │           └─→ Create Session
    │
    └─→ Kakao OAuth
        │
        └─→ Custom OAuth Flow
            └─→ Fetch/Create User
                └─→ Create Session
    │
    ▼
JWT Token Generated
    │
    │ (Stored in HTTP-only Cookie)
    ▼
Middleware Validation
    │
    ├─→ Protected Routes: Check Token
    └─→ Verification Check: Redirect if not verified
    │
    ▼
Access Granted
```

---

## Authentication & Authorization

### Authentication Providers

1. **Credentials Provider**
   - Email/password authentication
   - Password hashing (base64 - should use bcrypt in production)
   - User lookup and validation

2. **Google OAuth**
   - Standard OAuth 2.0 flow
   - Account linking by email
   - Profile image and name sync

3. **Kakao OAuth**
   - Custom OAuth implementation
   - Korean social login
   - Profile nickname and email

### Session Management

- **Strategy**: JWT tokens
- **Storage**: HTTP-only cookies
- **Expiration**: 30 days
- **Refresh**: Automatic on each request
- **Token Contents**: User ID, email, name, verification status, access token

### Authorization

**Middleware Protection**:
- `/dashboard`: Requires authentication + verification
- `/vassistant`: Requires authentication + verification
- `/api/*`: Session validation per route

**Verification System**:
- UUID-based verification tokens
- 5-minute expiration
- One-time use tokens
- Database-backed validation

---

## Real-Time Communication

### Socket.IO Architecture

**Server** (`mock-server/index.ts`):
- Express HTTP server
- Socket.IO WebSocket server
- Serial port integration
- Event broadcasting

**Client** (`app/services/socket.ts`):
- Singleton connection pattern
- Automatic reconnection (5 attempts)
- Transport fallback (websocket → polling)

**Events**:
- `telemetry`: New data point
- `telemetry:update`: Latest reading
- `serial:status`: Connection status change

### Data Synchronization

**Throttling**: Updates batched every 2 seconds (configurable)
**Buffer Management**: Maintains last 200 records in memory
**Historical Loading**: Optional database query for past data

---

## AI Integration

### Water Quality Prediction

**Service**: FastAPI (`ai-service/main.py`)
**Endpoint**: `POST /predict`

**Request**:
```json
{
  "pH": 7.2,
  "temp_c": 25.0,
  "do_mg_l": 6.5
}
```

**Response**:
```json
{
  "quality_ai": 8.5,
  "status_ai": "good"
}
```

**Models**:
1. **Heuristic Predictor**: Rule-based scoring algorithm
2. **ML Predictor**: Trained model from Colab (primary)

### AI Assistant

**Service**: Ollama (local LLM)
**Model**: Configurable (default: llama2 or similar)

**Features**:
- Conversational context (last 10 messages)
- Water quality report generation
- Natural language understanding
- Domain-specific knowledge (aquaculture)

---

## Database Schema

### Core Models

**User**:
- `id`: CUID
- `email`: Unique
- `password`: Hashed (nullable for OAuth)
- `name`: Display name
- `avatarUrl`: Profile image
- `verifiedAt`: Email verification timestamp
- `verificationToken`: UUID token
- Relations: `telemetry[]`, `verificationAttempts[]`

**Telemetry**:
- `id`: CUID
- `timestamp`: DateTime
- `pH`: Float (required)
- `temp_c`: Float (nullable)
- `do_mg_l`: Float (required)
- `fish_health`: Float (nullable)
- `quality_ai`: Float (nullable, 1-10)
- `status_ai`: String (nullable, "good"|"average"|"alert")
- `userId`: String (nullable, foreign key)
- Indexes: `timestamp`, `userId`

**VerificationAttempt**:
- `id`: CUID
- `userId`: Foreign key
- `token`: UUID (unique)
- `expiresAt`: DateTime
- `usedAt`: DateTime (nullable)
- Indexes: `userId`, `expiresAt`

**Chat_History**:
- `id`: Auto-increment
- `device_id`: String
- `message`: JSON string

---

## Deployment Architecture

### Development Setup

**Services**:
1. **Web App**: `npm run dev:ui` (port 3000)
2. **Mock Server**: `npm run dev:bridge` (port 4000)
3. **AI Service**: `python ai-service/main.py` (port 8000)
4. **Database**: PostgreSQL (local or cloud)

### Production Build

**Commands**:
- `npm run build`: Generate Prisma client + build Next.js
- `npm run start:prod:all`: Start all services

### Environment Variables

**Required**:
- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: NextAuth secret key
- `NEXTAUTH_URL`: Application base URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `KAKAO_CLIENT_ID` / `KAKAO_CLIENT_SECRET`
- `SERIAL_PATH`: Arduino port (or "auto")
- `SERIAL_BAUD`: Baud rate (default: 9600)
- `AI_BASE_URL`: FastAPI service URL (default: http://localhost:8000)
- `OLLAMA_URL`: Ollama service URL
- `NEXT_PUBLIC_WS_URL`: Socket.IO server URL

### Data Storage

**PostgreSQL**: 
- User accounts
- Telemetry records
- Verification tokens

**File System**:
- JSONL files: `mock-server/data/YYYY-MM-DD.jsonl`
- Daily archives for historical data
- User avatars: `public/uploads/userAvatars/`

---

## Security Considerations

### Authentication Security
- JWT tokens in HTTP-only cookies
- Password hashing (should upgrade to bcrypt)
- OAuth token validation
- CSRF protection via NextAuth

### API Security
- Session validation on protected routes
- Rate limiting on verification endpoints
- Input validation with type checking
- SQL injection prevention via Prisma

### Data Security
- User data isolation (userId filtering)
- Token expiration (5 minutes for verification)
- Secure file upload validation
- CORS configuration

---

## Performance Optimizations

### Frontend
- React memoization for expensive components
- Throttled telemetry updates (2s default)
- Code splitting with Next.js
- Image optimization
- Client-side caching

### Backend
- Database query optimization with Prisma
- Connection pooling
- Indexed database queries
- In-memory buffer for recent data
- Efficient Socket.IO event handling

### Real-Time
- Throttled updates to prevent UI lag
- Buffer size management (200 records)
- Automatic reconnection logic
- Efficient data serialization

---

## Future Enhancements

### Potential Improvements
1. **Caching Layer**: Redis for session and telemetry cache
2. **Search**: Full-text search for historical data
3. **Analytics**: User behavior tracking
4. **Monitoring**: Application performance monitoring (APM)
5. **Testing**: Comprehensive test suite (unit, integration, e2e)
6. **CI/CD**: Automated deployment pipeline
7. **Mobile App**: React Native companion app
8. **Multi-Device Support**: Multiple Arduino devices per user
9. **Advanced ML**: Real-time anomaly detection
10. **Notifications**: Push notifications for alerts

---

## Conclusion

Fishlinic is a well-architected IoT monitoring system that combines hardware sensors, real-time data processing, AI-powered analysis, and modern web technologies. The modular architecture, separation of concerns, and use of industry-standard tools provide a solid foundation for scalability and maintainability. The system successfully bridges the gap between physical hardware and digital intelligence, providing users with actionable insights for aquarium management.

