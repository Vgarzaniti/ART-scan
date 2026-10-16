document.addEventListener("DOMContentLoaded", () => {
  const arCard = document.getElementById("arCard");
  const closeCardBtn = document.getElementById("closeCardBtn");
  const quickSimSelect = document.getElementById("quickSimSelect");
  const scanStatus = document.getElementById("scanStatus");
  const cameraPrompt = document.getElementById("cameraPrompt");
  const btnStartCamera = document.getElementById("btnStartCamera");

  const arNombre = document.getElementById("arNombre");
  const arCodigo = document.getElementById("arCodigo");
  const arDesc = document.getElementById("arDesc");
  const arStock = document.getElementById("arStock");
  const arPrecio = document.getElementById("arPrecio");
  const arPasillo = document.getElementById("arPasillo");
  const arEstante = document.getElementById("arEstante");
  const arNivel = document.getElementById("arNivel");

  let html5QrCode = null;
  let lastScannedCode = null;

  async function mostrarDetalleArticulo(identificador) {
    try {
      scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Obteniendo datos de ${identificador}...`;
      const resp = await fetch(`/api/articulos/${encodeURIComponent(identificador)}`);
      
      if (!resp.ok) {
        throw new Error("No encontrado");
      }

      const item = await resp.json();

      arNombre.textContent = item.nombre;
      arCodigo.textContent = item.codigo;
      arDesc.textContent = item.descripcion || "Sin descripción";
      arStock.textContent = `${item.stock} unidades`;
      arPrecio.textContent = `$${Number(item.precio).toFixed(2)} ${item.moneda || "USD"}`;
      arPasillo.textContent = item.pasillo || "-";
      arEstante.textContent = item.estante || "-";
      arNivel.textContent = item.nivel || "-";

      arCard.classList.add("active");
      scanStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--accent-emerald);"></i> Objeto fijado: <strong>${item.codigo}</strong>`;
      
      if (navigator.vibrate) {
        navigator.vibrate(80);
      }
    } catch (err) {
      scanStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-rose);"></i> Código ${identificador} no registrado`;
      setTimeout(() => {
        scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Apunte al código QR del artículo...`;
      }, 3000);
    }
  }

  closeCardBtn.addEventListener("click", () => {
    arCard.classList.remove("active");
    lastScannedCode = null;
    scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Apunte al código QR del artículo...`;
  });

  quickSimSelect.addEventListener("change", (e) => {
    if (e.target.value) {
      mostrarDetalleArticulo(e.target.value);
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const paramCodigo = urlParams.get("codigo");
  if (paramCodigo) {
    mostrarDetalleArticulo(paramCodigo);
  }

  async function arrancarCamara() {
    scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Solicitando cámara trasera...`;
    if (cameraPrompt) cameraPrompt.style.display = "none";

    try {
      html5QrCode = new Html5Qrcode("reader");

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight);
          return {
            width: Math.floor(edge * 0.75),
            height: Math.floor(edge * 0.75)
          };
        }
      };

      await html5QrCode.start(
        { facingMode: { exact: "environment" } },
        config,
        onScanSuccess,
        () => {}
      );

      scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Escaneando entorno...`;
    } catch (err) {
      console.warn("Fallo con facingMode exact environment, intentando facingMode general:", err);
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 15 },
          onScanSuccess,
          () => {}
        );
        scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Escaneando entorno...`;
      } catch (errFallback) {
        console.error("Error crítico al iniciar cámara:", errFallback);
        scanStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-amber);"></i> Cámara no permitida. En Chrome/Safari habilita permisos de cámara.`;
        if (cameraPrompt) cameraPrompt.style.display = "block";
      }
    }
  }

  function onScanSuccess(decodedText) {
    let codigoDetectado = decodedText.trim();

    if (codigoDetectado.includes("codigo=")) {
      try {
        const urlObj = new URL(codigoDetectado);
        const extraido = urlObj.searchParams.get("codigo");
        if (extraido) codigoDetectado = extraido;
      } catch(e) {}
    }

    if (codigoDetectado !== lastScannedCode) {
      lastScannedCode = codigoDetectado;
      mostrarDetalleArticulo(codigoDetectado);
    }
  }

  if (btnStartCamera) {
    btnStartCamera.addEventListener("click", arrancarCamara);
  }

  // Si no requiere click explicito, intentamos directamente
  arrancarCamara();
});
