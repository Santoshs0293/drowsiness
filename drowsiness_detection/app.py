from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from pymongo import MongoClient
import subprocess
from bson.objectid import ObjectId
import os
import signal
import bcrypt
from datetime import datetime
import pytz
import atexit
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.secret_key = 'supersecretkey'
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

client = MongoClient('localhost', 27017)
db = client.drowsiness_detection
users = db.users
logs = db.logs  # Collection to store login/logout times

processes = {}  # Dictionary to keep track of processes per user

socketio = SocketIO(app)

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    user_data = users.find_one({"_id": ObjectId(user_id)})
    if user_data:
        return User(str(user_data["_id"]))
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password'].encode('utf-8')
        user = users.find_one({"username": username})
        if user and bcrypt.checkpw(password, user['password']):
            user_obj = User(str(user["_id"]))
            login_user(user_obj)
            ist_now = datetime.now(pytz.timezone('Asia/Kolkata'))
            logs.insert_one({"user_id": user["_id"], "action": "login", "timestamp": ist_now})
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password'].encode('utf-8')
        vehicle_number = request.form['vehicle_number']
        if users.find_one({"username": username}):
            flash('Username already exists')
        else:
            hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
            ist_now = datetime.now(pytz.timezone('Asia/Kolkata'))
            users.insert_one({"username": username, "password": hashed_password, "vehicle_number": vehicle_number, "registration_date": ist_now})
            return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/video_call')
@login_required
def video_call():
    return render_template('video_call.html')

@app.route('/start_camera')
@login_required
def start_camera():
    global processes
    user = users.find_one({"_id": ObjectId(current_user.id)})
    user_id = str(user["_id"])
    if user_id not in processes:
        process = subprocess.Popen(['python3', 'pi_detect_drowsiness.py', '--cascade', 'haarcascade_frontalface_default.xml', '--shape-predictor', 'shape_predictor_68_face_landmarks.dat', '--user-id', user_id, '--vehicle-number', user["vehicle_number"]], preexec_fn=os.setsid)
        processes[user_id] = process.pid
    return redirect(url_for('dashboard'))

@app.route('/stop_camera')
@login_required
def stop_camera():
    global processes
    user_id = str(current_user.id)
    if user_id in processes:
        os.killpg(processes[user_id], signal.SIGTERM)
        del processes[user_id]
    return redirect(url_for('logout_and_redirect'))

@app.route('/logout_and_redirect')
def logout_and_redirect():
    user_id = str(current_user.id)
    ist_now = datetime.now(pytz.timezone('Asia/Kolkata'))
    logs.insert_one({"user_id": ObjectId(user_id), "action": "logout", "timestamp": ist_now})
    logout_user()
    return redirect(url_for('login'))

@app.route('/logout')
@login_required
def logout():
    global processes
    user_id = str(current_user.id)
    if user_id in processes:
        os.killpg(processes[user_id], signal.SIGTERM)
        del processes[user_id]
    ist_now = datetime.now(pytz.timezone('Asia/Kolkata'))
    logs.insert_one({"user_id": ObjectId(user_id), "action": "logout", "timestamp": ist_now})
    logout_user()
    return redirect(url_for('login'))

@socketio.on('offer')
def handle_offer(data):
    emit('offer', data, broadcast=True)

@socketio.on('answer')
def handle_answer(data):
    emit('answer', data, broadcast=True)

@socketio.on('ice-candidate')
def handle_ice_candidate(data):
    emit('ice-candidate', data, broadcast=True)

@socketio.on('endCall')
def handle_end_call():
    emit('endCall', broadcast=True)

def cleanup():
    global processes
    for pid in processes.values():
        os.killpg(pid, signal.SIGTERM)
    processes.clear()

atexit.register(cleanup)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
