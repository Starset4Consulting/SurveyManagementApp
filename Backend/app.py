from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Initialize the database
def init_db():
    conn = sqlite3.connect('surveyapp.db')
    conn.execute('''CREATE TABLE IF NOT EXISTS users
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phone_number TEXT,
                    username TEXT UNIQUE,
                    password TEXT)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS surveys
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    questions TEXT)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS survey_responses
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    survey_id INTEGER,
                    responses TEXT,
                    location TEXT,
                    voice_recording_path TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (survey_id) REFERENCES surveys(id))''')

    # Insert a default user if not present (no role needed)
    conn.execute("INSERT OR IGNORE INTO users (phone_number, username, password) VALUES (?, ?, ?)", 
                 ("0000000000", "Admin", "password@123"))  # Keeping an admin for testing
    conn.commit()
    conn.close()

# Register a new user
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    phone_number = data['phoneNumber']
    username = data['username']
    password = data['password']

    conn = sqlite3.connect('surveyapp.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        return jsonify({"success": False, "message": "Username already exists."})

    cursor.execute("INSERT INTO users (phone_number, username, password) VALUES (?, ?, ?)", 
                   (phone_number, username, password))
    conn.commit()

    # Fetch the newly created user's ID
    user_id = cursor.lastrowid
    conn.close()

    return jsonify({"success": True, "user_id": user_id, "message": "User registered successfully"})

# Login for users
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    conn = sqlite3.connect('surveyapp.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
    user = cursor.fetchone()

    if user:
        return jsonify({"success": True, "user_id": user[0]})  # Return user_id
    else:
        return jsonify({"success": False, "message": "Invalid credentials"})

# Create a new survey
@app.route('/surveys', methods=['POST'])
def create_survey():
    data = request.json
    name = data['name']
    questions = data['questions']  # Expecting a list of questions with options from frontend

    conn = sqlite3.connect('surveyapp.db')
    cursor = conn.cursor()

    # Store survey name and questions as a string (for simplicity, storing as JSON)
    cursor.execute("INSERT INTO surveys (name, questions) VALUES (?, ?)", (name, str(questions)))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Survey created successfully"})

# User-only: Get a list of all available surveys
@app.route('/surveys', methods=['GET'])
def get_surveys():
    conn = sqlite3.connect('surveyapp.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM surveys")
    surveys = cursor.fetchall()
    survey_list = [{"id": s[0], "name": s[1], "questions": eval(s[2])} for s in surveys]  # Convert questions back to list

    conn.close()
    return jsonify({"surveys": survey_list})

# User-only: Get a specific survey by ID
@app.route('/surveys/<int:survey_id>', methods=['GET'])
def get_survey(survey_id):
    conn = sqlite3.connect('surveyapp.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM surveys WHERE id = ?", (survey_id,))
    survey = cursor.fetchone()

    if survey:
        return jsonify({
            "id": survey[0],
            "name": survey[1],
            "questions": eval(survey[2])  # Convert questions back to list
        })
    else:
        return jsonify({"error": "Survey not found"}), 404

# User-only: Submit survey responses
@app.route('/submit_survey', methods=['POST'])
def submit_survey():
    data = request.json
    user_id = data['user_id']
    survey_id = data['survey_id']
    responses = data['responses']  # Should be sent as a list of answers
    location = data.get('location', 'Unknown')  # Optional, defaults to 'Unknown'
    voice_recording_path = data.get('voice_recording_path', '')  # Optional, defaults to empty

    conn = sqlite3.connect('surveyapp.db')
    cursor = conn.cursor()

    cursor.execute("INSERT INTO survey_responses (user_id, survey_id, responses, location, voice_recording_path) VALUES (?, ?, ?, ?, ?)", 
                   (user_id, survey_id, str(responses), location, voice_recording_path))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Survey response submitted successfully"})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
