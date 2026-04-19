import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Tabs, Tab, Card, CardContent, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  TextField, MenuItem, Button
} from "@mui/material";
import dayjs from "dayjs";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function Consultas() {
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState([]);
  
  // Para historial de cliente
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState("");

  const fetchData = async (endpoint) => {
      try {
          const res = await fetch(`http://localhost:3001/api/reportes/consultas/${endpoint}`);
          const result = await res.json();
          setData(Array.isArray(result) ? result : []);
      } catch (err) { console.error(err); }
  };

  const fetchClientes = async () => {
    try {
        const res = await fetch(`http://localhost:3001/api/reportes/consultas/clientes`);
        const r = await res.json();
        setClientes(r);
    } catch(e) {}
  };

  useEffect(() => {
     if (tabIndex === 0) fetchData("disponibles");
     else if (tabIndex === 1) fetchData("activos");
     else if (tabIndex === 2) {
         fetchClientes();
         setData([]); // limpiar hasta que seleccione cliente
     }
     else if (tabIndex === 3) fetchData("estado-cuenta");
     else if (tabIndex === 4) fetchData("dias-alquiler");
  }, [tabIndex]);

  const handleClienteChange = (e) => {
     const id = e.target.value;
     setSelectedCliente(id);
     if (id) fetchData(`historial-cliente/${id}`);
     else setData([]);
  };

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Typography variant="h4" color="primary" sx={{ mb: 3, fontWeight: "bold" }}>
        Centro de Consultas Dinámicas
      </Typography>

      <Card elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
          <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Vehículos Disponibles" />
            <Tab label="Alquileres Activos" />
            <Tab label="Historial por Cliente" />
            <Tab label="Estado de Cuentas" />
            <Tab label="Días Feriados vs Normales" />
          </Tabs>
        </Box>

        {/* TAB 0: DISPONIBLES */}
        <TabPanel value={tabIndex} index={0}>
          <Typography variant="h6" gutterBottom>Catálogo de Flota Libre Actual</Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead><TableRow sx={{bgcolor: '#f5f5f5'}}>
                <TableCell>Vehículo</TableCell>
                <TableCell>Año</TableCell>
                <TableCell>Placa</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow></TableHead>
              <TableBody>
                 {data.map(d => (
                    <TableRow key={d.vehiculo_id}>
                       <TableCell><strong>{d.marca} {d.modelo}</strong></TableCell>
                       <TableCell>{d.anio}</TableCell>
                       <TableCell>{d.placa}</TableCell>
                       <TableCell><Chip label="Disponible Libre" color="success" size="small"/></TableCell>
                    </TableRow>
                 ))}
                 {data.length === 0 && <TableRow><TableCell colSpan={4}>Cargando / Sin datos</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TAB 1: ACTIVOS */}
        <TabPanel value={tabIndex} index={1}>
          <Typography variant="h6" gutterBottom>Alquileres Actualmente en la Calle</Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead><TableRow sx={{bgcolor: '#f5f5f5'}}>
                <TableCell>Contrato</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Retorno Programado</TableCell>
                <TableCell>Flota Asignada</TableCell>
              </TableRow></TableHead>
              <TableBody>
                 {data.map(d => (
                    <TableRow key={d.reserva_id}>
                       <TableCell>#{d.reserva_id}</TableCell>
                       <TableCell>{d.cliente?.nombre} {d.cliente?.apellido}</TableCell>
                       <TableCell>{dayjs.utc(d.fecha_fin).format("DD/MM/YYYY")}</TableCell>
                       <TableCell>{d.vehiculos?.map(v => v.vehiculo?.placa).join(", ")}</TableCell>
                    </TableRow>
                 ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TAB 2: HISTORIAL POR CLIENTE */}
        <TabPanel value={tabIndex} index={2}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
             <TextField select label="Filtrar por Cliente" value={selectedCliente} onChange={handleClienteChange} sx={{ width: 300 }}>
                 <MenuItem value=""><em>-- Seleccionar --</em></MenuItem>
                 {clientes.map(c => <MenuItem key={c.cliente_id} value={c.cliente_id}>{c.nombre} {c.apellido} ({c.cedula})</MenuItem>)}
             </TextField>
          </Box>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead><TableRow sx={{bgcolor: '#f5f5f5'}}>
                <TableCell>Contrato</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow></TableHead>
              <TableBody>
                 {data.map(d => (
                    <TableRow key={d.reserva_id}>
                       <TableCell>#{d.reserva_id}</TableCell>
                       <TableCell>{dayjs.utc(d.fecha_inicio).format("DD/MM/YYYY")}</TableCell>
                       <TableCell>{dayjs.utc(d.fecha_fin).format("DD/MM/YYYY")}</TableCell>
                       <TableCell><Chip label={d.estado} color={d.estado === 'completada' ? 'success': 'primary'} size="small"/></TableCell>
                    </TableRow>
                 ))}
                 {data.length === 0 && <TableRow><TableCell colSpan={4}>Seleccione un cliente para ver su historial.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TAB 3: ESTADO CUENTA */}
        <TabPanel value={tabIndex} index={3}>
           <Typography variant="h6" gutterBottom>Consolidado Cuentas por Cobrar (Facturación vs Abonos)</Typography>
           <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead><TableRow sx={{bgcolor: '#f5f5f5'}}>
                <TableCell>Contrato / Cliente</TableCell>
                <TableCell align="right">Montos Cargados</TableCell>
                <TableCell align="right">Montos Pagados</TableCell>
                <TableCell align="right">Saldo Deudor</TableCell>
              </TableRow></TableHead>
              <TableBody>
                 {data.filter(x => x.balance > 0).map(d => (
                    <TableRow key={d.reserva?.reserva_id}>
                       <TableCell>#{d.reserva?.reserva_id} - {d.reserva?.cliente?.nombre}</TableCell>
                       <TableCell align="right">${d.total_cargos?.toFixed(2)}</TableCell>
                       <TableCell align="right" sx={{color: 'success.main'}}>${d.total_pagado?.toFixed(2)}</TableCell>
                       <TableCell align="right" sx={{color: 'error.main', fontWeight: 'bold'}}>${d.balance?.toFixed(2)}</TableCell>
                    </TableRow>
                 ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TAB 4: FERIADOS VS NORMALES */}
        <TabPanel value={tabIndex} index={4}>
           <Typography variant="h6" gutterBottom>Rastreo de Actividad en Temporada Alta</Typography>
           <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead><TableRow sx={{bgcolor: '#f5f5f5'}}>
                <TableCell>Contrato / Cliente</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Clasificación</TableCell>
              </TableRow></TableHead>
              <TableBody>
                 {data.map(d => (
                    <TableRow key={d.contrato}>
                       <TableCell>#{d.contrato} - {d.cliente}</TableCell>
                       <TableCell>{dayjs.utc(d.inicio).format("DD/MM")} al {dayjs.utc(d.fin).format("DD/MM")}</TableCell>
                       <TableCell>
                          <Chip label={d.tipo} color={d.tipo === 'En Feriado' ? 'warning' : 'default'} />
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

      </Card>
    </Box>
  );
}
