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

    return { articulos, categorias };
  } catch (error) {
    console.error("Error al leer Excel:", error.message);
    return { articulos: [], categorias: [] };
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

app.get("/api/categorias", (req, res) => {
  const { categorias } = leerInventario();
  res.json(categorias);
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
    console.log(` Acceso desde móvil: https://192.168.1.11:${HTTPS_PORT}/scanner.html`);
    console.log(`====================================================`);
  });
}

iniciarServidores();
