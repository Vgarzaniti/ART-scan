# Roadmap: Reconocimiento de Objetos por Visión por Computadora (Sin QR)

El MVP actual utiliza marcadores QR y etiquetas industriales como ancla visual para identificación rápida y unívoca con cero error de lectura.
El siguiente salto evolutivo consiste en **reconocer directamente el objeto o pieza física en 3D** sin requerir etiquetas.

---

## 1. Enfoques Técnicos Evaluados

### Enfoque A: Clasificación / Detección de Objetos con TensorFlow.js (En el Navegador)
- **Cómo funciona**: Se carga un modelo preentrenado (MobileNet o YOLOv8 Nano exportado a TensorFlow.js) que se ejecuta directamente en la GPU del celular (WebGL / WebGPU).
- **Ventajas**:
  - No requiere servidor con GPU dedicada.
  - Privacidad total: las imágenes de la cámara no salen del teléfono.
- **Limitaciones**:
  - Requiere un dataset de entrenamiento con fotos de cada pieza física desde múltiples ángulos y condiciones de luz.

### Enfoque B: Backend de Inferencia de Visión (YOLOv10 / PyTorch en Servidor)
- **Cómo funciona**: La cámara del celular envía cuadros (snapshots) periódicos a una API de inferencia en Python (FastAPI + YOLO).
- **Ventajas**:
  - Admite modelos más pesados y precisos.
  - Capaz de segmentar piezas mecánicas complejas (ej. diferenciar un tornillo M6 de un M8).
- **Limitaciones**:
  - Depende del ancho de banda y latencia de red en planta.

### Enfoque C: Anclas Espaciales WebXR (Markerless AR)
- **Cómo funciona**: Mediante la API WebXR de navegadores modernos (ARCore en Android / ARKit en iOS), se detectan superficies y planos físicos (mesas, estanterías) y se anclan etiquetas 3D persistentes en el espacio tridimensional.

---

## 2. Plan de Implementación de la Fase 2

1. **Recolección de Dataset**:
   - Fotografiar 10-20 piezas clave del inventario desde distintos ángulos (100 fotos por clase).
2. **Entrenamiento de Modelo YOLOv8 Nano**:
   - Etiquetar las clases (ej: `motor_trifasico`, `plc_m221`, `sensor_omron`).
   - Entrenar modelo con transfer learning.
3. **Conversión a formato Web**:
   - Exportar a `tfjs_model` o formato ONNX Web.
4. **Integración con la vista `/scanner.html`**:
   - Mantener el motor dual: si detecta un QR lo prioriza; si no hay QR, ejecuta la inferencia de objeto 3D y despliega la tarjeta HUD correspondiente.
