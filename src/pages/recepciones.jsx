import React, { useState, useEffect } from "react";
import { 
  Box, Card, CardContent, Typography, Grid, TextField, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Alert, Snackbar, Divider, Collapse, IconButton
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// Componente para fila expandible
function RowExpandible({ row, procesarRecepcion, usuario_id }) {
  const [open, setOpen] = useState(false);
  const [formulario, setFormulario] = useState(
    row.vehiculos_pendientes.map(vp => ({
      vehiculo_id: vp.vehiculo_id,
      placa: vp.vehiculo.placa,
      marcaModelo: `${vp.vehiculo.marca} ${vp.vehiculo.modelo}`,
      combustible_devuelto: "",
      kilometraje_devuelto: "",
      danos: "",
      cargo_extra: ""
    }))
  );

  const handleCambio = (vehiculo_id, campo, valor) => {
    setFormulario(prev => prev.map(f => f.vehiculo_id === vehiculo_id ? { ...f, [campo]: valor } : f));
  };

  const enviar = async () => {
    // Validar basics
    const detalles_listos = formulario.map(f => ({
      vehiculo_id: f.vehiculo_id,
      combustible_devuelto: Number(f.combustible_devuelto) || 0,
      kilometraje_devuelto: Number(f.kilometraje_devuelto) || 0,
      danos: f.danos === "" ? null : f.danos,
      cargo_extra: Number(f.cargo_extra) || 0
    }));

    await procesarRecepcion(row.reserva_id, detalles_listos);
  };

  const atrasoDias = dayjs().diff(dayjs.utc(row.fecha_fin).startOf('day'), 'day');

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: open ? "#f5f5f5" : "inherit" }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon color="primary"/> : <KeyboardArrowDownIcon color="primary" />}
          </IconButton>
        </TableCell>
        <TableCell><strong>#{row.reserva_id}</strong></TableCell>
        <TableCell>{row.cliente.nombre} {row.cliente.apellido}</TableCell>
        <TableCell>{dayjs.utc(row.fecha_inicio).format("DD/MM/YY")} a {dayjs.utc(row.fecha_fin).format("DD/MM/YY")}</TableCell>
        <TableCell>
           {atrasoDias > 0 
              ? <Typography color="error" fontWeight="bold">+{atrasoDias} días retraso</Typography>
              : <Typography color="success.main">En tiempo</Typography>
           }
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, backgroundColor: "#fff", borderRadius: 2, border: "1px solid #ddd" }}>
              <Typography variant="h6" gutterBottom component="div" color="primary">
                Inspección de Vehículos Pendientes
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Vehículo</TableCell>
                    <TableCell>Combustible (Galones)</TableCell>
                    <TableCell>Kilometraje Actual</TableCell>
                    <TableCell>Daños Rep. / Extras ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formulario.map((formPart) => (
                    <TableRow key={formPart.vehiculo_id}>
                      <TableCell component="th" scope="row">
                        {formPart.marcaModelo}<br/>
                        <Typography variant="caption" color="text.secondary">[{formPart.placa}]</Typography>
                      </TableCell>
                      <TableCell>
                         <TextField 
                            size="small" variant="standard" placeholder="Ej: 5.5" type="number"
                            value={formPart.combustible_devuelto} onChange={(e) => handleCambio(formPart.vehiculo_id, 'combustible_devuelto', e.target.value)}
                         />
                      </TableCell>
                      <TableCell>
                         <TextField 
                            size="small" variant="standard" placeholder="Ej: 85000" type="number"
                            value={formPart.kilometraje_devuelto} onChange={(e) => handleCambio(formPart.vehiculo_id, 'kilometraje_devuelto', e.target.value)}
                         />
                      </TableCell>
                      <TableCell>
                         <Box sx={{display: 'flex', gap: 1}}>
                           <TextField 
                              size="small" variant="standard" placeholder="Describir daño..." sx={{width: 150}}
                              value={formPart.danos} onChange={(e) => handleCambio(formPart.vehiculo_id, 'danos', e.target.value)}
                           />
                           <TextField 
                              size="small" variant="standard" placeholder="$ Cargo extra" type="number" sx={{width: 100}}
                              value={formPart.cargo_extra} onChange={(e) => handleCambio(formPart.vehiculo_id, 'cargo_extra', e.target.value)}
                           />
                         </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                 <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={enviar}>
                    Confirmar Recepción
                 </Button>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export function Recepciones() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "info", msg: "" });

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if(data) setUsuario(JSON.parse(data));
    fetchPendientes();
  }, []);

  const fetchPendientes = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/recepcion/pendientes");
      if(!res.ok) throw new Error("Error interno al jalar pendientes");
      const data = await res.json();
      setPendientes(data);
    } catch (err) {
       console.error(err);
       setAlert({ open: true, type: "error", msg: "Error de conexión." });
    }
  };

  const closeAlert = () => setAlert({ ...alert, open: false });

  const procesarRecepcionAPI = async (reserva_id, detalles) => {
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:3001/api/recepcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reserva_id: reserva_id,
          fecha_recepcion: dayjs().toISOString(),
          empleado_id: usuario ? usuario.usuario_id : 1, // fallback si session fail
          observaciones: "Recepción por " + (usuario?.nombre || "Empleado"),
          detalles: detalles
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Error al procesar devolución");
      }

      setAlert({ open: true, type: "success", msg: "¡Vehículo(s) retornado(s) con éxito! Se aplicaron penalidades si correspondió." });
      fetchPendientes(); 
    } catch (error) {
      setAlert({ open: true, type: "error", msg: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      <Typography variant="h4" color="primary" sx={{ mb: 3, fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
        <LocalGasStationIcon sx={{ fontSize: 35, mr: 1 }} />
        Recepción de Vehículos / Devoluciones
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
         Selecciona el menú desplegable del alquiler pendiente para procesar la inspección técnica o reporte de daños al retornar el vehículo. Las penalidades por retraso se calculan en base al día actual.
      </Typography>

      <TableContainer component={Paper} elevation={3}>
         <Table aria-label="collapsible table">
            <TableHead>
               <TableRow sx={{backgroundColor: "#f0f0f0"}}>
                  <TableCell />
                  <TableCell><strong>Contrato</strong></TableCell>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Periodo Pactado</strong></TableCell>
                  <TableCell><strong>Estado Tiempo</strong></TableCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {pendientes.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} align="center" sx={{py: 4}}>
                        <Typography variant="h6" color="text.secondary">No hay vehículos pendientes de devolución en la calle.</Typography>
                     </TableCell>
                  </TableRow>
               ) : (
                  pendientes.map((row) => (
                     <RowExpandible key={row.reserva_id} row={row} procesarRecepcion={procesarRecepcionAPI} usuario_id={usuario?.usuario_id} />
                  ))
               )}
            </TableBody>
         </Table>
      </TableContainer>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={closeAlert} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeAlert} severity={alert.type} sx={{ width: '100%', fontSize: '1rem' }}>
          {alert.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
