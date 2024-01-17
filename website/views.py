from django.shortcuts import render
from keras.models import load_model
from keras.preprocessing import image
import numpy as np
import os
from django.conf import settings
import tensorflow_hub as hub
from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse
import tensorflow as tf


@require_GET
def views(request):
    return render(request, 'index.html')
        

@require_POST
def detection(request):
    result = {'status': False}
    
    image = request.FILES.get('image')
    
    if image:
        temp_path = os.path.join(settings.MEDIA_ROOT, 'temp', image.name)
        with open(temp_path, 'wb') as temp_file:
            for chunk in image.chunks():
                temp_file.write(chunk)
        
        level = detect_maturity_level(temp_path)
        
        os.remove(temp_path)
        
        result['results'] = level
        result['status'] = True
        
    return JsonResponse(result)


def detect_maturity_level(image_path):
    model = os.path.join(settings.BASE_DIR, 'website/model/coffee_model.tflite')
    interpreter = tf.lite.Interpreter(model_path=model)
    interpreter.allocate_tensors()

    # Praproses gambar
    img = image.load_img(image_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    # Set input tensor
    input_tensor_index = interpreter.get_input_details()[0]['index']
    interpreter.set_tensor(input_tensor_index, img_array)
    
    # Run inference
    interpreter.invoke()
    
    # Get the output tensor
    output_tensor_index = interpreter.get_output_details()[0]['index']
    predictions = interpreter.get_tensor(output_tensor_index)
    
    predicted_class = np.argmax(predictions)

    # Ambil tingkat kematangan dengan probabilitas tertinggi
    maturity_levels = ['dark', 'light', 'light-medium', 'medium', 'medium-dark']
    predicted_maturity_level = maturity_levels[predicted_class]

    responses = {
        "predictions": [
            {
                "type": "light",
                "value": str(round(predictions[0][1] * 100, 2))
            },
            {
                "type": "light-medium",
                "value": str(round(predictions[0][2] * 100, 2))
            },
            {
                "type": "medium",
                "value": str(round(predictions[0][3] * 100, 2))
            },
            {
                "type": "medium-dark",
                "value": str(round(predictions[0][4] * 100, 2))
            },
            {
                "type": "dark",
                "value": str(round(predictions[0][0] * 100, 2))
            },
        ],
        "level": predicted_maturity_level
    }

    return responses