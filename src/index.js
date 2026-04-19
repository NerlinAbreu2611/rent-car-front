import React from "react";
import { Login } from "./components/logginComponent";
import ReactDom from "react-dom/client";
import { Dashboard } from "./components/dashboardComponent";
import { BrowserRouter } from "react-router-dom";
import { App } from "./components/app";
import { initAudit } from "./utils/auditInterceptor";

// Inicializar auditoría automática
initAudit();
const rootElement = document.getElementById("root");

const root = ReactDom.createRoot(rootElement);

root.render(
  <>
    {" "}
    <BrowserRouter>
      <App></App>
    </BrowserRouter>{" "}
  </>,
);
