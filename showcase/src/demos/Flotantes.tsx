import { useState } from 'react';
import {
  Button, Dropdown, Popover, Tooltip, Input, Switch, Badge,
  EditIcon, TrashIcon, CopyIcon, ShareIcon, MenuIcon, FilterIcon, ArchiveIcon,
  type Placement,
} from 'neogestify-ui-components';

const PLACEMENTS: Placement[] = [
  'top', 'top-start', 'top-end',
  'bottom', 'bottom-start', 'bottom-end',
  'left', 'left-start', 'left-end',
  'right', 'right-start', 'right-end',
];

export function Flotantes() {
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement>('bottom-start');
  const [soloLectura, setSoloLectura] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  return (
    <div className="space-y-8">

      {/* ── Dropdown ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Dropdown</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Ábrelo y prueba el teclado: flechas, Inicio, Fin, Escape, y teclea
          «el» para saltar a «Eliminar».
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            aria-label="Acciones del registro"
            trigger={<Button variant="secondary" rightIcon={<MenuIcon className="h-4 w-4" />}>Acciones</Button>}
            onSelect={setUltimo}
            items={[
              { id: 'editar', label: 'Editar', icon: <EditIcon className="h-4 w-4" />, shortcut: '⌘E' },
              { id: 'duplicar', label: 'Duplicar', icon: <CopyIcon className="h-4 w-4" />, shortcut: '⌘D' },
              { id: 'compartir', label: 'Compartir', icon: <ShareIcon className="h-4 w-4" /> },
              { id: 'archivar', label: 'Archivar', icon: <ArchiveIcon className="h-4 w-4" />, disabled: true },
              { id: 'eliminar', label: 'Eliminar', icon: <TrashIcon className="h-4 w-4" />, danger: true, separatorBefore: true },
            ]}
          />

          <Dropdown
            aria-label="Menú de solo iconos"
            placement="bottom-end"
            trigger={<Button variant="icon" aria-label="Más opciones"><MenuIcon className="h-5 w-5" /></Button>}
            onSelect={setUltimo}
            items={[
              { id: 'ver', label: 'Ver detalles' },
              { id: 'exportar', label: 'Exportar CSV' },
              { id: 'imprimir', label: 'Imprimir' },
            ]}
          />

          {ultimo && (
            <Badge variant="success">
              Elegido: <code>{ultimo}</code>
            </Badge>
          )}
        </div>
      </div>

      {/* ── Popover ───────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Popover</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          A diferencia del tooltip, admite el foco dentro: campos, botones, lo
          que sea. Cierra con Escape o pulsando fuera.
        </p>
        <Popover
          placement="bottom-start"
          className="w-72 space-y-3"
          trigger={
            <Button variant="outline" leftIcon={<FilterIcon className="h-4 w-4" />}>
              Filtros
            </Button>
          }
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Filtrar resultados</p>
          <Input
            label="Buscar"
            placeholder="Nombre o correo…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            clearable
            onClear={() => setBusqueda('')}
          />
          <Switch
            label="Solo lectura"
            description="Oculta los registros editables"
            checked={soloLectura}
            onChange={setSoloLectura}
          />
        </Popover>
      </div>

      {/* ── Colocación y volteo ───────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
          Colocación, volteo y desplazamiento
        </h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Elige un lado y <strong>desplaza la página</strong> hasta pegar el botón
          a un borde: cuando deja de caber, el globo se voltea al lado contrario
          y se desplaza para no salirse.
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {PLACEMENTS.map(p => (
            <Button
              key={p}
              size="sm"
              variant="toggle"
              isActive={placement === p}
              onClick={() => setPlacement(p)}
            >
              {p}
            </Button>
          ))}
        </div>

        {/* Los bordes son donde se ve el volteo, así que el botón se puede
            llevar a cada esquina de una caja con desplazamiento propio. */}
        <div className="h-48 overflow-auto rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex h-96 w-[150%] items-center justify-center">
            <Tooltip
              content="Me volteo y me desplazo para caber en la pantalla"
              placement={placement}
            >
              <Button variant="primary">Apúntame ({placement})</Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
