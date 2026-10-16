# Guía de Conexión y Seguridad Móvil (HTTPS)

Para utilizar la cámara del celular en aplicaciones WebAR, los navegadores modernos (Safari en iOS y Chrome en Android) implementan políticas de seguridad estrictas:

> **Requisito obligatorio:** La API `navigator.mediaDevices.getUserMedia` requiere una conexión **segura (HTTPS)** o el host `localhost`. El acceso vía `http://192.168...` es bloqueado por el navegador sin mostrar petición de permisos.

---

## 1. Arquitectura de Servidores Dual

ART-scan ejecuta simultáneamente dos servicios en la misma aplicación Node.js (`server.js`):

| Protocolo | Puerto | Propósito | Acceso Recomendado |
|---|---|---|---|
| **HTTP** | `3000` | Acceso local en PC de escritorio y pruebas sin cámara | [http://localhost:3000](http://localhost:3000) |
| **HTTPS Seguro** | `3443` | Conexión móvil desde celular en red Wi-Fi con cámara habilitada | `https://TU_IP:3443/scanner.html` |

---

## 2. Certificados SSL Autofirmados

El servidor genera automáticamente certificados criptográficos en el primer arranque dentro de la carpeta `.cert/`:
- `.cert/server.key`: Clave privada RSA.
- `.cert/server.crt`: Certificado X.509 válido por 365 días.

---

## 3. Procedimiento de Acceso en el Celular

1. Conectar la PC y el teléfono a la **misma red Wi-Fi**.
2. Obtener la IP local de la computadora:
   ```powershell
   ipconfig
   ```
   *(Ejemplo: `192.168.1.11`)*.
3. En el celular, abrir Chrome o Safari e ingresar a:
   ```
   https://192.168.1.11:3443/scanner.html
   ```
4. **Superar la advertencia de certificado autofirmado**:
   - En **Google Chrome (Android)**: Tocar *"Configuración avanzada"* -> *"Acceder a 192.168.1.11 (no seguro)"*.
   - En **Apple Safari (iOS)**: Tocar *"Mostrar detalles"* -> *"Visitar este sitio web"*.
5. Aceptar el diálogo del sistema operativo para otorgar permiso a la cámara trasera.
