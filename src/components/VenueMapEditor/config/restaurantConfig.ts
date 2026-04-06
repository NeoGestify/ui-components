import type { DomainConfig } from '../types';

export const restaurantConfig: DomainConfig = {
  id: 'restaurant',
  name: 'Restaurante',
  elementTypes: [
    { id: 'TABLE_ROUND',  label: 'Mesa redonda',     shape: 'circle', defaultWidth: 80,  defaultHeight: 80,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_RECT',   label: 'Mesa rectangular', shape: 'rect',   defaultWidth: 120, defaultHeight: 80,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_LONG',   label: 'Mesa larga',       shape: 'rect',   defaultWidth: 200, defaultHeight: 70,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'CHAIR',        label: 'Silla',            shape: 'circle', defaultWidth: 28,  defaultHeight: 28,  color: '#e0e7ff', strokeColor: '#6366f1' },
    { id: 'BAR',          label: 'Barra',            shape: 'rect',   defaultWidth: 220, defaultHeight: 55,  color: '#fce7f3', strokeColor: '#db2777' },
    { id: 'ENTRANCE',     label: 'Entrada',          shape: 'arrow',  defaultWidth: 80,  defaultHeight: 30,  color: '#dcfce7', strokeColor: '#16a34a' },
    { id: 'KITCHEN',      label: 'Acceso cocina',    shape: 'rect',   defaultWidth: 80,  defaultHeight: 40,  color: '#fee2e2', strokeColor: '#dc2626' },
    { id: 'BATHROOM',     label: 'Baño',             shape: 'rect',   defaultWidth: 60,  defaultHeight: 50,  color: '#e0f2fe', strokeColor: '#0284c7' },
    { id: 'WAITING',      label: 'Zona espera',      shape: 'rect',   defaultWidth: 120, defaultHeight: 80,  color: '#f0fdf4', strokeColor: '#86efac' },
    { id: 'PILLAR',       label: 'Columna',          shape: 'rect',   defaultWidth: 25,  defaultHeight: 25,  color: '#e5e7eb', strokeColor: '#6b7280' },
  ],
};
