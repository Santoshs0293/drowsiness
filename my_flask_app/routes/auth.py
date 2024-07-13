# routes/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = generate_password_hash(data.get('password'))
    role = data.get('role', 'user')  # Default role is 'user' if not provided

    user_collection = db['users']
    user_collection.insert_one({
        'name': name,
        'email': email,
        'password': password,
        'role': role
    })

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user_collection = db['users']
    user = user_collection.find_one({'email': email})

    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "User logged out successfully"}), 200

@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user_collection = db['users']
    user = user_collection.find_one({'_id': ObjectId(user_id)})
    if user:
        return jsonify({
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }), 200
    else:
        return jsonify({"message": "User not found"}), 404
