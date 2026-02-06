import cv2
import numpy as np
from sklearn.cluster import KMeans
from pathlib import Path

# Ensure this path is correct relative to your script
CASCADE_PATH = Path("app/utils/haarcascade_frontalface_default.xml")

def detect_skin_tone(image_path: str):
    image = cv2.imread(image_path)

    if image is None:
        return {"error": "Image not readable"}

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(str(CASCADE_PATH))
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return {"error": "No face detected"}

    # Take first detected face
    (x, y, w, h) = faces[0]
    face = image[y:y+h, x:x+w]

    # Convert BGR to RGB
    face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)

    # Resize for faster processing
    face = cv2.resize(face, (200, 200))

    pixels = face.reshape((-1, 3))

    kmeans = KMeans(n_clusters=3, random_state=42, n_init="auto")
    kmeans.fit(pixels)

    counts = np.bincount(kmeans.labels_)
    dominant_color = kmeans.cluster_centers_[np.argmax(counts)]

    r = int(dominant_color[0])
    g = int(dominant_color[1])
    b = int(dominant_color[2])

    avg_brightness = (r + g + b) / 3

    # Depth classification
    if avg_brightness > 200:
        depth = "Fair"
    elif avg_brightness > 160:
        depth = "Light"
    elif avg_brightness > 120:
        depth = "Medium"
    elif avg_brightness > 80:
        depth = "Tan"
    else:
        depth = "Deep"

    # Undertone detection
    if r > b + 15:
        undertone = "Warm"
    elif b > r + 15:
        undertone = "Cool"
    else:
        undertone = "Neutral"

    return {
        "rgb": {"r": r, "g": g, "b": b},
        "depth": depth,
        "undertone": undertone
    }