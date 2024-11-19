from flask import Flask, request, jsonify
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
import io
import requests

app = Flask(__name__)

# Configure Tesseract path if required
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


@app.route('/process-image', methods=['POST'])
def process_image():
    try:
        data = request.json



        # Check if an image file or URL is provided in the request
        image_url = data.get("image")

        if image_url:
            response = requests.get(image_url)
            if response.status_code != 200:
                return jsonify({'error': 'Unable to fetch image from URL'}), 400
            img = Image.open(io.BytesIO(response.content))

        # Apply image processing
        img = img.convert('L')  # Convert to grayscale
        img = img.filter(ImageFilter.MedianFilter())  # Apply median filter
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2)  # Enhance contrast

        # Perform OCR
        extracted_text = pytesseract.image_to_string(img)

        return jsonify({'text': extracted_text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
