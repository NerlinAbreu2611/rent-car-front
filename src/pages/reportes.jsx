import React, { useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, TextField } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AnalyticsIcon from '@mui/icons-material/Analytics';

export function Reportes() {
  const [ingresosDates, setIngresosDates] = useState({ start: '', end: '' });

  const descargarPDF = (rutaParams) => {
     window.location.href = `http://localhost:3001/api/reportes/gerencial/${rutaParams}&exportPdf=true`;
  };

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <Typography variant="h4" color="primary" sx={{ mb: 4, fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
        <AnalyticsIcon sx={{ fontSize: 40, mr: 2 }} />
        Portal de Reportes Gerenciales
      </Typography>

      <Grid container spacing={4}>
         {/* REPORTE 1: Ingresos */}
         <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
               <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" color="primary" gutterBottom>Reporte de Ingresos por Fecha</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                     Filtre los ingresos derivados de alquileres y multas liquidadas en caja.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                     <TextField 
                        label="Desde" type="date" size="small" InputLabelProps={{ shrink: true }}
                        value={ingresosDates.start} onChange={(e) => setIngresosDates({...ingresosDates, start: e.target.value})}
                     />
                     <TextField 
                        label="Hasta" type="date" size="small" InputLabelProps={{ shrink: true }}
                        value={ingresosDates.end} onChange={(e) => setIngresosDates({...ingresosDates, end: e.target.value})}
                     />
                  </Box>
               </CardContent>
               <CardActions>
                  <Button 
                    variant="contained" fullWidth startIcon={<DownloadIcon />} color="success"
                    onClick={() => descargarPDF(`ingresos?start=${ingresosDates.start}&end=${ingresosDates.end}`)}
                  >
                     Exportar Análisis
                  </Button>
               </CardActions>
            </Card>
         </Grid>

         {/* REPORTE 2: Top Vehículos */}
         <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
               <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" color="primary" gutterBottom>Reporte de Vehículos Más Rentados</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                     Analiza la flota con mayor nivel de rotación y roturas. Basado en el registro histórico de reservas de la compañía.
                  </Typography>
               </CardContent>
               <CardActions>
                  <Button 
                    variant="contained" fullWidth startIcon={<DownloadIcon />} color="success"
                    onClick={() => descargarPDF("top-vehiculos?")}
                  >
                     Exportar PDF de Rotación
                  </Button>
               </CardActions>
            </Card>
         </Grid>

         {/* REPORTE 3: Top Clientes */}
         <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
               <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" color="primary" gutterBottom>Ranking de Clientes Frecuentes</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                     Identifica a los consumidores más fieles del servicio de Rent Car. Útil para estrategias de fidelización o descuentos.
                  </Typography>
               </CardContent>
               <CardActions>
                  <Button 
                    variant="contained" fullWidth startIcon={<DownloadIcon />} color="success"
                    onClick={() => descargarPDF("top-clientes?")}
                  >
                     Exportar Cartera VIP
                  </Button>
               </CardActions>
            </Card>
         </Grid>

         {/* REPORTE 4: Penalidades */}
         <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff5f5' }}>
               <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" color="error" gutterBottom>Reporte de Incidencias (Penalidades)</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                     Historial global de todas las multas por retrasos, recargos por temporada alta, daños materiales y falta de combustible.
                  </Typography>
               </CardContent>
               <CardActions>
                  <Button 
                    variant="outlined" fullWidth startIcon={<DownloadIcon />} color="error"
                    onClick={() => descargarPDF("penalidades?")}
                  >
                     Exportar Incidencias a PDF
                  </Button>
               </CardActions>
            </Card>
         </Grid>

      </Grid>
    </Box>
  );
}
