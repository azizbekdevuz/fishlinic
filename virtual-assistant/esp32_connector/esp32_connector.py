import cv2
import time
from ultralytics import YOLO
import ultralytics

CONF_THRESH = 0.3

# Load YOLO11 model
model = YOLO("latest.pt")

# Print model info
print(ultralytics.__version__)

def open_cap():
    cap = cv2.VideoCapture(0)   # change to (1) if using external USB camera
    return cap

cap = open_cap()

if cap.isOpened():
    print("Camera is connected")
else:
    print("Error: Camera not connected")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Cannot receive frame, retrying...")
        time.sleep(1)
        cap.release()
        cap = open_cap()
        continue

    # Resize if too large
    h, w = frame.shape[:2]
    max_dim = 480
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        frame = cv2.resize(frame, (int(w * scale), int(h * scale)))

    # Run inference with YOLO11
    results = model(frame, conf=CONF_THRESH)

    # Draw predictions on the frame (YOLO11 uses .plot())
    annotated_frame = results[0].plot()

    # Display result
    cv2.imshow("YOLO11 from Camera", annotated_frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
