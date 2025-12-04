#include <DS18B20.h>
#include <OneWire.h>
#include <Servo.h>

unsigned long previousMillis = 0;
const long timeInterval = 5000;
OneWire ds(2);
DS18B20 ds1(2);

uint8_t selected;

Servo myservo;

int pos = 0;

void setup() 
{
  Serial.begin(9600);
  Serial.println("Start scan...");
  ds.reset_search();

  byte addr[8];
  if (ds.search(addr))
  {
    Serial.println("Found temp sensor!");
    selected = ds1.select(addr);
    if (selected) 
    {
      Serial.println("Sensor detected!");
    } else 
    {
      Serial.println("Device not found!");
    }
  }

  myservo.attach(9);
}

void loop() 
{
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= timeInterval) {
    previousMillis = currentMillis;
    
    if (pos == 0)
      pos = 180;
    else
      pos = 0;

    myservo.write(pos);
  }

  if (selected) 
  {
    float temp = ds1.getTempC();
    Serial.print("Temperature: ");
    Serial.print(temp);
    Serial.println(" C");
  }
}