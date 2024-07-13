# utils.py
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from bson.objectid import ObjectId
from app import db

def role_required(role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = db['users'].find_one({'_id': ObjectId(user_id)})
            if user and user.get('role') == role:
                return fn(*args, **kwargs)
            else:
                return jsonify({"message": "Access forbidden: insufficient permissions"}), 403
        return wrapper
    return decorator
