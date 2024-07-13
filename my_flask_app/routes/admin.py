# routes/admin.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from utils import role_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('admin')
def admin_dashboard():
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