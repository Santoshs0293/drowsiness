import cv2
import dlib
import numpy as np
import imutils
import time
from imutils.video import VideoStream
from imutils import face_utils
import pika
import json
import argparse
import base64
import datetime
import pytz

def euclidean_dist(ptA, ptB):
    return np.linalg.norm(ptA - ptB)

def eye_aspect_ratio(eye):
    A = euclidean_dist(eye[1], eye[5])
    B = euclidean_dist(eye[2], eye[4])
    C = euclidean_dist(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

ap = argparse.ArgumentParser()
ap.add_argument("-c", "--cascade", required=True, help="path to where the face cascade resides")
ap.add_argument("-p", "--shape-predictor", required=True, help="path to facial landmark predictor")
ap.add_argument("-a", "--alarm", type=int, default=0, help="boolean used to indicate if TraffHat should be used")
ap.add_argument("-u", "--user-id", required=True, help="user ID")
ap.add_argument("-v", "--vehicle-number", required=True, help="vehicle number")
args = vars(ap.parse_args())

if args["alarm"] > 0:
    from gpiozero import TrafficHat
    th = TrafficHat()
    print("[INFO] using TrafficHat alarm...")

EYE_AR_THRESH = 0.3
EYE_AR_CONSEC_FRAMES = 16
COUNTER = 0
ALARM_ON = False
last_detection_time = 0
DETECTION_INTERVAL = 30  # seconds
eye_closed_start_time = None

print("[INFO] loading facial landmark predictor...")
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(args["shape_predictor"])

(lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

print("[INFO] starting video stream thread...")
vs = VideoStream(src=0).start()
time.sleep(1.0)

def send_detection(image, user_id, vehicle_number):
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='drowsiness_queue')

    _, buffer = cv2.imencode('.jpg', image)
    jpg_as_text = base64.b64encode(buffer).decode()

    ist = pytz.timezone('Asia/Kolkata')
    timestamp = datetime.datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S')

    detection = {
        "user_id": user_id,
        "vehicle_number": vehicle_number,
        "image": jpg_as_text,
        "timestamp": timestamp
    }

    channel.basic_publish(exchange='', routing_key='drowsiness_queue', body=json.dumps(detection))
    connection.close()

while True:
    frame = vs.read()
    frame = imutils.resize(frame, width=450)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rects = detector(gray, 0)

    for rect in rects:
        shape = predictor(gray, rect)
        shape = face_utils.shape_to_np(shape)

        leftEye = shape[lStart:lEnd]
        rightEye = shape[rStart:rEnd]
        leftEAR = eye_aspect_ratio(leftEye)
        rightEAR = eye_aspect_ratio(rightEye)
        ear = (leftEAR + rightEAR) / 2.0

        leftEyeHull = cv2.convexHull(leftEye)
        rightEyeHull = cv2.convexHull(rightEye)
        cv2.drawContours(frame, [leftEyeHull], -1, (0, 255, 0), 1)
        cv2.drawContours(frame, [rightEyeHull], -1, (0, 255, 0), 1)

        if ear < EYE_AR_THRESH:
            COUNTER += 1
            if eye_closed_start_time is None:
                eye_closed_start_time = time.time()
            if COUNTER >= EYE_AR_CONSEC_FRAMES:
                current_time = time.time()
                if not ALARM_ON:
                    ALARM_ON = True
                    if args["alarm"] > 0:
                        th.buzzer.blink(0.1, 0.1, 10, background=True)

                cv2.putText(frame, "DROWSINESS ALERT!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

                if current_time - last_detection_time > DETECTION_INTERVAL:
                    send_detection(frame, args["user_id"], args["vehicle_number"])
                    last_detection_time = current_time
        else:
            COUNTER = 0
            eye_closed_start_time = None
            ALARM_ON = False

        if eye_closed_start_time and (time.time() - eye_closed_start_time) >= 30:
            send_detection(frame, args["user_id"], args["vehicle_number"])
            eye_closed_start_time = None

        cv2.putText(frame, "EAR: {:.3f}".format(ear), (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    cv2.imshow("Frame", frame)
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break

cv2.destroyAllWindows()
vs.stop()
