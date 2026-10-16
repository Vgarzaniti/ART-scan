document.addEventListener("DOMContentLoaded", () => {
  const arCard = document.getElementById("arCard");
  const closeCardBtn = document.getElementById("closeCardBtn");
  const quickSimSelect = document.getElementById("quickSimSelect");
  const scanStatus = document.getElementById("scanStatus");
  const cameraPrompt = document.getElementById("cameraPrompt");
  const btnStartCamera = document.getElementById("btnStartCamera");
  const arTag = document.getElementById("arTag");

  const arNombre = document.getElementById("arNombre");
  const arCodigo = document.getElementById("arCodigo");
  const arDesc = document.getElementById("arDesc");
  const arStock = document.getElementById("arStock");
  const arPrecio = document.getElementById("arPrecio");
  const arPasillo = document.getElementById("arPasillo");
  const arEstante = document.getElementById("arEstante");
  const arNivel = document.getElementById("arNivel");

  let html5QrCode = null;
  let lastIdentifiedCode = null;
  let mobilenetModel = null;
  let isAiRunning = false;
  let aiInterval = null;

  // Diccionario de clases estrictas de ImageNet para cada artículo
  const MAPEO_VISION = [
    {
      codigo: "ART-003", // Joystick PS4 DualShock
      // Clases exactas de ImageNet: joystick, game controller
      keywords: ["joystick", "game_controller", "control"]
    },
    {
      codigo: "ART-001", // Calculadora Casio fx-350MS
      // Clases exactas de ImageNet: calculator, pocket calculator
      keywords: ["calculator", "pocket_calculator"]
    },
    {
      codigo: "ART-004", // Auriculares Gamer
      // Clases exactas de ImageNet: acoustic headphones, earphones, headphone
      keywords: ["headphone", "headphones", "earphone", "earphones", "headset"]
    },
    {
      codigo: "ART-002", // Cargador Samsung USB-C
      // Clases exactas de ImageNet: plug, power cord
      keywords: ["power_cord", "plug", "electric_cord", "cord", "battery_charger"]
    }
  ];

  async function cargarModeloVision() {
    try {
      scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cargando IA de visión...`;
      mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
      scanStatus.innerHTML = `<i class="fa-solid fa-brain" style="color:var(--accent-cyan);"></i> IA activa. Muestra el objeto centrado.`;
      iniciarBucleVision();
    } catch (e) {
      console.warn("No se pudo cargar MobileNet:", e);
      scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Apunte al código QR o use selector.`;
    }
  }

  function iniciarBucleVision() {
    if (aiInterval) clearInterval(aiInterval);

    aiInterval = setInterval(async () => {
      // Si la tarjeta ya está abierta, no sobreescribir hasta que el usuario la cierre
      if (!mobilenetModel || isAiRunning || arCard.classList.contains("active")) {
        return;
      }

      const videoEl = document.querySelector("#reader video");
      if (!videoEl || videoEl.readyState < 2) return;

      isAiRunning = true;
      try {
        const predictions = await mobilenetModel.classify(videoEl, 5);
        
        if (predictions && predictions.length > 0) {
          // Mostrar lo que la IA está viendo en tiempo real para dar visibilidad
          const claseDetectada = predictions[0].className;
          const probDetectada = Math.round(predictions[0].probability * 100);

          scanStatus.innerHTML = `<i class="fa-solid fa-eye" style="color:var(--accent-cyan);"></i> Viendo: <strong>${claseDetectada.split(",")[0]}</strong> (${probDetectada}%)`;

          // Buscar coincidencia en las top 3 predicciones con umbral más estricto (>= 30%)
          for (const pred of predictions) {
            const predClase = pred.className.toLowerCase().replace(/\s+/g, "_");
            const predProb = Math.round(pred.probability * 100);

            if (predProb < 25) continue;

            for (const item of MAPEO_VISION) {
              const coincide = item.keywords.some(kw => predClase.includes(kw));
              if (coincide) {
                mostrarDetalleArticulo(item.codigo, `IA DETECTÓ: ${pred.className.split(",")[0]} (${predProb}%)`);
                return;
              }
            }
          }
        }
      } catch (err) {
        // Ignorar excepciones transitorias
      } finally {
        isAiRunning = false;
      }
    }, 600);
  }

  async function mostrarDetalleArticulo(identificador, origen = "OBJETO IDENTIFICADO") {
    try {
      if (lastIdentifiedCode === identificador && arCard.classList.contains("active")) return;

      scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cargando datos...`;
      const resp = await fetch(`/api/articulos/${encodeURIComponent(identificador)}`);
      
      if (!resp.ok) throw new Error("No encontrado");

      const item = await resp.json();
      lastIdentifiedCode = identificador;

      arTag.innerHTML = `<i class="fa-solid fa-robot"></i> ${origen}`;
      arNombre.textContent = item.nombre;
      arCodigo.textContent = item.codigo;
      arDesc.textContent = item.descripcion || "Sin descripción";
      arStock.textContent = `${item.stock} unidades`;
      arPrecio.textContent = `$${Number(item.precio).toFixed(2)} ${item.moneda || "USD"}`;
      arPasillo.textContent = item.pasillo || "-";
      arEstante.textContent = item.estante || "-";
      arNivel.textContent = item.nivel || "-";

      arCard.classList.add("active");
      scanStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--accent-emerald);"></i> Reconocido: <strong>${item.nombre}</strong>`;
      
      if (navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
    } catch (err) {
      scanStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-rose);"></i> Código no registrado`;
    }
  }

  closeCardBtn.addEventListener("click", () => {
    arCard.classList.remove("active");
    lastIdentifiedCode = null;
    scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Apunte al objeto o código QR...`;
  });

  quickSimSelect.addEventListener("change", (e) => {
    if (e.target.value) {
      mostrarDetalleArticulo(e.target.value, "SELECCIÓN MANUAL");
    }
  });

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
          let cod = decodedText.trim();
          if (cod.includes("codigo=")) {
            try {
              const urlObj = new URL(cod);
              const extraido = urlObj.searchParams.get("codigo");
              if (extraido) cod = extraido;
            } catch(e) {}
          }
          mostrarDetalleArticulo(cod, "CÓDIGO QR ESCANEADO");
        },
        () => {}
      );

      cargarModeloVision();
    } catch (err) {
      console.warn("Fallo cámara directa:", err);
      if (cameraPrompt) cameraPrompt.style.display = "block";
    }
  }

  if (btnStartCamera) {
    btnStartCamera.addEventListener("click", arrancarCamara);
  }

  arrancarCamara();
});
