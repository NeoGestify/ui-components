import { AddIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, UserIcon, WarningIcon, ErrorIcon, SlashIcon, CalendarIcon, InfoIcon, CheckCircleIcon, RingSpinnerIcon, QuarterSpinnerIcon, AlertaAdvertencia, AlertaConfirmacion, AlertaError, AlertaExito, AlertaToast, Button, CheckIcon, CloseIcon, DeleteIcon, EditIcon, Form, HomeIcon, Input, Modal, ModalRef, SaveIcon, SearchIcon, Select, SpinnerIcon, Table, ThemeToggle, useTheme, VenueMap, VenueMapEditor, VenueMapViewer, ElementLibraryBuilder } from 'neogestify-ui-components';
import { Calendar, DatePicker, rangePresets, applyNuiColors, applyMotion } from 'neogestify-ui-components';
import {
  Accordion, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, Card, Pagination,
  Progress, Skeleton, Switch, Tabs, Tooltip,
} from 'neogestify-ui-components';
import type { NuiColors, VenuePaletteOverride } from 'neogestify-ui-components';
import type { DomainConfig, DateRange } from 'neogestify-ui-components';
import { ToastProvider } from 'neogestify-ui-components';
import { useState, useRef, useEffect } from 'react';
import { Flotantes } from './demos/Flotantes';
import { Controles } from './demos/Controles';
import { Datos } from './demos/Datos';
import { Movimiento } from './demos/Movimiento';

// ─── Demo «elemento clickeable» ────────────────────────────────────────────────
// El tipo INFO trae `clickable: true` por defecto: en el visor responde al clic;
// el tipo DECOR no, así se ve la diferencia (pulsarlo no hace nada).
const clickDemoConfig: DomainConfig = {
  id: 'click-demo',
  name: 'Demo',
  elementTypes: [
    { id: 'INFO', label: 'Púlsame', shape: 'circle', defaultWidth: 90, defaultHeight: 90, color: '#bfdbfe', strokeColor: '#2563eb', clickable: true },
    { id: 'DECOR', label: 'Decorativo', shape: 'rect', defaultWidth: 110, defaultHeight: 70, color: '#e5e7eb', strokeColor: '#6b7280' },
  ],
};

const clickDemoMap: VenueMap = {
  id: 'click-demo-map',
  name: 'Demo clickable',
  floors: [{
    id: 'f1', name: 'Planta', order: 0,
    area: { shape: 'rect', x: 0, y: 0, width: 460, height: 280 },
    wallNodes: [], walls: [],
    elements: [
      { id: 'clickable-1', type: 'INFO', x: 70, y: 95, width: 90, height: 90, rotation: 0, label: 'Púlsame' },
      { id: 'decor-1', type: 'DECOR', x: 290, y: 105, width: 110, height: 70, rotation: 0, label: 'Decorativo' },
    ],
  }],
};

type Preset = { nombre: string; colors: NuiColors; palette: VenuePaletteOverride };

/** Cada preset toca solo el acento: el resto de la paleta se mantiene. */
const PRESETS: Preset[] = [
  {
    nombre: 'Indigo',
    colors: {},
    palette: {},
  },
  {
    nombre: 'Esmeralda',
    colors: {
      light: { accent: '#059669', 'accent-hover': '#047857', 'accent-text': '#059669', 'accent-soft': '#ecfdf5', 'accent-subtle': '#a7f3d0', ring: '#10b981' },
      dark:  { accent: '#10b981', 'accent-hover': '#059669', 'accent-text': '#34d399', 'accent-soft': 'rgb(16 185 129 / .18)', 'accent-subtle': '#065f46', ring: '#34d399' },
    },
    palette: { light: { accent: '#059669' }, dark: { accent: '#34d399' } },
  },
  {
    nombre: 'Rosa',
    colors: {
      light: { accent: '#db2777', 'accent-hover': '#be185d', 'accent-text': '#db2777', 'accent-soft': '#fdf2f8', 'accent-subtle': '#fbcfe8', ring: '#ec4899' },
      dark:  { accent: '#ec4899', 'accent-hover': '#db2777', 'accent-text': '#f472b6', 'accent-soft': 'rgb(236 72 153 / .18)', 'accent-subtle': '#9d174d', ring: '#f472b6' },
    },
    palette: { light: { accent: '#db2777' }, dark: { accent: '#f472b6' } },
  },
  {
    nombre: 'Naranja',
    colors: {
      light: { accent: '#ea580c', 'accent-hover': '#c2410c', 'accent-text': '#ea580c', 'accent-soft': '#fff7ed', 'accent-subtle': '#fed7aa', ring: '#f97316' },
      dark:  { accent: '#f97316', 'accent-hover': '#ea580c', 'accent-text': '#fb923c', 'accent-soft': 'rgb(249 115 22 / .18)', 'accent-subtle': '#9a3412', ring: '#fb923c' },
    },
    palette: { light: { accent: '#ea580c' }, dark: { accent: '#fb923c' } },
  },
];

function App() {
  const [showModal, setShowModal] = useState(false);
  const [tema, setTema] = useState<string>('Indigo');
  const [pagina, setPagina] = useState(3);
  const [notificar, setNotificar] = useState(true);
  const [tags, setTags] = useState(['React', 'Tailwind', 'TypeScript']);
  const [avisoVisible, setAvisoVisible] = useState(true);
  const [animaciones, setAnimaciones] = useState(true);
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [dias, setDias] = useState<Date[]>([]);
  const [rango, setRango] = useState<DateRange>({ start: null, end: null });
  const [lastMap, setLastMap] = useState<VenueMap | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const modalRef = useRef<ModalRef>(null);
  const { theme, setTheme } = useTheme();

  const preset = PRESETS.find(p => p.nombre === tema) ?? PRESETS[0];
  useEffect(() => applyNuiColors(preset.colors), [preset]);
  useEffect(() => applyMotion(animaciones), [animaciones]);

  const handleAlertaExito = () => {
    AlertaExito('¡Éxito!', 'La operación se completó correctamente');
  };

  const handleAlertaError = () => {
    AlertaError('Error', 'Ocurrió un error al procesar la solicitud');
  };

  const handleAlertaAdvertencia = () => {
    AlertaAdvertencia(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer',
      () => AlertaToast('Confirmado', 'Acción ejecutada', 'success'),
      () => AlertaToast('Cancelado', 'Acción cancelada', 'info')
    );
  };

  const handleAlertaConfirmacion = () => {
    AlertaConfirmacion(
      'Confirmar acción',
      '¿Deseas continuar con esta operación?',
      () => console.log('Confirmado'),
      () => console.log('Cancelado')
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    AlertaToast('Formulario enviado', `Valor: ${inputValue}`, 'success');
  };

  return (
    // El proveedor envuelve toda la aplicación: `useToast()` funciona desde
    // cualquier punto del árbol que quede por debajo.
    <ToastProvider position="bottom-right">
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              UI Components Showcase
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Biblioteca de componentes reutilizables con React, Tailwind y SweetAlert
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Buttons Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Botones</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="link">Link Button</Button>
            <Button variant="primary" isLoading loadingText="Guardando...">
              Loading
            </Button>
            <Button variant="icon">
              <HomeIcon className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Icons Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Iconos</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <div className="flex flex-col items-center">
              <HomeIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Home</span>
            </div>
            <div className="flex flex-col items-center">
              <SaveIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Save</span>
            </div>
            <div className="flex flex-col items-center">
              <DeleteIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Delete</span>
            </div>
            <div className="flex flex-col items-center">
              <EditIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Edit</span>
            </div>
            <div className="flex flex-col items-center">
              <SearchIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Search</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Check</span>
            </div>
            <div className="flex flex-col items-center">
              <CloseIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Close</span>
            </div>
            <div className="flex flex-col items-center">
              <AddIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Add</span>
            </div>
            <div className="flex flex-col items-center">
              <SpinnerIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Spinner</span>
            </div>
            <div className="flex flex-col items-center">
              <ChevronLeftIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">ChevronLeft</span>
            </div>
            <div className="flex flex-col items-center">
              <ChevronRightIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">ChevronRight</span>
            </div>
            <div className="flex flex-col items-center">
              <ChevronDownIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">ChevronDown</span>
            </div>
            <div className="flex flex-col items-center">
              <ChevronUpIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">ChevronUp</span>
            </div>
            <div className="flex flex-col items-center">
              <UserIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">User</span>
            </div>
            <div className="flex flex-col items-center">
              <WarningIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Warning</span>
            </div>
            <div className="flex flex-col items-center">
              <ErrorIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Error</span>
            </div>
            <div className="flex flex-col items-center">
              <SlashIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Slash</span>
            </div>
            <div className="flex flex-col items-center">
              <CalendarIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Calendar</span>
            </div>
            <div className="flex flex-col items-center">
              <InfoIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">Info</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircleIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">CheckCircle</span>
            </div>
            <div className="flex flex-col items-center">
              <RingSpinnerIcon className="w-8 h-8 text-gray-700 dark:text-gray-300 animate-spin" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">RingSpinner</span>
            </div>
            <div className="flex flex-col items-center">
              <QuarterSpinnerIcon className="w-8 h-8 text-gray-700 dark:text-gray-300 animate-spin" />
              <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">QuarterSpinner</span>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Formularios</h2>
          <Form onSubmit={handleSubmit} className="max-w-md">
            <Input
              label="Nombre"
              type="text"
              placeholder="Ingresa tu nombre"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Este campo es obligatorio"
            />
            <Input
              label="Email"
              type="email"
              placeholder="correo@ejemplo.com"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error="La contraseña debe tener al menos 8 caracteres"
            />
            <Select
              label="País"
              placeholder="Selecciona un país"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: 'mx', label: 'México' },
                { value: 'ar', label: 'Argentina' },
                { value: 'cl', label: 'Chile' },
                { value: 'co', label: 'Colombia' }
              ]}
            />
            <Input
              type="checkbox"
              label="Acepto los términos y condiciones"
            />
            <div className="flex gap-2">
              <Button variant="primary" type="submit">
                Enviar
              </Button>
              <Button variant="secondary" type="button">
                Cancelar
              </Button>
            </div>
          </Form>
        </section>

        {/* Table Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Tablas</h2>
          <Table
            columns={['ID', 'Nombre', 'Email', 'Rol', 'Acciones']}
            rows={[
              ['1', 'Juan Pérez', 'juan@ejemplo.com', 'Admin',
                <div className="flex gap-2" key="actions-1">
                  <Button variant="icon"><EditIcon className="w-4 h-4" /></Button>
                  <Button variant="icon"><DeleteIcon className="w-4 h-4" /></Button>
                </div>
              ],
              ['2', 'María García', 'maria@ejemplo.com', 'Usuario',
                <div className="flex gap-2" key="actions-2">
                  <Button variant="icon"><EditIcon className="w-4 h-4" /></Button>
                  <Button variant="icon"><DeleteIcon className="w-4 h-4" /></Button>
                </div>
              ],
              ['3', 'Carlos López', 'carlos@ejemplo.com', 'Usuario',
                <div className="flex gap-2" key="actions-3">
                  <Button variant="icon"><EditIcon className="w-4 h-4" /></Button>
                  <Button variant="icon"><DeleteIcon className="w-4 h-4" /></Button>
                </div>
              ]
            ]}
          />
        </section>

        {/* Modal Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Modal</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Abrir Modal
          </Button>
          {showModal && (
            <Modal
              ref={modalRef}
              title="Ejemplo de Modal"
              onClose={() => setShowModal(false)}
              footer={
                <>
                  <Button variant="secondary" onClick={() => modalRef.current?.handleClose()}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={() => {
                    AlertaToast('Modal', 'Acción confirmada', 'success');
                    modalRef.current?.handleClose();
                  }}>
                    Confirmar
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Este es un ejemplo de un modal con contenido personalizado.
                </p>
                <Input
                  label="Campo de ejemplo"
                  placeholder="Escribe algo aquí..."
                />
              </div>
            </Modal>
          )}
        </section>

        {/* Theme Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Sistema de Tema</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-700 dark:text-gray-300">Tema actual: <strong>{theme}</strong></p>
              <ThemeToggle />
            </div>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => setTheme('light')}>
                Modo Claro
              </Button>
              <Button variant="secondary" onClick={() => setTheme('dark')}>
                Modo Oscuro
              </Button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                El tema se guarda automáticamente en localStorage y persiste entre sesiones.
                Usa el hook <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">useTheme()</code> para acceder al tema y sus funciones.
              </p>
            </div>
          </div>
        </section>

        {/* Componentes nuevos */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Card, Avatar, Badge, Tabs y compañia
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Todos usan los tokens de color, asi que siguen el acento elegido arriba.
          </p>

          <Breadcrumb
            className="mb-6"
            items={[
              { label: 'Inicio', href: '#' },
              { label: 'Componentes', href: '#' },
              { label: 'Card' },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8 [&>*]:min-w-0">
            <Card
              title="Ventas del mes"
              description="Comparado con el mes anterior"
              action={<Badge variant="success" dot>+12 %</Badge>}
              footer={<span className="text-xs text-gray-500 dark:text-gray-400">Actualizado hace 5 min</span>}
            >
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">48.320 EUR</p>
              <Progress className="mt-3" value={72} variant="success" size="sm" />
            </Card>

            <Card title="Equipo" description="5 personas en el proyecto" interactive>
              <AvatarGroup
                max={4}
                avatars={[
                  { name: 'Ada Lovelace', status: 'online' },
                  { name: 'Alan Turing' },
                  { name: 'Grace Hopper', status: 'busy' },
                  { name: 'Edsger Dijkstra' },
                  { name: 'Barbara Liskov' },
                ]}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map(t => (
                  <Badge key={t} variant="accent" pill onRemove={() => setTags(tags.filter(x => x !== t))}>
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card title="Cargando" description="Estado con Skeleton">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" width={40} />
                <div className="flex-1">
                  <Skeleton width="60%" />
                  <Skeleton className="mt-2" width="40%" />
                </div>
              </div>
              <Skeleton className="mt-4" lines={3} />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Avatar</h3>
              <div className="flex items-end gap-3">
                <Avatar name="Ada Lovelace" size="xs" />
                <Avatar name="Alan Turing" size="sm" status="online" />
                <Avatar name="Grace Hopper" size="md" status="busy" />
                <Avatar name="Edsger Dijkstra" size="lg" shape="square" />
                <Avatar size="xl" />
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">Badge</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Neutral</Badge>
                <Badge variant="accent">Acento</Badge>
                <Badge variant="success" dot>Activo</Badge>
                <Badge variant="warning">Pendiente</Badge>
                <Badge variant="danger" dot>Caido</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="solid" pill>12</Badge>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">Switch y Tooltip</h3>
              <Switch
                label="Notificaciones por correo"
                description="Te avisamos de cada pedido nuevo."
                checked={notificar}
                onChange={setNotificar}
              />
              <div className="mt-4">
                <Tooltip content="Esto es un tooltip; en movil se ve al mantener pulsado">
                  <Button variant="outline">Pasa el raton por aqui</Button>
                </Tooltip>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">Progress</h3>
              <Progress value={45} label="Subiendo archivo" showValue />
              <Progress className="mt-3" indeterminate label="Procesando..." variant="info" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tabs</h3>
              <Tabs
                aria-label="Ejemplo de pestanas"
                items={[
                  { id: 'general', label: 'General', content: <p className="text-sm text-gray-600 dark:text-gray-300">Contenido de la pestana general.</p> },
                  { id: 'seguridad', label: 'Seguridad', badge: <Badge size="sm" variant="danger">2</Badge>, content: <p className="text-sm text-gray-600 dark:text-gray-300">Dos avisos de seguridad pendientes.</p> },
                  { id: 'facturacion', label: 'Facturacion', content: <p className="text-sm text-gray-600 dark:text-gray-300">Sin facturas pendientes.</p> },
                  { id: 'archivado', label: 'Archivado', disabled: true },
                ]}
              />

              <h3 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">Accordion</h3>
              <Accordion
                type="multiple"
                items={[
                  { title: 'Como configuro el color del tema?', content: 'Declara las variables --nui-* en tu CSS o pasa la prop colors al ThemeProvider.', meta: 'Temas' },
                  { title: 'Funciona en Next.js y Astro?', content: 'Si. El README tiene una guia por framework con la ruta correcta de @source.', meta: 'Instalacion' },
                  { title: 'Necesito importar algun CSS?', content: 'No. Los componentes solo usan clases de Tailwind y tu proyecto ya compila el CSS.', meta: 'Setup' },
                ]}
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                El de abajo lleva <code>animate={false}</code>: se despliega de golpe aunque las
                animaciones globales esten encendidas.
              </p>
              <Accordion
                className="mt-2"
                animate={false}
                items={[{ title: 'Acordeon sin animacion', content: 'Se abre y cierra al instante.' }]}
              />

              <h3 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">Alert</h3>
              {avisoVisible && (
                <Alert
                  variant="warning"
                  title="Cuota casi llena"
                  onClose={() => setAvisoVisible(false)}
                  actions={<Button size="sm" variant="outline">Ampliar plan</Button>}
                >
                  Has usado el 92 % del espacio disponible.
                </Alert>
              )}
              <Alert className="mt-3" variant="success" title="Guardado">Los cambios se aplicaron.</Alert>

              <h3 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">Pagination</h3>
              <Pagination page={pagina} totalPages={12} onChange={setPagina} />
              <Pagination className="mt-3" page={pagina} totalPages={12} onChange={setPagina} compact />
            </div>
          </div>
        </section>

        {/* Theming Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Color del tema configurable
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Toda la libreria lee variables CSS <code>--nui-*</code>. Cambiando solo el acento se
            retematizan botones, campos, calendario, editor de mapas y alertas. Prueba a cambiar
            tambien a modo oscuro para ver los dos esquemas.
          </p>
          <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
            <Switch
              label="Animaciones"
              description="Interruptor global: applyMotion(false) o <ThemeProvider animations={false}>"
              checked={animaciones}
              onChange={setAnimaciones}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <Button
                key={p.nombre}
                variant={p.nombre === tema ? 'primary' : 'outline'}
                onClick={() => setTema(p.nombre)}
              >
                {p.nombre}
              </Button>
            ))}
          </div>
        </section>

        {/* Calendar Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Calendario &amp; DatePicker
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Celdas grandes para el dedo, desliza para cambiar de mes, selectores rapidos de mes/ano
            y colapso automatico a un solo mes en pantallas estrechas. Modos: fecha suelta, varias fechas y rango.
          </p>

          <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fecha suelta</h3>
              <Calendar value={fecha} onChange={setFecha} />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Valor: {fecha ? fecha.toLocaleDateString('es-ES') : '—'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Varias fechas (max. 5)</h3>
              <Calendar mode="multiple" maxSelections={5} value={dias} onChange={setDias} />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {dias.length ? dias.map(d => d.toLocaleDateString('es-ES')).join(' · ') : 'Sin fechas'}
              </p>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Rango con atajos (2 meses en escritorio, 1 en movil)
              </h3>
              <Calendar
                mode="range"
                value={rango}
                onChange={setRango}
                presets={rangePresets()}
                showValueSummary
                minDate={new Date(new Date().getFullYear(), 0, 1)}
                maxRangeDays={30}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {rango.start && rango.end
                  ? `${rango.start.toLocaleDateString('es-ES')} → ${rango.end.toLocaleDateString('es-ES')}`
                  : 'Elige un rango (maximo 30 dias)'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">DatePicker</h3>
              <DatePicker label="Fecha de la reserva" value={fecha} onChange={setFecha} helperText="En movil se abre como hoja inferior." />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">DatePicker de rango</h3>
              <DatePicker mode="range" label="Estancia" value={rango} onChange={setRango} presets={rangePresets(['next7', 'next30'])} />
            </div>
          </div>
        </section>

        {/* Element Library Builder Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Constructor de Librerías (Shapes JSON)
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Crea colecciones personalizadas de formas utilizando tus inputs nativos y expórtalas en JSON.
          </p>
          <div className="bg-white dark:bg-gray-50 rounded border dark:border-none shadow-inner h-[650px] overflow-hidden">
            <ElementLibraryBuilder />
          </div>
        </section>

        {/* VenueMapEditor Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            VenueMapEditor — Fase 1
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Canvas SVG infinito · pan con click-medio · zoom con rueda · artboard redimensionable
          </p>

          {/* Domain switcher */}
          <div className="flex gap-2 mb-4">
            <Button
              variant='toggle'
              isActive={readOnly}
              onClick={() => setReadOnly(!readOnly)}
            >
              Read Only
            </Button>
          </div>

          <VenueMapEditor
            palette={preset.palette}
            height="520px"
            readOnly={readOnly}
            containment="full"
            domainConfigs={[clickDemoConfig]}
            onChange={setLastMap}
          />

          {lastMap && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                Ver JSON del mapa ({lastMap.floors[0]?.area.width ?? 0} × {lastMap.floors[0]?.area.height ?? 0} px)
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 border border-gray-700 dark:border-gray-800 rounded text-xs overflow-auto max-h-48">
                {JSON.stringify(lastMap, null, 2)}
              </pre>
            </details>
          )}
        </section>

        {/* Clickable element demo */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Elemento clickeable (visor)
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            En modo visor, el círculo azul es <strong>clickeable</strong> y abre un
            SweetAlert; el rectángulo gris no responde. En el editor los elementos
            clickeables se mueven y editan como cualquier otro: solo responden al
            clic en modo visor.
          </p>
          <div className="rounded border dark:border-gray-700 overflow-hidden">
            <VenueMapViewer
              height="320px"
              initialMap={clickDemoMap}
              domainConfigs={[clickDemoConfig]}
              onElementClick={(el) =>
                AlertaExito('Elemento clickeable', `Has pulsado: ${el.label ?? el.type}`)
              }
            />
          </div>
        </section>

        {/* Duración y desenfoque configurables */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Movimiento configurable
          </h2>
          <Movimiento />
        </section>

        {/* Selección, paneles y piezas de composición */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Selección y composición
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Lo que hace falta cuando la lista pasa de una docena de opciones, y
            las piezas pequeñas que cada aplicación acababa reescribiendo.
          </p>
          <Datos />
        </section>

        {/* Controles de formulario y avisos */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Controles y avisos
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Los grupos que un <code>input</code> suelto no forma, y un sistema de
            avisos propio que no depende de SweetAlert.
          </p>
          <Controles />
        </section>

        {/* Capas flotantes: Dropdown, Popover, Tooltip */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Capas flotantes
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Todas comparten el mismo colocador: se voltean y se desplazan solas
            para no salirse de la pantalla, y viven en un portal para que ningún
            <code className="mx-1">overflow: hidden</code> las recorte.
          </p>
          <Flotantes />
        </section>

        {/* Alerts Section */}
        <section className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Alertas (SweetAlert2)</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="success" onClick={handleAlertaExito}>
              Alerta Éxito
            </Button>
            <Button variant="danger" onClick={handleAlertaError}>
              Alerta Error
            </Button>
            <Button variant="warning" onClick={handleAlertaAdvertencia}>
              Alerta Advertencia
            </Button>
            <Button variant="primary" onClick={handleAlertaConfirmacion}>
              Alerta Confirmación
            </Button>
            <Button variant="secondary" onClick={() => AlertaToast('Toast', 'Este es un toast de ejemplo', 'info')}>
              Toast Notification
            </Button>
          </div>
        </section>
      </div>
    </div>
    </ToastProvider>
  );
}

export default App;
