const XLSX = require("xlsx");
const path = require("path");

const articulos = [
  {
    id: 1,
    codigo: "ART-001",
    nombre: "Motor Trifasico 5HP Siemens",
    categoria: "Motores",
    stock: 12,
    precio: 450.00,
    moneda: "USD",
    pasillo: "A",
    estante: "12",
    nivel: "2",
    descripcion: "Motor electrico trifasico de alto rendimiento con rotor de jaula de ardilla.",
    estado: "Disponible",
    proveedor: "Siemens Argentina"
  },
  {
    id: 2,
    codigo: "ART-002",
    nombre: "Sensor Fotoelectrico Omron E3Z",
    categoria: "Sensores",
    stock: 35,
    precio: 85.50,
    moneda: "USD",
    pasillo: "B",
    estante: "04",
    nivel: "1",
    descripcion: "Sensor optico difuso infrarrojo con alcance de deteccion de hasta 1 metro.",
    estado: "Disponible",
    proveedor: "Omron Automation"
  },
  {
    id: 3,
    codigo: "ART-003",
    nombre: "PLC Schneider Modicon M221",
    categoria: "Automatizacion",
    stock: 8,
    precio: 320.00,
    moneda: "USD",
    pasillo: "A",
    estante: "03",
    nivel: "3",
    descripcion: "Controlador logico programable de 24 E/S para aplicaciones de control discreto.",
    estado: "Stock Bajo",
    proveedor: "Schneider Electric"
  },
  {
    id: 4,
    codigo: "ART-004",
    nombre: "Valvula Solenoide Neumatica Festo 5/2",
    categoria: "Neumatica",
    stock: 24,
    precio: 65.00,
    moneda: "USD",
    pasillo: "C",
    estante: "08",
    nivel: "1",
    descripcion: "Electrovalvula biestable de actuacion neumatica rapida a 24VDC.",
    estado: "Disponible",
    proveedor: "Festo"
  },
  {
    id: 5,
    codigo: "ART-005",
    nombre: "Rodamiento Rigido SKF 6205-2RSH",
    categoria: "Mecanica",
    stock: 120,
    precio: 14.20,
    moneda: "USD",
    pasillo: "D",
    estante: "15",
    nivel: "4",
    descripcion: "Rodamiento de una hilera de bolas con obturacion en ambos lados de caucho.",
    estado: "Disponible",
    proveedor: "SKF"
  },
  {
    id: 6,
    codigo: "ART-006",
    nombre: "Variador de Frecuencia WEG CFW500",
    categoria: "Accionamientos",
    stock: 5,
    precio: 290.00,
    moneda: "USD",
    pasillo: "B",
    estante: "07",
    nivel: "2",
    descripcion: "Convertidor de frecuencia para control de velocidad de motores trifasicos de induccion.",
    estado: "Stock Critico",
    proveedor: "WEG"
  }
];

const categorias = [
  { id: 1, nombre: "Motores", descripcion: "Motores electricos y actuadores principales" },
  { id: 2, nombre: "Sensores", descripcion: "Dispositivos de medicion y deteccion" },
  { id: 3, nombre: "Automatizacion", descripcion: "Controladores logicos programables y modulos I/O" },
  { id: 4, nombre: "Neumatica", descripcion: "Valvulas, cilindros y actuadores por aire" },
  { id: 5, nombre: "Mecanica", descripcion: "Rodamientos, poleas, engranajes y acoples" },
  { id: 6, nombre: "Accionamientos", descripcion: "Variadores de velocidad y arrancadores suaves" }
];

const wb = XLSX.utils.book_new();
const wsArticulos = XLSX.utils.json_to_sheet(articulos);
XLSX.utils.book_append_sheet(wb, wsArticulos, "Articulos");

const wsCategorias = XLSX.utils.json_to_sheet(categorias);
XLSX.utils.book_append_sheet(wb, wsCategorias, "Categorias");

const outPath = path.join(__dirname, "..", "datos", "inventario.xlsx");
XLSX.writeFile(wb, outPath);
console.log("Excel creado con exito en:", outPath);
