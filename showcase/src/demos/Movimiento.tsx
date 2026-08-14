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
