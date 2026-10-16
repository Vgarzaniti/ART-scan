# Reconocimiento Visual y Modos de Escaneo AR

ART-scan implementa una arquitectura híbrida de detección diseñada para adaptarse a cualquier contexto operativo en la Industria 4.0:

```
                                  +---------------------------------------+
                                  |     CÁMARA DEL CELULAR / WEBRTC       |
                                  +---------------------------------------+
                                                     |
                    +--------------------------------+--------------------------------+
                    |                                |                                |
                    v                                v                                v
       +-------------------------+      +-------------------------+      +-------------------------+
       |   MODO 1: FOTO REAL     |      |    MODO 2: CÓDIGO QR    |      |       MODO 3: IA        |
       | (Comparación de imagen) |      | (Estándar de planta)    |      | (Red Neuronal MobileNet)|
       +-------------------------+      +-------------------------+      +-------------------------+
                    |                                |                                |
      Compara contra banco de 12        Decodificación milimétrica       Clasificación semántica
      fotos reales del usuario          de etiquetas industriales        en WebGL local
                    |                                |                                |
                    +--------------------------------+--------------------------------+
                                                     |
                                                     v
                                  +---------------------------------------+
                                  |      TARJETA HUD AR INTERACTIVA       |
                                  |  - Stock en tiempo real               |
                                  |  - Precio unitario                    |
                                  |  - Ubicación física (Pasillo/Estante) |
                                  |  - Feedback háptico (vibración)       |
                                  +---------------------------------------+
```

---

## 1. Modo 1: Foto Real (Image Matching)

### ¿Cómo funciona?
- En `public/targets/` se almacena el banco de imágenes de referencia capturadas de los artículos físicos reales (calculadora, joystick, auriculares, cargador).
- Cada imagen es precalibrada generando una firma binaria de gradientes de luminancia (32x32 bits).
- Cuando el usuario enfoca un objeto en la retícula, la cámara compara cuadro a cuadro (450ms) la similitud matemática.
- Al superar el umbral de concordancia (>=68%), se activa la tarjeta flotante con la ficha del inventario.

---

## 2. Modo 2: Código QR (Instantáneo / Cero Error)

### ¿Cómo funciona?
- El servidor Node.js genera códigos QR vectoriales dinámicos para cada artículo mediante el endpoint `/api/qr/:codigo`.
- Los códigos pueden imprimirse directamente desde `/qrs.html` o escanearse de pantalla.
- La biblioteca `html5-qrcode` decodifica la URL o código unívoco en menos de 100ms.
- Es el método recomendado para almacenes con iluminación variable o piezas metálicas sin textura reconocible.

---

## 3. Modo 3: IA MobileNet (TensorFlow.js)

### ¿Cómo funciona?
- Ejecuta una red neuronal convolucional MobileNet v2 en el navegador del cliente mediante WebGL/WebGPU.
- Clasifica el video en 1.000 clases preentrenadas de ImageNet (ejemplo: `joystick`, `calculator`, `headphones`, `power_cord`).
- Si la confianza de la predicción supera el 25% y coincide con el catálogo del Excel, proyecta la información del artículo.

---

## 4. Herramienta de Calibración
Disponible en `/calibrador.html`:
Permite inspeccionar cómo la red neuronal y los descriptores visuales interpretan cada una de las 12 fotos almacenadas en el banco de datos.
