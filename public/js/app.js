document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const articulosGrid = document.getElementById("articulosGrid");
  const totalCounter = document.getElementById("totalCounter");
  const loading = document.getElementById("loading");

  let debounceTimer;

  async function cargarArticulos(filtro = "") {
    if (loading) loading.style.display = "block";
    try {
      const url = filtro ? `/api/articulos?q=${encodeURIComponent(filtro)}` : "/api/articulos";
      const resp = await fetch(url);
      const data = await resp.json();

      totalCounter.textContent = data.total;
      renderizarArticulos(data.datos);
    } catch (err) {
      articulosGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--accent-rose);">
        <i class="fa-solid fa-triangle-exclamation"></i> Error al conectar con el servidor o leer la base de datos Excel.
      </div>`;
    } finally {
      if (loading) loading.style.display = "none";
    }
  }

  function getStockBadge(stock, estado) {
    if (stock <= 5 || estado === "Stock Critico") {
      return `<span class="badge-stock stock-crit"><i class="fa-solid fa-circle-exclamation"></i> Crítico: ${stock} un.</span>`;
    } else if (stock <= 10 || estado === "Stock Bajo") {
      return `<span class="badge-stock stock-low"><i class="fa-solid fa-triangle-exclamation"></i> Bajo: ${stock} un.</span>`;
    }
    return `<span class="badge-stock stock-ok"><i class="fa-solid fa-check"></i> Stock: ${stock} un.</span>`;
  }

  function renderizarArticulos(articulos) {
    if (!articulos || articulos.length === 0) {
      articulosGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fa-regular fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>No se encontraron artículos que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    articulosGrid.innerHTML = articulos.map(item => `
      <div class="card">
        <div class="card-header">
          <span class="card-code">${item.codigo}</span>
          ${getStockBadge(item.stock, item.estado)}
        </div>
        <h3 class="card-title">${item.nombre}</h3>
        <p class="card-desc">${item.descripcion || "Sin descripción disponible."}</p>
        
        <div class="location-box">
          <div class="location-title"><i class="fa-solid fa-location-dot"></i> Ubicación en Almacén</div>
          <div class="location-val">
            <span>Pasillo: <strong>${item.pasillo || "-"}</strong></span>
            <span>Estante: <strong>${item.estante || "-"}</strong></span>
            <span>Nivel: <strong>${item.nivel || "-"}</strong></span>
          </div>
        </div>

        <div class="card-footer">
          <div>
            <span class="currency">${item.moneda || "USD"}</span>
            <span class="price-tag">$${Number(item.precio).toFixed(2)}</span>
          </div>
          <a href="scanner.html?codigo=${encodeURIComponent(item.codigo)}" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
            <i class="fa-solid fa-eye"></i> Ver AR
          </a>
        </div>
      </div>
    `).join("");
  }

  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      cargarArticulos(e.target.value);
    }, 250);
  });

  cargarArticulos();
});
