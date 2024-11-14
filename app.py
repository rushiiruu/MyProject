from flask import Flask, request, jsonify
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import csv

app = Flask(__name__)

def load_medicine_data():
    medicines = []
    with open('Medicine_Details.csv', 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            medicines.append(row)
    return medicines

medicines_db = load_medicine_data()

def preprocess_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    gray = cv2.dilate(gray, kernel, iterations=1)
    gray = cv2.medianBlur(gray, 3)
    return gray

def search_medicines(text):
    matches = []
    words = text.lower().split()
    
    for medicine in medicines_db:
        medicine_name = medicine['Medicine Name'].lower()
        if any(word in medicine_name for word in words):
            matches.append({
                'id': medicine.get('ID', ''),  # Assuming you have an ID in your CSV
                'name': medicine['Medicine Name'],
                'description': medicine.get('Uses', '').split('.')[0],  # Get first sentence of uses
                'type': 'Tablet' if 'tablet' in medicine_name.lower() else 
                       'Liquid' if 'liquid' in medicine_name.lower() else 
                       'Cream' if 'cream' in medicine_name.lower() else 'Medicine'
            })
    return matches

@app.route('/scan-medicine', methods=['POST'])
def scan_medicine():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        image_bytes = image_file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        processed_image = preprocess_image(image)
        text = pytesseract.image_to_string(processed_image)
        
        matches = search_medicines(text)
        
        if matches:
            return jsonify({'medicines': matches})
        else:
            return jsonify({'error': 'No matching medicines found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/medicine/<medicine_id>', methods=['GET'])
def get_medicine_details(medicine_id):
    for medicine in medicines_db:
        if medicine.get('ID') == medicine_id:
            return jsonify({
                'name': medicine['Medicine Name'],
                'manufacturer': medicine.get('Manufacturer', 'N/A'),
                'uses': medicine['Uses'],
                'sideEffects': medicine['Side_effects'],
                'dosage': medicine.get('Dosage', 'N/A'),
                'warnings': medicine.get('Warnings', 'N/A')
            })
    return jsonify({'error': 'Medicine not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)