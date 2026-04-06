import type { DomainConfig } from '../types';

export const restaurantConfig: DomainConfig = {
  id: 'restaurant',
  name: 'Restaurante',
  elementTypes: [
    // ── Mesas ──────────────────────────────────────────────────────────────
    { id: 'TABLE_ROUND_2',   label: 'Mesa 2 pers.',      shape: 'circle', defaultWidth: 60,  defaultHeight: 60,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_ROUND_4',   label: 'Mesa 4 pers.',      shape: 'circle', defaultWidth: 90,  defaultHeight: 90,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_ROUND_6',   label: 'Mesa 6 pers.',      shape: 'circle', defaultWidth: 110, defaultHeight: 110, color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_RECT_2',    label: 'Mesa rect. 2p.',    shape: 'rect',   defaultWidth: 80,  defaultHeight: 60,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_RECT_4',    label: 'Mesa rect. 4p.',    shape: 'rect',   defaultWidth: 110, defaultHeight: 70,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_RECT_6',    label: 'Mesa rect. 6p.',    shape: 'rect',   defaultWidth: 150, defaultHeight: 75,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_LONG',      label: 'Mesa banquete',     shape: 'rect',   defaultWidth: 240, defaultHeight: 75,  color: '#fef3c7', strokeColor: '#d97706' },
    { id: 'TABLE_HIGH',      label: 'Mesa alta/coctel',  shape: 'circle', defaultWidth: 45,  defaultHeight: 45,  color: '#fde68a', strokeColor: '#b45309' },
    // ── Asientos ───────────────────────────────────────────────────────────
    { id: 'CHAIR',           label: 'Silla',             shape: 'circle', defaultWidth: 28,  defaultHeight: 28,  color: '#e0e7ff', strokeColor: '#6366f1' },
    { id: 'CHAIR_HIGH',      label: 'Silla alta',        shape: 'circle', defaultWidth: 24,  defaultHeight: 24,  color: '#c7d2fe', strokeColor: '#4338ca' },
    { id: 'BENCH',           label: 'Banco',             shape: 'rect',   defaultWidth: 110, defaultHeight: 32,  color: '#ddd6fe', strokeColor: '#7c3aed' },
    { id: 'SOFA',            label: 'Sofá',              shape: 'rect',   defaultWidth: 150, defaultHeight: 58,  color: '#ede9fe', strokeColor: '#7c3aed' },
    { id: 'LOVESEAT',        label: 'Sillón 2p.',        shape: 'rect',   defaultWidth: 90,  defaultHeight: 55,  color: '#f5f3ff', strokeColor: '#8b5cf6' },
    { id: 'ARMCHAIR',        label: 'Butaca',            shape: 'circle', defaultWidth: 45,  defaultHeight: 45,  color: '#f3f4f6', strokeColor: '#6b7280' },
    // ── Servicio ───────────────────────────────────────────────────────────
    { id: 'BAR',             label: 'Barra principal',   shape: 'rect',   defaultWidth: 240, defaultHeight: 55,  color: '#fce7f3', strokeColor: '#db2777' },
    { id: 'BAR_CORNER',      label: 'Esquina barra',     shape: 'rect',   defaultWidth: 70,  defaultHeight: 55,  color: '#fce7f3', strokeColor: '#db2777' },
    { id: 'BAR_STOOL',       label: 'Taburete',          shape: 'circle', defaultWidth: 26,  defaultHeight: 26,  color: '#fbcfe8', strokeColor: '#db2777' },
    { id: 'COUNTER',         label: 'Mostrador',         shape: 'rect',   defaultWidth: 160, defaultHeight: 50,  color: '#fed7aa', strokeColor: '#ea580c' },
    { id: 'SERVING_STATION', label: 'Estación servicio', shape: 'rect',   defaultWidth: 80,  defaultHeight: 50,  color: '#fff7ed', strokeColor: '#fb923c' },
    { id: 'BUFFET',          label: 'Buffet',            shape: 'rect',   defaultWidth: 200, defaultHeight: 55,  color: '#fef9c3', strokeColor: '#ca8a04' },
    { id: 'CASH_REGISTER',   label: 'Caja',              shape: 'rect',   defaultWidth: 55,  defaultHeight: 45,  color: '#dcfce7', strokeColor: '#16a34a' },
    { id: 'PODIUM',          label: 'Podio/hostess',     shape: 'rect',   defaultWidth: 50,  defaultHeight: 40,  color: '#ecfdf5', strokeColor: '#059669' },
    // ── Escenario y decor ──────────────────────────────────────────────────
    { id: 'STAGE',           label: 'Escenario',         shape: 'rect',   defaultWidth: 220, defaultHeight: 110, color: '#e7e5e4', strokeColor: '#57534e' },
    { id: 'DANCE_FLOOR',     label: 'Pista de baile',    shape: 'rect',   defaultWidth: 180, defaultHeight: 180, color: '#fdf4ff', strokeColor: '#c026d3' },
    { id: 'DJ_BOOTH',        label: 'Cabina DJ',         shape: 'rect',   defaultWidth: 90,  defaultHeight: 60,  color: '#f0abfc', strokeColor: '#a21caf' },
    { id: 'PIANO',           label: 'Piano',             shape: 'rect',   defaultWidth: 100, defaultHeight: 70,  color: '#f1f5f9', strokeColor: '#475569' },
    { id: 'PLANT',           label: 'Planta/árbol',      shape: 'circle', defaultWidth: 35,  defaultHeight: 35,  color: '#dcfce7', strokeColor: '#16a34a' },
    { id: 'DISPLAY',         label: 'Exhibidor',         shape: 'rect',   defaultWidth: 60,  defaultHeight: 30,  color: '#f8fafc', strokeColor: '#94a3b8' },
    // ── Infraestructura ────────────────────────────────────────────────────
    { id: 'KITCHEN',         label: 'Cocina',            shape: 'rect',   defaultWidth: 160, defaultHeight: 80,  color: '#fee2e2', strokeColor: '#dc2626' },
    { id: 'BATHROOM',        label: 'Baño',              shape: 'rect',   defaultWidth: 65,  defaultHeight: 55,  color: '#e0f2fe', strokeColor: '#0284c7' },
    { id: 'BATHROOM_M',      label: 'Baño hombres',      shape: 'rect',   defaultWidth: 65,  defaultHeight: 55,  color: '#dbeafe', strokeColor: '#2563eb' },
    { id: 'BATHROOM_F',      label: 'Baño mujeres',      shape: 'rect',   defaultWidth: 65,  defaultHeight: 55,  color: '#fce7f3', strokeColor: '#db2777' },
    { id: 'COAT_ROOM',       label: 'Guardarropa',       shape: 'rect',   defaultWidth: 110, defaultHeight: 50,  color: '#f0f9ff', strokeColor: '#0369a1' },
    { id: 'WAITING',         label: 'Zona espera',       shape: 'rect',   defaultWidth: 130, defaultHeight: 80,  color: '#f0fdf4', strokeColor: '#86efac' },
    { id: 'STORAGE',         label: 'Almacén',           shape: 'rect',   defaultWidth: 80,  defaultHeight: 60,  color: '#f4f4f5', strokeColor: '#71717a' },
    { id: 'PILLAR',          label: 'Columna',           shape: 'circle', defaultWidth: 25,  defaultHeight: 25,  color: '#e5e7eb', strokeColor: '#6b7280' },
    { id: 'ENTRANCE',        label: 'Entrada',           shape: 'arrow',  defaultWidth: 80,  defaultHeight: 30,  color: '#dcfce7', strokeColor: '#16a34a' },
    { id: 'EMERGENCY_EXIT',  label: 'Salida emergencia', shape: 'arrow',  defaultWidth: 80,  defaultHeight: 30,  color: '#fee2e2', strokeColor: '#dc2626' },
  ],
};
