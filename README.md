# ART-scan - Realidad Aumentada & Inventario Inteligente (Industria 4.0)

> Prototipo MVP para localización de inventario, control de stock bidireccional y visualización en tiempo real mediante Realidad Aumentada (WebAR) utilizando como base de datos una planilla Excel en almacén (`/datos/inventario.xlsx`).

---

## 👤 Autor y Contacto
- **Nombre y Apellido:** Valentin Garzaniti
- **Email:** [valenxity@gmail.com](mailto:valenxity@gmail.com)

---

## ⚡ Instalación y Ejecución (En 2 Comandos)

El sistema está diseñado para configurarse e iniciarse de forma 100% automática tanto para **computadora** como para **celular**:

### 1. Instalar Todo (Un solo comando)
Descarga todas las dependencias (servidor, lector Excel, generador QR, certificados SSL) y verifica/crea la base de datos Excel automáticamente:
```bash
npm install
```

### 2. Levantar Todo para PC y Celular (Un solo comando)
Inicia simultáneamente el servidor web para PC (`HTTP :3000`), genera los certificados de seguridad para habilitar la cámara móvil y levanta el servidor seguro para celulares (`HTTPS :3443`), mostrando en consola la dirección IP exacta de tu red Wi-Fi:
```bash
npm start
```

Al ejecutar `npm start`, verás en tu terminal un cuadro con los enlaces listos para abrir:
```text
=============================================================
 🚀 ART-scan INICIADO CORRECTAMENTE (PC + CELULAR)
=============================================================
 💻 Acceso en Computadora (PC):
    -> Inventario:    http://localhost:3000
    -> Generador QRs: http://localhost:3000/qrs.html
-------------------------------------------------------------
 📱 Acceso en Celular (Misma red Wi-Fi con Cámara AR):
    -> Escáner AR:    https://TU_IP_WIFI:3443/scanner.html
    -> Catálogo Web:  https://TU_IP_WIFI:3443
=============================================================
```

---

## 💡 ¿Qué incluye y cómo funciona ART-scan?

1. **Buscador Web y Control de Stock en Tiempo Real (`/index.html`)**:
   - Busca artículos por código (`ART-001`), nombre o descripción.
   - Muestra su **ubicación física exacta (Pasillo, Estante, Nivel)**, precio y estado.
   - Permite **sumar (+), restar (-) stock o cambiar el estado** impactando directamente en el archivo [`datos/inventario.xlsx`](datos/inventario.xlsx).

2. **Visor de Realidad Aumentada Multi-Modo (`/scanner.html`)**:
   - **Modo Foto Real**: Compara en vivo lo que enfoca la cámara contra el banco de fotos reales cargadas en `/public/targets/`.
   - **Modo Código QR**: Lectura industrial instantánea (<100ms) con cero margen de error.
   - **Modo IA**: Clasificación de objetos con TensorFlow.js + MobileNet en el navegador.
   - **Panel Inferior AR (Bottom Sheet)**: Despliega la información sin tapar el objeto en pantalla y permite descontar o sumar unidades en el Excel directamente desde la cámara.

3. **Centro de Generación e Impresión de QRs (`/qrs.html`)**:
   - Genera etiquetas con códigos QR para cada artículo del Excel.
   - Permite seleccionar **1, 2, varios o todos** los artículos, elegir la **cantidad de copias** de cada etiqueta e imprimirlas listas para recortar.

---

## 📱 Cómo conectar el Celular (Android e iOS)

1. Conecta tu computadora y tu celular a la **misma red Wi-Fi**.
2. Ejecuta `npm start` en la computadora y copia la URL que aparece bajo **`📱 Acceso en Celular`** (ejemplo: `https://10.10.20.98:3443/scanner.html`).
3. Ábrela en el navegador de tu teléfono (Chrome en Android o Safari en iPhone).
4. Como el certificado HTTPS es generado localmente por tu PC, acepta el aviso de seguridad la primera vez:
   - **En Chrome (Android)**: Toca *"Configuración avanzada"* -> *"Acceder a ... (no seguro)"*.
   - **En Safari (iOS)**: Toca *"Mostrar detalles"* -> *"Visitar este sitio web"*.
5. Concede permiso para utilizar la cámara trasera.

---

## 📚 Documentación Técnica en `/docs`

Toda la arquitectura y especificaciones se encuentran documentadas en la carpeta [`/docs`](docs/):

- 📐 [**docs/arquitectura.md**](docs/arquitectura.md): Diagrama de componentes y flujo de datos.
- 👁️ [**docs/reconocimiento-visual.md**](docs/reconocimiento-visual.md): Funcionamiento de los 3 modos de escaneo (Foto Real, QR, IA MobileNet).
- 🔒 [**docs/conexion-segura-https.md**](docs/conexion-segura-https.md): Certificados SSL autofirmados y permisos de cámara móvil.
- 🔌 [**docs/api-rest.md**](docs/api-rest.md): Endpoints REST de consulta y modificación de stock (`GET`, `PATCH`).
- 📊 [**docs/estructura-datos.md**](docs/estructura-datos.md): Estructura de hojas y columnas del archivo Excel.
- 🧪 [**docs/guia-uso-pruebas.md**](docs/guia-uso-pruebas.md): Guía paso a paso para pruebas en PC y celular.
- 🔮 [**docs/roadmap-vision-computadora.md**](docs/roadmap-vision-computadora.md): Evolución hacia YOLOv8 y WebXR.

---

## 🛠️ Comandos Adicionales

- `npm install`: Instala todo el entorno y prepara la base de datos si no existe.
- `npm start`: Levanta simultáneamente el servidor HTTP (PC) y HTTPS (Celular).
- `npm run init-db`: Restaura el archivo `datos/inventario.xlsx` a sus valores originales de fábrica.
