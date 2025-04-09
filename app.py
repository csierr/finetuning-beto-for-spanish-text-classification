"""School Subject Detection (Spanish language) Flask App"""

from flask import Flask, render_template, request
from SchoolSubjectDetector.school_subject_detection import ss_detector

app = Flask("School Subject Detector")

@app.route("/subjectDetector")
def subject_detector():
    ''' This code receives the text from the HTML interface and 
        runs subject detection over it using ss_detector()
        function. The output returned shows the predicted class and the
        class probabilities.
    '''
    try:
        text = request.args.get('textToAnalyze')
        resp = ss_detector(text)

        result = { 'predicted_class': resp['predicted_class'],
                'class_probabilities': resp['class_probabilities']}

        result = resp['predicted_class'].encode('utf-8')
        
        return result, 200
    
    except Exception as e:
        return ({'error': str(e)}), 400
    

@app.route("/")
def render_index_page():
    ''' This function initiates the rendering of the main application
        page over the Flask channel
    '''
    return render_template('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
