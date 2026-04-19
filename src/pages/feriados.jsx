import React, { useState, useEffect } from "react";
import { Grid, Typography, Card, CardContent, IconButton, List, ListItem, ListItemText, Divider, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar, PickerDay, DayCalendarSkeleton } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/es";
import Badge from "@mui/material/Badge";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Fade, Grow } from "@mui/material";

dayjs.locale('es');

export function Feriados() {
  const [feriados, setFeriados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);
  const [comentario, setComentario] = useState("");

  const fetchFeriados = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/feriado");
      const data = await response.json();
      setFeriados(data);
    } catch (error) {
      console.error("Error al obtener feriados", error);
      setErrorMsg("Error al obtener feriados de la base de datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeriados();
  }, []);

  const handleDateSelect = (newDate) => {
    const formattedDate = newDate.format("YYYY-MM-DD");
    
    const exists = feriados.some((f) => dayjs(f.fecha).format("YYYY-MM-DD") === formattedDate);
    if (exists) {
      setErrorMsg("El día seleccionado ya es un feriado.");
      return;
    }

    setPendingDate(newDate);
    setComentario("");
    setOpenModal(true);
  };

  const confirmAddFeriado = async () => {
    if (!pendingDate) return;
    const formattedDate = pendingDate.format("YYYY-MM-DD");
    try {
      const resp = await fetch("http://localhost:3001/api/feriado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            fecha: pendingDate.toISOString(), 
            descripcion: comentario || "Día Feriado Genérico" 
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.mensaje || "Error al guardar");
      }
      setSuccessMsg(`Día ${formattedDate} agregado como feriado exitosamente.`);
      fetchFeriados();
      setOpenModal(false);
    } catch (error) {
      setErrorMsg(error.message);
      setOpenModal(false);
    }
  };

  const deleteFeriado = async (feriado_id) => {
    try {
      const resp = await fetch(`http://localhost:3001/api/feriado/${feriado_id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Error al eliminar feriado");
      setSuccessMsg("Feriado eliminado exitosamente.");
      fetchFeriados();
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const highlightedDays = feriados.map((f) => dayjs(f.fecha).format("YYYY-MM-DD"));

  function ServerDay(props) {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
    const isSelected = !outsideCurrentMonth && highlightedDays.indexOf(day.format("YYYY-MM-DD")) >= 0;

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={isSelected ? <EventAvailableIcon sx={{ fontSize: 15, color: 'primary.main', bgcolor: 'white', borderRadius: '50%' }} /> : undefined}
      >
      <PickerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ padding: 0 }}>
        <Typography variant="h4" color="primary" sx={{ marginBottom: 3, fontWeight: "bold" }}>
          Mantenimiento de Días Feriados
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Grow in={true} timeout={1000}>
              <Card elevation={3} sx={{ p: 1, height: "100%", display: "flex", flexDirection:"column", alignItems: "center", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{mb: 1, color: 'text.secondary'}}>
                  Presione un día para registrar
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DateCalendar 
                    onChange={handleDateSelect}
                    renderLoading={() => <DayCalendarSkeleton />}
                    slots={{ day: ServerDay }}
                    slotProps={{ day: { highlightedDays } }}
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
              </Card>
            </Grow>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Card elevation={3} sx={{ p: 0, height: "100%", maxHeight: 500, overflow: "hidden", borderRadius: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                 <Typography variant="subtitle1" fontWeight="bold">
                    Calendario de Fechas Especiales
                 </Typography>
              </Box>
              <List sx={{ overflow: 'auto', maxHeight: 440 }}>
                {feriados.map((feriado, index) => (
                  <Fade in={true} timeout={400 + (index * 100)} key={feriado.feriado_id}>
                    <Box>
                      <ListItem
                        sx={{ 
                          '&:hover': { bgcolor: '#f0f7ff', transition: '0.3s' },
                          transition: 'background-color 0.3s'
                        }}
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={() => deleteFeriado(feriado.feriado_id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography fontWeight="bold" color="primary.dark">
                              {dayjs(feriado.fecha.substring(0, 10)).format("DD MMMM YYYY")}
                            </Typography>
                          }
                          secondary={feriado.descripcion || "Día Feriado"}
                        />
                      </ListItem>
                      <Divider />
                    </Box>
                  </Fade>
                ))}
                {feriados.length === 0 && !loading && (
                   <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No hay feriados registrados.</Typography>
                   </Box>
                )}
              </List>
            </Card>
          </Grid>
        </Grid>

        {/* ... Snackbars and Dialog stay same for logic, but wrapped in box ... */}
        {/* Snackbars */}
        <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg("")}>
          <Alert onClose={() => setSuccessMsg("")} severity="success" sx={{ width: '100%' }}>{successMsg}</Alert>
        </Snackbar>
        <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg("")}>
          <Alert onClose={() => setErrorMsg("")} severity="error" sx={{ width: '100%' }}>{errorMsg}</Alert>
        </Snackbar>

        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{bgcolor: 'primary.main', color: 'white'}}>Registrar Feriado Nacional</DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
             <Typography variant="body1" sx={{ mb: 2 }}>
               Día seleccionado: <strong>{pendingDate ? pendingDate.format("DD/MM/YYYY") : ""}</strong>.
             </Typography>
             <TextField
               fullWidth label="Nombre del Feriado / Comentario" placeholder="Ej: Navidad..."
               value={comentario} onChange={(e) => setComentario(e.target.value)}
               multiline rows={2} autoFocus
             />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
             <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
             <Button onClick={confirmAddFeriado} variant="contained" color="success">Guardar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
