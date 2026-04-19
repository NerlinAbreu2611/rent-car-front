import { crearBitacora } from "./bitacora";

/**
 * auditInterceptor.js
 * Sobreescribe el fetch global para registrar automáticamente las acciones del usuario.
 */
export function initAudit() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const url = args[0];
    const options = args[1] || {};
    const method = options.method || "GET";

    // 1. Evitar bucles infinitos y omitir peticiones que no sean a la API local
    if (url.includes("/api/bitacora") || !url.includes("localhost:3001/api")) {
      return originalFetch(...args);
    }

    // 2. Extraer Entidad de la URL
    // Ej: http://localhost:3001/api/cliente -> CLIENTE
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1].split("?")[0];
    const entity = lastPart.toUpperCase();

    // 3. Obtener Usuario Actual
    const userStr = localStorage.getItem("usuario");
    const usuario = userStr ? JSON.parse(userStr) : null;
    const usuario_id = usuario ? usuario.usuario_id : null;

    // 4. Determinar Acción Genérica
    let accion = "";
    switch (method) {
      case "POST": accion = "CREAR"; break;
      case "PUT": case "PATCH": accion = "ACTUALIZAR"; break;
      case "DELETE": accion = "ELIMINAR"; break;
      default: accion = "CONSULTAR";
    }

    // 5. Crear Bitácora de forma asíncrona (no bloqueamos el fetch original)
    if (usuario_id) {
      const descripcion = `${accion} en la entidad ${entity}`;
      
      // Llamamos a crearBitacora sin await para que el fetch principal siga su curso rápidamente
      crearBitacora(usuario_id, accion, descripcion, method, entity);
    }

    return originalFetch(...args);
  };
}
