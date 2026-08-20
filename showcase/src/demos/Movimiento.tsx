import { useState } from 'react';
import {
  Button, Drawer, Modal, SegmentedControl, Switch, Input, Divider, Badge,
  applyMotion, motionDuration, motionBlur,
} from 'neogestify-ui-components';

const DURACIONES = [
  { value: '0', label: 'Sin animación' },
  { value: '120', label: 'Rápido' },
  { value: '200', label: 'Normal' },
  { value: '600', label: 'Lento' },
];

const DESENFOQUES = [
  { value: '0', label: 'Ninguno' },
  { value: '4', label: 'Suave' },
  { value: '8', label: 'Normal' },
  { value: '20', label: 'Fuerte' },
];

export function Movimiento() {
  const [duracion, setDuracion] = useState('200');
  const [desenfoque, setDesenfoque] = useState('8');
  const [cajon, setCajon] = useState(false);
  const [modal, setModal] = useState(false);
  const [efectivo, setEfectivo] = useState<{ ms: number; px: number } | null>(null);
  const [conZIndex, setConZIndex] = useState(false);
  const [zModal, setZModal] = useState('40');
  const [zBanda, setZBanda] = useState('50');
  const [enTopLayer, setEnTopLayer] = useState(false);

  /** Escribe las variables en `<html>`: afecta a toda la página. */
  const aplicarGlobal = () => {
    applyMotion({ duration: Number(duracion), blur: Number(desenfoque) });
    setEfectivo({ ms: motionDuration(), px: motionBlur() });
  };

  const restaurar = () => {
    applyMotion(true);
    setEfectivo({ ms: motionDuration(), px: motionBlur() });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Todo el movimiento sale de tres variables CSS, así que se configura igual
        que los colores: globalmente o por componente, sin tocar la configuración
        de Tailwind.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            Duración <code className="text-xs">--nui-duration</code>
          </p>
          <SegmentedControl
            aria-label="Duración"
            size="sm"
            options={DURACIONES}
            value={duracion}
            onChange={setDuracion}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            Desenfoque del fondo <code className="text-xs">--nui-blur</code>
          </p>
          <SegmentedControl
            aria-label="Desenfoque"
            size="sm"
            options={DESENFOQUES}
            value={desenfoque}
            onChange={setDesenfoque}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setCajon(true)}>Abrir cajón</Button>
        <Button variant="secondary" onClick={() => setModal(true)}>Abrir modal</Button>
        <Divider orientation="vertical" />
        <Button variant="outline" onClick={aplicarGlobal}>
          Aplicar a toda la página
        </Button>
        <Button variant="ghost" onClick={restaurar}>Restaurar</Button>
        {efectivo && (
          <Badge variant="info">
            Ahora: {efectivo.ms} ms · {efectivo.px} px
          </Badge>
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Los dos botones de arriba usan las props del componente
        (<code>animate</code> y <code>blur</code>), que solo afectan a ese
        elemento. «Aplicar a toda la página» llama a <code>applyMotion()</code> y
        escribe las variables en <code>&lt;html&gt;</code>.
      </p>

      {cajon && (
        <Drawer
          title="Cajón configurado"
          onClose={() => setCajon(false)}
          // Las props ganan sobre lo global y solo valen para este componente.
          animate={Number(duracion) === 0 ? false : Number(duracion)}
          blur={Number(desenfoque) === 0 ? false : Number(desenfoque)}
          footer={<Button onClick={() => setCajon(false)}>Cerrar</Button>}
        >
          <div className="space-y-4">
            <Input label="Un campo cualquiera" placeholder="…" />
            <Switch label="Un interruptor" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <code>animate={'{'}{duracion === '0' ? 'false' : duracion}{'}'}</code>{' '}
              <code>blur={'{'}{desenfoque === '0' ? 'false' : desenfoque}{'}'}</code>
            </p>
          </div>
        </Drawer>
      )}

      {/* ── zIndex: algo propio por encima del modal ─────────────────── */}
      <Divider label="zIndex" />
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Un <code>&lt;dialog&gt;</code> con <code>showModal()</code> vive en la
          <em> top layer</em>, por encima de todo el documento y al margen de
          cualquier <code>z-index</code>. Pasando <code>zIndex</code> el modal se
          sale de esa capa y vuelve a obedecer al apilamiento normal — la
          modalidad se conserva marcando <code>inert</code> el resto de la página.
        </p>

        <div className="grid max-w-xl gap-4 sm:grid-cols-2">
          <Input
            type="number"
            label="z-index del modal"
            value={zModal}
            onChange={e => setZModal(e.target.value)}
            helperText="La prop zIndex del componente"
          />
          <Input
            type="number"
            label="z-index de la banda verde"
            value={zBanda}
            onChange={e => setZBanda(e.target.value)}
            helperText="Un div corriente, ajeno a la librería"
          />
        </div>

        <Switch
          label="Modal en la top layer"
          description="Con esto activado el z-index deja de importar: la top layer gana siempre"
          checked={enTopLayer}
          onChange={setEnTopLayer}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setConZIndex(true)}>
            Abrir modal
          </Button>
          <Badge variant={enTopLayer ? 'warning' : Number(zBanda) > Number(zModal) ? 'success' : 'danger'}>
            {enTopLayer
              ? 'En la top layer: la banda quedará debajo'
              : Number(zBanda) > Number(zModal)
                ? `La banda gana (${zBanda} > ${zModal})`
                : `El modal gana (${zModal} ≥ ${zBanda})`}
          </Badge>
        </div>
      </div>

      {conZIndex && (
        <>
          <Modal
            title={enTopLayer ? 'Modal en la top layer' : `Modal a z-${zModal}`}
            zIndex={Number(zModal)}
            topLayer={enTopLayer}
            onClose={() => setConZIndex(false)}
            footer={<Button onClick={() => setConZIndex(false)}>Cerrar</Button>}
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Modal a <code>z-index: {zModal}</code>, banda a{' '}
              <code>z-index: {zBanda}</code>.
              {enTopLayer
                ? ' Pero está en la top layer, así que ningún z-index de la página puede ponerse por encima.'
                : Number(zBanda) > Number(zModal)
                  ? ' La banda debería verse nítida sobre el velo.'
                  : ' La banda debería quedar debajo, atenuada y desenfocada.'}
            </p>
          </Modal>

          {/* Deliberadamente un elemento cualquiera, no un componente nuestro. */}
          <div
            style={{ zIndex: Number(zBanda) }}
            className="fixed inset-x-0 bottom-0 bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white"
          >
            Banda ajena a la librería · z-index {zBanda}
            <button className="ml-3 underline" onClick={() => setConZIndex(false)}>cerrar</button>
          </div>
        </>
      )}

      {modal && (
        <Modal
          title="Modal configurado"
          onClose={() => setModal(false)}
          closeOnBackdrop
          closeOnEsc
          animate={Number(duracion) === 0 ? false : Number(duracion)}
          blur={Number(desenfoque) === 0 ? false : Number(desenfoque)}
          footer={<Button onClick={() => setModal(false)}>Cerrar</Button>}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Fíjate en el fondo: el desenfoque entra fundiéndose junto con el
            tinte, no de golpe.
          </p>
        </Modal>
      )}
    </div>
  );
}
