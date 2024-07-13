from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from config import Config
from utils import role_required

client = MongoClient(Config.MONGO_URI)
db = client['drowsiness_detection']

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('user')
def user_dashboard():
def get_profile():
    user_id = get_jwt_identity()
    user_collection = db['users']
    user = user_collection.find_one({'_id': user_id})
    if user:
        return jsonify({
            'name': user['name'],
            'email': user['email']
        }), 200
    else:
        return jsonify({"message": "User not found"}), 404
