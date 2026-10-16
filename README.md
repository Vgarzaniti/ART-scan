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
2. **Escanear con la cámara del celular**: al apuntar a un código o etiqueta en una pieza o repisa, el sistema despliega una **tarjeta HUD flotante de Realidad Aumentada** sobre la imagen de la cámara con todos los datos actualizados del producto.
3. **Imprimir y generar etiquetas QR**: catálogo automático para imprimir marcadores y pegarlos en cajas, pallets o componentes.
4. **Base de Datos en Excel**: los datos provienen directamente del archivo [`datos/inventario.xlsx`](datos/inventario.xlsx), facilitando la actualización de artículos sin necesidad de configurar bases de datos complejas.

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
   - Abrir en el navegador de la computadora: [http://localhost:3000](http://localhost:3000)

---

## 📱 ¿Cómo probarlo desde el celular?

1. Asegúrate de que la computadora y el celular estén conectados a la **misma red Wi-Fi**.
2. Averigua la dirección IP local de tu computadora:
   - En Windows (PowerShell): `ipconfig` (busca la *Dirección IPv4*, ej: `192.168.1.45`).
3. En el navegador del celular (Chrome / Safari), ingresa a:
   ```
   http://TU_IP_LOCAL:3000
   ```
4. Ingresa a la sección **"Escáner AR"** (`/scanner.html`) y concede permisos para usar la cámara trasera.
5. En la pantalla de tu computadora, abre la sección de **QRs** (`/qrs.html`) y apunta la cámara del teléfono hacia cualquiera de los códigos en pantalla.
6. Verás aparecer inmediatamente la tarjeta de Realidad Aumentada con el stock, precio, ubicación física y especificaciones técnicas.

---

## 📁 Estructura del Proyecto

```
ART-scan/
├── datos/
│   └── inventario.xlsx         # Base de datos en Excel (Hojas: Articulos, Categorias)
├── docs/                       # Documentación técnica completa
│   ├── arquitectura.md         # Diagrama de arquitectura y flujo de datos
│   ├── estructura-datos.md     # Estructura de campos del Excel
│   ├── guia-uso-pruebas.md     # Guía detallada de pruebas en PC y móvil
│   └── roadmap-vision-computadora.md  # Hoja de ruta para reconocimiento de objetos 3D
├── public/                     # Frontend Web (HTML5 / CSS3 / JS)
│   ├── css/
│   │   └── styles.css          # Estilos tipo HUD industrial y dark-mode
│   ├── js/
│   │   ├── app.js              # Lógica de búsqueda y renderizado de catálogo
│   │   └── scanner.js          # Control de cámara, escaneo y tarjeta AR
│   ├── index.html              # Portal principal y buscador de inventario
│   ├── scanner.html            # Visor de cámara con Realidad Aumentada (HUD)
│   └── qrs.html                # Catálogo de códigos QR listos para imprimir
├── scripts/
│   └── crear_excel_datos.js    # Script para generar o reiniciar el Excel inicial
├── server.js                   # Servidor Express y API REST
├── package.json                # Configuración y dependencias del proyecto
└── README.md                   # Documentación principal del repositorio
```

---

## 🛠️ Comandos Disponibles

- `npm start`: Inicia el servidor de desarrollo y producción en el puerto `3000`.
- `npm run init-db`: Regenera el archivo `datos/inventario.xlsx` con los datos de muestra iniciales.

---

## 🔮 Futuras Mejoras (Fase 2)
- Detección directa de objetos 3D sin código QR mediante modelos de visión por computadora (TensorFlow.js / YOLO).
- Anclaje espacial 3D con WebXR para posicionar etiquetas virtuales fijas en el espacio físico del almacén.
- Notificaciones de alerta de stock crítico conectadas con proveedores.
