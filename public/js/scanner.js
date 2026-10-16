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

  // Diccionario de mapeo visual MobileNet -> Artículos del inventario
  const MAPEO_VISION = [
    {
      codigo: "ART-003", // Joystick PS4
      keywords: ["joystick", "game controller", "remote control", "control", "hand held computer", "mouse"]
    },
    {
      codigo: "ART-001", // Calculadora Casio
      keywords: ["calculator", "hand-held computer", "cellular telephone", "digital watch", "abacus"]
    },
    {
      codigo: "ART-004", // Auriculares Gamer
      keywords: ["headphones", "headphone", "earphone", "microphone", "loudspeaker"]
    },
    {
      codigo: "ART-002", // Cargador Samsung USB-C
      keywords: ["plug", "power cord", "cable", "adapter", "charger", "switch"]
    }
  ];

  async function cargarModeloVision() {
    try {
      scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cargando IA de visión...`;
      mobilenetModel = await mobilenet.load();
      scanStatus.innerHTML = `<i class="fa-solid fa-brain" style="color:var(--accent-cyan);"></i> IA de Visión activa. Apunte al objeto.`;
      iniciarBucleVision();
    } catch (e) {
      console.warn("No se pudo cargar MobileNet:", e);
      scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Apunte al código QR o use selector.`;
    }
  }

  function iniciarBucleVision() {
    if (aiInterval) clearInterval(aiInterval);

    aiInterval = setInterval(async () => {
      if (!mobilenetModel || isAiRunning || arCard.classList.contains("active")) {
        return;
      }

      const videoEl = document.querySelector("#reader video");
      if (!videoEl || videoEl.readyState < 2) return;

      isAiRunning = true;
      try {
        const predictions = await mobilenetModel.classify(videoEl, 3);
        
        if (predictions && predictions.length > 0) {
          const topClase = predictions[0].className.toLowerCase();
          const topProb = Math.round(predictions[0].probability * 100);

          for (const item of MAPEO_VISION) {
            const matched = item.keywords.some(kw => topClase.includes(kw));
            if (matched && topProb >= 18) {
              mostrarDetalleArticulo(item.codigo, `IA DETECTÓ: ${predictions[0].className} (${topProb}%)`);
              break;
            }
          }
        }
      } catch (err) {
        // Ignorar excepciones transitorias de render
      } finally {
        isAiRunning = false;
      }
    }, 800); // Analiza cada 800ms
  }

  async function mostrarDetalleArticulo(identificador, origen = "OBJETO IDENTIFICADO") {
    try {
      if (lastIdentifiedCode === identificador && arCard.classList.contains("active")) return;

      scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Conectando con inventario...`;
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

      // Una vez prendida la cámara, cargamos el modelo de visión artificial
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
