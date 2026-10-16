# Estructura del Archivo de Datos (Excel)

El sistema utiliza como base de datos inicial el archivo ubicado en:
`/datos/inventario.xlsx`

Este archivo contiene dos hojas principales de cálculo: **`Articulos`** y **`Categorias`**.

---

## 1. Hoja: `Articulos`

Contiene el listado maestro de materiales, piezas, herramientas y componentes industriales.

| Campo | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `id` | Número | `1` | Identificador único numérico |
| `codigo` | Texto | `ART-001` | Código unívoco del artículo (utilizado en las etiquetas y QRs) |
| `nombre` | Texto | `Motor Trifásico 5HP Siemens` | Nombre descriptivo del componente |
| `categoria` | Texto | `Motores` | Categoría a la que pertenece |
| `stock` | Número | `12` | Cantidad física disponible en el almacén |
| `precio` | Número | `450.00` | Precio unitario del artículo |
| `moneda` | Texto | `USD` | Moneda de cotización (`USD`, `ARS`, `EUR`) |
| `pasillo` | Texto | `A` | Identificador de pasillo en el almacén |
| `estante` | Texto | `12` | Número o código de estante |
| `nivel` | Texto | `2` | Nivel de altura de la repisa |
| `descripcion` | Texto | `Motor eléctrico trifásico...` | Especificaciones técnicas resumidas |
| `estado` | Texto | `Disponible` | Estado operativo (`Disponible`, `Stock Bajo`, `Stock Crítico`) |
| `proveedor` | Texto | `Siemens Argentina` | Proveedor o fabricante oficial |

---

## 2. Hoja: `Categorias`

Permite agrupar los componentes para filtrado y reportes logísticos.

| Campo | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `id` | Número | `1` | ID de categoría |
| `nombre` | Texto | `Motores` | Nombre de la categoría |
| `descripcion` | Texto | `Motores eléctricos y actuadores` | Alcance de la categoría |

---

## 3. ¿Cómo editar o agregar nuevos artículos?

Puedes editar directamente el archivo `datos/inventario.xlsx` con **Microsoft Excel**, **LibreOffice Calc** o **Google Sheets**.
Al guardar los cambios en el archivo, la API de ART-scan reflejará automáticamente los nuevos datos sin requerir reiniciar la aplicación.

Si deseas regenerar el archivo con los datos de muestra iniciales, ejecuta en la terminal:
```bash
npm run init-db
```
