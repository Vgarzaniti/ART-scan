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
        <i class="fa-solid fa-triangle-exclamation"></i> Error al conectar con el servidor o leer el Excel.
      </div>`;
    } finally {
      if (loading) loading.style.display = "none";
    }
  }

  function getStockBadge(stock, estado) {
    if (stock <= 2 || estado === "Stock Critico") {
      return `<span class="badge-stock stock-crit"><i class="fa-solid fa-circle-exclamation"></i> Crítico: ${stock} un.</span>`;
    } else if (stock <= 8 || estado === "Stock Bajo") {
      return `<span class="badge-stock stock-low"><i class="fa-solid fa-triangle-exclamation"></i> Bajo: ${stock} un.</span>`;
    }
    return `<span class="badge-stock stock-ok"><i class="fa-solid fa-check"></i> Stock: ${stock} un.</span>`;
  }

  function renderizarArticulos(articulos) {
    if (!articulos || articulos.length === 0) {
      articulosGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fa-regular fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>No se encontraron artículos.</p>
        </div>
      `;
      return;
    }

    articulosGrid.innerHTML = articulos.map(item => `
      <div class="card" id="card-${item.codigo}">
        <div class="card-header">
          <span class="card-code">${item.codigo}</span>
          <span id="badge-${item.codigo}">${getStockBadge(item.stock, item.estado)}</span>
        </div>
        <h3 class="card-title">${item.nombre}</h3>
        <p class="card-desc">${item.descripcion || "Sin descripción disponible."}</p>
        
        <!-- Controles de Stock directos al Excel -->
        <div style="background: rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:8px; padding:0.6rem 0.8rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
          <button onclick="modificarStockWeb('${item.codigo}', -1)" style="width:32px; height:32px; border-radius:6px; border:none; background:rgba(244,63,94,0.2); color:var(--accent-rose); font-weight:800; cursor:pointer;">-</button>
          
          <div style="text-align:center;">
            <div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Stock en Excel</div>
            <strong id="stock-val-${item.codigo}" style="font-size:1.15rem; color:#fff;">${item.stock}</strong>
          </div>

          <button onclick="modificarStockWeb('${item.codigo}', 1)" style="width:32px; height:32px; border-radius:6px; border:none; background:rgba(16,185,129,0.2); color:var(--accent-emerald); font-weight:800; cursor:pointer;">+</button>

          <select onchange="cambiarEstadoWeb('${item.codigo}', this.value)" style="background:var(--bg-secondary); border:1px solid var(--border-color); color:#fff; font-size:0.75rem; padding:0.3rem 0.5rem; border-radius:6px; outline:none;">
            <option value="Disponible" ${item.estado === "Disponible" ? "selected" : ""}>Disponible</option>
            <option value="Stock Bajo" ${item.estado === "Stock Bajo" ? "selected" : ""}>Stock Bajo</option>
            <option value="Stock Critico" ${item.estado === "Stock Critico" ? "selected" : ""}>Stock Crítico</option>
            <option value="En Mantenimiento" ${item.estado === "En Mantenimiento" ? "selected" : ""}>En Mantenimiento</option>
          </select>
        </div>

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

  // Funciones globales para actualizar stock desde el catálogo web
  window.modificarStockWeb = async function(codigo, delta) {
    try {
      const resp = await fetch(`/api/articulos/${encodeURIComponent(codigo)}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta })
      });
      if (!resp.ok) throw new Error("Fallo");
      const data = await resp.json();
      
      const stockEl = document.getElementById(`stock-val-${codigo}`);
      const badgeEl = document.getElementById(`badge-${codigo}`);
      if (stockEl) stockEl.textContent = data.articulo.stock;
      if (badgeEl) badgeEl.innerHTML = getStockBadge(data.articulo.stock, data.articulo.estado);
    } catch(e) {
      alert("Error actualizando stock en Excel");
    }
  };

  window.cambiarEstadoWeb = async function(codigo, nuevoEstado) {
    try {
      const resp = await fetch(`/api/articulos/${encodeURIComponent(codigo)}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEstado })
      });
      if (!resp.ok) throw new Error("Fallo");
      const data = await resp.json();
      
      const badgeEl = document.getElementById(`badge-${codigo}`);
      if (badgeEl) badgeEl.innerHTML = getStockBadge(data.articulo.stock, data.articulo.estado);
    } catch(e) {
      alert("Error actualizando estado en Excel");
    }
  };

  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      cargarArticulos(e.target.value);
    }, 250);
  });

  cargarArticulos();
});
