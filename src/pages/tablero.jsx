import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, 
  CircularProgress, Stack, Fade, Grow, Paper 
} from "@mui/material";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaidIcon from '@mui/icons-material/Paid';

const COLORS = ['#1976d2', '#ff9800', '#4caf50', '#f44336', '#9c27b0'];

export function Tablero() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/reportes/gerencial/stats");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!data || !data.kpis) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Error al cargar las estadísticas.</Typography>
        <Typography variant="body2">Por favor, intente de nuevo más tarde o verifique la conexión con el servidor.</Typography>
      </Box>
    );
  }

  const { kpis, ingresosSemana, estadoFlota, topVehiculos } = data;

  return (
    <Fade in={true} timeout={1000}>
      <Box sx={{ p: 0 }}>
        <Typography variant="h4" color="primary" sx={{ mb: 4, fontWeight: "bold" }}>
          Panel de Control Rent Car
        </Typography>

        {/* ROW 1: KPIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Flota Total" value={kpis.totalVehiculos} icon={<DirectionsCarIcon />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Disponibles" value={kpis.disponibles} icon={<CheckCircleOutlineIcon />} color="#4caf50" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Rentas Activas" value={kpis.alquileresActivos} icon={<AccessTimeIcon />} color="#ff9800" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Recaudación Total" value={`$${kpis.totalRecaudado.toLocaleString()}`} icon={<PaidIcon />} color="#2e7d32" />
          </Grid>
        </Grid>

        {/* ROW 2: CHARTS */}
        <Grid container spacing={3}>
          {/* Ingresos Semanales */}
          <Grid item xs={12} md={8}>
            <Grow in={true} timeout={1200}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: 400 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Tendencia de Ingresos (7 días)</Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={ingresosSemana}>
                    <defs>
                      <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                       contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                       formatter={(value) => [`$${value}`, 'Ingresos']}
                    />
                    <Area type="monotone" dataKey="monto" stroke="#1976d2" fillOpacity={1} fill="url(#colorMonto)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grow>
          </Grid>

          {/* Distribución Flota */}
          <Grid item xs={12} md={4}>
            <Grow in={true} timeout={1400}>
                <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Estado de la Flota</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={estadoFlota}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {estadoFlota.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
            </Grow>
          </Grid>

          {/* Top Vehículos */}
          <Grid item xs={12}>
            <Grow in={true} timeout={1600}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: 350 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Vehículos con Mayor Demanda</Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={topVehiculos}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10 }} />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                      {topVehiculos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

function KPICard({ title, value, icon, color }) {
  return (
    <Grow in={true}>
      <Card sx={{ 
        borderRadius: 3, 
        borderLeft: `6px solid ${color}`,
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        transition: '0.3s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
      }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '50%', 
              bgcolor: `${color}15`, 
              color: color,
              display: 'flex'
            }}>
              {icon}
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                {title.toUpperCase()}
              </Typography>
              <Typography variant="h5" fontWeight="900">
                {value}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}
