"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedPage } from "@/app/components/ProtectedPage";
import { useToast } from "@/app/hooks/useToast";
import { getToastFromUrl } from "@/app/lib/toast-server";
import { 
  Bot, 
  Camera, 
  CameraOff, 
  Send, 
  Volume2, 
  User, 
  Trash2, 
  Zap,
  MessageSquare,
  BarChart3,
  Heart,
  Lightbulb
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
};

const ASSISTANT_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ASSISTANT_URL) ||
  "http://localhost:5055";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ASSISTANT_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return (await res.json()) as T;
}

function VAssistantContent() {
  const [initiated, setInitiated] = useState(false);
  const [cameraRunning, setCameraRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const hasCheckedToast = useRef(false);

  // Check for server-initiated toast (only once)
  useEffect(() => {
    if (!hasCheckedToast.current) {
      hasCheckedToast.current = true;
      const urlToast = getToastFromUrl();
      if (urlToast) {
        toast.show(urlToast.type as any, urlToast.message);
      }
    }
  }, [toast]);

  async function refreshStatus() {
    try {
      const s = await api<{ initiated: boolean; camera_running: boolean; model_id: string }>(
        "/status"
      );
      setInitiated(s.initiated);
      setCameraRunning(s.camera_running);
    } catch {}
  }

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ 
        top: listRef.current.scrollHeight, 
        behavior: "smooth" 
      });
    }
  }, [messages.length, isTyping]);

  async function onInitiate() {
    setBusy(true);
    setError(null);
    try {
      await api<{ ok: boolean }>("/assistant/initiate", { method: "POST" });
      setInitiated(true);
      // Add welcome message
      const welcomeMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Hello! I'm Veronica, your smart aquaculture assistant. I'm ready to help you monitor your aquarium and answer any questions you have about water quality, fish health, or system status.",
        ts: Date.now()
      };
      setMessages([welcomeMsg]);
    } catch {
      setError("Failed to initiate assistant");
    } finally {
      setBusy(false);
    }
  }

  async function onAsk() {
    const prompt = input.trim();
    if (!prompt || busy) return;
    
    const userMsg: Message = { 
      id: crypto.randomUUID(), 
      role: "user", 
      text: prompt, 
      ts: Date.now() 
    };
    
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);
    setIsTyping(true);
    setError(null);
    
    try {
      const res = await api<{ ok: boolean; answer?: string }>("/assistant/ask", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      
      setIsTyping(false);
      const text = res.answer || "I couldn't process that request.";
      const bot: Message = { 
        id: crypto.randomUUID(), 
        role: "assistant", 
        text, 
        ts: Date.now() 
      };
      setMessages((m) => [...m, bot]);
    } catch {
      setIsTyping(false);
      setError("Failed to get response");
    } finally {
      setBusy(false);
    }
  }

  async function onSpeak(text: string) {
    try {
      await api<{ ok: boolean }>("/assistant/say", { 
        method: "POST", 
        body: JSON.stringify({ text }) 
      });
    } catch {}
  }

  async function onCameraOpen() {
    setBusy(true);
    setError(null);
    try {
      await api<{ ok: boolean }>("/camera/open", { method: "POST" });
      setCameraRunning(true);
    } catch {
      setError("Camera failed to open");
    } finally {
      setBusy(false);
    }
  }

  async function onCameraClose() {
    setBusy(true);
    setError(null);
    try {
      await api<{ ok: boolean }>("/camera/close", { method: "POST" });
      setCameraRunning(false);
    } catch {
      setError("Camera failed to close");
    } finally {
      setBusy(false);
    }
  }

  const quickActions = [
    { label: "Water Report", prompt: "Give me a detailed water quality report", icon: BarChart3 },
    { label: "System Status", prompt: "What's the current system status?", icon: Zap },
    { label: "Fish Health", prompt: "How are my fish doing?", icon: Heart },
    { label: "Recommendations", prompt: "Any recommendations for my aquarium?", icon: Lightbulb }
  ];

  return (
    <div className="bg-gradient-main min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="glass-strong p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                Virtual Assistant
              </h1>
              <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                Powered by AI • Smart Aquaculture Management
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className={`badge ${initiated ? "status-good" : "status-neutral"}`}>
                <div className={`w-2 h-2 rounded-full ${initiated ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></div>
                Assistant: {initiated ? "Ready" : "Idle"}
              </div>
              <div className={`badge ${cameraRunning ? "status-good" : "status-neutral"}`}>
                <div className={`w-2 h-2 rounded-full ${cameraRunning ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></div>
                Camera: {cameraRunning ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Control Panel */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Assistant Controls */}
            <div className="card-glass animate-slide-in">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                Assistant Controls
              </h3>
              
              <div className="space-y-3">
                <button
                  className={`btn w-full ${initiated ? "btn-secondary" : "btn-primary animate-glow"}`}
                  onClick={onInitiate}
                  disabled={busy}
                >
                  {busy ? (
                    <div className="animate-pulse">Initializing...</div>
                  ) : initiated ? (
                    <>
                      <Bot className="w-4 h-4" />
                      Veronica Ready
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Initiate Veronica
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Camera Controls */}
            <div className="card-glass animate-slide-in" style={{ animationDelay: "100ms" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                Camera System
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onCameraOpen}
                  disabled={busy || cameraRunning}
                  title="Opens camera window on host system"
                >
                  <Camera className="w-4 h-4" />
                  Open
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={onCameraClose}
                  disabled={busy || !cameraRunning}
                >
                  <CameraOff className="w-4 h-4" />
                  Close
                </button>
              </div>
              
              <p className="text-xs mt-3" style={{ color: "rgb(var(--text-muted))" }}>
                Camera opens in a native window for fish monitoring and health analysis.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="card-glass animate-slide-in" style={{ animationDelay: "200ms" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="btn btn-ghost btn-sm w-full text-left justify-start"
                      onClick={() => {
                        setInput(action.prompt);
                        inputRef.current?.focus();
                      }}
                      disabled={!initiated}
                    >
                      <IconComponent className="w-4 h-4" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Chat Interface */}
          <main className="lg:col-span-8">
            <div className="card-glass h-[70vh] flex flex-col animate-fade-in" style={{ animationDelay: "300ms" }}>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                      Veronica AI
                    </h3>
                    <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      {initiated ? "Online • Ready to help" : "Offline • Click initiate to start"}
                    </p>
                  </div>
                </div>
                
                {messages.length > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setMessages([])}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Messages */}
              <div 
                ref={listRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.length === 0 && !initiated && (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                      Welcome to Your Smart Aquarium Assistant
                    </h3>
                    <p style={{ color: "rgb(var(--text-muted))" }}>
                      Click &quot;Initiate Veronica&quot; to start your AI-powered aquaculture management experience.
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`animate-fade-in ${
                      message.role === "user" ? "flex justify-end" : "flex justify-start"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.role === "user" ? "message-user" : "message-assistant"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {message.text}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs opacity-60">
                              {new Date(message.ts).toLocaleTimeString()}
                            </span>
                            {message.role === "assistant" && message.text && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => onSpeak(message.text)}
                                title="Speak this message"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="message-assistant max-w-[80%]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    className="input-glass flex-1 focus-ring"
                    placeholder={initiated ? "Ask Veronica anything about your aquarium..." : "Initiate assistant first"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onAsk();
                      }
                    }}
                    disabled={!initiated || busy}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={onAsk}
                    disabled={!initiated || busy || !input.trim()}
                  >
                    {busy ? (
                      <MessageSquare className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function VAssistantPage() {
  return (
    <ProtectedPage>
      <VAssistantContent />
    </ProtectedPage>
  );
}