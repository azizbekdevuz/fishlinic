#include<Wire.h>
#include "RTClib.h"

// --- pH config (per DFRobot sample: pH = 3.5 * V + Offset) ---
#define PH_ARRAY_LEN 40
#define PH_SAMPLING_INTERVAL_MS 20
#define PH_PRINT_INTERVAL_MS 1000

float PH_OFFSET = 0.00f;  // <-- adjust after calibration with 7.00 buffer
const int PH_PIN = A0;

const int DO_PIN = A1;

const int SERVO_PIN = 9;

// --- DO calibration ---
// Replace slope/intercept after you calibrate DO sensor at known points.
// If you don't have calibration yet, values will be meaningless.
const bool DO_ENABLE_LINEAR = true;  // must be true to output mg/L
float DO_SLOPE = 0.0025f;     // example slope (mg/L per mV) 
float DO_INTERCEPT = 0.0f;    // example intercept

// --- ADC / Vref assumptions for UNO ---
const float VREF_MV = 5000.0f;  // UNO 5V (mV)
const float ADC_RES = 1024.0f;  // 10-bit

// --- Fixed temperature  ---
const float TEMP_C = 25.0f;

// pH averaging buffer & helpers
int   phArray[PH_ARRAY_LEN];
int   phIdx = 0;
unsigned long phSampleAt = 0;
unsigned long lastPrintAt = 0;

RTC_DS1307 RTC;  // RTC init


double avgArray_dropMinMax(int* arr, int n) {
  if (n <= 0) return 0.0;
  if (n < 5) {
    long sum = 0; for (int i = 0; i < n; i++) sum += arr[i];
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

void setup() {
  Serial.begin(9600);
  Wire.begin();
  RTC.begin();

  // Pre-fill pH buffer
  int seed = analogRead(PH_PIN);
  for (int i = 0; i < PH_ARRAY_LEN; i++) phArray[i] = seed;
  phSampleAt = millis();
  lastPrintAt = millis();

  if (! RTC.isrunning())
  {
    //   Serial.println("RTC is NOT running!");// reflect the time that your sketch was compiled
      RTC.adjust(DateTime(__DATE__, __TIME__));
  }
}

void loop() {
  unsigned long now = millis();

  // --- pH sampling (every 20 ms) ---
  if (now - phSampleAt >= PH_SAMPLING_INTERVAL_MS) {
    phArray[phIdx++] = analogRead(PH_PIN);
    if (phIdx == PH_ARRAY_LEN) phIdx = 0;
    phSampleAt = now;
  }

  // --- print once per second ---
  if (now - lastPrintAt >= PH_PRINT_INTERVAL_MS) {
    // pH
    double phAdcAvg = avgArray_dropMinMax(phArray, PH_ARRAY_LEN);
    double phVolt   = phAdcAvg * (5.0 / ADC_RES);
    double pH       = 3.5 * phVolt + PH_OFFSET;

    // DO
    uint16_t doRaw  = analogRead(DO_PIN);
    double   do_mV  = (doRaw * VREF_MV) / ADC_RES;
    double   do_mgL = DO_ENABLE_LINEAR ? (DO_SLOPE * do_mV + DO_INTERCEPT) : -1.0;

    // RTC
    DateTime now = RTC.now();
    String date = String(now.month()) + "/" + String(now.day()) + "/" + String(now.year()) + " " + String(now.hour()) + ":" + String(now.minute()) + ":" + String(now.second());
    
    Serial.print("{\"pH\":");       Serial.print(pH, 2);
    Serial.print(",\"do_mg_l\":");  Serial.print(do_mgL, 2);
    Serial.print(",\"temp_c\":");   // if no temp sensor, print null
    if (isnan(TEMP_C)) Serial.print("null"); else Serial.print(TEMP_C, 1);
    // Serial.print(",\"rtc\":"); Serial.print(date);
    Serial.println("}");
    
    delay(1000); // 1s
  }
}