from pymongo import MongoClient
from bson import ObjectId

class DrowsinessData:
    def __init__(self, user_id, screenshot_path, video_path):
        self.user_id = user_id
        self.screenshot_path = screenshot_path
        self.video_path = video_path

    def save(self):
        db.drowsiness_data.insert_one({
            'user_id': ObjectId(self.user_id),
            'screenshot_path': self.screenshot_path,
            'video_path': self.video_path
        })
