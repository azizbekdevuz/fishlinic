// Sound utility for alert notifications

let audioContext: AudioContext | null = null;

// Initialize audio context (required for modern browsers)
export function initAudioContext() {
  if (!audioContext && typeof window !== 'undefined') {
    try {
      audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }
  return audioContext;
}

// Play a beep sound for alerts
export function playAlertSound(type: 'warning' | 'alert' = 'warning') {
  const context = initAudioContext();
  if (!context) return;

  try {
    // Resume context if suspended (required by browser policies)
    if (context.state === 'suspended') {
      context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Different frequencies for different alert types
    const frequency = type === 'alert' ? 800 : 600;
    const duration = type === 'alert' ? 0.3 : 0.2;

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = 'sine';

    // Fade in and out for smoother sound
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);

    // Play multiple beeps for critical alerts
    if (type === 'alert') {
      setTimeout(() => {
        playBeep(context, frequency, 0.2);
      }, 400);
      setTimeout(() => {
        playBeep(context, frequency, 0.2);
      }, 700);
    }
  } catch (error) {
    console.warn('Failed to play alert sound:', error);
  }
}

// Helper function to play a single beep
function playBeep(context: AudioContext, frequency: number, duration: number) {
  try {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  } catch (error) {
    console.warn('Failed to play beep:', error);
  }
}

// Check if sound is supported
export function isSoundSupported(): boolean {
  return typeof window !== 'undefined' && 
         !!(window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
}

// Request audio permission (call on user interaction)
export async function requestAudioPermission(): Promise<boolean> {
  const context = initAudioContext();
  if (!context) return false;

  try {
    if (context.state === 'suspended') {
      await context.resume();
    }
    return context.state === 'running';
  } catch (error) {
    console.warn('Failed to request audio permission:', error);
    return false;
  }
}
