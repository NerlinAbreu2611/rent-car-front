import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Cliente } from "../pages/cliente";
import { Tablero } from "../pages/tablero";

import { Vehiculo } from "../pages/vehiculo";
import { Usuario } from "../pages/usuario";
import { PerfilUsuario } from "../pages/perfilUsuario";
import { Feriados } from "../pages/feriados";
import { Reservas } from "../pages/reservas";
import { Recepciones } from "../pages/recepciones";
import { Pagos } from "../pages/pagos";
import { Consultas } from "../pages/consultas";
import { Reportes } from "../pages/reportes";

export function PageRoutes() {
  return (
    <Routes>
      <Route path="cliente" element={<Cliente />} />
      <Route path="tablero" element={<Tablero />} />
      <Route path="vehiculo" element={<Vehiculo />} />
      <Route path="reservas" element={<Reservas />} />
      <Route path="recepciones" element={<Recepciones />} />
      <Route path="pagos" element={<Pagos />} />
      <Route path="feriado" element={<Feriados />} />
      <Route path="consultas" element={<Consultas />} />
      <Route path="reportes" element={<Reportes />} />
      <Route path="perfil" element={<PerfilUsuario />}></Route>
      <Route path="usuario" element={<Usuario />}></Route>
      <Route path="*" element={<Navigate to="tablero" replace />} />
    </Routes>
  );
}
