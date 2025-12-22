# Fishlinic - Complete Student Guide

> **A comprehensive guide for students inheriting this capstone project**

Welcome! This guide is designed specifically for students who will be working on this project in future semesters. It assumes you may not have experience with all the technologies used here, so we'll explain everything from the ground up.

---

## Table of Contents

1. [What is Fishlinic?](#what-is-fishlinic)
2. [Understanding the Problem](#understanding-the-problem)
3. [How the System Works](#how-the-system-works)
4. [Technology Overview for Beginners](#technology-overview-for-beginners)
5. [Project Structure Explained](#project-structure-explained)
6. [Key Concepts You Need to Know](#key-concepts-you-need-to-know)
7. [Understanding the Codebase](#understanding-the-codebase)
8. [Common Tasks & How-Tos](#common-tasks--how-tos)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Where to Learn More](#where-to-learn-more)

---

## What is Fishlinic?

Fishlinic is an **IoT-based smart aquaculture monitoring system**. In simpler terms, it's a web application that:

1. **Reads data from sensors** connected to an Arduino (pH, temperature, dissolved oxygen)
2. **Displays the data in real-time** on a beautiful dashboard
3. **Uses AI to predict** whether the water quality is good or needs attention
4. **Has an AI assistant** (named Veronica) that can answer questions about fish care
5. **Controls an automatic fish feeder** via the web interface

Think of it as a "smart home for fish" - monitoring and automation for aquariums or fish farms.

---

## Understanding the Problem

### Why Does This Project Exist?

**Traditional fish farming problems:**

| Problem | Impact |
|---------|--------|
| Manual water testing is time-consuming | Takes 15-30 minutes multiple times per day |
| Human error in readings | Inaccurate measurements lead to wrong decisions |
| No historical data | Can't see trends or patterns |
| Late detection of issues | Fish get sick or die before problems are noticed |
| No remote monitoring | Must be physically present to check water |

**How Fishlinic solves these:**

| Solution | Benefit |
|----------|---------|
| Automatic sensor readings | 24/7 monitoring, no human effort |
| Digital precision | Accurate to 0.01 units |
| Database storage | Historical trends and analysis |
| AI prediction | Early warning before problems occur |
| Web-based dashboard | Monitor from anywhere with internet |

---

## How the System Works

### The Big Picture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ARDUINO       │────▶│   MOCK SERVER   │────▶│   WEB APP       │
│   (Sensors)     │     │   (Bridge)      │     │   (Dashboard)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   AI SERVICE    │
                        │   (Predictions) │
                        └─────────────────┘
```

### Step-by-Step Data Flow

1. **Arduino reads sensors** every few seconds
   - pH sensor: Measures acidity (0-14 scale)
   - Temperature sensor: Measures water temperature in Celsius
   - DO sensor: Measures dissolved oxygen in mg/L

2. **Arduino sends data via USB** as a JSON string:
   ```json
   {"pH": 7.2, "temp_c": 25.0, "do_mg_l": 6.5}
   ```

3. **Mock Server receives the data** and:
   - Parses the JSON
   - Validates the values (pH must be 0-14, etc.)
   - Sends to AI service for quality prediction
   - Saves to database and files
   - Broadcasts to all connected browsers via WebSocket

4. **AI Service analyzes the data** and returns:
   ```json
   {"quality_ai": 8.5, "status_ai": "good"}
   ```

5. **Web Dashboard updates instantly**:
   - Charts show new data point
   - Gauges update their values
   - Status color changes if needed

All this happens in **less than 1 second**.

---

## Technology Overview for Beginners

### What is Each Technology and Why We Use It

#### Frontend (What Users See)

| Technology | What It Is | Why We Use It |
|------------|------------|---------------|
| **Next.js** | A React framework | Makes React easier with routing, API routes, and optimization built-in |
| **React** | A JavaScript library for building UIs | Components let us reuse code; state management makes things reactive |
| **TypeScript** | JavaScript with types | Catches bugs before running code; better autocomplete in editors |
| **Tailwind CSS** | Utility CSS classes | Fast styling without writing separate CSS files |
| **ECharts** | Charting library | Creates beautiful, interactive charts for data visualization |
| **Socket.IO** | Real-time communication | Instant updates without page refresh |

#### Backend (Server-Side Logic)

| Technology | What It Is | Why We Use It |
|------------|------------|---------------|
| **Next.js API Routes** | Server endpoints inside Next.js | No need for separate backend server |
| **Express.js** | Node.js web server | Powers our mock-server for serial communication |
| **Prisma** | Database ORM | Write TypeScript instead of SQL; type-safe database queries |
| **PostgreSQL** | Relational database | Stores users, telemetry, schedules reliably |
| **NextAuth.js** | Authentication library | Handles login, sessions, OAuth automatically |

#### AI & Hardware

| Technology | What It Is | Why We Use It |
|------------|------------|---------------|
| **FastAPI** | Python web framework | Simple and fast for AI endpoints |
| **Ollama** | Local AI model server | Run LLMs locally for the AI assistant |
| **Arduino** | Microcontroller | Reads physical sensors, controls servo motor |
| **SerialPort** | Node.js library | Communicates with Arduino over USB |

---

## Project Structure Explained

### Top-Level Folders

```
fishlinic/
├── app/              ← Next.js application (main code!)
├── mock-server/      ← Server that talks to Arduino
├── ai-service/       ← Python AI prediction service
├── arduino-code/     ← Code that runs on the Arduino
├── prisma/           ← Database schema and migrations
├── public/           ← Static files (images, fonts)
├── node_modules/     ← Installed packages (don't edit!)
├── .env              ← Secret configuration (never commit!)
├── package.json      ← Project dependencies and scripts
└── README.md         ← Quick start guide
```

### Inside the `app/` Folder

This is where 90% of your work will be:

```
app/
├── api/                    ← Backend API endpoints
│   ├── assistant/          ← AI assistant endpoints
│   │   ├── initiate/       ← POST /api/assistant/initiate
│   │   ├── ask/            ← POST /api/assistant/ask
│   │   └── status/         ← GET /api/assistant/status
│   ├── auth/               ← Authentication
│   │   ├── [...nextauth]/  ← NextAuth magic route
│   │   ├── signup/         ← POST /api/auth/signup
│   │   └── verification/   ← Email verification
│   ├── feeder/             ← Fish feeder control
│   ├── telemetry/          ← Sensor data endpoints
│   └── user/               ← User profile endpoints
│
├── components/             ← Reusable UI pieces
│   ├── Gauge.tsx           ← Circular gauge display
│   ├── TelemetryChart.tsx  ← Real-time line charts
│   ├── FeederPanel.tsx     ← Feeder control panel
│   ├── StatusCard.tsx      ← Status display card
│   └── SiteNav.tsx         ← Navigation bar
│
├── dashboard/              ← Dashboard page
│   └── page.tsx            ← Main dashboard (800+ lines!)
│
├── vassistant/             ← AI Assistant page
│   └── page.tsx            ← Chat interface with Veronica
│
├── auth/                   ← Authentication pages
│   ├── signin/             ← Login page
│   └── signup/             ← Registration page
│
├── hooks/                  ← Custom React hooks
│   ├── useTelemetry.ts     ← Real-time sensor data hook
│   ├── useFeeder.ts        ← Feeder control hook
│   └── useAuth.ts          ← Authentication state hook
│
├── lib/                    ← Utility functions
│   ├── auth-config.ts      ← NextAuth configuration
│   ├── prisma.ts           ← Database client singleton
│   ├── types.ts            ← TypeScript type definitions
│   └── rate-limit.ts       ← API rate limiting
│
├── layout.tsx              ← Root layout (wraps all pages)
├── page.tsx                ← Home page (landing page)
└── globals.css             ← Global styles
```

### How Files Become URLs

Next.js uses **file-based routing**:

| File Path | URL |
|-----------|-----|
| `app/page.tsx` | `/` (home) |
| `app/dashboard/page.tsx` | `/dashboard` |
| `app/auth/signin/page.tsx` | `/auth/signin` |
| `app/api/telemetry/latest/route.ts` | `GET /api/telemetry/latest` |
| `app/api/feeder/schedule/[id]/route.ts` | `DELETE /api/feeder/schedule/123` |

The `[id]` syntax is a dynamic route - it matches any value.

---

## Key Concepts You Need to Know

### 1. React Components

Components are reusable pieces of UI:

```tsx
// A simple component
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Using it
<Greeting name="Student" />
// Renders: <h1>Hello, Student!</h1>
```

### 2. React Hooks

Hooks let you add features to components:

```tsx
import { useState, useEffect } from 'react';

function Counter() {
  // useState: Manage local state
  const [count, setCount] = useState(0);

  // useEffect: Run code when component loads or updates
  useEffect(() => {
    console.log('Count changed to:', count);
  }, [count]); // Only run when 'count' changes

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

### 3. API Routes

API routes handle HTTP requests:

```ts
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: 'Hello!' });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Do something with body
  return NextResponse.json({ received: body });
}
```

### 4. Prisma Database Queries

Prisma makes database queries type-safe:

```ts
import { prisma } from '@/lib/prisma';

// Create a new user
const user = await prisma.user.create({
  data: {
    email: 'student@example.com',
    name: 'Student'
  }
});

// Find users
const users = await prisma.user.findMany({
  where: { email: { contains: '@example.com' } }
});

// Get telemetry with sorting and limit
const readings = await prisma.telemetry.findMany({
  orderBy: { timestamp: 'desc' },
  take: 100
});
```

### 5. Socket.IO Real-Time Events

Socket.IO enables instant communication:

```ts
// SERVER: Sending data
io.emit('telemetry:update', { pH: 7.2, temp_c: 25 });

// CLIENT: Receiving data
socket.on('telemetry:update', (data) => {
  console.log('New reading:', data);
  updateChart(data);
});
```

### 6. TypeScript Types

Types define the shape of data:

```ts
// Define a type
interface Telemetry {
  id: string;
  timestamp: Date;
  pH: number;
  temp_c: number | null;  // Can be null
  do_mg_l: number;
  quality_ai?: number;     // Optional
  status_ai?: 'good' | 'average' | 'alert';
}

// Use the type
function processReading(data: Telemetry): void {
  console.log(data.pH);  // TypeScript knows this is a number
}
```

---

## Understanding the Codebase

### The Most Important Files

#### 1. `app/dashboard/page.tsx` - Main Dashboard

This is the biggest file (~800 lines). Key sections:

```tsx
export default function DashboardPage() {
  // 1. GET DATA from hooks
  const { telemetry, latest, socketConnected } = useTelemetry();
  const { status: feederStatus, feedNow } = useFeeder();
  const { session } = useAuth();

  // 2. LOCAL STATE for UI
  const [showSettings, setShowSettings] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState(defaults);

  // 3. EFFECTS for side effects
  useEffect(() => {
    // Check if values exceed thresholds
    if (latest?.pH && latest.pH < alertThresholds.pH.min) {
      showAlert('pH is too low!');
    }
  }, [latest]);

  // 4. RENDER the UI
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Gauges */}
      <Gauge value={latest?.pH} label="pH" />
      <Gauge value={latest?.temp_c} label="Temperature" />
      <Gauge value={latest?.do_mg_l} label="Dissolved Oxygen" />

      {/* Charts */}
      <TelemetryChart data={telemetry} />

      {/* Feeder Control */}
      <FeederPanel status={feederStatus} onFeed={feedNow} />
    </div>
  );
}
```

#### 2. `app/hooks/useTelemetry.ts` - Real-Time Data Hook

This hook manages all real-time sensor data:

```tsx
export function useTelemetry(options?: { bufferSize?: number }) {
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [latest, setLatest] = useState<Telemetry | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('telemetry:update', (data: Telemetry) => {
      setLatest(data);
      setTelemetry(prev => {
        const updated = [...prev, data];
        // Keep only last N readings
        return updated.slice(-options?.bufferSize || 200);
      });
    });

    return () => {
      socket.off('telemetry:update');
    };
  }, []);

  return { telemetry, latest, socketConnected };
}
```

#### 3. `mock-server/index.ts` - Serial Bridge

Connects Arduino to web app:

```ts
// Serial port listener
serial.on('data', async (line: string) => {
  try {
    const raw = JSON.parse(line);
    const normalized = normalize(raw);

    if (normalized) {
      // Get AI prediction
      const prediction = await fetchPrediction(normalized);
      normalized.quality_ai = prediction.quality;
      normalized.status_ai = prediction.status;

      // Broadcast to all browsers
      io.emit('telemetry:update', normalized);

      // Save to file
      appendToFile(normalized);
    }
  } catch (err) {
    console.error('Parse error:', err);
  }
});
```

#### 4. `prisma/schema.prisma` - Database Models

Defines all database tables:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?
  name      String?
  createdAt DateTime @default(now())

  telemetry Telemetry[]
  schedules FeederSchedule[]
}

model Telemetry {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  pH        Float
  temp_c    Float?
  do_mg_l   Float
  quality_ai Float?
  status_ai String?

  userId    String?
  user      User? @relation(fields: [userId], references: [id])

  @@index([timestamp])
}
```

---

## Common Tasks & How-Tos

### How to Add a New Page

1. Create a folder in `app/`:
   ```
   app/my-new-page/page.tsx
   ```

2. Add your component:
   ```tsx
   export default function MyNewPage() {
     return (
       <div>
         <h1>My New Page</h1>
       </div>
     );
   }
   ```

3. Access it at `http://localhost:3000/my-new-page`

### How to Add a New API Endpoint

1. Create a folder in `app/api/`:
   ```
   app/api/my-endpoint/route.ts
   ```

2. Add handler functions:
   ```ts
   import { NextResponse } from 'next/server';

   export async function GET() {
     return NextResponse.json({ data: 'hello' });
   }

   export async function POST(request: Request) {
     const body = await request.json();
     // Process body...
     return NextResponse.json({ success: true });
   }
   ```

3. Call it from frontend:
   ```ts
   const response = await fetch('/api/my-endpoint');
   const data = await response.json();
   ```

### How to Add a New Database Table

1. Edit `prisma/schema.prisma`:
   ```prisma
   model NewTable {
     id        String   @id @default(cuid())
     name      String
     createdAt DateTime @default(now())
   }
   ```

2. Generate Prisma client:
   ```bash
   pnpm db:generate
   ```

3. Push to database:
   ```bash
   pnpm db:push
   ```

4. Use it in code:
   ```ts
   const items = await prisma.newTable.findMany();
   ```

### How to Add a New Component

1. Create file in `app/components/`:
   ```tsx
   // app/components/MyComponent.tsx
   interface MyComponentProps {
     title: string;
     value: number;
   }

   export function MyComponent({ title, value }: MyComponentProps) {
     return (
       <div className="p-4 bg-white rounded-lg shadow">
         <h2 className="text-lg font-bold">{title}</h2>
         <p className="text-2xl">{value}</p>
       </div>
     );
   }
   ```

2. Import and use it:
   ```tsx
   import { MyComponent } from '@/components/MyComponent';

   <MyComponent title="pH Level" value={7.2} />
   ```

### How to Add a New Sensor Type

1. Update Arduino code to send the new value:
   ```cpp
   Serial.println("{\"pH\": 7.2, \"ammonia\": 0.5}");
   ```

2. Update the normalize function in mock-server:
   ```ts
   const ammonia = raw.ammonia ?? raw.NH3 ?? raw.nh3;
   ```

3. Add to Prisma schema:
   ```prisma
   model Telemetry {
     // ...existing fields
     ammonia Float?
   }
   ```

4. Update the dashboard to display it:
   ```tsx
   <Gauge value={latest?.ammonia} label="Ammonia" max={1} />
   ```

---

## Troubleshooting Guide

### "Cannot connect to database"

**Error:** `Error: P1001: Can't reach database server`

**Solutions:**
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `.env` is correct
3. Try: `pnpm db:push` to sync schema

### "Socket not connecting"

**Error:** Dashboard shows "Disconnected" or no real-time updates

**Solutions:**
1. Make sure mock-server is running: `pnpm dev:bridge`
2. Check `NEXT_PUBLIC_WS_URL` in `.env` (should be `http://localhost:4000`)
3. Check browser console for WebSocket errors

### "Authentication not working"

**Error:** Login fails or OAuth redirects fail

**Solutions:**
1. Check `AUTH_SECRET` is set in `.env`
2. Check `NEXTAUTH_URL` matches your URL (e.g., `http://localhost:3000`)
3. For OAuth: Verify client ID and secret are correct
4. Check redirect URIs in Google/Kakao console

### "AI service not responding"

**Error:** Quality predictions are empty, Veronica not responding

**Solutions:**
1. Start the AI service: `cd ai-service && python main.py`
2. Check `AI_BASE_URL` in `.env` (should be `http://localhost:8000`)
3. For Ollama: Make sure it's running with `ollama serve`

### "Prisma client not generated"

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
pnpm db:generate
```

### "Module not found"

**Error:** `Module not found: Can't resolve 'xyz'`

**Solutions:**
1. Install the package: `pnpm add xyz`
2. Check for typos in import path
3. Try: `pnpm install` to reinstall all packages

---

## Where to Learn More

### Official Documentation

| Technology | URL |
|------------|-----|
| Next.js | https://nextjs.org/docs |
| React | https://react.dev |
| TypeScript | https://www.typescriptlang.org/docs |
| Tailwind CSS | https://tailwindcss.com/docs |
| Prisma | https://www.prisma.io/docs |
| NextAuth.js | https://next-auth.js.org |
| Socket.IO | https://socket.io/docs |
| FastAPI | https://fastapi.tiangolo.com |

### Free Courses

| Topic | Resource |
|-------|----------|
| React Basics | [React Official Tutorial](https://react.dev/learn) |
| Next.js | [Next.js Learn Course](https://nextjs.org/learn) |
| TypeScript | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) |
| Tailwind | [Tailwind UI Kit](https://tailwindui.com) |

### YouTube Channels

- **Theo** - Next.js and modern web development
- **Web Dev Simplified** - React and JavaScript
- **Fireship** - Quick tech explanations
- **Traversy Media** - Full project tutorials

### Project Documentation

| File | Contains |
|------|----------|
| `README.md` | Quick start guide |
| `architecture.md` | System architecture details |
| `DETAILED_REPORT.md` | Comprehensive technical documentation |
| `PROJECT_REPORT.md` | Capstone project report |
| `VIDEO_SCRIPT.md` | Video presentation script |
| `GETTING_STARTED.md` | Step-by-step setup guide |

---

## Quick Reference Card

### Important Commands

```bash
# Development
pnpm dev              # Run all services
pnpm dev:ui           # Run only web app
pnpm dev:bridge       # Run only mock server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:studio        # Open database GUI

# Production
pnpm build            # Build for production
pnpm start            # Start production server
```

### Important URLs (Development)

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| Mock Server | http://localhost:4000 |
| AI Service | http://localhost:8000 |
| Prisma Studio | http://localhost:5555 |

### Important Environment Variables

```env
DATABASE_URL=         # PostgreSQL connection string
AUTH_SECRET=          # Random string for session encryption
NEXTAUTH_URL=         # Your app URL
NEXT_PUBLIC_WS_URL=   # WebSocket server URL
AI_BASE_URL=          # Python AI service URL
OLLAMA_URL=           # Ollama server URL
```

---

## Final Tips

1. **Start with the README** - Get the project running first before diving into code

2. **Use TypeScript hover** - In VS Code, hover over any variable to see its type

3. **Read error messages carefully** - They usually tell you exactly what's wrong

4. **Use console.log liberally** - When debugging, print values to understand what's happening

5. **Check the browser console** - Press F12 to see JavaScript errors and network requests

6. **Keep the architecture in mind** - Always think about which layer handles what

7. **Ask for help early** - Don't spend hours stuck; reach out to TAs or online communities

8. **Document your changes** - Future students will thank you!

---

*Good luck with your capstone project! You've got this!*

---

*Created for Fishlinic Capstone Project - Sejong University 2025*
