const XLSX = require("xlsx");
const path = require("path");

const articulos = [
  {
    id: 1,
    codigo: "ART-001",
    nombre: "Calculadora Cientifica Casio fx-350MS",
    categoria: "Electronica y Oficina",
    stock: 7,
    precio: 25.00,
    moneda: "USD",
    pasillo: "A",
    estante: "01",
    nivel: "2",
    descripcion: "Calculadora cientifica de 2 lineas con 240 funciones, display S-V.P.A.M. ideal para medicion y calculo en taller.",
    estado: "Disponible",
    proveedor: "Casio Argentina"
  },
  {
    id: 2,
    codigo: "ART-002",
    nombre: "Cargador Rapido Samsung USB-C",
    categoria: "Accesorios y Alimentacion",
    stock: 18,
    precio: 19.50,
    moneda: "USD",
    pasillo: "A",
    estante: "04",
    nivel: "1",
    descripcion: "Adaptador de corriente de carga rapida con cable reforzado USB tipo C para dispositivos de planta.",
    estado: "Disponible",
    proveedor: "Samsung"
  },
  {
    id: 3,
    codigo: "ART-003",
    nombre: "Joystick Sony DualShock 4 PS4 Negro",
    categoria: "Control y Telemando",
    stock: 4,
    precio: 65.00,
    moneda: "USD",
    pasillo: "B",
    estante: "02",
    nivel: "3",
    descripcion: "Controlador inalambrico con panel tactil y sensores de movimiento de 6 ejes, apto para teleoperacion y simuladores.",
    estado: "Stock Critico",
    proveedor: "Sony PlayStation"
  },
  {
    id: 4,
    codigo: "ART-004",
    nombre: "Auriculares Gamer Headset con Microfono",
    categoria: "Audio y Comunicacion",
    stock: 12,
    precio: 42.00,
    moneda: "USD",
    pasillo: "B",
    estante: "05",
    nivel: "2",
    descripcion: "Auriculares circumaurales acolchados con cancelacion pasiva de ruido y microfono flexible para comunicaciones de sala.",
    estado: "Disponible",
    proveedor: "Gaming Audio Pro"
  }
];

const categorias = [
  { id: 1, nombre: "Electronica y Oficina", descripcion: "Equipos de computo y oficina tecnica" },
  { id: 2, nombre: "Accesorios y Alimentacion", descripcion: "Cargadores, fuentes y conectividad" },
  { id: 3, nombre: "Control y Telemando", descripcion: "Controladores, periféricos y simuladores" },
  { id: 4, nombre: "Audio y Comunicacion", descripcion: "Headsets y sistemas de diadema para comunicación" }
];

const wb = XLSX.utils.book_new();
const wsArticulos = XLSX.utils.json_to_sheet(articulos);
XLSX.utils.book_append_sheet(wb, wsArticulos, "Articulos");

const wsCategorias = XLSX.utils.json_to_sheet(categorias);
XLSX.utils.book_append_sheet(wb, wsCategorias, "Categorias");

const outPath = path.join(__dirname, "..", "datos", "inventario.xlsx");
XLSX.writeFile(wb, outPath);
console.log("Excel actualizado con los articulos reales en:", outPath);
