from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from pymongo import MongoClient

app = Flask(__name__)
app.config.from_object('config.Config')

CORS(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

client = MongoClient(app.config['MONGO_URI'])
db = client['drowsiness_detection']

from routes.auth import auth_bp
from routes.user import user_bp
from routes.admin import admin_bp
from routes.drowsiness import drowsiness_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(drowsiness_bp, url_prefix='/api/drowsiness')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
