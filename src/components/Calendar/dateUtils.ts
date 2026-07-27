/**
 * Utilidades de fecha en hora LOCAL, sin dependencias externas.
 *
 * Todas las fechas que maneja el calendario están normalizadas a medianoche
 * local (`startOfDay`): así dos fechas del mismo día siempre son comparables
 * con `getTime()` y nunca aparecen desfases por la hora del día.
 */

/** Rango de fechas. `end` es `null` mientras el usuario sigue seleccionando. */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** 0 = domingo … 6 = sábado. */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const MS_DAY = 86400000;

export function startOfDay(d: Date): Date {
  const c = new Date(d.getTime());
  c.setHours(0, 0, 0, 0);
  return c;
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d.getTime());
  c.setDate(c.getDate() + n);
  return c;
}

/** Suma meses conservando el día cuando existe (31 ene + 1 mes → 28/29 feb). */
export function addMonths(d: Date, n: number): Date {
  const c = new Date(d.getTime());
  const day = c.getDate();
  c.setDate(1);
  c.setMonth(c.getMonth() + n);
  c.setDate(Math.min(day, daysInMonth(c.getFullYear(), c.getMonth())));
  return c;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/** Comparación a nivel de día (ignora la hora). */
export function compareDay(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return compareDay(a, b) < 0;
}

export function isAfterDay(a: Date, b: Date): boolean {
  return compareDay(a, b) > 0;
}

/** Días completos entre dos fechas (a → b). Usa UTC para esquivar el horario de verano. */
export function diffDays(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / MS_DAY);
}

export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && isBeforeDay(d, min)) return startOfDay(min);
  if (max && isAfterDay(d, max)) return startOfDay(max);
  return d;
}

export function isWithin(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = startOfDay(d).getTime();
  return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime();
}

/** Ordena un rango para que `start <= end`. */
export function normalizeRange(range: DateRange): DateRange {
  const { start, end } = range;
  if (start && end && isAfterDay(start, end)) return { start: end, end: start };
  return range;
}

/**
 * Matriz de 6×7 días que cubre el mes de `date`, rellenando con días del mes
 * anterior y siguiente. Siempre 6 filas para que la altura no salte al cambiar
 * de mes (un mes puede necesitar 4, 5 o 6 semanas).
 */
export function getMonthMatrix(date: Date, weekStartsOn: WeekDay = 1): Date[][] {
  const first = startOfMonth(date);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -offset);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) row.push(addDays(gridStart, w * 7 + d));
    weeks.push(row);
  }
  return weeks;
}

// ─── Formato / parseo ───────────────────────────────────────────────────────

/** `YYYY-MM-DD` en hora local (no usar `toISOString`: convierte a UTC). */
export function toISODate(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Acepta `Date`, `YYYY-MM-DD` o timestamp. Devuelve `null` si no es válida. */
export function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : startOfDay(value);
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : startOfDay(d);
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : startOfDay(d);
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = locale + JSON.stringify(opts);
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, opts);
    fmtCache.set(key, f);
  }
  return f;
}

export function formatDate(d: Date, locale: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  return formatter(locale, opts).format(d);
}

/** "enero de 2026" → "Enero 2026" (con mayúscula inicial, sin la preposición). */
export function formatMonthYear(d: Date, locale: string): string {
  const s = formatter(locale, { month: 'long', year: 'numeric' }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function monthNames(locale: string): string[] {
  const f = formatter(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, m) => {
    const s = f.format(new Date(2021, m, 1));
    return s.charAt(0).toUpperCase() + s.slice(1);
  });
}

/** Cabeceras de los días de la semana, empezando en `weekStartsOn`. */
export function weekDayNames(locale: string, weekStartsOn: WeekDay = 1, width: 'short' | 'narrow' = 'short'): string[] {
  const f = formatter(locale, { weekday: width });
  // 2021-08-01 fue domingo → base fiable para recorrer la semana.
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2021, 7, 1 + ((weekStartsOn + i) % 7));
    const s = f.format(d).replace('.', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  });
}

/** Día de inicio de semana habitual del locale (lunes salvo en/US-like). */
export function localeWeekStart(locale: string): WeekDay {
  // `Intl.Locale.weekInfo` aún no está en todos los navegadores → fallback.
  try {
    const L = (Intl as unknown as { Locale?: new (l: string) => { weekInfo?: { firstDay?: number } } }).Locale;
    if (L) {
      const info = new L(locale).weekInfo;
      if (info?.firstDay) return (info.firstDay % 7) as WeekDay;
    }
  } catch {
    // navegador sin weekInfo
  }
  return /^(en-US|en-CA|es-MX|ja|he|pt-BR|ko)/i.test(locale) ? 0 : 1;
}
