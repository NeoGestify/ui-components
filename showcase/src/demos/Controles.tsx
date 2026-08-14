import { useState } from 'react';
import {
  Button, RadioGroup, CheckboxGroup, SegmentedControl, Badge, useToast,
  CalendarIcon, ChartIcon, UsersIcon, TruckIcon, LightingIcon,
} from 'neogestify-ui-components';

const ENVIOS = [
  { value: 'std', label: 'Estándar', description: 'Llega en 3-5 días laborables' },
  { value: 'exp', label: 'Exprés', description: 'Llega mañana antes de las 14 h' },
  { value: 'rec', label: 'Recoger en tienda', description: 'Disponible hoy', disabled: true },
];

const PERMISOS = [
  { value: 'leer', label: 'Leer', description: 'Ver registros y exportarlos' },
  { value: 'escribir', label: 'Escribir', description: 'Crear y editar registros' },
  { value: 'borrar', label: 'Borrar', description: 'Eliminar registros de forma permanente' },
  { value: 'admin', label: 'Administrar', description: 'Gestionar usuarios y facturación', disabled: true },
];

const RANGOS = [
  { value: 'dia', label: 'Día', icon: <CalendarIcon className="h-4 w-4" /> },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'anio', label: 'Año' },
];

/** Se separa del resto porque necesita estar dentro del `ToastProvider`. */
export function Avisos() {
  const { toast, dismissAll } = useToast();
  const [borrados, setBorrados] = useState(0);

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="success" onClick={() => toast({ title: 'Guardado', description: 'Los cambios ya están publicados.', variant: 'success' })}>
        Éxito
      </Button>
      <Button variant="danger" onClick={() => toast({ title: 'No se pudo conectar', description: 'Reintentando en 30 segundos…', variant: 'danger' })}>
        Error
      </Button>
      <Button variant="warning" onClick={() => toast({ title: 'Cuota casi llena', description: 'Has usado el 92 % del espacio.', variant: 'warning' })}>
        Aviso
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          setBorrados(n => n + 1);
          toast({
            title: 'Registro eliminado',
            description: 'Se puede recuperar durante 30 días.',
            action: { label: 'Deshacer', onClick: () => setBorrados(n => Math.max(0, n - 1)) },
            duration: 8000,
          });
        }}
      >
        Con acción «Deshacer»
      </Button>
      <Button
        variant="outline"
        onClick={() => toast({ title: 'Este no se va solo', description: 'Ciérralo con la X.', duration: 0 })}
      >
        Sin temporizador
      </Button>
      <Button variant="ghost" onClick={dismissAll}>Cerrar todos</Button>

      {borrados > 0 && <Badge variant="danger">{borrados} borrados</Badge>}
    </div>
  );
}

export function Controles() {
  const [envio, setEnvio] = useState('std');
  const [permisos, setPermisos] = useState<string[]>(['leer']);
  const [rango, setRango] = useState('semana');
  const [vista, setVista] = useState('grafico');

  return (
    <div className="space-y-8">

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Toast</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          El temporizador <strong>se pausa</strong> mientras el ratón está encima
          o algo dentro tiene el foco: prueba a dejar el cursor sobre el que
          lleva «Deshacer». Se apilan hasta 4 y el más viejo se retira solo.
        </p>
        <Avisos />
      </div>

      {/* ── RadioGroup ────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">RadioGroup</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Una sola parada de tabulación; dentro se mueve con las flechas, y mover
          el foco selecciona — igual que un grupo de radios nativo.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <RadioGroup
            label="Método de envío"
            variant="card"
            options={ENVIOS}
            value={envio}
            onChange={setEnvio}
            required
          />
          <RadioGroup
            label="Orientación horizontal"
            orientation="horizontal"
            options={[
              { value: 'si', label: 'Sí' },
              { value: 'no', label: 'No' },
              { value: 'quiza', label: 'Quizá' },
            ]}
            defaultValue="si"
            error="Elige una para continuar"
          />
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Valor: <code>{envio}</code>
        </p>
      </div>

      {/* ── CheckboxGroup ─────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">CheckboxGroup</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Con casilla de «todas» y su estado intermedio de verdad
          (<code>aria-checked=&quot;mixed&quot;</code>), no un simple sí/no.
        </p>
        <CheckboxGroup
          label="Permisos del rol"
          description="«Administrar» solo lo puede conceder el propietario."
          selectAllLabel="Seleccionar todo"
          variant="card"
          options={PERMISOS}
          value={permisos}
          onChange={setPermisos}
        />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Valor: <code>[{permisos.join(', ')}]</code>
        </p>
      </div>

      {/* ── SegmentedControl ──────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">SegmentedControl</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Para cambiar un <strong>valor</strong>, no la vista. La pastilla se
          desliza en vez de saltar porque se mide del botón activo.
        </p>
        <div className="flex flex-wrap items-start gap-6">
          <SegmentedControl
            aria-label="Rango de fechas"
            options={RANGOS}
            value={rango}
            onChange={setRango}
          />
          <SegmentedControl
            aria-label="Tamaño pequeño"
            size="sm"
            options={[
              { value: 'grafico', label: 'Gráfico', icon: <ChartIcon className="h-3.5 w-3.5" /> },
              { value: 'tabla', label: 'Tabla', icon: <UsersIcon className="h-3.5 w-3.5" /> },
              { value: 'mapa', label: 'Mapa', icon: <TruckIcon className="h-3.5 w-3.5" /> },
            ]}
            value={vista}
            onChange={setVista}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <SegmentedControl
            aria-label="A todo el ancho"
            fullWidth
            size="lg"
            options={[
              { value: 'a', label: 'Ancho completo', icon: <LightingIcon className="h-4 w-4" /> },
              { value: 'b', label: 'Segunda' },
              { value: 'c', label: 'Tercera' },
            ]}
            defaultValue="a"
          />
        </div>
      </div>
    </div>
  );
}
