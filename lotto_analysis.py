from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# JSON 파일 경로
RECOMMENDED_PATH = os.path.join(os.path.dirname(__file__), "recommended.json")

@app.route("/backend/recommended.json")
def get_recommendation():
    if os.path.exists(RECOMMENDED_PATH):
        with open(RECOMMENDED_PATH, encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify({"error": "추천번호 파일이 없습니다."}), 404

if __name__ == "__main__":
    app.run(debug=True)
