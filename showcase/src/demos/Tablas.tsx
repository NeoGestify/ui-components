import { useState } from 'react';
import {
  DataTable, Table, Badge, Button, Kbd, Switch,
  DeleteIcon, IconDownload,
  type DataColumn,
} from 'neogestify-ui-components';

interface Pedido {
  id: string;
  cliente: string;
  articulos: number;
  total: number;
  estado: 'pagado' | 'pendiente' | 'anulado';
  fecha: Date;
}

const ESTADOS = {
  pagado:    { label: 'Pagado', variant: 'success' as const },
  pendiente: { label: 'Pendiente', variant: 'warning' as const },
  anulado:   { label: 'Anulado', variant: 'danger' as const },
};

const NOMBRES = [
  'Ana Ruiz', 'Bruno Salas', 'Carmen Ortiz', 'Diego Vela', 'Elena Mir',
  'Félix Cano', 'Gema Losa', 'Hugo Pardo', 'Irene Gil', 'Javier Sanz',
  'Lucía Peña', 'Marco Vidal', 'Nuria Sáez', 'Óscar Lima', 'Paula Rey',
  'Quique Mora', 'Rosa Ibáñez', 'Samuel Cruz', 'Teresa Lago', 'Víctor Nieto',
  'Artículo 2', 'Artículo 10',
];

/** Datos deterministas: la demo tiene que verse igual en cada recarga. */
const PEDIDOS: Pedido[] = NOMBRES.map((cliente, i) => ({
  id: `P-${String(1000 + i)}`,
  cliente,
  articulos: ((i * 7) % 11) + 1,
  total: Math.round(((i * 137) % 950 + 12.5) * 100) / 100,
  estado: (['pagado', 'pendiente', 'anulado'] as const)[i % 3],
  fecha: new Date(2025, 0, 1 + (i * 13) % 300),
}));

const COLUMNAS: DataColumn<Pedido>[] = [
  { key: 'id', header: 'Pedido', sortable: true, width: '7rem' },
  { key: 'cliente', header: 'Cliente', sortable: true },
  { key: 'articulos', header: 'Artículos', sortable: true, align: 'right', width: '8rem' },
  {
    key: 'total', header: 'Total', sortable: true, align: 'right', width: '8rem',
    cell: p => <span className="tabular-nums">{p.total.toFixed(2)} €</span>,
  },
  {
    key: 'estado', header: 'Estado', sortable: true, width: '8rem',
    cell: p => <Badge variant={ESTADOS[p.estado].variant}>{ESTADOS[p.estado].label}</Badge>,
  },
  {
    key: 'fecha', header: 'Fecha', sortable: true, align: 'right', width: '8rem',
    accessor: p => p.fecha,
    cell: p => p.fecha.toLocaleDateString('es-ES'),
  },
];

/** Columnas de sobra para que la tabla no quepa y haya que desplazarla. */
const ANCHA = Array.from({ length: 9 }, (_, i) => ({
  header: `Columna ${i + 1}`,
  key: `c${i}`,
  sortable: i === 0,
  minWidth: '10rem',
}));

export function Tablas() {
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [redondeada, setRedondeada] = useState(true);

  return (
    <div className="space-y-8">

      {/* ── DataTable ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">DataTable</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          <code>Table</code> recibe <code>ReactNode[][]</code> y no sabe qué hay
          dentro, así que no puede ordenar ni buscar. <code>DataTable</code>
          trabaja sobre los registros, y de ahí salen la ordenación, la búsqueda,
          la paginación y la selección. Pulsa una cabecera tres veces: sube, baja
          y vuelve al orden original. Y fíjate en «Artículo 2» antes de
          «Artículo 10».
        </p>
        <DataTable
          data={PEDIDOS}
          columns={COLUMNAS}
          getRowId={p => p.id}
          searchable
          selectable
          pageSize={8}
          rounded
          selected={seleccion}
          onSelectedChange={setSeleccion}
          searchPlaceholder="Buscar cliente o pedido…"
          toolbar={
            <>
              <Button size="sm" variant="outline" leftIcon={<IconDownload className="h-4 w-4" />}>
                Exportar
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={seleccion.length === 0}
                leftIcon={<DeleteIcon className="h-4 w-4" />}
              >
                Borrar ({seleccion.length})
              </Button>
            </>
          }
        />
      </div>

      {/* ── Los arreglos de la tabla ──────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
          Tabla ancha, redondeada y con cabecera fija
        </h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Con <code>rounded</code>, <code>twMerge</code> se llevaba por delante el{' '}
          <code>overflow-x-auto</code> del envoltorio y una tabla ancha se quedaba
          recortada sin forma de desplazarla. Enciende y apaga el interruptor: en
          los dos casos la barra horizontal sigue ahí. Y la primera cabecera se
          ordena con <Kbd>Tab</Kbd> + <Kbd>Intro</Kbd>, que antes era imposible.
        </p>
        <div className="mb-3">
          <Switch label="rounded" checked={redondeada} onChange={setRedondeada} />
        </div>
        <Table
          rounded={redondeada}
          shadow
          stickyHeader
          maxHeight="16rem"
          columns={ANCHA}
          sortState={{ key: 'c0', direction: 'asc' }}
          onSort={() => undefined}
          rows={Array.from({ length: 14 }, (_, f) =>
            Array.from({ length: 9 }, (_, c) => `Fila ${f + 1} · col ${c + 1}`),
          )}
        />
      </div>
    </div>
  );
}
