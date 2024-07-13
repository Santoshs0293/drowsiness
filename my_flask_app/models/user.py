from pymongo import MongoClient
from bson import ObjectId

class User:
    def __init__(self, username, password, is_admin=False):
        self.username = username
        self.password = password
        self.is_admin = is_admin

    @staticmethod
    def find_by_username(username):
        return db.users.find_one({'username': username})

    @staticmethod
    def find_by_id(user_id):
        return db.users.find_one({'_id': ObjectId(user_id)})

    def save(self):
        db.users.insert_one({
            'username': self.username,
            'password': self.password,
            'is_admin': self.is_admin
        })
