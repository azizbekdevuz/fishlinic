# Fishlinic API Documentation

## Quick Start

### 1. Get the API URL
Ask the data provider for the ngrok URL (e.g., `https://abc123.ngrok.io`)

### 2. Test Connection
```bash
curl https://your-ngrok-url.ngrok.io/mock/status
```

### 3. Get Live Data
```bash
curl https://your-ngrok-url.ngrok.io/live
```

---

## API Endpoints

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/live` | GET | Latest single reading | `GET /live` |
| `/latest?n=10` | GET | Latest N readings | `GET /latest?n=10` |
| `/history?range=24h` | GET | Historical data | `GET /history?range=24h` |
| `/mock/status` | GET | System status | `GET /mock/status` |

---

## Data Format

### Live Data Response
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "pH": 7.18,
  "temp_c": 24.8,
  "do_mg_l": 6.42,
  "fish_health": 78,
  "quality_ai": 8.1,
  "status_ai": "good",
  "system_status": {
    "serial_connected": false,
    "mock_mode": true,
    "socket_connections": 1
  }
}
```

### Field Descriptions
- `timestamp`: ISO timestamp of the reading
- `pH`: Water pH level (0-14)
- `temp_c`: Temperature in Celsius
- `do_mg_l`: Dissolved oxygen in mg/L
- `fish_health`: Fish health percentage (0-100)
- `quality_ai`: AI quality score (1-10)
- `status_ai`: Status ("good", "average", "alert")
- `system_status`: System connection info

---

## JavaScript Examples

### Get Latest Reading
```javascript
async function getLiveData() {
  const response = await fetch('https://your-ngrok-url.ngrok.io/live');
  const data = await response.json();
  return data;
}
```

### Get Recent Readings
```javascript
async function getRecentData(count = 10) {
  const response = await fetch(`https://your-ngrok-url.ngrok.io/latest?n=${count}`);
  const data = await response.json();
  return data;
}
```

### Poll for Updates
```javascript
setInterval(async () => {
  const data = await getLiveData();
  console.log(`pH: ${data.pH}, Temp: ${data.temp_c}°C, Quality: ${data.quality_ai}/10`);
}, 5000); // Every 5 seconds
```

---

## Python Examples

### Get Latest Reading
```python
import requests

def get_live_data():
    response = requests.get('https://your-ngrok-url.ngrok.io/live')
    return response.json()

data = get_live_data()
print(f"pH: {data['pH']}, Temp: {data['temp_c']}°C")
```

### Get Recent Readings
```python
def get_recent_data(count=10):
    response = requests.get(f'https://your-ngrok-url.ngrok.io/latest?n={count}')
    return response.json()

recent_data = get_recent_data(20)
for reading in recent_data:
    print(f"Time: {reading['timestamp']}, pH: {reading['pH']}")
```

---

## Troubleshooting

### No Data Available
```bash
# Check system status
curl https://your-ngrok-url.ngrok.io/mock/status

# Expected response:
{
  "isMockMode": true,
  "hasSerialConnection": false,
  "latestTelemetry": "available"
}
```

### Connection Issues
1. Verify ngrok URL is correct
2. Check if data provider's system is running
3. Try accessing the URL in browser first
4. Click "Continue" on ngrok warning page

---

## Notes
- Data updates every 3 seconds
- Maximum 200 recent readings available
- System automatically switches between mock and real data
- ngrok URLs may change - get updated URL from data provider
