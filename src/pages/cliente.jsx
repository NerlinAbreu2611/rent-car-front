import React, { useState, useEffect } from "react";
import {
  Box,
  InputAdornment,
  TextField,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  TableSortLabel,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

import { ClienteModal } from "../modal/clienteModal";

export function Cliente() {
  const [clientes, setClientes] = useState([]);
  const [columna, setColumna] = useState("nombre");
  const [carga, setCarga] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteModal, setClienteModal] = useState(null);

  // ESTADOS PARA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ESTADOS PARA ORDENAMIENTO
  const [orderBy, setOrderBy] = useState("nombre");
  const [order, setOrder] = useState("asc");

  //MODAL
  // En el componente PADRE
  const [snack, setSnack] = useState({
    open: false,
    mensaje: "",
    severity: "success",
  });

  const showSnack = (mensaje, severity = "success") => {
    setSnack({ open: true, mensaje, severity });
  };

  const handleCloseSnack = () => setSnack({ ...snack, open: false });

  const header = [
    { id: "nombre", label: "Nombre" },
    { id: "apellido", label: "Apellido" },
    { id: "cedula", label: "Cédula" },
    { id: "telefono", label: "Teléfono" },
    { id: "email", label: "Email" },
    { id: "direccion", label: "Dirección" },
    { id: "estado", label: "Estado" },
    { id: "acciones", label: "Acciones", sortable: false },
  ];

  const cargarClientes = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/cliente");
      if (!res.ok) throw new Error("Error en el servidor");
      const datos = await res.json();
      setClientes(datos.filter((i) => i.estado === "activo"));
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // LÓGICA DE FILTRADO Y ORDENAMIENTO
  useEffect(() => {
    let datosFiltrados = clientes.filter((c) =>
      String(c[columna] || "")
        .toLowerCase()
        .startsWith(busqueda.toLowerCase()),
    );

    // Aplicar Ordenamiento
    datosFiltrados.sort((a, b) => {
      const valA = String(a[orderBy] || "").toLowerCase();
      const valB = String(b[orderBy] || "").toLowerCase();
      if (order === "asc") return valA < valB ? -1 : 1;
      return valA > valB ? -1 : 1;
    });

    setCarga(datosFiltrados);
    setPage(0); // Reiniciar a la página 1 al filtrar
  }, [busqueda, columna, clientes, order, orderBy]);

  // MANEJADORES DE EVENTOS
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [tipoAccion, setTipoAccion] = useState("Agregar"); // Estado para el título

  // Función para abrir como Agregar
  const abrirAgregar = () => {
    setTipoAccion("Agregar");
    setClienteModal(null);
    setModalOpen(true);
  };

  //Función para deshabilitar
  const deshabilitar = (cliente) => {
    fetch("http://localhost:3001/api/cliente", {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(cliente),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en la petición");
        return res.json();
      })
      .then((data) => {
        setClientes((prev) => {
          return prev.filter((i) => i.cliente_id !== data.cliente_id);
        });
      })
      .then(setSnack({ ...snack, open: true, mensaje: "Modificación exitosa" }))
      .catch((error) =>
        setSnack(...snack, {
          open: true,
          mensaje: "Ocurrió un error",
          severity: "error",
        }),
      );
  };

  // Función para abrir como Editar
  const abrirEditar = (cliente) => {
    setTipoAccion("Editar");
    // Aquí podrías cargar los datos del cliente en otro estado si quisieras
    setClienteModal(cliente);
    setModalOpen(true);
  };
  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center", // Alinea verticalmente el texto con los inputs
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{ flexGrow: 1 }} // <--- ESTA ES LA CLAVE: ocupa todo el espacio sobrante a la izquierda
          >
            Mantenimiento de Clientes
          </Typography>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por columna</InputLabel>
            <Select
              value={columna}
              label="Filtrar por columna"
              onChange={(e) => setColumna(e.target.value)}
            >
              {header
                .filter((h) => h.id !== "acciones")
                .map((h) => (
                  <MenuItem key={h.id} value={h.id}>
                    {h.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            placeholder={`Buscar...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Añadir">
            <IconButton
              onClick={abrirAgregar}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark", // Azul más oscuro
                  opacity: 0.9, // Opcional: para que no brille tanto
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 4 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {header.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={
                      headCell.id === "estado" || headCell.id === "acciones"
                        ? "center"
                        : "left"
                    }
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {headCell.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={() => handleRequestSort(headCell.id)}
                        sx={{
                          color: "white !important",
                          "& .MuiTableSortLabel-icon": {
                            color: "white !important",
                          },
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {carga
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cliente) => (
                  <TableRow key={cliente.cliente_id} hover>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.apellido}</TableCell>
                    <TableCell>{cliente.cedula}</TableCell>
                    <TableCell>{cliente.telefono || "N/A"}</TableCell>
                    <TableCell>{cliente.email || "N/A"}</TableCell>
                    <TableCell>{cliente.direccion || "N/A"}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={
                          <FiberManualRecordIcon
                            style={{ fontSize: "12px", color: "inherit" }}
                          />
                        }
                        label={cliente.estado}
                        variant="outlined"
                        color={
                          cliente.estado === "activo" ? "success" : "error"
                        }
                        sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => abrirEditar(cliente)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => deshabilitar(cliente)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={carga.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            showFirstButton={true}
            showLastButton={true}
          />
        </TableContainer>
        {/* El Modal recibe el estado dinámico */}
        <ClienteModal
          accion={tipoAccion}
          open={modalOpen}
          cliente={clienteModal}
          setCargaModal={setClientes}
          handleClose={() => setModalOpen(false)}
          showSnack={showSnack} // <--- Nueva prop
        />
      </Box>
      {/* El Snackbar se queda aquí, en el PADRE */}
      <Snackbar
        key={snack.mensaje} // <--- ESTO ES VITAL
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={handleCloseSnack}
        >
          {snack.mensaje}
        </Alert>
      </Snackbar>
    </>
  );
}
