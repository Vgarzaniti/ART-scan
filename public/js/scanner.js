document.addEventListener("DOMContentLoaded", () => {
  const arCard = document.getElementById("arCard");
  const closeCardBtn = document.getElementById("closeCardBtn");
  const scanStatus = document.getElementById("scanStatus");
  const cameraPrompt = document.getElementById("cameraPrompt");
  const btnStartCamera = document.getElementById("btnStartCamera");
  const arTag = document.getElementById("arTag");

  const modeFotoBtn = document.getElementById("modeFotoBtn");
  const modeQrBtn = document.getElementById("modeQrBtn");
  const modeIaBtn = document.getElementById("modeIaBtn");

  const arNombre = document.getElementById("arNombre");
  const arCodigo = document.getElementById("arCodigo");
  const arStockNum = document.getElementById("arStockNum");
  const arEstadoSelect = document.getElementById("arEstadoSelect");
  const arPrecio = document.getElementById("arPrecio");
  const arPasillo = document.getElementById("arPasillo");
  const arEstante = document.getElementById("arEstante");
  const arNivel = document.getElementById("arNivel");

  const btnSumarStock = document.getElementById("btnSumarStock");
  const btnRestarStock = document.getElementById("btnRestarStock");

  const canvas = document.getElementById("photoCompareCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  let html5QrCode = null;
  let activeMode = "foto";
  let currentArticleCode = null;
  let loopInterval = null;

  let mobilenetModel = null;
  let isAiRunning = false;

  const TARGETS = [
    { codigo: "ART-003", name: "Joystick PS4", src: "targets/joystick.jpg", sig: null },
    { codigo: "ART-001", name: "Calculadora Casio", src: "targets/calculadora.jpg", sig: null },
    { codigo: "ART-004", name: "Auriculares Gamer", src: "targets/auriculares.jpg", sig: null },
    { codigo: "ART-002", name: "Cargador Samsung", src: "targets/cargador.jpg", sig: null }
  ];

  function calcularFirmaImagen(imgEl) {
    const s = 32;
    canvas.width = s;
    canvas.height = s;
    ctx.drawImage(imgEl, 0, 0, s, s);
    const imgData = ctx.getImageData(0, 0, s, s).data;
    
    let luma = new Float32Array(s * s);
    let avg = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      const idx = i / 4;
      const v = 0.299 * imgData[i] + 0.587 * imgData[i+1] + 0.114 * imgData[i+2];
      luma[idx] = v;
      avg += v;
    }
    avg /= (s * s);

    let hash = [];
    for (let i = 0; i < luma.length; i++) {
      hash.push(luma[i] >= avg ? 1 : 0);
    }
    return { luma, hash, avg };
  }

  function precalibrarFotosReales() {
    TARGETS.forEach(t => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        t.sig = calcularFirmaImagen(img);
      };
      img.src = t.src;
    });
  }

  function compararConFotosReales(videoEl) {
    const s = 32;
    canvas.width = s;
    canvas.height = s;
    
    const vw = videoEl.videoWidth || 640;
    const vh = videoEl.videoHeight || 480;
    const cropSize = Math.min(vw, vh) * 0.7;
    const sx = (vw - cropSize) / 2;
    const sy = (vh - cropSize) / 2;

    ctx.drawImage(videoEl, sx, sy, cropSize, cropSize, 0, 0, s, s);
    const frameData = ctx.getImageData(0, 0, s, s).data;

    let luma = new Float32Array(s * s);
    let avg = 0;
    for (let i = 0; i < frameData.length; i += 4) {
      const idx = i / 4;
      const v = 0.299 * frameData[i] + 0.587 * frameData[i+1] + 0.114 * frameData[i+2];
      luma[idx] = v;
      avg += v;
    }
    avg /= (s * s);

    let frameHash = [];
    for (let i = 0; i < luma.length; i++) {
      frameHash.push(luma[i] >= avg ? 1 : 0);
    }

    let mejorMatch = null;
    let maxSimilitud = 0;

    for (const target of TARGETS) {
      if (!target.sig) continue;
      
      let iguales = 0;
      for (let i = 0; i < frameHash.length; i++) {
        if (frameHash[i] === target.sig.hash[i]) iguales++;
      }
      const sim = iguales / frameHash.length;

      if (sim > maxSimilitud) {
        maxSimilitud = sim;
        mejorMatch = target;
      }
    }

    const pct = Math.round(maxSimilitud * 100);
    if (mejorMatch) {
      scanStatus.innerHTML = `<i class="fa-solid fa-camera"></i> Comparando: <strong>${mejorMatch.name}</strong> (${pct}%)`;
    }

    if (mejorMatch && maxSimilitud >= 0.68) {
      mostrarDetalleArticulo(mejorMatch.codigo, `FOTO REAL (${pct}%)`);
    }
  }

  function iniciarBucleDeteccion() {
    if (loopInterval) clearInterval(loopInterval);

    loopInterval = setInterval(async () => {
      if (arCard.classList.contains("active")) return;
      const videoEl = document.querySelector("#reader video");
      if (!videoEl || videoEl.readyState < 2) return;

      if (activeMode === "foto") {
        compararConFotosReales(videoEl);
      } else if (activeMode === "ia") {
        ejecutarInferenciaIA(videoEl);
      }
    }, 450);
  }

  async function ejecutarInferenciaIA(videoEl) {
    if (!mobilenetModel || isAiRunning) return;
    isAiRunning = true;
    try {
      const preds = await mobilenetModel.classify(videoEl, 3);
      if (preds && preds.length > 0) {
        const top = preds[0];
        const prob = Math.round(top.probability * 100);
        scanStatus.innerHTML = `<i class="fa-solid fa-brain"></i> IA: <strong>${top.className.split(",")[0]}</strong> (${prob}%)`;

        const MAPEO = [
          { cod: "ART-003", kws: ["joystick", "game_controller", "control"] },
          { cod: "ART-001", kws: ["calculator", "pocket_calculator"] },
          { cod: "ART-004", kws: ["headphone", "headphones", "earphone", "headset"] },
          { cod: "ART-002", kws: ["power_cord", "plug", "charger", "cord"] }
        ];

        for (const m of MAPEO) {
          const match = m.kws.some(k => top.className.toLowerCase().includes(k));
          if (match && prob >= 25) {
            mostrarDetalleArticulo(m.cod, `IA: ${top.className.split(",")[0]} (${prob}%)`);
            break;
          }
        }
      }
    } catch(e) {}
    finally { isAiRunning = false; }
  }

  async function mostrarDetalleArticulo(identificador, origen = "OBJETO IDENTIFICADO") {
    try {
      if (currentArticleCode === identificador && arCard.classList.contains("active")) return;

      const resp = await fetch(`/api/articulos/${encodeURIComponent(identificador)}`);
      if (!resp.ok) return;

      const item = await resp.json();
      currentArticleCode = item.codigo;

      arTag.innerHTML = `<i class="fa-solid fa-check"></i> ${origen}`;
      arNombre.textContent = item.nombre;
      arCodigo.textContent = item.codigo;
      arStockNum.textContent = item.stock;
      arEstadoSelect.value = item.estado || "Disponible";
      arPrecio.textContent = `$${Number(item.precio).toFixed(2)} ${item.moneda || "USD"}`;
      arPasillo.textContent = item.pasillo || "-";
      arEstante.textContent = item.estante || "-";
      arNivel.textContent = item.nivel || "-";

      arCard.classList.add("active");
      scanStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--accent-emerald);"></i> ${item.nombre}`;

      if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
    } catch (err) {}
  }

  // Modificar stock en Excel en tiempo real
  async function actualizarStockEnExcel(delta, nuevoEstado = null) {
    if (!currentArticleCode) return;

    try {
      scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando en Excel...`;
      
      const payload = {};
      if (typeof delta === "number") payload.delta = delta;
      if (nuevoEstado) payload.nuevoEstado = nuevoEstado;

      const resp = await fetch(`/api/articulos/${encodeURIComponent(currentArticleCode)}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Error en servidor");

      const data = await resp.json();
      arStockNum.textContent = data.articulo.stock;
      arEstadoSelect.value = data.articulo.estado;

      scanStatus.innerHTML = `<i class="fa-solid fa-floppy-disk" style="color:var(--accent-emerald);"></i> Guardado en Excel: Stock ${data.articulo.stock}`;
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (e) {
      scanStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-rose);"></i> Error actualizando Excel`;
    }
  }

  btnSumarStock.addEventListener("click", () => actualizarStockEnExcel(1));
  btnRestarStock.addEventListener("click", () => actualizarStockEnExcel(-1));
  arEstadoSelect.addEventListener("change", (e) => actualizarStockEnExcel(null, e.target.value));

  closeCardBtn.addEventListener("click", () => {
    arCard.classList.remove("active");
    currentArticleCode = null;
    scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Apunte al objeto...`;
  });

  function setModo(nuevoModo) {
    activeMode = nuevoModo;
    [modeFotoBtn, modeQrBtn, modeIaBtn].forEach(b => b.classList.remove("active"));

    if (nuevoModo === "foto") {
      modeFotoBtn.classList.add("active");
      scanStatus.innerHTML = `<i class="fa-solid fa-image"></i> Modo Foto Real activo.`;
    } else if (nuevoModo === "qr") {
      modeQrBtn.classList.add("active");
      scanStatus.innerHTML = `<i class="fa-solid fa-qrcode"></i> Modo QR activo. Enfoque código.`;
    } else if (nuevoModo === "ia") {
      modeIaBtn.classList.add("active");
      if (!mobilenetModel) {
        scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cargando IA...`;
        mobilenet.load().then(m => {
          mobilenetModel = m;
          scanStatus.innerHTML = `<i class="fa-solid fa-brain"></i> IA lista.`;
        });
      } else {
        scanStatus.innerHTML = `<i class="fa-solid fa-brain"></i> Modo IA activo.`;
      }
    }
  }

  modeFotoBtn.addEventListener("click", () => setModo("foto"));
  modeQrBtn.addEventListener("click", () => setModo("qr"));
  modeIaBtn.addEventListener("click", () => setModo("ia"));

  async function arrancarCamara() {
    if (cameraPrompt) cameraPrompt.style.display = "none";
    try {
      html5QrCode = new Html5Qrcode("reader");

      const config = {
        fps: 15,
        qrbox: (w, h) => {
          const edge = Math.min(w, h);
          return { width: Math.floor(edge * 0.75), height: Math.floor(edge * 0.75) };
        }
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (activeMode === "qr" || activeMode === "foto") {
            let cod = decodedText.trim();
            if (cod.includes("codigo=")) {
              try {
                const u = new URL(cod);
                const ex = u.searchParams.get("codigo");
                if (ex) cod = ex;
              } catch(e) {}
            }
            mostrarDetalleArticulo(cod, "CÓDIGO QR");
          }
        },
        () => {}
      );

      precalibrarFotosReales();
      iniciarBucleDeteccion();
    } catch (err) {
      console.warn("Fallo cámara directa:", err);
      if (cameraPrompt) cameraPrompt.style.display = "block";
    }
  }

  if (btnStartCamera) btnStartCamera.addEventListener("click", arrancarCamara);
  arrancarCamara();
});
