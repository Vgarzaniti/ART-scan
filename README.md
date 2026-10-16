# ART-scan - Realidad Aumentada & Inventario Inteligente (Industria 4.0)

> Prototipo MVP para localización de inventario, consulta técnica y visualización en tiempo real mediante Realidad Aumentada (WebAR) utilizando como fuente de datos una planilla Excel en almacén.

---

## 👤 Autor y Contacto
- **Nombre y Apellido:** Valentin Garzaniti
- **Email:** [valenxity@gmail.com](mailto:valenxity@gmail.com)

---

## 💡 ¿Qué es ART-scan?

**ART-scan** es un sistema web concebido para entornos de **Industria 4.0** (almacenes, depósitos logísticos, plantas de producción y talleres de mantenimiento).

Permite a los operarios:
1. **Buscar artículos** en tiempo real por código (ej: `ART-001`), nombre o descripción técnica, obteniendo inmediatamente su **stock disponible**, **precio** y **ubicación exacta en el almacén (Pasillo, Estante, Nivel)**.
2. **Escanear con la cámara del celular con soporte Multi-Modo**:
   - 📷 **Modo Foto Real**: Reconocimiento por coincidencia visual directa contra el banco de fotos de las piezas reales.
   - 🏁 **Modo Código QR**: Detección instantánea en menos de 100ms con cero margen de error.
   - 🧠 **Modo IA**: Red neuronal convolucional MobileNet (TensorFlow.js) para clasificación en el navegador.
3. **Tarjeta HUD AR Flotante**: Información proyectada sobre la cámara en tiempo real con feedback háptico (vibración).
4. **Imprimir y generar etiquetas QR**: Catálogo dinámico para imprimir marcadores y pegarlos en cajas, estantes o componentes.
5. **Base de Datos en Excel**: Los datos se leen directamente desde [`datos/inventario.xlsx`](datos/inventario.xlsx), facilitando la actualización inmediata de artículos.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### Pasos de Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Vgarzaniti/ART-scan.git
   cd ART-scan
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar la aplicación**:
   ```bash
   npm start
   ```

4. **Acceder a la aplicación**:
   - **En la computadora**: [http://localhost:3000](http://localhost:3000)
   - **En el celular (Cámara AR segura por Wi-Fi)**: `https://TU_IP_LOCAL:3443/scanner.html`

---

## 📱 ¿Cómo probarlo desde el celular?

1. Conecta la PC y el celular a la **misma red Wi-Fi**.
2. Averigua la dirección IP local de tu computadora:
   - En Windows (PowerShell): `ipconfig` (ej: `192.168.1.11`).
3. En el navegador del celular (Chrome / Safari), ingresa a:
   ```
   https://192.168.1.11:3443/scanner.html
   ```
4. Acepta el certificado autofirmado y el permiso de cámara.
5. Elige tu modo favorito (**Foto Real**, **Código QR** o **IA**) y apunta la cámara a tu objeto o etiqueta.

---

## 📚 Documentación Técnica Detallada

La documentación modular del sistema se encuentra organizada en la carpeta [`/docs`](docs/):

- 📐 [**docs/arquitectura.md**](docs/arquitectura.md): Diagrama de componentes, flujo de datos y dependencias.
- 👁️ [**docs/reconocimiento-visual.md**](docs/reconocimiento-visual.md): Explicación técnica de los 3 modos de escaneo (Foto Real, QR, IA MobileNet).
- 🔒 [**docs/conexion-segura-https.md**](docs/conexion-segura-https.md): Configuración de certificados SSL autofirmados y permisos de cámara para iOS y Android.
- 🔌 [**docs/api-rest.md**](docs/api-rest.md): Especificación de todos los endpoints REST expuestos por el backend.
- 📊 [**docs/estructura-datos.md**](docs/estructura-datos.md): Columnas, tipos de datos y edición del archivo Excel de inventario.
- 🧪 [**docs/guia-uso-pruebas.md**](docs/guia-uso-pruebas.md): Procedimiento paso a paso para validar el sistema en PC y dispositivos móviles.
- 🔮 [**docs/roadmap-vision-computadora.md**](docs/roadmap-vision-computadora.md): Hoja de ruta para modelos YOLOv8 y anclajes espaciales WebXR.

---

## 📁 Estructura del Directorio

```
ART-scan/
├── .cert/                      # Certificados SSL para HTTPS nativo en móvil
├── datos/
│   └── inventario.xlsx         # Base de datos en Excel (Hojas: Articulos, Categorias)
├── docs/                       # Documentación técnica completa en Markdown
│   ├── api-rest.md
│   ├── arquitectura.md
│   ├── conexion-segura-https.md
│   ├── estructura-datos.md
│   ├── guia-uso-pruebas.md
│   ├── reconocimiento-visual.md
│   └── roadmap-vision-computadora.md
├── public/                     # Frontend Web (HTML5 / CSS3 / JS)
│   ├── css/
│   │   └── styles.css          # Estilos tipo HUD industrial y dark-mode
│   ├── js/
│   │   ├── app.js              # Lógica de búsqueda y renderizado de catálogo
│   │   └── scanner.js          # Control de cámara, escaneo tri-modo y HUD AR
│   ├── targets/                # Banco de 12 fotos reales de calibración
│   ├── calibrador.html         # Panel de inspección y análisis visual de fotos
│   ├── index.html              # Portal principal y buscador de inventario
│   ├── qrs.html                # Catálogo de códigos QR listos para imprimir
│   └── scanner.html            # Visor de cámara con Realidad Aumentada (HUD)
├── scripts/
│   └── crear_excel_datos.js    # Script para generar o reiniciar el Excel inicial
├── server.js                   # Servidor Express con HTTP (3000) y HTTPS (3443)
├── package.json                # Configuración y dependencias del proyecto
└── README.md                   # Portada principal del repositorio
```

---

## 🛠️ Comandos Disponibles

- `npm start`: Inicia el servidor HTTP (puerto 3000) y el servidor HTTPS seguro (puerto 3443).
- `npm run init-db`: Regenera el archivo `datos/inventario.xlsx` con los datos de muestra iniciales.
