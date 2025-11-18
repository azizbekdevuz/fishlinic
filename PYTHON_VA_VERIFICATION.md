# Python Virtual Assistant - Verification Implementation Guide

## Overview
This document provides the implementation guide for the Python Virtual Assistant to handle QR code verification.

## Architecture

```
Dashboard (Next.js) → Generates Token → Creates QR Code
                              ↓
                    API: GET /api/auth/verification/status?token={token}
                              ↓
VA (Python) → Scans QR → Calls API → Verifies User → Calls Complete API
```

## API Endpoints

### 1. Check Token Status
**Endpoint:** `GET /api/auth/verification/status?token={token}`

**Purpose:** Check if a verification token is valid before completing verification.

**Request:**
```bash
GET http://localhost:3000/api/auth/verification/status?token=550e8400-e29b-41d4-a716-446655440000
```

**Response (Valid Token):**
```json
{
  "valid": true,
  "userId": "clx123abc456",
  "userEmail": "user@example.com",
  "expiresAt": "2024-01-15T10:35:00.000Z",
  "expiresIn": 245
}
```

**Response (Invalid/Expired Token):**
```json
{
  "valid": false,
  "error": "Token expired",
  "expired": true
}
```

### 2. Complete Verification
**Endpoint:** `POST /api/auth/verification/complete`

**Purpose:** Mark the user as verified after scanning the QR code.

**Request:**
```bash
POST http://localhost:3000/api/auth/verification/complete
Content-Type: application/json

{
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "message": "User verified successfully",
  "userId": "clx123abc456"
}
```

**Response (Error):**
```json
{
  "error": "Token not found"
}
```

## Python Implementation

### Required Dependencies
```txt
requests>=2.31.0
qrcode[pil]>=7.4.2
opencv-python>=4.8.0
pyzbar>=0.1.9
Pillow>=10.0.0
```

### Example Implementation

```python
import requests
import cv2
from pyzbar import pyzbar
from typing import Optional, Dict

class VerificationHandler:
    def __init__(self, api_base_url: str = "http://localhost:3000"):
        self.api_base_url = api_base_url
    
    def extract_token_from_url(self, url: str) -> Optional[str]:
        """Extract token from verification URL"""
        try:
            if "token=" in url:
                token = url.split("token=")[1].split("&")[0]
                return token
            return None
        except Exception as e:
            print(f"Error extracting token: {e}")
            return None
    
    def check_verification_status(self, token: str) -> Dict:
        """Check if verification token is valid"""
        try:
            url = f"{self.api_base_url}/api/auth/verification/status"
            params = {"token": token}
            
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            return data
        except requests.exceptions.RequestException as e:
            print(f"Error checking verification status: {e}")
            return {"valid": False, "error": str(e)}
    
    def complete_verification(self, token: str) -> Dict:
        """Complete verification process"""
        try:
            url = f"{self.api_base_url}/api/auth/verification/complete"
            payload = {"token": token}
            
            response = requests.post(url, json=payload, timeout=5)
            response.raise_for_status()
            
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error completing verification: {e}")
            return {"ok": False, "error": str(e)}
    
    def scan_qr_from_camera(self) -> Optional[str]:
        """Scan QR code from camera"""
        cap = cv2.VideoCapture(0)
        print("Scanning for QR code... Press 'q' to quit")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Decode QR codes
            decoded_objects = pyzbar.decode(frame)
            
            for obj in decoded_objects:
                qr_data = obj.data.decode('utf-8')
                cap.release()
                print(f"QR code scanned: {qr_data}")
                return qr_data
            
            # Display frame
            cv2.imshow('QR Scanner', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        return None
    
    def verify_user(self) -> bool:
        """Main verification flow"""
        print("=== User Verification Process ===")
        
        # Step 1: Scan QR code
        print("\n1. Waiting for QR code scan...")
        qr_data = self.scan_qr_from_camera()
        
        if not qr_data:
            print("No QR code detected")
            return False
        
        # Step 2: Extract token
        token = self.extract_token_from_url(qr_data)
        if not token:
            print("Invalid QR code format")
            return False
        
        print(f"Token extracted: {token[:8]}...")
        
        # Step 3: Check token status
        print("\n2. Validating token...")
        status = self.check_verification_status(token)
        
        if not status.get("valid"):
            error = status.get("error", "Unknown error")
            print(f"❌ Verification failed: {error}")
            return False
        
        print(f"✅ Token is valid")
        print(f"   User ID: {status.get('userId')}")
        print(f"   Email: {status.get('userEmail')}")
        print(f"   Expires in: {status.get('expiresIn')} seconds")
        
        # Step 4: Complete verification
        print("\n3. Completing verification...")
        result = self.complete_verification(token)
        
        if result.get("ok"):
            print("✅ User verified successfully!")
            return True
        else:
            error = result.get("error", "Unknown error")
            print(f"❌ Verification completion failed: {error}")
            return False


# Example usage
if __name__ == "__main__":
    handler = VerificationHandler(api_base_url="http://localhost:3000")
    
    # Scan QR from camera and verify
    success = handler.verify_user()
    
    if success:
        print("\n🎉 Verification completed!")
    else:
        print("\n❌ Verification failed")
```

## Security Considerations

1. **Token Format:** Tokens are UUIDs (36 characters) stored in the database
2. **Expiration:** Tokens expire after 5 minutes
3. **One-time Use:** Tokens can only be used once
4. **Rate Limiting:** Status endpoint has rate limiting (10 requests/minute per IP)
5. **Database Verification:** Python VA should verify userId exists in database before completing

## Flow Diagram

```
1. User clicks "Verify Account" on dashboard
   ↓
2. Dashboard generates UUID token, stores in DB with userId
   ↓
3. QR code displayed with URL: /api/auth/verification/status?token={uuid}
   ↓
4. Python VA scans QR code
   ↓
5. Python VA calls GET /api/auth/verification/status?token={uuid}
   ↓
6. API returns userId if token is valid
   ↓
7. Python VA verifies userId exists in database (optional extra check)
   ↓
8. Python VA calls POST /api/auth/verification/complete with token
   ↓
9. API marks user as verified, marks token as used
   ↓
10. Dashboard polls status, detects completion, refreshes session, redirects
```

## Error Handling

- **Invalid Token Format:** Return 400 with error message
- **Token Not Found:** Return 404
- **Token Expired:** Return 400 with expired flag
- **Token Already Used:** Return 400 with used flag
- **Rate Limit Exceeded:** Return 429
- **Network Errors:** Handle with retry logic

## Testing

Test the flow:
1. Generate token from dashboard
2. Scan QR code with Python VA
3. Verify user is marked as verified in database
4. Check dashboard session updates

