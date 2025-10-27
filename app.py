"""School Subject Detection (Spanish language) Flask App"""

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from SchoolSubjectDetector.school_subject_detection import ss_detector
import os

app = Flask("School Subject Detector")
# Allow cross-origin requests from the dev frontend (Vite) on localhost
CORS(app)


@app.route("/subjectDetector", methods=["GET", "POST"])
def subject_detector():
    """
    Receive text, run subject detection and return JSON result.

    Accepts either GET with query param `textToAnalyze` or POST with JSON body {"textToAnalyze": "..."}.
    """
    try:
        # prefer JSON body for POST, fallback to query param
        if request.method == "POST":
            payload = request.get_json(silent=True) or {}
            text = payload.get("textToAnalyze")
        else:
            text = request.args.get('textToAnalyze')

        if not text:
            return jsonify({"error": "Missing 'textToAnalyze' parameter"}), 400

        resp = ss_detector(text)
        # resp is already a dict: {predicted_class, class_probabilities}
        return jsonify(resp), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route("/")
def render_index_page():
    """
    Serve the frontend index.html.

    When running the SPA dev server (Vite) you usually run frontend separately. 
    For simple deployments or quick tests we also serve the `index.html` located at the repository root.
    """
    repo_root = os.path.dirname(os.path.abspath(__file__))
    # The project has an `index.html` at the repository root used by Vite.
    # Try to serve it if present; otherwise render a simple message.
    index_path = os.path.join(repo_root, "../index.html")
    index_path = os.path.abspath(index_path)
    if os.path.exists(index_path):
        return send_from_directory(os.path.dirname(index_path), os.path.basename(index_path))
    return render_template('index.html')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
