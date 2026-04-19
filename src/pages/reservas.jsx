import React, { useState, useEffect } from "react";
import { 
  Box, Card, CardContent, Typography, Grid, TextField, 
  Button, MenuItem, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, Alert, Snackbar, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { Fade, Grow, Zoom, Divider } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function Reservas() {
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [feriados, setFeriados] = useState([]);
  
  const [selectedCliente, setSelectedCliente] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  const [carrito, setCarrito] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "info", msg: "" });

  useEffect(() => {
    fetchClientes();
    fetchDisponibles();
    fetchFeriados();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/cliente");
      const data = await res.json();
      setClientes(data.filter(c => c.estado === 'activo'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeriados = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/feriado");
      const data = await res.json();
      setFeriados(data.map(f => f.fecha.substring(0, 10)));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDisponibles = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/reserva/disponibles");
      const data = await res.json();
      setVehiculos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeAlert = () => setAlert({ ...alert, open: false });

  // Función para pre-calcular el costo en tiempo real en la UI
  const calcularCostoDinamico = (vehiculo, fInicio, fFin) => {
    if (!fInicio || !fFin) return 0;
    const start = dayjs(fInicio);
    const end = dayjs(fFin);
    if(end.diff(start, 'day') < 0) return 0;

    let subtotal = 0;
    let fechaActual = start;

    while (fechaActual.isBefore(end) || fechaActual.isSame(end, 'day')) {
      const dateStr = fechaActual.format("YYYY-MM-DD");
      const dayOfWeek = fechaActual.day(); // 0 is Sun, 6 is Sat
      
      let tipoDiaBase = (dayOfWeek === 0 || dayOfWeek === 6) ? 'fin_de_semana' : 'normal';
      const pObj = vehiculo.precios?.find(pr => pr.tipo_dia === tipoDiaBase);
      let diaPrecio = pObj ? Number(pObj.precio) : 0;
      
      if (feriados.includes(dateStr)) {
         diaPrecio += (diaPrecio * 0.30);
      }
      
      subtotal += diaPrecio;

      fechaActual = fechaActual.add(1, 'day');
    }
    return subtotal;
  };

  const agregarAlCarrito = (vehiculo) => {
    if (!fechaInicio || !fechaFin) {
      setAlert({ open: true, type: "warning", msg: "Primero seleccione las fechas para poder calcular precios." });
      return;
    }
    if (dayjs(fechaFin).isBefore(dayjs(fechaInicio))) {
      setAlert({ open: true, type: "error", msg: "La fecha de fin debe ser posterior a la de inicio." });
      return;
    }
    if (carrito.find(c => c.vehiculo_id === vehiculo.vehiculo_id)) {
      setAlert({ open: true, type: "warning", msg: "El vehículo ya está en el carrito." });
      return;
    }

    const costo = calcularCostoDinamico(vehiculo, fechaInicio, fechaFin);
    if(costo === 0) {
       setAlert({ open: true, type: "error", msg: "No se encontró precio para este vehículo en los días seleccionados." });
       return;
    }

    setCarrito([...carrito, { ...vehiculo, subtotal_calculado: costo }]);
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(c => c.vehiculo_id !== id));
  };

  const totalCarrito = carrito.reduce((acc, curr) => acc + curr.subtotal_calculado, 0);

  const procesarReserva = async () => {
    if (!selectedCliente || carrito.length === 0 || !fechaInicio || !fechaFin) {
      setAlert({ open: true, type: "error", msg: "Complete todos los campos obligatorios y agregue al menos un vehículo." });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:3001/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: selectedCliente,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          carrito: carrito.map(c => ({ vehiculo_id: c.vehiculo_id }))
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Error al procesar reserva");
      }

      const nuevaReserva = await resp.json();

      setAlert({ open: true, type: "success", msg: "¡Reserva procesada exitosamente! Imprimiendo Ticket..." });
      
      // Descarga de Ticket Automática (usando location para evitar popup blocker)
      window.location.href = `http://localhost:3001/api/reserva/${nuevaReserva.reserva_id}/ticket`;

      setCarrito([]);
      setFechaInicio("");
      setFechaFin("");
      setSelectedCliente("");
      fetchDisponibles(); // Refrescar stock
    } catch (error) {
      setAlert({ open: true, type: "error", msg: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ p: 0, width: "100%" }}>
        <Typography variant="h4" color="primary" sx={{ mb: 3, fontWeight: "bold" }}>
          Nueva Reserva / Alquiler
        </Typography>

        <Grid container spacing={2}>
          {/* PANEL IZQUIERDO: CABECERA Y SELECCION DE VEHICULOS */}
          <Grid item xs={12} md={8}>
            <Grow in={true} timeout={800}>
              <Card elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent sx={{ pb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                     <CheckCircleIcon fontSize="small" color="primary"/> IDENTIFICACIÓN Y PERÍODO
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        select fullWidth label="Cliente" size="small"
                        value={selectedCliente}
                        onChange={(e) => setSelectedCliente(e.target.value)}
                      >
                        {clientes.map((c) => (
                          <MenuItem key={c.cliente_id} value={c.cliente_id}>
                            {c.cedula} - {c.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3.5}>
                      <TextField
                        type="date" fullWidth label="Inicio" size="small"
                        InputLabelProps={{ shrink: true }}
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3.5}>
                      <TextField
                        type="date" fullWidth label="Fin" size="small"
                        InputLabelProps={{ shrink: true }}
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grow>

            <Grow in={true} timeout={1000}>
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                 <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Flota Disponible para la Fecha
                    </Typography>
                 </Box>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Placa</strong></TableCell>
                        <TableCell><strong>Modelo</strong></TableCell>
                        <TableCell align="center"><strong>Añadir</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vehiculos.map((v) => (
                        <TableRow 
                          key={v.vehiculo_id}
                          sx={{ '&:hover': { bgcolor: '#fafafa' } }}
                        >
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{v.placa}</TableCell>
                          <TableCell>{v.marca} {v.modelo} <Typography variant="caption" color="text.secondary">{v.anio}</Typography></TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => agregarAlCarrito(v)}
                              sx={{ '&:hover': { scale: '1.1' }, transition: '0.2s' }}
                            >
                              <AddShoppingCartIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grow>
          </Grid>

          {/* PANEL DERECHO: CARRITO Y CHECKOUT */}
          <Grid item xs={12} md={4}>
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <Card elevation={6} sx={{ height: "100%", borderRadius: 2, borderLeft: '4px solid #1976d2', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <ShoppingCartCheckoutIcon sx={{ mr: 1 }} /> Carrito de Renta
                  </Typography>
                  
                  <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 250, mb: 2 }}>
                    {carrito.length === 0 ? (
                       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, opacity: 0.5 }}>
                          <DirectionsCarIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="body2" align="center">
                            Seleccione vehículos<br/>disponibles
                          </Typography>
                       </Box>
                    ) : (
                      carrito.map((item) => (
                        <Fade key={item.vehiculo_id} in={true}>
                          <Paper elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: '#fcfcfc', border: '1px solid #f0f0f0', display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                               <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>{item.marca} {item.modelo}</Typography>
                               <Typography variant="caption" color="text.secondary">{item.placa}</Typography>
                               <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>${item.subtotal_calculado.toFixed(2)}</Typography>
                            </Box>
                            <IconButton color="error" size="small" onClick={() => quitarDelCarrito(item.vehiculo_id)}>
                               <DeleteIcon fontSize="small"/>
                            </IconButton>
                          </Paper>
                        </Fade>
                      ))
                    )}
                  </Box>

                  <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                  
                  <Box sx={{ py: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Subtotal Reserva:</Typography>
                      <Typography variant="body2" fontWeight="bold">${totalCarrito.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mt: 1 }}>
                      <Typography variant="h6" fontWeight="bold">TOTAL:</Typography>
                      <Typography variant="h5" color="primary" fontWeight="900">${totalCarrito.toFixed(2)}</Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={loading || carrito.length === 0}
                    onClick={procesarReserva}
                    fullWidth
                    startIcon={<CheckCircleIcon />}
                    sx={{ 
                      py: 1.5, 
                      fontWeight: 'bold', 
                      borderRadius: 1.5,
                      boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    {loading ? "PROCESANDO..." : "CONFIRMAR RENTA"}
                  </Button>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        <Snackbar open={alert.open} autoHideDuration={6000} onClose={closeAlert} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={closeAlert} severity={alert.type} sx={{ width: '100%', borderRadius: 2 }}>
            {alert.msg}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
