import type { DomainConfig } from '../types';

export const parkingConfig: DomainConfig = {
  id: 'parking',
  name: 'Parqueadero',
  elementTypes: [
    // ── Espacios de estacionamiento ────────────────────────────────────────
    { id: 'SPOT',           label: 'Espacio normal',     shape: 'rect',   defaultWidth: 60,  defaultHeight: 120, color: '#dbeafe', strokeColor: '#3b82f6' },
    { id: 'SPOT_COMPACT',   label: 'Compacto',           shape: 'rect',   defaultWidth: 50,  defaultHeight: 100, color: '#bfdbfe', strokeColor: '#2563eb' },
    { id: 'SPOT_LARGE',     label: 'SUV / camioneta',    shape: 'rect',   defaultWidth: 70,  defaultHeight: 140, color: '#eff6ff', strokeColor: '#1d4ed8' },
    { id: 'SPOT_MOTO',      label: 'Moto',               shape: 'rect',   defaultWidth: 35,  defaultHeight: 75,  color: '#fef9c3', strokeColor: '#eab308' },
    { id: 'SPOT_DISCAP',    label: 'Discapacitados',     shape: 'rect',   defaultWidth: 80,  defaultHeight: 125, color: '#dcfce7', strokeColor: '#22c55e' },
    { id: 'SPOT_VIP',       label: 'VIP / reservado',    shape: 'rect',   defaultWidth: 65,  defaultHeight: 120, color: '#fae8ff', strokeColor: '#a855f7' },
    { id: 'SPOT_EV',        label: 'Carga eléctrica',    shape: 'rect',   defaultWidth: 65,  defaultHeight: 120, color: '#d1fae5', strokeColor: '#059669' },
    { id: 'SPOT_LOADING',   label: 'Carga / descarga',   shape: 'rect',   defaultWidth: 80,  defaultHeight: 160, color: '#ffedd5', strokeColor: '#f97316' },
    { id: 'SPOT_VISITOR',   label: 'Visitantes',         shape: 'rect',   defaultWidth: 60,  defaultHeight: 120, color: '#f0fdf4', strokeColor: '#4ade80' },
    // ── Circulación ────────────────────────────────────────────────────────
    { id: 'ENTRANCE',       label: 'Entrada',            shape: 'arrow',  defaultWidth: 85,  defaultHeight: 35,  color: '#dcfce7', strokeColor: '#16a34a' },
    { id: 'EXIT',           label: 'Salida',             shape: 'arrow',  defaultWidth: 85,  defaultHeight: 35,  color: '#fee2e2', strokeColor: '#dc2626' },
    { id: 'ENTRANCE_EXIT',  label: 'Entrada / Salida',   shape: 'arrow',  defaultWidth: 85,  defaultHeight: 35,  color: '#fef9c3', strokeColor: '#ca8a04' },
    { id: 'LANE',           label: 'Carril / pasillo',   shape: 'rect',   defaultWidth: 300, defaultHeight: 60,  color: '#f3f4f6', strokeColor: '#9ca3af' },
    { id: 'LANE_ONEWAY',    label: 'Carril un sentido',  shape: 'rect',   defaultWidth: 300, defaultHeight: 50,  color: '#fef9c3', strokeColor: '#d97706' },
    { id: 'PEDESTRIAN',     label: 'Paso peatonal',      shape: 'rect',   defaultWidth: 130, defaultHeight: 30,  color: '#fef3c7', strokeColor: '#f59e0b' },
    { id: 'SPEED_BUMP',     label: 'Reductor velocidad', shape: 'rect',   defaultWidth: 100, defaultHeight: 18,  color: '#fde68a', strokeColor: '#d97706' },
    { id: 'RAMP_UP',        label: 'Rampa subida',       shape: 'arrow',  defaultWidth: 120, defaultHeight: 50,  color: '#e0f2fe', strokeColor: '#0284c7' },
    { id: 'RAMP_DOWN',      label: 'Rampa bajada',       shape: 'arrow',  defaultWidth: 120, defaultHeight: 50,  color: '#f0f9ff', strokeColor: '#0369a1' },
    // ── Infraestructura ────────────────────────────────────────────────────
    { id: 'BOOTH',          label: 'Garita',             shape: 'rect',   defaultWidth: 50,  defaultHeight: 50,  color: '#fed7aa', strokeColor: '#ea580c' },
    { id: 'PAY_STATION',    label: 'Estación de pago',   shape: 'rect',   defaultWidth: 35,  defaultHeight: 45,  color: '#fce7f3', strokeColor: '#db2777' },
    { id: 'EV_CHARGER',     label: 'Cargador EV',        shape: 'rect',   defaultWidth: 30,  defaultHeight: 45,  color: '#ecfdf5', strokeColor: '#059669' },
    { id: 'FIRE_HYDRANT',   label: 'Hidrante',           shape: 'circle', defaultWidth: 22,  defaultHeight: 22,  color: '#fee2e2', strokeColor: '#dc2626' },
    { id: 'PILLAR',         label: 'Columna',            shape: 'circle', defaultWidth: 25,  defaultHeight: 25,  color: '#e5e7eb', strokeColor: '#6b7280' },
    { id: 'WALL_CURB',      label: 'Bordillo / isleta',  shape: 'rect',   defaultWidth: 160, defaultHeight: 25,  color: '#f1f5f9', strokeColor: '#94a3b8' },
    { id: 'TREE',           label: 'Árbol / jardín',     shape: 'circle', defaultWidth: 40,  defaultHeight: 40,  color: '#dcfce7', strokeColor: '#16a34a' },
    { id: 'CAMERA',         label: 'Cámara seguridad',   shape: 'circle', defaultWidth: 20,  defaultHeight: 20,  color: '#e2e8f0', strokeColor: '#475569' },
    { id: 'SIGN',           label: 'Señal de tráfico',   shape: 'circle', defaultWidth: 22,  defaultHeight: 22,  color: '#fef9c3', strokeColor: '#ca8a04' },
  ],
};
