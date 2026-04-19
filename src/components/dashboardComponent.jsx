import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Avatar,
  Card,
  CardContent,
  Divider,
  ListItemIcon,
} from "@mui/material";

import { Cliente } from "../pages/cliente";
import { PageRoutes } from "../routes/pageRoutes";
import { Link } from "react-router-dom";

import Logout from "@mui/icons-material/Logout";
import Settings from "@mui/icons-material/Settings";
import Tooltip from "@mui/material/Tooltip";

import CarRentalIcon from "@mui/icons-material/CarRental";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";

export function Dashboard() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null); // Para saber CUÁL menú abrir

  const navigate = useNavigate();

  const handleOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const [usuario] = useState(() => {
    const data = localStorage.getItem("usuario");
    return data ? JSON.parse(data) : null;
  });

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Región izquierda */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              color="inherit"
              Typography="h6"
              component={Link}
              to="/dashboard/tablero"
            >
              <CarRentalIcon />
              <Typography variant="h6">Rent Car</Typography>
            </Button>
          </Box>

          {/* Región central */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              color="inherit"
              onClick={(e) => handleOpen(e, "menuMantenimiento")}
            >
              Mantenimientos
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={menuId === "menuMantenimiento"}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <MenuItem
                onClick={handleClose}
                component={Link}
                to="/dashboard/cliente"
              >
                Clientes
              </MenuItem>
              {usuario.rol === "admin" ? (
                <MenuItem
                  onClick={handleClose}
                  component={Link}
                  to="/dashboard/usuario"
                >
                  Usuarios
                </MenuItem>
              ) : (
                ""
              )}
              <MenuItem
                onClick={handleClose}
                component={Link}
                to="/dashboard/vehiculo"
              >
                Vehiculos
              </MenuItem>
              <MenuItem
                onClick={handleClose}
                component={Link}
                to="/dashboard/feriado"
              >
                Días Feriados
              </MenuItem>
            </Menu>

            <Button
              color="inherit"
              onClick={(e) => handleOpen(e, "menuMovimientos")}
            >
              Movimientos
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={menuId === "menuMovimientos"}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <MenuItem onClick={handleClose} component={Link} to="/dashboard/reservas">Registro de Alquiler de Vehículo</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/dashboard/recepciones">Devolucion de vehiculo</MenuItem>

              <MenuItem onClick={handleClose} component={Link} to="/dashboard/pagos">Pago de vehiculo</MenuItem>
            </Menu>
            <Button
              color="inherit"
              onClick={(e) => handleOpen(e, "menuConsultas")}
            >
              Consultas
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={menuId === "menuConsultas"}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <MenuItem onClick={handleClose} component={Link} to="/dashboard/consultas">
                 Explorador de Consultas Dinámico
              </MenuItem>
            </Menu>

            <Button
              color="inherit"
              onClick={(e) => handleOpen(e, "menuReportes")}
            >
              Reportes
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={menuId === "menuReportes"}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <MenuItem onClick={handleClose} component={Link} to="/dashboard/reportes">
                 Portal de Reportes de Rentabilidad y Descargas
              </MenuItem>
            </Menu>
          </Box>

          {/* Región derecha */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={(e) => handleOpen(e, "menuAvatar")}>
              {" "}
              <Avatar>
                <PersonIcon></PersonIcon>
              </Avatar>
            </IconButton>

            {/* EL MENÚ DESPLEGABLE */}
            <Menu
              anchorEl={anchorEl}
              open={menuId === "menuAvatar"}
              onClose={handleClose}
              onClick={handleClose}
              // Posicionamiento para que flote debajo del círculo
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 200, overflow: "visible" },
              }}
            >
              {/* CABECERA CON DATOS DEL USUARIO */}
              <Box
                sx={{
                  px: 0.2,
                  py: 1,
                  display: "flex", // Activa Flexbox
                  flexDirection: "column", // Apila los elementos verticalmente
                  alignItems: "center", // Centra los hijos horizontalmente
                  justifyContent: "center", // Centra los hijos verticalmente
                  width: "100%", // Ocupa todo el ancho del Menú
                  textAlign: "center", // Asegura que el texto largo se centre
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    width: "100%", // Fuerza al texto a usar todo el ancho para centrarse
                    display: "block",
                  }}
                >
                  {usuario.nombre} {usuario.apellido}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ width: "100%", display: "block" }}
                >
                  {usuario.rol}
                </Typography>
              </Box>

              <Divider />

              {/* OPCIONES DEL MENÚ */}
              <MenuItem
                onClick={handleClose}
                component={Link}
                to="/dashboard/perfil"
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Mi Perfil
              </MenuItem>

              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Configuración
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleClose();

                  setTimeout(() => {
                    cerrarSesion();
                  }, 10);
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "error.main" }} />
                </ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>

            <Divider />
            <Tooltip title="Salir">
              <Button color="inherit" onClick={cerrarSesion}>
                <LogoutIcon />
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 1 }}>
        <Card elevation={0} sx={{ border: 'none', bgcolor: 'transparent' }}>
          <CardContent>
            {/* Aquí van tus componentes de navegación o cualquier contenido */}
            <PageRoutes />
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
