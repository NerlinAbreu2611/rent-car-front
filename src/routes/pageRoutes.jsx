import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Cliente } from "../pages/cliente";
import { Tablero } from "../pages/tablero";

export function PageRoutes() {
  return (
    <Routes>
      <Route path="cliente" element={<Cliente />} />
      <Route path="tablero" element={<Tablero />} />
      <Route path="*" element={<Navigate to="tablero" replace />} />
    </Routes>
  );
}
