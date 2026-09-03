import { useState } from 'react';
import {
  Checkbox, Radio, NumberInput, Slider, TagInput, Rating, FileDropzone, ToggleGroup,
  Badge, Kbd,
  EditIcon, IconGrid, StackIcon, DocumentIcon,
  type RejectedFile,
} from 'neogestify-ui-components';

/**
 * El mismo arreglo de opciones se pasa a tres componentes distintos.
 *
 * Antes no se podía: cada uno declaraba su propio tipo —`RadioOption`,
 * `SegmentedOption`, `ToggleOption`— y TypeScript los daba por incompatibles.
 * Ahora todos son `NuiOption`.
 */
const VISTA = [
  { value: 'lista', label: 'Lista', icon: <StackIcon className="h-4 w-4" /> },
  { value: 'rejilla', label: 'Rejilla', icon: <IconGrid className="h-4 w-4" /> },
  { value: 'detalle', label: 'Detalle', icon: <DocumentIcon className="h-4 w-4" /> },
];

const PLANES = [
  { value: 'free', label: 'Gratis', description: 'Hasta 3 proyectos' },
  { value: 'pro', label: 'Profesional', description: '25 €/mes, proyectos sin límite' },
];

export function Formularios() {
  const [acepta, setAcepta] = useState(false);
  const [plan, setPlan] = useState('pro');
  const [cantidad, setCantidad] = useState<number | null>(12);
  const [precio, setPrecio] = useState<number | null>(19.99);
  const [aforo, setAforo] = useState(120);
  const [tags, setTags] = useState<string[]>(['urgente', 'facturado']);
  const [nota, setNota] = useState(4);
  const [vista, setVista] = useState('rejilla');
  const [formato, setFormato] = useState<string[]>(['negrita']);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [rechazados, setRechazados] = useState<RejectedFile[]>([]);

  return (
    <div className="space-y-8">

      {/* ── Casilla y opción sueltas ─────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Checkbox y Radio sueltos</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Antes solo existían las versiones de grupo, así que un «acepto los
          términos» obligaba a declarar un <code>CheckboxGroup</code> de una sola
          opción. Los grupos ahora se construyen con estos mismos, no al revés.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Checkbox
            label="Acepto los términos"
            description="Se puede revocar desde los ajustes de la cuenta."
            required
            checked={acepta}
            onChange={setAcepta}
          />
          <div className="flex flex-col gap-2">
            {PLANES.map(p => (
              <Radio
                key={p.value}
                value={p.value}
                variant="card"
                label={p.label}
                description={p.description}
                checked={plan === p.value}
                onChange={setPlan}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Números ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">NumberInput</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          No es un <code>input type="number"</code>: la rueda del ratón no cambia
          el valor al pasar por encima. Prueba <Kbd>↑</Kbd> <Kbd>↓</Kbd> para
          moverte de uno en uno y <Kbd>RePág</Kbd> <Kbd>AvPág</Kbd> de diez en
          diez. En el precio, la coma vale como separador decimal.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <NumberInput label="Cantidad" min={1} max={99} value={cantidad} onChange={setCantidad} />
          <NumberInput
            label="Precio" step={0.01} min={0} prefix="€"
            value={precio} onChange={setPrecio}
            helperText="Se redondea al salir del campo."
          />
          <NumberInput
            label="Descuento" min={0} max={100} step={5} suffix="%" controls={false}
            defaultValue={10}
          />
        </div>
      </div>

      {/* ── Slider ───────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Slider</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Por dentro es un <code>input type="range"</code> de verdad: arrastre,
          gesto táctil, flechas, <Kbd>Inicio</Kbd> y <Kbd>Fin</Kbd> vienen de
          serie. Solo cambia la pintura.
        </p>
        <div className="max-w-md">
          <Slider
            label="Aforo máximo"
            min={0} max={500} step={10}
            showValue
            formatValue={v => `${v} personas`}
            marks={[0, 250, 500]}
            value={aforo}
            onChange={setAforo}
          />
        </div>
      </div>

      {/* ── Etiquetas ────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">TagInput</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Los valores no salen de una lista: los inventa quien escribe. Cierra
          con <Kbd>Intro</Kbd> o coma, <Kbd>⌫</Kbd> sobre el campo vacío borra la
          última, y al pegar una columna de una hoja de cálculo sale una etiqueta
          por línea.
        </p>
        <div className="max-w-md">
          <TagInput
            label="Etiquetas"
            placeholder="Escribe y pulsa Intro…"
            max={8}
            value={tags}
            onChange={setTags}
            transform={t => t.toLowerCase()}
            helperText={`${tags.length} de 8`}
          />
        </div>
      </div>

      {/* ── Puntuación y grupos de botones ───────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Rating</h3>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Una sola parada de tabulación; dentro, las flechas.
          </p>
          <div className="space-y-3">
            <Rating label="Valoración" showValue value={nota} onChange={setNota} />
            <div className="flex items-center gap-2">
              <Rating value={4} readOnly size="sm" />
              <span className="text-sm text-gray-500 dark:text-gray-400">4,0 · 128 opiniones</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">ToggleGroup</h3>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Barra de herramientas, no campo: admite varios activos y botones de
            solo icono. El mismo arreglo <code>VISTA</code> vale aquí y en un
            <code className="mx-1">RadioGroup</code>.
          </p>
          <div className="space-y-3">
            <ToggleGroup
              options={VISTA}
              value={vista}
              onChange={setVista}
              aria-label="Vista"
            />
            <ToggleGroup
              type="multiple"
              attached
              iconOnly
              options={[
                { value: 'negrita', label: 'Negrita', icon: <span className="font-bold">B</span> },
                { value: 'cursiva', label: 'Cursiva', icon: <span className="italic">I</span> },
                { value: 'subrayado', label: 'Subrayado', icon: <span className="underline">U</span> },
                { value: 'editar', label: 'Editar', icon: <EditIcon className="h-4 w-4" /> },
              ]}
              value={formato}
              onChange={setFormato}
              aria-label="Formato"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Activos: {formato.length ? formato.join(', ') : 'ninguno'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Archivos ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">FileDropzone</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          El <code>input type="file"</code> sigue ahí, oculto pero enfocable: se
          abre con <Kbd>Intro</Kbd> y la lista se mantiene sincronizada con él,
          así que <code>name</code> envía lo que de verdad se ve.
        </p>
        <div className="max-w-xl space-y-2">
          <FileDropzone
            label="Adjuntos"
            accept="image/*,.pdf"
            multiple
            maxFiles={4}
            maxSize={2 * 1024 * 1024}
            value={archivos}
            onChange={setArchivos}
            onReject={setRechazados}
            helperText="Arrastra desde el escritorio o pulsa para elegir."
          />
          {rechazados.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {rechazados.map(r => (
                <Badge key={r.file.name} variant="danger">
                  {r.file.name} · {r.reason === 'size' ? 'demasiado grande' : r.reason === 'type' ? 'tipo no admitido' : 'sobran archivos'}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
