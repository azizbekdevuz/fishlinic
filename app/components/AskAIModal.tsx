"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Bot, Send, Loader2 } from "lucide-react";
import type { Telemetry } from "@/app/lib/types";

type AskAIModalProps = {
  isOpen: boolean;
  onClose: () => void;
  latest?: Telemetry;
};

export function AskAIModal({ isOpen, onClose, latest }: AskAIModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    "What's the current water quality status?",
    "Are there any issues I should be aware of?",
    "What actions should I take?",
    "How is the fish health?",
    "Explain the current pH level"
  ];

  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);
    setAnswer(null);

    // Simulate AI response (replace with actual API call if available)
    setTimeout(() => {
      const response = generateAIResponse(question, latest);
      setAnswer(response);
      setLoading(false);
    }, 1500);
  };

  const handleQuickQuestion = (q: string) => {
    setQuestion(q);
  };

  const handleClose = () => {
    setQuestion("");
    setAnswer(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ask AI Assistant" size="lg">
      <div className="space-y-6">
        {/* Quick Questions */}
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
            Quick Questions
          </label>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="btn btn-ghost btn-sm text-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
            Ask a Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about water quality, fish health, recommendations, or any concerns..."
            className="input w-full min-h-[100px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAsk();
              }
            }}
          />
          <p className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
            Press Ctrl+Enter or Cmd+Enter to submit
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAsk}
          disabled={!question.trim() || loading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Ask AI
            </>
          )}
        </button>

        {/* Answer */}
        {answer && (
          <div 
            className="p-4 rounded-lg space-y-3"
            style={{
              background: "rgb(var(--surface-elevated))",
              border: "1px solid var(--border)"
            }}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" style={{ color: "rgb(var(--primary))" }} />
              <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                AI Response
              </span>
            </div>
            <div className="text-sm whitespace-pre-wrap" style={{ color: "rgb(var(--text-secondary))" }}>
              {answer}
            </div>
          </div>
        )}

        {/* Current Status Info */}
        {latest && (
          <div 
            className="p-4 rounded-lg"
            style={{
              background: "rgb(var(--surface-elevated))",
              border: "1px solid var(--border)"
            }}
          >
            <div className="text-xs space-y-1" style={{ color: "rgb(var(--text-muted))" }}>
              <div className="flex justify-between">
                <span>Current pH:</span>
                <span className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  {latest.pH.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  {latest.temp_c.toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dissolved Oxygen:</span>
                <span className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  {latest.do_mg_l.toFixed(2)} mg/L
                </span>
              </div>
              {latest.quality_ai && (
                <div className="flex justify-between">
                  <span>AI Quality Score:</span>
                  <span className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                    {latest.quality_ai.toFixed(1)}/10
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function generateAIResponse(question: string, latest?: Telemetry): string {
  const lowerQuestion = question.toLowerCase();
  
  if (!latest) {
    return "I don't have current telemetry data to analyze. Please wait for data to be available.";
  }

  // Status-based responses
  if (lowerQuestion.includes("status") || lowerQuestion.includes("how is") || lowerQuestion.includes("current")) {
    const status = latest.status_ai || (latest.pH >= 6.5 && latest.pH <= 8.0 && latest.temp_c >= 20 && latest.temp_c <= 30 && latest.do_mg_l >= 5.0 ? "good" : "average");
    
    if (status === "good") {
      return `The water quality is currently in GOOD condition. All key parameters are within optimal ranges:\n\n• pH: ${latest.pH.toFixed(2)} (optimal: 6.5-8.0)\n• Temperature: ${latest.temp_c.toFixed(1)}°C (optimal: 20-30°C)\n• Dissolved Oxygen: ${latest.do_mg_l.toFixed(2)} mg/L (optimal: ≥5.0 mg/L)\n\nYour aquarium is healthy and stable. Continue regular monitoring and maintenance.`;
    } else if (status === "average") {
      return `The water quality needs ATTENTION. Some parameters are outside optimal ranges:\n\n• pH: ${latest.pH.toFixed(2)} (target: 6.5-8.0)\n• Temperature: ${latest.temp_c.toFixed(1)}°C (target: 20-30°C)\n• Dissolved Oxygen: ${latest.do_mg_l.toFixed(2)} mg/L (target: ≥5.0 mg/L)\n\nRecommendations:\n- Check filtration system\n- Consider partial water change\n- Monitor fish behavior closely\n- Review feeding schedule`;
    } else {
      return `⚠️ CRITICAL ALERT: Water quality requires IMMEDIATE action!\n\nCurrent readings:\n• pH: ${latest.pH.toFixed(2)}\n• Temperature: ${latest.temp_c.toFixed(1)}°C\n• Dissolved Oxygen: ${latest.do_mg_l.toFixed(2)} mg/L\n\nImmediate actions:\n1. Check all equipment functionality\n2. Perform emergency water correction\n3. Consider emergency protocols\n4. Monitor fish closely for stress signs`;
    }
  }

  // pH-specific
  if (lowerQuestion.includes("ph") || lowerQuestion.includes("acidity")) {
    const phStatus = latest.pH >= 6.5 && latest.pH <= 8.0 ? "optimal" : latest.pH >= 6.0 && latest.pH <= 8.5 ? "acceptable" : "critical";
    return `Current pH level: ${latest.pH.toFixed(2)}\n\nStatus: ${phStatus.toUpperCase()}\n\n${phStatus === "optimal" ? "Your pH is in the ideal range for most fish species. No action needed." : phStatus === "acceptable" ? "pH is slightly outside optimal range. Monitor closely and consider gradual adjustment." : "pH is critically outside safe range. Immediate correction required to prevent fish stress."}`;
  }

  // Temperature-specific
  if (lowerQuestion.includes("temp") || lowerQuestion.includes("temperature") || lowerQuestion.includes("warm") || lowerQuestion.includes("cold")) {
    const tempStatus = latest.temp_c >= 20 && latest.temp_c <= 30 ? "optimal" : latest.temp_c >= 18 && latest.temp_c <= 32 ? "acceptable" : "critical";
    return `Current temperature: ${latest.temp_c.toFixed(1)}°C (${((latest.temp_c * 9/5) + 32).toFixed(1)}°F)\n\nStatus: ${tempStatus.toUpperCase()}\n\n${tempStatus === "optimal" ? "Temperature is perfect for most tropical fish. Maintain current settings." : tempStatus === "acceptable" ? "Temperature is slightly outside ideal range. Check heater/cooler settings." : "Temperature is critically outside safe range. Adjust immediately to prevent fish stress or death."}`;
  }

  // Oxygen-specific
  if (lowerQuestion.includes("oxygen") || lowerQuestion.includes("do") || lowerQuestion.includes("dissolved")) {
    const doStatus = latest.do_mg_l >= 5.0 ? "optimal" : latest.do_mg_l >= 3.5 ? "low" : "critical";
    return `Current dissolved oxygen: ${latest.do_mg_l.toFixed(2)} mg/L\n\nStatus: ${doStatus.toUpperCase()}\n\n${doStatus === "optimal" ? "Oxygen levels are excellent. Fish have plenty of oxygen for respiration." : doStatus === "low" ? "Oxygen levels are below optimal. Consider:\n- Increasing aeration\n- Checking water flow\n- Reducing fish load\n- Adding air stones" : "Oxygen levels are critically low! Immediate action required:\n- Increase aeration immediately\n- Check for equipment failure\n- Consider emergency aeration\n- Monitor fish for signs of distress"}`;
  }

  // Fish health
  if (lowerQuestion.includes("fish") || lowerQuestion.includes("health")) {
    const health = latest.fish_health ?? 80;
    const healthStatus = health >= 80 ? "excellent" : health >= 60 ? "good" : "needs attention";
    return `Fish health indicator: ${health}%\n\nStatus: ${healthStatus.toUpperCase()}\n\n${health >= 80 ? "Your fish appear to be in excellent health. Continue current care routine." : health >= 60 ? "Fish health is good but could be improved. Monitor behavior and water quality closely." : "Fish health needs attention. Review water parameters, feeding schedule, and check for signs of disease or stress."}`;
  }

  // Action/recommendation requests
  if (lowerQuestion.includes("action") || lowerQuestion.includes("what should") || lowerQuestion.includes("recommend") || lowerQuestion.includes("do")) {
    const issues: string[] = [];
    if (latest.pH < 6.5 || latest.pH > 8.0) issues.push("pH adjustment");
    if (latest.temp_c < 20 || latest.temp_c > 30) issues.push("temperature regulation");
    if (latest.do_mg_l < 5.0) issues.push("oxygenation improvement");
    
    if (issues.length === 0) {
      return "No immediate actions required. Your aquarium is in good condition. Continue regular maintenance:\n\n• Weekly water testing\n• Regular filter cleaning\n• Appropriate feeding schedule\n• Monitor fish behavior";
    } else {
      return `Recommended actions:\n\n${issues.map((issue, i) => `${i + 1}. Address ${issue}`).join("\n")}\n\nGeneral maintenance:\n• Check all equipment\n• Review feeding schedule\n• Monitor fish behavior\n• Consider partial water change if needed`;
    }
  }

  // Default response
  return `Based on current readings:\n\n• pH: ${latest.pH.toFixed(2)}\n• Temperature: ${latest.temp_c.toFixed(1)}°C\n• Dissolved Oxygen: ${latest.do_mg_l.toFixed(2)} mg/L\n• AI Quality Score: ${latest.quality_ai?.toFixed(1) ?? "N/A"}/10\n\nOverall status: ${latest.status_ai?.toUpperCase() ?? "MONITORING"}\n\nFor specific questions, ask about pH, temperature, oxygen, fish health, or recommended actions.`;
}

