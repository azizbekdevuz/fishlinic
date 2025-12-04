#include <DS18B20.h>
#include <OneWire.h>
#include <Servo.h>

// --- Pins & hardware config ---
const int ONE_WIRE_PIN     = 2;
const int SERVO_PIN        = 9;

// --- Temperature sensor config ---
OneWire  ds(ONE_WIRE_PIN);
DS18B20  ds1(ONE_WIRE_PIN);
uint8_t  selected;  // Non-zero if sensor is selected

// --- Servo config ---
Servo myservo;
const int SERVO_MIN_ANGLE = 0;
const int SERVO_MAX_ANGLE = 180;   // Target max position (full rotation range)

// --- Timing for periodic tasks ---
unsigned long previousTempMillis = 0;
const unsigned long tempInterval = 1000;  // Send temperature every second

// --- Serial command buffer ---
String inputBuffer = "";

// --- Feeding state machine ---
bool          feeding            = false;  // Are we in a feeding sequence?
int           feedCyclesRemaining = 0;     // Number of full 0→180→0 cycles left
unsigned long cycleStartTime     = 0;      // Timestamp of current half-cycle
bool          servoAtMax         = false;  // true = at SERVO_MAX_ANGLE, false = at SERVO_MIN_ANGLE

// NOTE: Increased from 500ms to 1000ms to allow the servo to actually reach
// the intended angle before being driven back.
const unsigned long HALF_CYCLE_MS = 1000;  // 1 second each way = 2 seconds per full cycle

// -----------------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------------
void setup() 
{
  Serial.begin(9600);
  
  // Initialize temperature sensor
  ds.reset_search();
  byte addr[8];
  if (ds.search(addr))
  {
    selected = ds1.select(addr);
    if (selected) 
    {
      Serial.println("{\"status\":\"temp_sensor_ready\"}");
    } 
    else 
    {
      Serial.println("{\"status\":\"temp_sensor_not_found\"}");
    }
  } 
  else 
  {
    Serial.println("{\"status\":\"temp_sensor_not_found\"}");
  }

  // Initialize servo at home (0°) position
  myservo.attach(SERVO_PIN);
  myservo.write(SERVO_MIN_ANGLE);
  
  Serial.println("{\"status\":\"secondary_ready\"}");
}

// -----------------------------------------------------------------------------
// Command processing
// -----------------------------------------------------------------------------
void processCommand(String cmd) {
  // Expected JSON: {"cmd":"feed","duration":2}
  cmd.trim();

  // If we are already feeding, ignore new feed commands to avoid overlapping cycles
  if (feeding) {
    Serial.println("{\"error\":\"already_feeding\"}");
    return;
  }

  // Very simple JSON detection and matching
  if (cmd.startsWith("{") && cmd.indexOf("\"cmd\"") > 0 && cmd.indexOf("\"feed\"") > 0) {
    // Extract "duration" value (number of cycles / seconds)
    int durationIdx = cmd.indexOf("\"duration\"");
    int cycles = 1;  // Default to 1 cycle if not provided

    if (durationIdx > 0) {
      int colonIdx = cmd.indexOf(":", durationIdx);
      int endIdx   = cmd.indexOf("}", colonIdx);
      if (colonIdx > 0 && endIdx > colonIdx) {
        String durationStr = cmd.substring(colonIdx + 1, endIdx);
        durationStr.trim();
        cycles = durationStr.toInt();
      }
    }

    // Validate duration: only allow 1–5 cycles
    if (cycles >= 1 && cycles <= 5) {
      // Start feeding sequence
      feeding             = true;
      feedCyclesRemaining = cycles;
      cycleStartTime      = millis();
      servoAtMax          = false;

      // First move: from current position (assumed 0° at rest) to 180°
      myservo.write(SERVO_MAX_ANGLE);
      servoAtMax = true;

      // Send acknowledgment
      Serial.print("{\"ack\":\"feed_start\",\"cycles\":");
      Serial.print(cycles);
      Serial.println("}");
    } 
    else 
    {
      Serial.println("{\"error\":\"invalid_duration\",\"allowed\":\"1-5\"}");
    }
  }
}

// -----------------------------------------------------------------------------
// Feeding state handler: drives the servo according to HALF_CYCLE_MS timing
// -----------------------------------------------------------------------------
void handleFeeding() {
  if (!feeding) return;

  unsigned long now     = millis();
  unsigned long elapsed = now - cycleStartTime;

  if (servoAtMax) {
    // Servo is at SERVO_MAX_ANGLE; after HALF_CYCLE_MS, send it back to SERVO_MIN_ANGLE
    if (elapsed >= HALF_CYCLE_MS) {
      myservo.write(SERVO_MIN_ANGLE);
      servoAtMax     = false;
      cycleStartTime = now;
    }
  } 
  else {
    // Servo is at SERVO_MIN_ANGLE; after HALF_CYCLE_MS, check if more cycles remain
    if (elapsed >= HALF_CYCLE_MS) {
      feedCyclesRemaining--;

      if (feedCyclesRemaining > 0) {
        // Start the next cycle: move towards SERVO_MAX_ANGLE again
        myservo.write(SERVO_MAX_ANGLE);
        servoAtMax     = true;
        cycleStartTime = now;
      } 
      else {
        // All cycles complete: ensure servo is at home position and stop feeding
        feeding = false;
        myservo.write(SERVO_MIN_ANGLE);
        Serial.println("{\"ack\":\"feed_complete\"}");
      }
    }
  }
}

// -----------------------------------------------------------------------------
// Main loop
// -----------------------------------------------------------------------------
void loop() 
{
  unsigned long currentMillis = millis();

  // --- Read serial commands ---
  while (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '\n' || c == '\r') {
      if (inputBuffer.length() > 0) {
        processCommand(inputBuffer);
        inputBuffer = "";
      }
    } 
    else {
      inputBuffer += c;

      // Prevent buffer overflow from garbage input
      if (inputBuffer.length() > 200) {
        inputBuffer = "";
      }
    }
  }

  // --- Handle ongoing feeding ---
  handleFeeding();

  // --- Send temperature data periodically ---
  if (currentMillis - previousTempMillis >= tempInterval) {
    previousTempMillis = currentMillis;
    
    if (selected) 
    {
      float temp = ds1.getTempC();
      
      Serial.print("{\"temp_c\":");
      if (isnan(temp) || temp < -50 || temp > 100) {
        Serial.print("null");
      } else {
        Serial.print(temp, 2);
      }
      Serial.print(",\"feeding\":");
      Serial.print(feeding ? "true" : "false");
      Serial.println("}");
    } 
    else 
    {
      Serial.println("{\"temp_c\":null,\"feeding\":false,\"error\":\"no_sensor\"}");
    }
  }
}
