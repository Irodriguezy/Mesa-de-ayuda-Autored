from flask import Flask, request, jsonify, render_template
import json
import requests

app = Flask(__name__)

# Configuración para la API de WhatsApp
ACCESS_TOKEN = "TU_ACCESS_TOKEN_DE_META"
PHONE_NUMBER_ID = "TU_PHONE_NUMBER_ID"

# Cargar preguntas desde JSON
with open('preguntas.json', encoding='utf-8') as f:
    questions_data = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '').strip()
    category = request.json.get('category', 'inicio')
    phone_number = request.json.get('from', '')
    
    response = process_message(user_message, category)

    # Enviar respuesta al usuario vía WhatsApp
    if phone_number:
        enviar_respuesta(phone_number, response["response"])

    return jsonify(response)

def process_message(user_message, current_category):
    category_data = questions_data.get('categorias', {}).get(current_category, {})
    if not category_data:
        return {"response": "Lo siento, no entiendo tu mensaje.", "options": []}

    # Verificar si el mensaje coincide con alguna pregunta predefinida
    for option in category_data.get('opciones', []):
        if user_message.lower() in option.get('texto', '').lower():
            next_category = option.get('siguiente_categoria')
            if next_category:
                next_category_data = questions_data['categorias'].get(next_category, {})
                return {
                    "response": next_category_data.get('respuesta', 'Lo siento, no entiendo tu mensaje.'),
                    "options": next_category_data.get('opciones', [])
                }
            return {"response": option.get('accion', 'Lo siento, no entiendo tu mensaje.'), "options": []}

    return {"response": "Lo siento, no entiendo tu mensaje.", "options": []}

def enviar_respuesta(phone_number, mensaje):
    url = f"https://graph.facebook.com/v17.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "text": {"body": mensaje}
    }
    response = requests.post(url, headers=headers, json=payload)
    return response.status_code, response.text

if __name__ == '__main__':
    app.run(debug=True, port=5000)
