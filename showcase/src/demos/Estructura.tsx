import { useState } from 'react';
import {
  Stepper, Collapsible, Timeline, Tree, ScrollArea, CommandPalette,
  Button, Badge, Kbd, Input, TextArea,
  FolderIcon, DocumentIcon, AddIcon, SearchIcon, SaveIcon, UsersIcon, CashIcon,
  CheckCircleIcon, TruckIcon, ClockIcon,
  type TreeNode, type CommandItem,
} from 'neogestify-ui-components';

const PASOS = [
  { label: 'Datos del cliente', description: 'Nombre y contacto' },
  { label: 'Artículos', description: '3 líneas' },
  { label: 'Pago', description: 'Tarjeta o transferencia' },
  { label: 'Confirmación', optional: true },
];

const SUCESOS = [
  { title: 'Pedido creado', meta: '10:04', variant: 'accent' as const, icon: <AddIcon className="h-4 w-4" />, description: 'Por Ana Ruiz desde el panel.' },
  { title: 'Pago confirmado', meta: '10:06', variant: 'success' as const, icon: <CheckCircleIcon className="h-4 w-4" />, description: '248,90 € con tarjeta terminada en 4417.' },
  { title: 'Preparando envío', meta: '11:20', variant: 'warning' as const, icon: <ClockIcon className="h-4 w-4" /> },
  { title: 'En reparto', meta: 'Ayer', variant: 'info' as const, icon: <TruckIcon className="h-4 w-4" />, description: 'Entrega estimada mañana antes de las 14 h.' },
];

const ARBOL: TreeNode[] = [
  {
    id: 'src', label: 'src', icon: <FolderIcon className="h-4 w-4" />, meta: '24',
    children: [
      {
        id: 'components', label: 'components', icon: <FolderIcon className="h-4 w-4" />,
        children: [
          { id: 'button', label: 'Button.tsx', icon: <DocumentIcon className="h-4 w-4" /> },
          { id: 'table', label: 'Table.tsx', icon: <DocumentIcon className="h-4 w-4" /> },
          { id: 'modal', label: 'Modal.tsx', icon: <DocumentIcon className="h-4 w-4" /> },
        ],
      },
      {
        id: 'internal', label: 'internal', icon: <FolderIcon className="h-4 w-4" />,
        children: [
          { id: 'cn', label: 'cn.ts', icon: <DocumentIcon className="h-4 w-4" /> },
          { id: 'options', label: 'options.ts', icon: <DocumentIcon className="h-4 w-4" /> },
        ],
      },
      { id: 'index', label: 'index.ts', icon: <DocumentIcon className="h-4 w-4" /> },
    ],
  },
  {
    id: 'dist', label: 'dist', icon: <FolderIcon className="h-4 w-4" />, disabled: true,
    children: [{ id: 'bundle', label: 'index.mjs' }],
  },
];

const ACCIONES: CommandItem[] = [
  { id: 'nuevo-pedido', label: 'Crear pedido', group: 'Acciones', icon: <AddIcon className="h-4 w-4" />, shortcut: ['⌘', 'N'], keywords: ['nuevo', 'venta'] },
  { id: 'nuevo-cliente', label: 'Crear cliente', group: 'Acciones', icon: <UsersIcon className="h-4 w-4" />, keywords: ['alta'] },
  { id: 'facturar', label: 'Facturar pedido', group: 'Acciones', icon: <CashIcon className="h-4 w-4" />, keywords: ['cobro', 'ticket'] },
  { id: 'guardar', label: 'Guardar borrador', group: 'Acciones', icon: <SaveIcon className="h-4 w-4" />, shortcut: ['⌘', 'S'] },
  { id: 'buscar-pedidos', label: 'Buscar pedidos', group: 'Ir a', icon: <SearchIcon className="h-4 w-4" /> },
  { id: 'clientes', label: 'Clientes', group: 'Ir a', icon: <UsersIcon className="h-4 w-4" /> },
  { id: 'archivo', label: 'Archivo (sin permisos)', group: 'Ir a', disabled: true },
];

export function Estructura() {
  const [paso, setPaso] = useState(1);
  const [paleta, setPaleta] = useState(false);
  const [ultima, setUltima] = useState<string | null>(null);
  const [abiertos, setAbiertos] = useState<string[]>(['src', 'components']);
  const [marcados, setMarcados] = useState<string[]>([]);

  return (
    <div className="space-y-8">

      {/* ── Stepper ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Stepper</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Es un <code>&lt;ol&gt;</code> de verdad, así que un lector de pantalla
          anuncia «3 de 4» sin que haya que escribirlo. Solo se puede volver a
          los pasos ya completados.
        </p>
        <Stepper steps={PASOS} current={paso} onStepClick={setPaso} />
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" disabled={paso === 0} onClick={() => setPaso(p => p - 1)}>
            Atrás
          </Button>
          <Button size="sm" disabled={paso >= PASOS.length} onClick={() => setPaso(p => p + 1)}>
            Siguiente
          </Button>
        </div>
      </div>

      {/* ── Collapsible ──────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Collapsible</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          El acordeón de uno solo. La animación va con{' '}
          <code>grid-template-rows: 0fr → 1fr</code>, que llega a la altura real
          del contenido sin medirla, y cerrado queda <code>inert</code>: prueba a
          tabular con el panel plegado y verás que no entra.
        </p>
        <div className="max-w-xl space-y-2">
          <Collapsible variant="bordered" title="Opciones avanzadas" meta="3 campos">
            <div className="space-y-3 pt-2">
              <Input label="Referencia interna" placeholder="REF-000" />
              <TextArea label="Notas" rows={2} placeholder="Visible solo para el equipo" />
            </div>
          </Collapsible>
          <Collapsible variant="bordered" title="Historial" defaultOpen meta={<Badge size="sm">4</Badge>}>
            <Timeline size="sm" items={SUCESOS} aria-label="Historial del pedido" />
          </Collapsible>
        </div>
      </div>

      {/* ── Tree y ScrollArea ────────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Tree</h3>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Una sola parada de tabulación para todo el árbol. Dentro:{' '}
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> entre lo visible, <Kbd>→</Kbd> abre o baja
            al primer hijo, <Kbd>←</Kbd> cierra o sube al padre.
          </p>
          <ScrollArea maxHeight="14rem" className="rounded-lg border border-gray-200 p-2 dark:border-gray-700">
            <Tree
              nodes={ARBOL}
              selectable="multiple"
              expanded={abiertos}
              onExpandedChange={setAbiertos}
              selected={marcados}
              onSelectedChange={setMarcados}
              aria-label="Archivos del proyecto"
            />
          </ScrollArea>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Marcados: {marcados.length ? marcados.join(', ') : 'ninguno'}
          </p>
        </div>

        <div>
          <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">ScrollArea</h3>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            La barra sigue siendo la nativa, solo cambia de aspecto. Reimplementarla
            en JavaScript es lo que rompe el desplazamiento automático al llegar
            con el tabulador a algo que está fuera de la vista.
          </p>
          <ScrollArea
            maxHeight="14rem"
            stableGutter
            tabIndex={0}
            aria-label="Registro de actividad"
            className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <Timeline items={[...SUCESOS, ...SUCESOS, ...SUCESOS]} aria-label="Actividad" />
          </ScrollArea>
        </div>
      </div>

      {/* ── CommandPalette ───────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">CommandPalette</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Montada sobre <code>Modal</code>, así que hereda el velo, el foco
          atrapado y la <em>top layer</em>. El foco no se mueve del campo: lo que
          baja con las flechas es <code>aria-activedescendant</code>, y por eso se
          puede seguir escribiendo. Prueba «cl cr» o «cobro».
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" leftIcon={<SearchIcon className="h-4 w-4" />} onClick={() => setPaleta(true)}>
            Abrir buscador <Kbd>⌘</Kbd><Kbd>K</Kbd>
          </Button>
          {ultima && <Badge variant="accent">Última acción: {ultima}</Badge>}
        </div>
        <CommandPalette
          open={paleta}
          onClose={() => setPaleta(false)}
          items={ACCIONES}
          onSelect={i => setUltima(i.label)}
          footer={
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> para moverte · <Kbd>Intro</Kbd> para elegir · <Kbd>Esc</Kbd> para cerrar
            </span>
          }
        />
      </div>
    </div>
  );
}
