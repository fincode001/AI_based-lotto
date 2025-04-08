from flask import Flask, jsonify
import random
import json
import os

app = Flask(__name__)

# 추천 번호 생성 함수
def generate_recommendation():
    # 메인 번호 6개 + 보너스 번호 1개 (모두 중복 없이)
    numbers = random.sample(range(1, 46), 7)
    return sorted(numbers[:6]) + [numbers[6]]


# 엔드포인트
@app.route("/recommend", methods=["GET"])
def recommend():
    numbers = generate_recommendation()
    result = {"recommend": numbers}

    # JSON 파일로도 저장
    output_path = os.path.join(os.path.dirname(__file__), 'recommended.json')
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)

