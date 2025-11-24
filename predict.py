from flask import Flask, request, jsonify
from PIL import Image
import io
app = Flask(__name__)
@app.route('/predict', methods=['POST'])
def predict():
    f = request.files.get('chart')
    if f:
        img = Image.open(io.BytesIO(f.read()))
        return jsonify({'patterns':[{'name':'Head & Shoulders','confidence':'0.92'}]})
    return jsonify({'error':'no file'}),400
if __name__=='__main__':
    app.run(port=8000)
