"""School Subject Detection (Spanish language) Flask App"""

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from SchoolSubjectDetector.school_subject_detection import ss_detector
import os

app = Flask("School Subject Detector")
CORS(app) # Allow cross-origin requests from the dev frontend (Vite) on localhost

@app.route("/subjectDetector", methods=["GET", "POST"])
def subject_detector():
    """
    Endpoint to detect school subject from input text.

    Accepts either GET with query param `textToAnalyze` or POST with JSON body {"textToAnalyze": "..."}.
    """
    try:
        if request.method == "POST":
            payload = request.get_json(silent=True) or {}
            text = payload.get("textToAnalyze")

        else:
            text = request.args.get('textToAnalyze')

        if not text:
            return jsonify({"error": "Missing 'textToAnalyze' parameter"}), 400

        resp = ss_detector(text)

        return jsonify(resp), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route("/")
def render_index_page():
    """
    Endpoint to serve the index.html page. 
    The project has an `index.html` file at the repository root used by Vite.
    """
    repo_root  = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(repo_root, "../index.html")
    index_path = os.path.abspath(index_path)

    if os.path.exists(index_path):
        return send_from_directory(os.path.dirname(index_path), os.path.basename(index_path))
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
