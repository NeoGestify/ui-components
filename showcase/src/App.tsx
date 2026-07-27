import { AddIcon, AlertaAdvertencia, AlertaConfirmacion, AlertaError, AlertaExito, AlertaToast, Button, CheckIcon, CloseIcon, DeleteIcon, EditIcon, Form, HomeIcon, Input, Modal, ModalRef, SaveIcon, SearchIcon, Select, SpinnerIcon, Table, ThemeToggle, useTheme, VenueMap, VenueMapEditor, VenueMapViewer, ElementLibraryBuilder } from 'neogestify-ui-components';
import { Calendar, DatePicker, rangePresets } from 'neogestify-ui-components';
import type { DomainConfig, DateRange } from 'neogestify-ui-components';
import { useState, useRef } from 'react';

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

function App() {
  const [showModal, setShowModal] = useState(false);
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [dias, setDias] = useState<Date[]>([]);
  const [rango, setRango] = useState<DateRange>({ start: null, end: null });
  const [lastMap, setLastMap] = useState<VenueMap | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const modalRef = useRef<ModalRef>(null);
  const { theme, setTheme } = useTheme();

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
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              UI Components Showcase
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Biblioteca de componentes reutilizables con React, Tailwind y SweetAlert
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Buttons Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Botones</h2>
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
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Iconos</h2>
          <div className="grid grid-cols-6 gap-4">
            <div className="flex flex-col items-center">
              <HomeIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Home</span>
            </div>
            <div className="flex flex-col items-center">
              <SaveIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Save</span>
            </div>
            <div className="flex flex-col items-center">
              <DeleteIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Delete</span>
            </div>
            <div className="flex flex-col items-center">
              <EditIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Edit</span>
            </div>
            <div className="flex flex-col items-center">
              <SearchIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Search</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Check</span>
            </div>
            <div className="flex flex-col items-center">
              <CloseIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Close</span>
            </div>
            <div className="flex flex-col items-center">
              <AddIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Add</span>
            </div>
            <div className="flex flex-col items-center">
              <SpinnerIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Spinner</span>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Formularios</h2>
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
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tablas</h2>
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
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Modal</h2>
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
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sistema de Tema</h2>
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

        {/* Calendar Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Calendario &amp; DatePicker
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Celdas grandes para el dedo, desliza para cambiar de mes, selectores rapidos de mes/ano
            y colapso automatico a un solo mes en pantallas estrechas. Modos: fecha suelta, varias fechas y rango.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
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
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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

        {/* Alerts Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Alertas (SweetAlert2)</h2>
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
  );
}

export default App;
