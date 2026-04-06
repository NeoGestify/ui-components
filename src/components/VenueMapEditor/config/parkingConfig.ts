import type { DomainConfig } from '../types';

export const parkingConfig: DomainConfig = {
  id: 'parking',
  name: 'Parqueadero',
  elementTypes: [
    { id: 'SPOT',        label: 'Espacio normal',  shape: 'rect',   defaultWidth: 60,  defaultHeight: 120, color: '#dbeafe', strokeColor: '#3b82f6' },
    { id: 'SPOT_MOTO',   label: 'Moto',            shape: 'rect',   defaultWidth: 40,  defaultHeight: 80,  color: '#fef9c3', strokeColor: '#eab308' },
    { id: 'SPOT_DISCAP', label: 'Discapacitado',   shape: 'rect',   defaultWidth: 80,  defaultHeight: 120, color: '#dcfce7', strokeColor: '#22c55e' },
    { id: 'SPOT_VIP',    label: 'VIP',             shape: 'rect',   defaultWidth: 70,  defaultHeight: 120, color: '#fae8ff', strokeColor: '#a855f7' },
    { id: 'ENTRANCE',    label: 'Entrada',         shape: 'arrow',  defaultWidth: 80,  defaultHeight: 30,  color: '#dcfce7', strokeColor: '#16a34a' },
    { id: 'EXIT',        label: 'Salida',          shape: 'arrow',  defaultWidth: 80,  defaultHeight: 30,  color: '#fee2e2', strokeColor: '#dc2626' },
    { id: 'LANE',        label: 'Carril',          shape: 'rect',   defaultWidth: 300, defaultHeight: 60,  color: '#f3f4f6', strokeColor: '#9ca3af' },
    { id: 'BOOTH',       label: 'Garita',          shape: 'rect',   defaultWidth: 50,  defaultHeight: 50,  color: '#fed7aa', strokeColor: '#ea580c' },
    { id: 'PILLAR',      label: 'Columna',         shape: 'rect',   defaultWidth: 25,  defaultHeight: 25,  color: '#e5e7eb', strokeColor: '#6b7280' },
  ],
};
