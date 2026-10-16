document.addEventListener("DOMContentLoaded", () => {
  const arCard = document.getElementById("arCard");
  const closeCardBtn = document.getElementById("closeCardBtn");
  const quickSimSelect = document.getElementById("quickSimSelect");
  const scanStatus = document.getElementById("scanStatus");

  const arNombre = document.getElementById("arNombre");
  const arCodigo = document.getElementById("arCodigo");
  const arDesc = document.getElementById("arDesc");
  const arStock = document.getElementById("arStock");
  const arPrecio = document.getElementById("arPrecio");
  const arPasillo = document.getElementById("arPasillo");
  const arEstante = document.getElementById("arEstante");
  const arNivel = document.getElementById("arNivel");

  let html5QrCode = null;
  let isScanning = false;
  let lastScannedCode = null;

  async function mostrarDetalleArticulo(identificador) {
    try {
      scanStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Cargando datos de ${identificador}...`;
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
      
      // Feedback haptico/vibracion en celulares si esta soportado
      if (navigator.vibrate) {
        navigator.vibrate(80);
      }
    } catch (err) {
      scanStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-rose);"></i> Código ${identificador} no registrado en inventario`;
      setTimeout(() => {
        scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Buscando código en campo de visión...`;
      }, 3000);
    }
  }

  closeCardBtn.addEventListener("click", () => {
    arCard.classList.remove("active");
    lastScannedCode = null;
    scanStatus.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Buscando código en campo de visión...`;
  });

  quickSimSelect.addEventListener("change", (e) => {
    if (e.target.value) {
      mostrarDetalleArticulo(e.target.value);
    }
  });

  // Revisar si viene parametro por URL (ej: scanner.html?codigo=ART-001)
  const urlParams = new URLSearchParams(window.location.search);
  const paramCodigo = urlParams.get("codigo");
  if (paramCodigo) {
    mostrarDetalleArticulo(paramCodigo);
  }

  // Inicializar Camara con Html5Qrcode
  function iniciarCamara() {
    html5QrCode = new Html5Qrcode("reader");

    const qrConfig = {
      fps: 15,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    html5QrCode.start(
      { facingMode: "environment" }, // Camara trasera en celulares
      qrConfig,
      (decodedText) => {
        let codigoDetectado = decodedText.trim();

        // Si el QR tiene formato de URL completa (ej: http://.../scanner.html?codigo=ART-001)
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
      },
      () => {
        // Ignorar errores de frame vacio durante el rastreo continuo
      }
    ).catch(err => {
      console.warn("No se pudo iniciar cámara automáticamente:", err);
      scanStatus.innerHTML = `<i class="fa-solid fa-camera-rotate"></i> Modo simulador activo (cámara no disponible o sin permiso).`;
    });
  }

  // Si estamos en un navegador que soporta getUserMedia, iniciamos cámara
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    iniciarCamara();
  } else {
    scanStatus.innerHTML = `<i class="fa-solid fa-circle-info"></i> Usa el selector superior para simular lecturas AR.`;
  }
});
