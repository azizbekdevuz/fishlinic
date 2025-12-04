// =============================================================================
// Main Arduino: pH Sensor, DO Sensor, RTC Module
// Temperature comes from Secondary Arduino (not handled here)
// =============================================================================

#include <Wire.h>
#include "RTClib.h"

// --- pH config (per DFRobot sample: pH = 3.5 * V + Offset) ---
#define PH_ARRAY_LEN 40
#define PH_SAMPLING_INTERVAL_MS 20
#define PH_PRINT_INTERVAL_MS 1000

float PH_OFFSET = 0.00f;  // <-- adjust after calibration with 7.00 buffer
const int PH_PIN = A0;

// --- DO sensor config ---
const int DO_PIN = A1;

// --- DO calibration ---
// Replace slope/intercept after you calibrate DO sensor at known points.
const bool DO_ENABLE_LINEAR = true;  // must be true to output mg/L
float DO_SLOPE = 0.0025f;     // example slope (mg/L per mV) 
float DO_INTERCEPT = 0.0f;    // example intercept

// --- ADC / Vref assumptions for UNO ---
const float VREF_MV = 5000.0f;  // UNO 5V (mV)
const float ADC_RES = 1024.0f;  // 10-bit

// pH averaging buffer & helpers
int   phArray[PH_ARRAY_LEN];
int   phIdx = 0;
unsigned long phSampleAt = 0;
unsigned long lastPrintAt = 0;

// RTC module
RTC_DS1307 RTC;
bool rtcAvailable = false;

// -----------------------------------------------------------------------------
// Helper: Average array with min/max dropped for noise reduction
// -----------------------------------------------------------------------------
double avgArray_dropMinMax(int* arr, int n) {
  if (n <= 0) return 0.0;
  if (n < 5) {
    long sum = 0; 
    for (int i = 0; i < n; i++) sum += arr[i];
    return (double)sum / n;
  }
  int minV = arr[0], maxV = arr[1];
  if (minV > maxV) { int t = minV; minV = maxV; maxV = t; }
  long sum = 0;
  for (int i = 2; i < n; i++) {
    int v = arr[i];
    if (v < minV) { sum += minV; minV = v; }
    else if (v > maxV) { sum += maxV; maxV = v; }
    else { sum += v; }
  }
  return (double)sum / (n - 2);
}

// -----------------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(9600);
  Wire.begin();
  
  // Initialize RTC
  if (RTC.begin()) {
    rtcAvailable = true;
    if (!RTC.isrunning()) {
      // Set RTC to compile time if not running
      RTC.adjust(DateTime(__DATE__, __TIME__));
    }
  }

  // Pre-fill pH buffer with initial reading
  int seed = analogRead(PH_PIN);
  for (int i = 0; i < PH_ARRAY_LEN; i++) phArray[i] = seed;
  phSampleAt = millis();
  lastPrintAt = millis();
  
  // Startup message
  Serial.println("{\"status\":\"main_ready\",\"rtc\":" + String(rtcAvailable ? "true" : "false") + "}");
}

// -----------------------------------------------------------------------------
// Main Loop
// -----------------------------------------------------------------------------
void loop() {
  unsigned long now = millis();

  // --- pH sampling (every 20 ms for averaging) ---
  if (now - phSampleAt >= PH_SAMPLING_INTERVAL_MS) {
    phArray[phIdx++] = analogRead(PH_PIN);
    if (phIdx == PH_ARRAY_LEN) phIdx = 0;
    phSampleAt = now;
  }

  // --- Output JSON once per second ---
  if (now - lastPrintAt >= PH_PRINT_INTERVAL_MS) {
    lastPrintAt = now;
    
    // Calculate pH from averaged ADC readings
    double phAdcAvg = avgArray_dropMinMax(phArray, PH_ARRAY_LEN);
    double phVolt   = phAdcAvg * (5.0 / ADC_RES);
    double pH       = 3.5 * phVolt + PH_OFFSET;

    // Calculate DO from ADC reading
    uint16_t doRaw  = analogRead(DO_PIN);
    double   do_mV  = (doRaw * VREF_MV) / ADC_RES;
    double   do_mgL = DO_ENABLE_LINEAR ? (DO_SLOPE * do_mV + DO_INTERCEPT) : -1.0;

    // Build JSON output
    // Note: temp_c is NOT included - it comes from Secondary Arduino
    Serial.print("{\"pH\":");
    Serial.print(pH, 2);
    Serial.print(",\"do_mg_l\":");
    Serial.print(do_mgL, 2);
    
    // Include RTC timestamp if available
    if (rtcAvailable) {
      DateTime rtcNow = RTC.now();
      Serial.print(",\"rtc\":\"");
      Serial.print(rtcNow.year());
      Serial.print("-");
      if (rtcNow.month() < 10) Serial.print("0");
      Serial.print(rtcNow.month());
      Serial.print("-");
      if (rtcNow.day() < 10) Serial.print("0");
      Serial.print(rtcNow.day());
      Serial.print("T");
      if (rtcNow.hour() < 10) Serial.print("0");
      Serial.print(rtcNow.hour());
      Serial.print(":");
      if (rtcNow.minute() < 10) Serial.print("0");
      Serial.print(rtcNow.minute());
      Serial.print(":");
      if (rtcNow.second() < 10) Serial.print("0");
      Serial.print(rtcNow.second());
      Serial.print("\"");
    }
    
    Serial.println("}");
  }
}
