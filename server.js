const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const XLSX = require("xlsx");
const QRCode = require("qrcode");
const selfsigned = require("selfsigned");

const app = express();
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const EXCEL_PATH = path.join(__dirname, "datos", "inventario.xlsx");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function leerInventario() {
  try {
    const wb = XLSX.readFile(EXCEL_PATH);
    const sheetNameArticulos = wb.SheetNames.includes("Articulos") ? "Articulos" : wb.SheetNames[0];
    const articulos = XLSX.utils.sheet_to_json(wb.Sheets[sheetNameArticulos]);
    
    let categorias = [];
    if (wb.SheetNames.includes("Categorias")) {
      categorias = XLSX.utils.sheet_to_json(wb.Sheets["Categorias"]);
    }

    return { wb, sheetNameArticulos, articulos, categorias };
  } catch (error) {
    console.error("Error al leer Excel:", error.message);
    return { wb: null, sheetNameArticulos: "Articulos", articulos: [], categorias: [] };
  }
}

function guardarInventario(wb, sheetName, articulos) {
  try {
    const nuevaSheet = XLSX.utils.json_to_sheet(articulos);
    wb.Sheets[sheetName] = nuevaSheet;
    XLSX.writeFile(wb, EXCEL_PATH);
    return true;
  } catch (err) {
    console.error("Error al escribir en Excel:", err.message);
    return false;
  }
}

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

  res.json({ total: filtrados.length, datos: filtrados });
});

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

// Endpoint para modificar stock y estado directamente en el Excel
app.patch("/api/articulos/:identificador/stock", (req, res) => {
  const { identificador } = req.params;
  const { delta, nuevoStock, nuevoEstado } = req.body;
  const { wb, sheetNameArticulos, articulos } = leerInventario();

  if (!wb) {
    return res.status(500).json({ error: "No se pudo acceder al Excel" });
  }

  const idBuscado = identificador.trim().toLowerCase();
  const index = articulos.findIndex(item => 
    (item.codigo && item.codigo.toString().toLowerCase() === idBuscado) ||
    (item.id && item.id.toString() === idBuscado)
  );

  if (index === -1) {
    return res.status(404).json({ error: "Articulo no encontrado" });
  }

  const art = articulos[index];

  // Aplicar suma/resta o fijación directa
  if (typeof delta === "number") {
    art.stock = Math.max(0, Number(art.stock || 0) + delta);
  } else if (typeof nuevoStock === "number") {
    art.stock = Math.max(0, nuevoStock);
  }

  // Actualizar estado si viene especificado o auto-calcular según stock
  if (nuevoEstado) {
    art.estado = nuevoEstado;
  } else {
    if (art.stock <= 2) art.estado = "Stock Critico";
    else if (art.stock <= 8) art.estado = "Stock Bajo";
    else art.estado = "Disponible";
  }

  articulos[index] = art;
  const exito = guardarInventario(wb, sheetNameArticulos, articulos);

  if (!exito) {
    return res.status(500).json({ error: "Error escribiendo en el archivo Excel" });
  }

  res.json({
    mensaje: "Stock y estado actualizados correctamente en Excel",
    articulo: art
  });
});

app.get("/api/categorias", (req, res) => {
  const { categorias } = leerInventario();
  res.json(categorias);
});

app.get("/api/targets", (req, res) => {
  const targetsDir = path.join(__dirname, "public", "targets");
  if (!fs.existsSync(targetsDir)) return res.json([]);

  const files = fs.readdirSync(targetsDir).filter(f => f.endsWith(".jpeg") || f.endsWith(".jpg"));
  res.json(files);
});

app.get("/api/qr/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;
    const urlEscaneo = `${req.protocol}://${req.get("host")}/scanner.html?codigo=${encodeURIComponent(codigo)}`;
    const qrDataUrl = await QRCode.toDataURL(urlEscaneo, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: { dark: "#0f172a", light: "#ffffff" }
    });

    res.json({ codigo, urlEscaneo, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: "Error generando QR: " + err.message });
  }
});

async function iniciarServidores() {
  const certDir = path.join(__dirname, ".cert");
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const keyPath = path.join(certDir, "server.key");
  const certPath = path.join(certDir, "server.crt");

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log("Generando certificados SSL seguros para acceso móvil...");
    const pems = await selfsigned.generate(
      [{ name: "commonName", value: "ART-scan" }],
      { days: 365 }
    );
    fs.writeFileSync(keyPath, pems.private, "utf8");
    fs.writeFileSync(certPath, pems.cert, "utf8");
  }

  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };

  http.createServer(app).listen(HTTP_PORT, "0.0.0.0", () => {
    console.log(`[HTTP]  http://localhost:${HTTP_PORT}`);
  });

  https.createServer(httpsOptions, app).listen(HTTPS_PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(` [HTTPS SEGURO NATIVO]`);
    console.log(` Acceso desde móvil: https://10.10.20.98:${HTTPS_PORT}/scanner.html`);
    console.log(`====================================================`);
  });
}

iniciarServidores();
