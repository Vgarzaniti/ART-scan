# Guía de Uso y Pruebas del MVP

Esta guía explica paso a paso cómo probar todas las funcionalidades de **ART-scan**, tanto desde una computadora como desde un teléfono móvil real.

---

## 1. Pruebas Locales en Computadora (PC / Mac)

1. Inicia el servidor:
   ```bash
   npm start
   ```
2. Abre tu navegador en [http://localhost:3000](http://localhost:3000).

### Pruebas de Búsqueda y Localización
- En la barra de búsqueda, tipea códigos como `ART-001`, `ART-003` o nombres como `Motor`, `Sensor`, `PLC`.
- Observa cómo se filtran en tiempo real los artículos, mostrando su stock, precio y ubicación (Pasillo, Estante, Nivel).

### Pruebas del Visor AR en PC
- Entra a [http://localhost:3000/scanner.html](http://localhost:3000/scanner.html).
- Si tu computadora cuenta con webcam, se activará el escaneo de video en vivo.
- Si no tienes cámara o quieres probar rápidamente, utiliza el desplegable superior **"Simular artículo"** para fijar cualquier producto y ver la tarjeta de Realidad Aumentada interactiva.

---

## 2. Pruebas desde un Celular (Smartphones Android / iOS)

Para que el celular acceda al servidor de tu computadora en la misma red Wi-Fi:

1. **Obtener la IP local de tu PC**:
   - En Windows (PowerShell):
     ```powershell
     ipconfig
     ```
   - Busca la dirección IPv4 (por ejemplo: `192.168.1.45`).
2. **Abrir en el celular**:
   - Conecta el celular a la misma red Wi-Fi que la PC.
   - Abre Chrome o Safari en el celular e ingresa:
     ```
     http://192.168.1.45:3000
     ```
3. **Escaneo con la cámara del celular**:
   - Toca en **"Abrir Escáner AR Móvil"** (`/scanner.html`).
   - El navegador te pedirá permiso para usar la cámara: acéptalo.
   - En la PC, abre la pestaña de QRs (`/qrs.html`) y apunta la cámara del celular a cualquiera de los códigos en pantalla.
   - Al instante el celular vibrará y mostrará la tarjeta de Realidad Aumentada con el stock, precio y ubicación exacta del artículo.
