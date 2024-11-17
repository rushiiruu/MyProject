from flask import Flask, request, jsonify
import cv2
import numpy as np
import pytesseract
import csv

app = Flask(__name__)

def load_medicine_data():
    medicines = []
    with open('Medicine_Details.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            medicines.append(row)
    return medicines

medicines_db = load_medicine_data()

def preprocess_image(image):
    """
    Preprocess the image for better OCR results
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Using Otsu's thresholding for better binarization
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    # Morphological operations to clean up the image
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    gray = cv2.dilate(gray, kernel, iterations=1)
    gray = cv2.medianBlur(gray, 3)
    return gray

def search_medicines(text):
    """
    Search for medicines in the database based on OCR text
    """
    matches = []
    words = text.lower().split()
    
    for medicine in medicines_db:
        medicine_name = medicine['Medicine Name'].lower()
        if any(word in medicine_name for word in words):
            matches.append({
                'id': medicine.get('ID', ''),
                'name': medicine['Medicine Name'],
                'description': medicine.get('Uses', '').split('.')[0],
                'type': get_medicine_type(medicine_name)
            })
    return matches

def get_medicine_type(medicine_name):
    """
    Determine medicine type based on name
    """
    medicine_name = medicine_name.lower()
    if 'tablet' in medicine_name:
        return 'Tablet'
    elif 'liquid' in medicine_name:
        return 'Liquid'
    elif 'cream' in medicine_name:
        return 'Cream'
    return 'Medicine'

@app.route('/scan-medicine', methods=['POST'])
def scan_medicine():
    """
    Endpoint to scan medicine from image and return matches
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        # Read and decode image
        image_file = request.files['image']
        image_bytes = image_file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Process image and perform OCR
        processed_image = preprocess_image(image)
        text = pytesseract.image_to_string(processed_image)
        
        # Search for matches
        matches = search_medicines(text)
        
        if matches:
            return jsonify({'medicines': matches})
        else:
            return jsonify({'error': 'No matching medicines found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Processing error: {str(e)}'}), 500

@app.route('/medicine/<medicine_id>', methods=['GET'])
def get_medicine_details(medicine_id):
    """
    Endpoint to get detailed information about a specific medicine
    """
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