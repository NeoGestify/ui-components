import type { ReactNode } from 'react';
import type { DateRange, WeekDay } from './dateUtils';

export type { DateRange, WeekDay };

/** Cualquier cosa que el calendario sepa convertir a fecha. */
export type DateInput = Date | string | number | null | undefined;

export type CalendarMode = 'single' | 'range' | 'multiple';

/** Valor que emite/recibe el calendario según el modo. */
export type CalendarValue<M extends CalendarMode = 'single'> =
  M extends 'range' ? DateRange :
  M extends 'multiple' ? Date[] :
  Date | null;

export type CalendarSize = 'sm' | 'md' | 'lg';

/** Atajo de rango (p. ej. «Últimos 7 días»). Solo se muestra en modo `range`. */
export interface CalendarPreset {
  label: string;
  /** Se evalúa al pulsar, para que «hoy» sea siempre el día actual. */
  range: () => { start: DateInput; end: DateInput };
}

/** Textos de la interfaz — cámbialos para traducir el componente. */
export interface CalendarLabels {
  today: string;
  clear: string;
  apply: string;
  cancel: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  selectMonth: string;
  selectYear: string;
  startDate: string;
  endDate: string;
  selectDate: string;
  selectRange: string;
}

export const DEFAULT_LABELS: CalendarLabels = {
  today: 'Hoy',
  clear: 'Limpiar',
  apply: 'Aplicar',
  cancel: 'Cancelar',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  previousYear: 'Año anterior',
  nextYear: 'Año siguiente',
  selectMonth: 'Elegir mes',
  selectYear: 'Elegir año',
  startDate: 'Fecha de inicio',
  endDate: 'Fecha de fin',
  selectDate: 'Seleccionar fecha',
  selectRange: 'Seleccionar rango',
};

/** Estado de un día concreto, para `renderDay`. */
export interface DayState {
  date: Date;
  today: boolean;
  selected: boolean;
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  disabled: boolean;
  outside: boolean;
}

export interface CalendarProps<M extends CalendarMode = 'single'> {
  /** `single` (por defecto), `range` o `multiple`. */
  mode?: M;
  /** Valor controlado. Si se pasa, el componente no guarda estado propio. */
  value?: CalendarValue<M>;
  /** Valor inicial en modo no controlado. */
  defaultValue?: CalendarValue<M>;
  onChange?: (value: CalendarValue<M>) => void;
  /** Se llama al cerrar un rango completo o al elegir fecha en modo `single`. */
  onComplete?: (value: CalendarValue<M>) => void;

  /** Mes visible (controlado). */
  month?: DateInput;
  /** Mes visible inicial. Por defecto, el del valor o el mes actual. */
  defaultMonth?: DateInput;
  onMonthChange?: (month: Date) => void;

  minDate?: DateInput;
  maxDate?: DateInput;
  /** Días deshabilitados: lista de fechas o predicado. */
  disabledDates?: DateInput[] | ((date: Date) => boolean);
  /** Días de la semana siempre deshabilitados (0 = domingo). */
  disabledDaysOfWeek?: WeekDay[];
  /** Longitud mínima/máxima del rango, en días (extremos incluidos). */
  minRangeDays?: number;
  maxRangeDays?: number;
  /** Tope de fechas en modo `multiple`. */
  maxSelections?: number;

  /** Meses visibles a la vez. Por defecto 2 en modo `range`, 1 en el resto. */
  numberOfMonths?: number;
  /**
   * Reduce a un solo mes cuando el contenedor es estrecho (< 640 px).
   * Activado por defecto: es lo que hace usable el calendario en móvil.
   */
  responsive?: boolean;

  locale?: string;
  /** 0 = domingo. Por defecto, el del `locale`. */
  weekStartsOn?: WeekDay;
  size?: CalendarSize;

  /** Muestra los días del mes anterior/siguiente que rellenan la cuadrícula. */
  showOutsideDays?: boolean;
  /** Barra inferior con «Hoy» y «Limpiar». */
  showFooter?: boolean;
  /** Resumen del valor elegido sobre la cuadrícula. */
  showValueSummary?: boolean;
  /** Atajos de rango. Solo en modo `range`. */
  presets?: CalendarPreset[];
  /** Permite navegar entre meses deslizando el dedo. Activado por defecto. */
  swipeNavigation?: boolean;

  disabled?: boolean;
  /** Se puede navegar, pero no cambiar la selección. */
  readOnly?: boolean;
  autoFocus?: boolean;

  labels?: Partial<CalendarLabels>;
  className?: string;
  /** Contenido extra dentro de la celda (puntos, precios, aforo…). */
  renderDay?: (state: DayState) => ReactNode;
  onDayClick?: (date: Date) => void;
  id?: string;
  'aria-label'?: string;
}
