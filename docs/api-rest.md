# Endpoints de la API REST - ART-scan

El backend de ART-scan expone una interfaz RESTful que lee y procesa los datos del archivo Excel `/datos/inventario.xlsx` en tiempo real.

---

## 1. Listar o Buscar Artículos

- **Ruta**: `GET /api/articulos`
- **Query Params**:
  - `q`: Término de búsqueda por texto (filtra por código, nombre o descripción).
  - `categoria`: Filtra artículos pertenecientes a una categoría específica.
- **Respuesta (JSON)**:
  ```json
  {
    "total": 4,
    "datos": [
      {
        "id": 1,
        "codigo": "ART-001",
        "nombre": "Calculadora Cientifica Casio fx-350MS",
        "categoria": "Electronica y Oficina",
        "stock": 7,
        "precio": 25.00,
        "moneda": "USD",
        "pasillo": "A",
        "estante": "01",
        "nivel": "2",
        "descripcion": "Calculadora cientifica de 2 lineas...",
        "estado": "Disponible",
        "proveedor": "Casio Argentina"
      }
    ]
  }
  ```

---

## 2. Detalle de Artículo por Código o ID

- **Ruta**: `GET /api/articulos/:identificador`
- **Parámetros**:
  - `:identificador`: Código único (ej. `ART-003`) o ID numérico.
- **Respuesta 200 (JSON)**:
  ```json
  {
    "id": 3,
    "codigo": "ART-003",
    "nombre": "Joystick Sony DualShock 4 PS4 Negro",
    "categoria": "Control y Telemando",
    "stock": 4,
    "precio": 65.00,
    "moneda": "USD",
    "pasillo": "B",
    "estante": "02",
    "nivel": "3",
    "descripcion": "Controlador inalambrico con panel tactil...",
    "estado": "Stock Critico",
    "proveedor": "Sony PlayStation"
  }
  ```
- **Respuesta 404**:
  ```json
  {
    "error": "Articulo no encontrado"
  }
  ```

---

## 3. Listado de Categorías

- **Ruta**: `GET /api/categorias`
- **Respuesta (JSON)**:
  ```json
  [
    { "id": 1, "nombre": "Electronica y Oficina", "descripcion": "..." },
    { "id": 2, "nombre": "Accesorios y Alimentacion", "descripcion": "..." }
  ]
  ```

---

## 4. Generación Dinámica de Códigos QR

- **Ruta**: `GET /api/qr/:codigo`
- **Parámetros**:
  - `:codigo`: Código del artículo para codificar en el QR.
- **Respuesta (JSON)**:
  ```json
  {
    "codigo": "ART-001",
    "urlEscaneo": "https://.../scanner.html?codigo=ART-001",
    "qrDataUrl": "data:image/png;base64,iVBORw0KGgoAAA..."
  }
  ```

---

## 5. Listado de Fotos de Calibración

- **Ruta**: `GET /api/targets`
- **Respuesta (JSON)**:
  ```json
  [
    "foto_0.jpeg",
    "foto_1.jpeg",
    "foto_2.jpeg",
    "..."
  ]
  ```
