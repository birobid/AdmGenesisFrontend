import React from 'react'
import { TextField, Button, Card, Grid, InputAdornment, FormControlLabel, Checkbox, Fade, IconButton, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import es from "date-fns/locale/es";
import axios from 'axios';
import { useSnackbar } from 'notistack';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import ModalGenerico from '../../../../components/modalgenerico';
import Page from '../../../../components/Page';
import Motivo from './components/motivo';
import { PATH_AUTH, PATH_PAGE } from '../../../../routes/paths'
import { URLAPIGENERAL, URLAPILOCAL } from "../../../../config";
import HeaderBreadcrumbs from '../../../../components/HeaderBreadcrumbs';
import { formaterarFecha, generarCodigo, obtenerMaquina } from '../../../../utils/sistema/funciones';
import CircularProgreso from '../../../../components/Cargando';

export default function SolicitudDocumentos() {
    const user = JSON.parse(window.localStorage.getItem('usuario'));
    const config = {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
    }

    const navegacion = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    // MENSAJE GENERICO
    const mensajeSistema = (mensaje, variante) => {
        enqueueSnackbar(mensaje,
            {
                variant: variante,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            }
        )
    }

    const [empleado, setEmpleado] = React.useState([]);
    const [numeroSolicitud, SetNumeroSolicitud] = React.useState(0);
    const [formulario, setFormulario] = React.useState({
        fecha: new Date(),
        motivo: '',
        empleado: '',
        codigoempleado: '',
        nombreempleado: '',
        estado: false,
        aprobado: false,
        observacion: ''
    })

    function limpiarCampos() {
        setFormulario({
            ...formulario,
            fecha: new Date(),
            motivo: '',
            empleado: '',
            codigoempleado: '',
            nombreempleado: '',
            estado: false,
            aprobado: false,
            observacion: ''
        })
        setEmpleado([]);
        SetNumeroSolicitud(0);
    }

    const [mostrarprogreso, setMostrarProgreso] = React.useState(false);
    const [tiposBusquedas, setTiposBusqueda] = React.useState([{ tipo: 'nombre' }, { tipo: 'codigo' }]);
    const [openModal, setOpenModal] = React.useState(false);
    const toggleShow = () => setOpenModal(p => !p);
    const handleCallbackChild = (e) => {
        const item = e.row;
        setFormulario({
            ...formulario,
            empleado: item.id,
            codigoempleado: item.codigo,
            nombreempleado: item.nombre
        });
        toggleShow();
    }
    console.log(formulario)

    const grabarSolicitudDocumento = async () => {
        try {
            const ip = await obtenerMaquina();
            const form = {
                codigo: 0,
                numero: numeroSolicitud,
                fecha: formulario.fecha,
                motivo: formulario.motivo,
                empleado: formulario.empleado,
                observacion: formulario.observacion,
                estado: formulario.estado,
                aprobado: formulario.aprobado,
                urlDocumento: " ",
                fechaing: new Date(),
                maquina: ip,
                usuario: user.codigo,
                fechaapr: new Date(),
                maquinaapr: " ",
                usuarioapr: 0
            }
            console.log('form to send', form);
            const { data } = await axios.post(`${URLAPIGENERAL}/SolicitudDocumentos`, form, config, setMostrarProgreso(true));
            if (data === 200) {
                mensajeSistema('Datos registrados correctamente', 'success');
                limpiarCampos();
            }
            limpiarCampos();
        } catch (error) {
            if (error.response.status === 401) {
                navegacion(`${PATH_AUTH.login}`);
                mensajeSistema("Su inicio de sesión expiró", "error");
            }
            else if (error.response.status === 500) {
                navegacion(`${PATH_PAGE.page500}`);
            } else {
                mensajeSistema("Problemas al guardar verifique los datos e inténtelo nuevamente", "error");
            }
        } finally {
            setMostrarProgreso(false);
        }
    }

    React.useEffect(() => {
        async function getDatos() {
            try {
                const { data } = await axios(`${URLAPIGENERAL}/empleados/listar`, config, setMostrarProgreso(true));
                const response = await axios(`${URLAPIGENERAL}/SolicitudDocumentos/listar`, config, setMostrarProgreso(true));


                const listaempleado = data.map(m => ({ id: m.codigo, codigo: m.codigo_Empleado, nombre: m.nombres }));
                const listadosolicitudocs = response.data;
                const { [Object.keys(listadosolicitudocs).pop()]: lastItem } = listadosolicitudocs;

                SetNumeroSolicitud(lastItem.numero + 1);
                setEmpleado(listaempleado);
            } catch (error) {
                if (error.response.status === 401) {
                    navegacion(`${PATH_AUTH.login}`);
                    mensajeSistema("Su inicio de sesión expiró", "error");
                }
                else if (error.response.status === 500) {
                    navegacion(`${PATH_PAGE.page500}`);
                } else {
                    mensajeSistema("Problemas al obtener datos, inténtelo nuevamente", "error");
                }
            } finally {
                setMostrarProgreso(false)
            }
        }
        getDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numeroSolicitud])

    return (
        <>
            <CircularProgreso open={mostrarprogreso} handleClose1={() => { setMostrarProgreso(false) }} />
            <ModalGenerico
                nombre="Empleados"
                openModal={openModal}
                busquedaTipo={tiposBusquedas}
                toggleShow={toggleShow}
                rowsData={empleado}
                parentCallback={handleCallbackChild}
            />
            <Page title="Solicitud de Documentos">
                <Fade in style={{ transformOrigin: '0 0 0' }} timeout={1000}>
                    <Box sx={{ ml: 3, mr: 3, p: 1 }}>
                        <HeaderBreadcrumbs
                            heading="Solicitud de Documentos"
                            links={[
                                { name: 'Inicio' },
                                { name: 'Procesos' },
                                { name: 'Solicitud de Documentos' },
                            ]}
                            action={
                                <Grid container spacing={1}>
                                    <Grid item md={4} sm={4} xs={12} sx={{ mr: 2 }}>
                                        <Button
                                            fullWidth
                                            variant="text"
                                            onClick={() => { limpiarCampos() }}
                                            startIcon={<InsertDriveFileRoundedIcon />}
                                        >
                                            Nuevo
                                        </Button>
                                    </Grid>
                                    <Grid item md={4} sm={4} xs={12}>
                                        <Button
                                            fullWidth
                                            variant="text"
                                            onClick={() => { grabarSolicitudDocumento() }}
                                            startIcon={<SaveRoundedIcon />}
                                        >
                                            Grabar
                                        </Button>
                                    </Grid>
                                    <Grid item md={4} sm={4} xs={12}>
                                        {/* <Button
                                            // disabled={imprimir}
                                            fullWidth
                                            variant="text"
                                            target="_blank"
                                            // href={`${URLAPILOCAL}/prestamo/generarpdf?codigo=${formulario.codigoimprime}&operador=${usuario.tipo_Persona}`}
                                            startIcon={<PrintRoundedIcon />}
                                        >
                                            Imprimir
                                        </Button> */}
                                    </Grid>

                                </Grid>
                            }
                        />
                    </Box>
                </Fade>
                <Fade in style={{ transformOrigin: '0 0 0' }} timeout={1000}>
                    <Card sx={{ ml: 3, mr: 3, p: 2 }}>
                        <Box>
                            <Grid container spacing={1}>
                                <Grid item container md={12} spacing={1}>
                                    <Grid item md={3} sm={6} xs={12}>
                                        <TextField
                                            disabled
                                            size="small"
                                            fullWidth
                                            label="Número"
                                            value={numeroSolicitud}
                                        />
                                    </Grid>
                                    <Grid item md={3} sm={6} xs={12}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
                                            <MobileDatePicker
                                                label="Fecha"
                                                value={formulario.fecha}
                                                inputFormat="dd/MM/yyyy"
                                                onChange={(newValue) => {
                                                    setFormulario({
                                                        ...formulario,
                                                        fecha: newValue
                                                    });
                                                }}
                                                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>
                                <Grid item container md={12} spacing={1}>
                                    <Grid item md={2} sm={6} xs={12}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            label="Empleado"
                                            value={formulario.codigoempleado}
                                            InputProps={{
                                                readOnly: true,
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton size="small" onClick={() => { setOpenModal(true) }}>
                                                            <SearchRoundedIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Grid>
                                    <Grid item md={4} sm={6} xs={12}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            label="Nombre"
                                            value={formulario.nombreempleado}
                                            InputProps={{
                                                readOnly: true
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item container md={12} spacing={1}>
                                    <Grid item md={3} sm={4} xs={12}>
                                        <Motivo
                                            data={formulario}
                                            disparador={(e) => {
                                                setFormulario({
                                                    ...formulario,
                                                    motivo: e
                                                })
                                            }}
                                        />
                                    </Grid>
                                    <Grid item md={1.5} sm={4}>
                                        <FormControlLabel
                                            onChange={(e) => {
                                                setFormulario({
                                                    ...formulario,
                                                    estado: e.target.checked
                                                })
                                            }}
                                            control={<Checkbox />} checked={formulario.estado} label="Estado"
                                        />
                                    </Grid>
                                    <Grid item md={1.5} sm={4}>
                                        <FormControlLabel
                                            onChange={(e) => {
                                                setFormulario({
                                                    ...formulario,
                                                    aprobado: e.target.checked
                                                })
                                            }}
                                            control={<Checkbox />} checked={formulario.aprobado} label="Aprobado"
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item container md={12} spacing={1}>
                                    <Grid item md={6} sm={12} xs={12}>
                                        <TextField
                                            multiline
                                            rows={4}
                                            maxRows={4}
                                            size="normal"
                                            fullWidth
                                            label="Observación"
                                            value={formulario.observacion}
                                            onChange={(e) => {
                                                setFormulario({
                                                    ...formulario,
                                                    observacion: e.target.value
                                                })
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item container md={6} spacing={1} justifyContent="center">
                                    <Grid item md={6}>
                                        <Button
                                            fullWidth
                                            variant="text"
                                            // onClick={() => { calcularAmortizacion() }}
                                            startIcon={<AttachFileRoundedIcon />}
                                        >
                                            Subir Documento
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Card>
                </Fade>
            </Page>
        </>
    )
}