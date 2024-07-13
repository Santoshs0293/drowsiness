import pika
import json
import base64
from pymongo import MongoClient
import datetime

def save_to_mongodb(detection):
    client = MongoClient('localhost', 27017)
    db = client.drowsiness_detection
    detections = db.detections

    detection_data = {
        "user_id": detection["user_id"],
        "vehicle_number": detection["vehicle_number"],
        "image": base64.b64decode(detection["image"]),
        "timestamp": datetime.datetime.strptime(detection["timestamp"], '%Y-%m-%d %H:%M:%S.%f')
    }

    detections.insert_one(detection_data)
    client.close()

def callback(ch, method, properties, body):
    detection = json.loads(body)
    save_to_mongodb(detection)
    print(f" [x] Received {detection}")

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='drowsiness_queue')

channel.basic_consume(queue='drowsiness_queue', on_message_callback=callback, auto_ack=True)
print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
