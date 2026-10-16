# Arquitectura del Sistema - ART-scan

## 1. Visión General
**ART-scan** es una solución de Realidad Aumentada Web (WebAR) y gestión de inventario orientada a la **Industria 4.0**.
Su propósito es eliminar la fricción en almacenes, plantas industriales y depósitos logísticos, permitiendo que cualquier operario con un smartphone u ordenador pueda:
1. Buscar artículos por código, nombre o categoría y conocer su ubicación física exacta.
2. Escanear el código QR o etiqueta adherida al objeto/estantería para desplegar en tiempo real una tarjeta HUD flotante con telemetría de stock, precio y descripción técnica.

---

## 2. Diagrama de Componentes

```
+-------------------------------------------------------------+
|                     DISPOSITIVOS CLIENTE                    |
|  (Smartphones iOS/Android, Tablets, Laptops / Navegador Web)|
+-------------------------------------------------------------+
           |                                  ^
   Peticiones HTTP / Escaneo            Páginas HTML5,
   WebRTC Cámara Móvil (15 FPS)          CSS3 y Assets JS
           v                                  |
+-------------------------------------------------------------+
|                 SERVIDOR ART-scan (Node.js)                 |
|  - Framework: Express.js                                    |
|  - Generador QR dinámico: qrcode                            |
|  - Servidor de Estáticos (Buscador, Visor AR, QRs)          |
+-------------------------------------------------------------+
           |                                  ^
           | Consultas de lectura             | JSON Data
           v                                  |
+-------------------------------------------------------------+
|                 CAPA DE PERSISTENCIA (EXCEL)                |
|  - Archivo: /datos/inventario.xlsx                          |
|  - Parser: SheetJS (xlsx)                                   |
|  - Hojas: "Articulos" y "Categorias"                        |
+-------------------------------------------------------------+
```

---

## 3. Flujo de Datos

### Flujo A: Búsqueda Web
1. El usuario tipea un término en el buscador (ejemplo: `ART-001` o `Siemens`).
2. El cliente emite `GET /api/articulos?q=...` con debounce para optimizar peticiones.
3. El servidor consulta el Excel mediante la librería `xlsx` y filtra por concordancia en código, nombre, ID o descripción.
4. El frontend renderiza las fichas interactivas con indicador de stock (óptimo, bajo, crítico) y ubicación espacial.

### Flujo B: Escaneo y Realidad Aumentada (AR)
1. El usuario accede a `/scanner.html` desde su celular.
2. El navegador solicita acceso a la cámara trasera (`facingMode: "environment"`).
3. El motor de análisis visual procesa los fotogramas en tiempo real.
4. Al detectar la etiqueta o código QR, consulta de inmediato el endpoint `/api/articulos/:codigo`.
5. Si el dispositivo lo soporta, emite una vibración háptica de confirmación (`navigator.vibrate`) y despliega la tarjeta HUD flotante sobre el video de la cámara.

---

## 4. Tecnologías Empleadas

- **Backend Runtime**: Node.js v18+.
- **Framework Web**: Express.js.
- **Motor de Datos**: `xlsx` (SheetJS) para lectura directa del archivo Excel sin necesidad de un motor de base de datos externo pesado.
- **Renderizado y Detección QR**: `qrcode` (servidor) y `html5-qrcode` (cliente).
- **Estilos e Iconografía**: CSS3 moderno con variables (modo oscuro industrial) y FontAwesome 6.
