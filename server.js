const express = require("express");
const cors = require("cors");
const path = require("path");
const XLSX = require("xlsx");
const QRCode = require("qrcode");

const app = express();
const PORT = process.env.PORT || 3000;
const EXCEL_PATH = path.join(__dirname, "datos", "inventario.xlsx");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper para leer articulos del Excel
function leerInventario() {
  try {
    const wb = XLSX.readFile(EXCEL_PATH);
    const sheetNameArticulos = wb.SheetNames.includes("Articulos") ? "Articulos" : wb.SheetNames[0];
    const articulos = XLSX.utils.sheet_to_json(wb.Sheets[sheetNameArticulos]);
    
    let categorias = [];
    if (wb.SheetNames.includes("Categorias")) {
      categorias = XLSX.utils.sheet_to_json(wb.Sheets["Categorias"]);
    }

    return { articulos, categorias };
  } catch (error) {
    console.error("Error al leer el archivo Excel:", error.message);
    return { articulos: [], categorias: [] };
  }
}

// API: Obtener todos los articulos o filtrar por query
app.get("/api/articulos", (req, res) => {
  const { q, categoria } = req.query;
  const { articulos } = leerInventario();

  let filtrados = articulos;

  if (categoria) {
    filtrados = filtrados.filter(item => 
      item.categoria && item.categoria.toLowerCase() === categoria.toLowerCase()
    );
  }

  if (q) {
    const query = q.toString().trim().toLowerCase();
    filtrados = filtrados.filter(item => {
      const matchCod = item.codigo && item.codigo.toString().toLowerCase().includes(query);
      const matchNom = item.nombre && item.nombre.toLowerCase().includes(query);
      const matchDesc = item.descripcion && item.descripcion.toLowerCase().includes(query);
      const matchId = item.id && item.id.toString() === query;
      return matchCod || matchNom || matchDesc || matchId;
    });
  }

  res.json({
    total: filtrados.length,
    datos: filtrados
  });
});

// API: Obtener articulo individual por codigo o ID
app.get("/api/articulos/:identificador", (req, res) => {
  const { identificador } = req.params;
  const { articulos } = leerInventario();
  const idBuscado = identificador.trim().toLowerCase();

  const articulo = articulos.find(item => 
    (item.codigo && item.codigo.toString().toLowerCase() === idBuscado) ||
    (item.id && item.id.toString() === idBuscado)
  );

  if (!articulo) {
    return res.status(404).json({ error: "Articulo no encontrado" });
  }

  res.json(articulo);
});

// API: Obtener categorias
app.get("/api/categorias", (req, res) => {
  const { categorias } = leerInventario();
  res.json(categorias);
});

// API: Generar codigo QR para un articulo
app.get("/api/qr/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;
    // Generar formato DataURL o imagen
    const urlEscaneo = `${req.protocol}://${req.get("host")}/scanner.html?codigo=${encodeURIComponent(codigo)}`;
    const qrDataUrl = await QRCode.toDataURL(urlEscaneo, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });

    res.json({
      codigo,
      urlEscaneo,
      qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ error: "Error generando QR: " + err.message });
  }
});

// Levantar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(` Servidor ART-scan iniciado con exito`);
  console.log(` Acceso Local:  http://localhost:${PORT}`);
  console.log(` Modulo Escaner AR: http://localhost:${PORT}/scanner.html`);
  console.log(` Generador QRs:     http://localhost:${PORT}/qrs.html`);
  console.log(`===============================================`);
});
