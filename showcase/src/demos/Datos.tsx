import { useState } from 'react';
import {
  Button, Combobox, Drawer, Divider, EmptyState, Stat, Kbd, Input, Switch, Badge,
  BoxIcon, CashIcon, UsersIcon, ChartIcon, FilterIcon, SearchIcon,
  type ComboboxOption,
} from 'neogestify-ui-components';

const PAISES: ComboboxOption[] = [
  { value: 'es', label: 'España', description: 'Europa', group: 'Europa' },
  { value: 'pt', label: 'Portugal', description: 'Europa', group: 'Europa' },
  { value: 'fr', label: 'Francia', description: 'Europa', group: 'Europa' },
  { value: 'de', label: 'Alemania', description: 'Europa', group: 'Europa' },
  { value: 'co', label: 'Colombia', description: 'América', group: 'América' },
  { value: 'mx', label: 'México', description: 'América', group: 'América' },
  { value: 'ar', label: 'Argentina', description: 'América', group: 'América' },
  { value: 'cl', label: 'Chile', description: 'América', group: 'América' },
  { value: 'pe', label: 'Perú', description: 'América', group: 'América' },
  { value: 'aq', label: 'Antártida', description: 'Sin cobertura', disabled: true },
];

const ETIQUETAS: ComboboxOption[] = [
  { value: 'urgente', label: 'Urgente' },
  { value: 'facturado', label: 'Facturado' },
  { value: 'pendiente', label: 'Pendiente de pago' },
  { value: 'revision', label: 'En revisión' },
  { value: 'archivado', label: 'Archivado' },
  { value: 'incidencia', label: 'Con incidencia' },
];

export function Datos() {
  const [pais, setPais] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>(['urgente']);
  const [cajon, setCajon] = useState<null | 'right' | 'left' | 'bottom'>(null);
  const [vacio, setVacio] = useState(true);

  return (
    <div className="space-y-8">

      {/* ── Combobox ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Combobox</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Escribe para filtrar — ignora acentos, así que «peru» encuentra «Perú».
          Con las flechas se recorre la lista sin perder el cursor del campo, y
          en el múltiple, <Kbd>⌫</Kbd> con el campo vacío quita la última ficha.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Combobox
            label="País"
            options={PAISES}
            value={pais}
            onChange={setPais}
            placeholder="Busca un país…"
            helperText="Las opciones van agrupadas por continente."
          />
          <Combobox
            multiple
            label="Etiquetas"
            options={ETIQUETAS}
            value={etiquetas}
            onChange={setEtiquetas}
            placeholder="Añade etiquetas…"
            maxTags={2}
          />
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Valores: <code>{pais || '—'}</code> · <code>[{etiquetas.join(', ')}]</code>
        </p>
      </div>

      <Divider label="Drawer" />

      {/* ── Drawer ────────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Es un <code>&lt;dialog&gt;</code> con <code>showModal()</code>, igual que
          el Modal: el navegador atrapa el foco de verdad y deja el resto de la
          página inerte. Prueba a tabular con uno abierto.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" leftIcon={<FilterIcon className="h-4 w-4" />} onClick={() => setCajon('right')}>
            Desde la derecha
          </Button>
          <Button variant="secondary" onClick={() => setCajon('left')}>Desde la izquierda</Button>
          <Button variant="secondary" onClick={() => setCajon('bottom')}>Desde abajo</Button>
        </div>

        {cajon && (
          <Drawer
            side={cajon}
            // Un panel horizontal reparte su alto entre cabecera, cuerpo y pie,
            // así que este formulario necesita una talla más que en los laterales.
            size={cajon === 'bottom' ? 'lg' : 'md'}
            title="Filtros avanzados"
            onClose={() => setCajon(null)}
            footer={
              <>
                <Button variant="outline" onClick={() => setCajon(null)}>Cancelar</Button>
                <Button onClick={() => setCajon(null)}>Aplicar</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Buscar" placeholder="Referencia o cliente…" icon={<SearchIcon className="h-4 w-4" />} />
              <Combobox label="País" options={PAISES} placeholder="Cualquiera" />
              <Switch label="Solo con incidencias" description="Oculta los pedidos correctos" />
              <Divider />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                El panel entra desde <code>{cajon}</code>.
              </p>
            </div>
          </Drawer>
        )}
      </div>

      <Divider label="Piezas sueltas" />

      {/* ── Stat ──────────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Stat</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          El <code>delta</code> se colorea por su signo, salvo con
          <code className="mx-1">invertDelta</code>: un −8 % en costes es bueno.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Pedidos" value="1.284" delta={12} hint="vs. mes anterior" icon={<BoxIcon className="h-5 w-5" />} />
          <Stat label="Facturación" value="48.320 €" delta={4} hint="vs. mes anterior" icon={<CashIcon className="h-5 w-5" />} />
          <Stat label="Coste por pedido" value="3,41 €" delta={-8} invertDelta hint="vs. mes anterior" icon={<ChartIcon className="h-5 w-5" />} />
          <Stat label="Clientes activos" value="312" delta={0} hint="sin cambios" icon={<UsersIcon className="h-5 w-5" />} />
        </div>
      </div>

      {/* ── EmptyState ────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">EmptyState</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Una lista vacía sin esto es indistinguible de una que no ha cargado.
        </p>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700">
          {vacio ? (
            <EmptyState
              icon={<BoxIcon className="h-10 w-10" />}
              title="Aún no hay pedidos"
              description="Cuando entre el primero aparecerá aquí, con su estado y su cliente."
              action={<Button onClick={() => setVacio(false)}>Crear el primero</Button>}
            />
          ) : (
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Pedido <strong>#1001</strong> <Badge variant="success">Nuevo</Badge>
              </span>
              <Button variant="link" onClick={() => setVacio(true)}>Vaciar</Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Divider y Kbd ─────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Divider y Kbd</h3>
        <div className="max-w-sm space-y-4">
          <Divider />
          <Divider label="o" />
          <Divider label="Opciones avanzadas" labelPosition="start" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Abre la paleta con <Kbd>⌘</Kbd> <Kbd>K</Kbd>, y cierra con <Kbd>Esc</Kbd>.
          </p>
          <div className="flex h-10 items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">Izquierda</span>
            <Divider orientation="vertical" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Derecha</span>
          </div>
        </div>
      </div>
    </div>
  );
}
