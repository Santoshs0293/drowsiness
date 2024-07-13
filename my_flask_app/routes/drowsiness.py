from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

drowsiness_bp = Blueprint('drowsiness', __name__)

@drowsiness_bp.route('/start', methods=['GET'])
@jwt_required()
def start_drowsiness_detection():
    try:
        # Replace this with your actual drowsiness detection logic
        # For testing purposes, just return a success message
        current_user_id = get_jwt_identity()
        
        # Perform drowsiness detection logic here
        # Example: Save detection start status to the database
        db['drowsiness_status'].insert_one({
            'user_id': current_user_id,
            'status': 'started'
        })

        return jsonify({"message": "Drowsiness detection started"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to start drowsiness detection: {str(e)}"}), 500

@drowsiness_bp.route('/stop', methods=['GET'])
@jwt_required()
def stop_drowsiness_detection():
    try:
        # Replace this with your actual drowsiness detection stop logic
        # For testing purposes, just return a success message
        current_user_id = get_jwt_identity()
        
        # Perform drowsiness detection stop logic here
        # Example: Update detection status in the database
        db['drowsiness_status'].update_one(
            {'user_id': current_user_id},
            {'$set': {'status': 'stopped'}}
        )

        return jsonify({"message": "Drowsiness detection stopped"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to stop drowsiness detection: {str(e)}"}), 500
