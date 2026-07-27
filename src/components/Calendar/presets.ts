import { addDays, addMonths, endOfMonth, startOfDay, startOfMonth } from './dateUtils';
import type { CalendarPreset } from './types';

/**
 * Atajos de rango listos para usar con `<Calendar mode="range" presets={…} />`.
 * Se evalúan al pulsarlos, así que «hoy» siempre es el día actual.
 *
 * ```tsx
 * <Calendar mode="range" presets={rangePresets()} />
 * <Calendar mode="range" presets={rangePresets(['last7', 'thisMonth'])} />
 * ```
 */
export function rangePresets(
  keys: PresetKey[] = ['today', 'last7', 'last30', 'thisMonth', 'lastMonth'],
  labels: Partial<Record<PresetKey, string>> = {},
): CalendarPreset[] {
  return keys.map(k => ({
    label: labels[k] ?? DEFAULT_PRESET_LABELS[k],
    range: PRESET_RANGES[k],
  }));
}

export type PresetKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'next7' | 'next30';

const DEFAULT_PRESET_LABELS: Record<PresetKey, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  last7: 'Últimos 7 días',
  last30: 'Últimos 30 días',
  thisMonth: 'Este mes',
  lastMonth: 'Mes pasado',
  next7: 'Próximos 7 días',
  next30: 'Próximos 30 días',
};

const PRESET_RANGES: Record<PresetKey, () => { start: Date; end: Date }> = {
  today: () => { const t = startOfDay(new Date()); return { start: t, end: t }; },
  yesterday: () => { const y = addDays(startOfDay(new Date()), -1); return { start: y, end: y }; },
  last7: () => { const t = startOfDay(new Date()); return { start: addDays(t, -6), end: t }; },
  last30: () => { const t = startOfDay(new Date()); return { start: addDays(t, -29), end: t }; },
  thisMonth: () => { const t = new Date(); return { start: startOfMonth(t), end: endOfMonth(t) }; },
  lastMonth: () => { const p = addMonths(new Date(), -1); return { start: startOfMonth(p), end: endOfMonth(p) }; },
  next7: () => { const t = startOfDay(new Date()); return { start: t, end: addDays(t, 6) }; },
  next30: () => { const t = startOfDay(new Date()); return { start: t, end: addDays(t, 29) }; },
};
