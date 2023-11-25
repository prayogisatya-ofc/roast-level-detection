from django.shortcuts import render
from keras.models import load_model
from keras.preprocessing import image
import numpy as np
import os
from django.conf import settings
import tensorflow_hub as hub
from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse


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
        
        result['level'] = level
        result['status'] = True
        
    return JsonResponse(result)


def detect_maturity_level(image_path):
    custom_objects = {'KerasLayer': hub.KerasLayer}
    model = load_model(os.path.join(settings.BASE_DIR, 'website/model/coffee_model.h5'), custom_objects=custom_objects)

    # Praproses gambar
    img = image.load_img(image_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Lakukan prediksi
    predictions = model.predict(img_array)
    
    print(predictions)
    
    predicted_class = np.argmax(predictions)

    # Ambil tingkat kematangan dengan probabilitas tertinggi
    maturity_levels = ['dark', 'light', 'light-medium', 'medium', 'medium-dark']
    predicted_maturity_level = maturity_levels[predicted_class]

    return predicted_maturity_level