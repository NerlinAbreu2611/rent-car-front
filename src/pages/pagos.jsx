import React, { useState, useEffect } from "react";
import { 
  Box, Card, CardContent, Typography, Grid, TextField, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Alert, Snackbar, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function Pagos() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "info", msg: "" });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [pagoTarget, setPagoTarget] = useState(null);
  
  const [montoAbono, setMontoAbono] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  useEffect(() => {
    fetchCuentas();
  }, []);

  const fetchCuentas = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/pago/deudas");
      if(!res.ok) throw new Error("Error interno al jalar estados de cuenta");
      const data = await res.json();
      setCuentas(data);
    } catch (err) {
       console.error(err);
       setAlert({ open: true, type: "error", msg: "Error conectando con el módulo financiero." });
    }
  };

  const closeAlert = () => setAlert({ ...alert, open: false });

  const abrirPago = (cuenta) => {
     setPagoTarget(cuenta);
     setMontoAbono(cuenta.detalles_finanzas.balance_adeudado.toString()); // default full amount!
     setMetodoPago("Efectivo");
     setModalAbierto(true);
  };

  const procesarPago = async () => {
    if (!montoAbono || Number(montoAbono) <= 0) {
        setAlert({ open: true, type: "warning", msg: "Debe ingresar un monto mayor a 0." });
        return;
    }

    setLoading(true);
    try {
      const resp = await fetch("http://localhost:3001/api/pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reserva_id: pagoTarget.reserva_id,
          monto: Number(montoAbono),
          metodo: metodoPago
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Error al procesar cobro");
      }

      setAlert({ open: true, type: "success", msg: "¡Pago registrado! El balance ha sido actualizado." });
      setModalAbierto(false);
      fetchCuentas(); // Refrescar Grid
    } catch (error) {
      setAlert({ open: true, type: "error", msg: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      <Typography variant="h4" color="primary" sx={{ mb: 3, fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
        <ReceiptLongIcon sx={{ fontSize: 35, mr: 1 }} />
        Estado de Cuenta y Pagos
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
         Esta pantalla unifica los costos originales de las reservas más cualquier penalidad generada en cajas, restando los abonos previos para brindarle a detalle el Saldo pendiente del Cliente.
      </Typography>

      <TableContainer component={Paper} elevation={3}>
         <Table>
            <TableHead>
               <TableRow sx={{backgroundColor: "#f5f5f5"}}>
                  <TableCell><strong>Contrato #</strong></TableCell>
                  <TableCell><strong>Cliente Deudor</strong></TableCell>
                  <TableCell><strong>Estado Reserva</strong></TableCell>
                  <TableCell align="right"><strong>Cargos Brutos</strong></TableCell>
                  <TableCell align="right"><strong>Abonado</strong></TableCell>
                  <TableCell align="right"><strong>Saldo Actual</strong></TableCell>
                  <TableCell align="center"><strong>Acción</strong></TableCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {cuentas.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={7} align="center" sx={{py: 4}}>
                        <Typography variant="h6" color="success.main">Ningún cliente tiene balances deudores en el sistema.</Typography>
                     </TableCell>
                  </TableRow>
               ) : (
                  cuentas.map((row) => (
                    <TableRow key={row.reserva_id} hover>
                       <TableCell><strong>{row.reserva_id}</strong></TableCell>
                       <TableCell>{row.cliente.nombre} {row.cliente.apellido}<br/><Typography variant="caption" color="text.secondary">{row.cliente.cedula}</Typography></TableCell>
                       <TableCell>
                          <Chip label={row.estado.toUpperCase()} size="small" color={row.estado === 'completada' ? 'success' : 'primary'} />
                       </TableCell>
                       <TableCell align="right">${row.detalles_finanzas.total_bruto_factura.toFixed(2)}</TableCell>
                       <TableCell align="right" color="green">
                          <Typography color="success.main">${row.detalles_finanzas.total_pagado.toFixed(2)}</Typography>
                       </TableCell>
                       <TableCell align="right">
                          <Typography fontWeight="bold" color="error.main" fontSize="1.1rem">
                            ${row.detalles_finanzas.balance_adeudado.toFixed(2)}
                          </Typography>
                       </TableCell>
                       <TableCell align="center">
                          <Button 
                             variant="contained" 
                             color="primary" 
                             size="small" 
                             startIcon={<PaymentIcon />} 
                             onClick={() => abrirPago(row)}
                          >
                             Pagar
                          </Button>
                       </TableCell>
                    </TableRow>
                  ))
               )}
            </TableBody>
         </Table>
      </TableContainer>

      {/* Modal / Dialog de Pagos */}
      <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', mb: 2}}>
          <AttachMoneyIcon sx={{mr: 1}}/> Registrar Cobro
        </DialogTitle>
        {pagoTarget && (
        <DialogContent>
           <Typography variant="subtitle1" gutterBottom>
              Estás registrando un pago para el Contrato <strong>#{pagoTarget.reserva_id}</strong> a nombre de <strong>{pagoTarget.cliente.nombre} {pagoTarget.cliente.apellido}</strong>.
           </Typography>
           
           <Box sx={{ p: 2, bgcolor: "#fff3e0", borderLeft: "4px solid #ff9800", mb: 3 }}>
              <Typography variant="body2">Total en Cargos de Alquiler: ${pagoTarget.detalles_finanzas.total_alquiler.toFixed(2)}</Typography>
              <Typography variant="body2">Total en Penalidades (Mora/Daños): ${pagoTarget.detalles_finanzas.total_penalidades.toFixed(2)}</Typography>
              <Typography variant="body2" color="success.main">Pagos Previos y Abonos: -${pagoTarget.detalles_finanzas.total_pagado.toFixed(2)}</Typography>
              <Typography variant="h6" fontWeight="bold" sx={{mt: 1}}>
                 Adeudado HOY: <span style={{color: 'red'}}>${pagoTarget.detalles_finanzas.balance_adeudado.toFixed(2)}</span>
              </Typography>
           </Box>

           <Grid container spacing={2}>
              <Grid item xs={6}>
                 <TextField
                   select fullWidth label="Método de Pago"
                   value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}
                 >
                    <MenuItem value="Efectivo">Efectivo 💵</MenuItem>
                    <MenuItem value="Tarjeta Crédito/Débito">Tarjeta Bancaria 💳</MenuItem>
                    <MenuItem value="Transferencia">Transferencia a Cuenta 🏦</MenuItem>
                 </TextField>
              </Grid>
              <Grid item xs={6}>
                 <TextField
                   fullWidth label="Monto a Abonar (USD)" type="number"
                   value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)}
                 />
              </Grid>
           </Grid>
        </DialogContent>
        )}
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setModalAbierto(false)} color="inherit">Cancelar</Button>
          <Button onClick={procesarPago} variant="contained" color="success" disabled={loading} startIcon={<CheckCircleIcon />}>
            {loading ? "Registrando..." : "Afectar Estado"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={closeAlert} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeAlert} severity={alert.type} sx={{ width: '100%', fontSize: '1rem' }}>
          {alert.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
