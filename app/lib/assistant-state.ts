// Shared assistant state (in production, use Redis or database)
let assistantState = {
  initiated: false,
  cameraRunning: false,
  modelId: process.env.ASSISTANT_MODEL || "qwen2.5:3b"
};

export function getAssistantState() {
  return { ...assistantState };
}

export function setAssistantState(updates: Partial<typeof assistantState>) {
  assistantState = { ...assistantState, ...updates };
}

