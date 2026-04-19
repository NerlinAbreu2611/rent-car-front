import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CardMedia,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";

import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../assets/rentcar_logo.png";
import { Fade, Grow } from "@mui/material";
import { crearBitacora } from "../utils/bitacora";

export function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [errors, setErrors] = useState({
    usuario: "Campo requerido*",
    clave: "Campo requerido*",
  });
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success"); // success, error, warning, info
  const navigate = useNavigate();
  const isDisabled = Object.values(errors).some((e) => e.length > 0) || loading;

  // Abrir el SnackBar funcion
  const handleOpen = (msg, sev = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return; // opcional: evita cerrar al hacer click fuera
    setOpen(false);
  };

  // Manejador de errores del usuario
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsuario(value);

    if (value.length <= 2) {
      setErrors((prev) => ({
        ...prev,
        usuario: "Usuario requerido*",
      }));
    } else {
      setErrors((prev) => ({ ...prev, usuario: "" }));
    }
  };

  //Manejador de errores de la clave
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setClave(value);

    if (value.length <= 2 || value === "") {
      setErrors((prev) => ({
        ...prev,
        clave: "Clave requerida*",
      }));
    } else {
      setErrors((prev) => ({ ...prev, clave: "" }));
    }
  };

  const obtenerUsuarios = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/usuario");
      const data = await res.json();

      const autenticado = Object.values(data).find(
        (e) =>
          e.username === usuario &&
          e.password === clave &&
          e.estado === "activo",
      );

      if (autenticado !== undefined) {
        localStorage.setItem("usuario", JSON.stringify(autenticado));

        handleOpen("Autenticación exitosa");

        crearBitacora(
          autenticado.usuario_id,
          "INICIAR SESION",
          `El usuario ${autenticado.username} inicio sesión.`,
          `GET`,
          "USUARIO",
        );

        navigate("/dashboard");
      } else {
        localStorage.setItem("usuario", null);
        handleOpen("Usuario o contraseña incorrectos", "error");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3a8a 0%, #111827 100%)", // Fondo degradado premium
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)',
          top: '-50%',
          left: '-50%',
        }
      }}
    >
      <Grow in={true} timeout={1000}>
        <Card sx={{
          width: 400,
          p: 3,
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Fade in={true} timeout={1500}>
                <CardMedia
                  component="img"
                  height="150"
                  width="150"
                  image={Logo}
                  alt="Rent Car Logo"
                  sx={{ objectFit: "contain", mb: 2, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                />
              </Fade>
              <Typography variant="h5" color="primary.dark" fontWeight="800" sx={{ letterSpacing: 1 }}>
                ACCESO AL SISTEMA
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gestión Profesional de Flota y Alquileres
              </Typography>
            </Box>

            <Stack spacing={2.5}>
              <TextField
                label="Nombre de Usuario"
                variant="outlined"
                fullWidth
                value={usuario}
                onChange={handleUsernameChange}
                error={!!errors.usuario}
                helperText={errors.usuario}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                value={clave}
                fullWidth
                onChange={handlePasswordChange}
                error={!!errors.clave}
                helperText={errors.clave}
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={obtenerUsuarios}
                disabled={isDisabled}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(30, 58, 138, 0.4)'
                  }
                }}
              >
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </Button>
            </Stack>

            <Snackbar
              open={open}
              autoHideDuration={4000}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert
                onClose={handleClose}
                severity={severity}
                sx={{ width: "100%", borderRadius: 2 }}
                variant="filled"
              >
                {message}
              </Alert>
            </Snackbar>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}

export default Login;
