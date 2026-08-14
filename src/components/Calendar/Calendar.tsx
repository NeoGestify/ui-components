import {
  useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  addDays, addMonths, compareDay, diffDays, formatDate, formatMonthYear, getMonthMatrix,
  isAfterDay, isBeforeDay, isSameDay, isSameMonth, isWithin, localeWeekStart, monthNames,
  normalizeRange, startOfDay, startOfMonth, toDate, weekDayNames,
  type DateRange, type WeekDay,
} from './dateUtils';
import {
  DEFAULT_LABELS, type CalendarMode, type CalendarProps, type CalendarSize,
  type CalendarValue, type DateInput, type DayState,
} from './types';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/icons';
import {
  bg, bgHover, border, focusRing, focusVisibleRing, text, textHover,
} from '../../theme/tokens';
import { motion } from '../../theme/motion';
import { cn } from '../../internal/cn';

// ─── Tamaños ────────────────────────────────────────────────────────────────

const SIZE: Record<CalendarSize, { cell: string; text: string; head: string; gap: string }> = {
  sm: { cell: 'h-8',  text: 'text-xs',  head: 'text-sm',  gap: 'p-2' },
  md: { cell: 'h-10', text: 'text-sm',  head: 'text-base', gap: 'p-3' },
  lg: { cell: 'h-12', text: 'text-base', head: 'text-lg',  gap: 'p-4' },
};

const NAV_BTN =
  `inline-flex items-center justify-center rounded-md p-1.5 ${text.subtle} ` +
  `${bgHover.surface} ${textHover.muted} ${focusRing} ` +
  `disabled:opacity-40 disabled:pointer-events-none ${motion.colors} touch-manipulation`;

const FOOT_BTN =
  `rounded-md px-2.5 py-1.5 text-sm font-medium ${text.accent} ` +
  `${bgHover.accentSoft} ${focusRing} disabled:opacity-40 disabled:pointer-events-none ` +
  `${motion.colors} touch-manipulation`;

/** Debajo de esto, `responsive` fuerza un solo mes visible. */
const NARROW_PX = 640;
/** Desplazamiento horizontal mínimo (px) para que un gesto cuente como swipe. */
const SWIPE_PX = 45;

/** Anillo tenue que marca el día de hoy. */
const ringAccentSoft =
  'ring-[color-mix(in_oklab,var(--nui-accent,oklch(51.1%_.262_276.966))_60%,transparent)] ' +
  'dark:ring-[color-mix(in_oklab,var(--nui-accent-dark,oklch(58.5%_.233_277.117))_70%,transparent)]';

type View = 'days' | 'months' | 'years';

/** `useLayoutEffect` avisa en SSR; en servidor no hay nada que medir. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Calendario accesible y pensado para el dedo: celdas grandes, navegación por
 * deslizamiento, selectores rápidos de mes/año y colapso automático a un mes
 * en pantallas estrechas.
 *
 * Soporta selección de día suelto, de varios días y de rangos.
 *
 * ```tsx
 * const [range, setRange] = useState<DateRange>({ start: null, end: null });
 * <Calendar mode="range" value={range} onChange={setRange} />
 * ```
 */
export function Calendar<M extends CalendarMode = 'single'>(props: CalendarProps<M>) {
  const {
    mode = 'single' as M,
    value,
    defaultValue,
    onChange,
    onComplete,
    month,
    defaultMonth,
    onMonthChange,
    minDate,
    maxDate,
    disabledDates,
    disabledDaysOfWeek,
    minRangeDays,
    maxRangeDays,
    maxSelections,
    numberOfMonths,
    responsive = true,
    locale = 'es-ES',
    weekStartsOn,
    size = 'md',
    showOutsideDays = true,
    showFooter = true,
    showValueSummary = false,
    presets,
    swipeNavigation = true,
    disabled = false,
    readOnly = false,
    autoFocus = false,
    labels: labelsProp,
    className = '',
    renderDay,
    onDayClick,
    id,
    'aria-label': ariaLabel,
  } = props;

  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelsProp }), [labelsProp]);
  const autoId = useId();
  const rootId = id || `cal-${autoId}`;
  const sz = SIZE[size];

  const min = useMemo(() => toDate(minDate), [minDate]);
  const max = useMemo(() => toDate(maxDate), [maxDate]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const firstDayOfWeek: WeekDay = weekStartsOn ?? localeWeekStart(locale);

  // ── Valor (controlado / no controlado) ────────────────────────────────────
  const emptyValue = useCallback((): CalendarValue<M> => (
    (mode === 'range' ? { start: null, end: null } : mode === 'multiple' ? [] : null) as CalendarValue<M>
  ), [mode]);

  const normalize = useCallback((v: unknown): CalendarValue<M> => {
    if (mode === 'range') {
      const r = (v ?? {}) as { start?: DateInput; end?: DateInput };
      return { start: toDate(r.start), end: toDate(r.end) } as CalendarValue<M>;
    }
    if (mode === 'multiple') {
      const list = Array.isArray(v) ? v : [];
      return list.map(toDate).filter(Boolean) as CalendarValue<M>;
    }
    return toDate(v as DateInput) as CalendarValue<M>;
  }, [mode]);

  const [innerValue, setInnerValue] = useState<CalendarValue<M>>(() =>
    defaultValue !== undefined ? normalize(defaultValue) : emptyValue());

  const selection = value !== undefined ? normalize(value) : innerValue;

  const range: DateRange = mode === 'range'
    ? (selection as DateRange)
    : { start: null, end: null };
  const multiple: Date[] = mode === 'multiple' ? (selection as Date[]) : [];
  const single: Date | null = mode === 'single' ? (selection as Date | null) : null;

  /** Primera fecha seleccionada: ancla para el mes inicial y el foco. */
  const anchor = useMemo(
    () => single ?? range.start ?? multiple[0] ?? null,
    [single?.getTime(), range.start?.getTime(), multiple[0]?.getTime()],
  );

  // ── Ancho del contenedor → meses visibles ─────────────────────────────────
  const rootRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(true);

  useIsomorphicLayoutEffect(() => {
    if (!responsive) return;
    const el = rootRef.current;
    if (!el) return;
    const measure = (w: number) => setNarrow(w > 0 && w < NARROW_PX);
    measure(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) measure(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [responsive]);

  const requestedMonths = Math.max(1, numberOfMonths ?? (mode === 'range' ? 2 : 1));
  const monthsToRender = responsive && narrow ? 1 : requestedMonths;

  // ── Mes visible ───────────────────────────────────────────────────────────
  const [innerMonth, setInnerMonth] = useState<Date>(() =>
    startOfMonth(toDate(defaultMonth) ?? anchor ?? today));
  const visibleMonth = month !== undefined ? startOfMonth(toDate(month) ?? today) : innerMonth;

  const goToMonth = useCallback((next: Date) => {
    const m = startOfMonth(next);
    if (month === undefined) setInnerMonth(m);
    onMonthChange?.(m);
  }, [month, onMonthChange]);

  // Si el valor cambia desde fuera a un mes que no se ve, seguirlo.
  const anchorTime = anchor?.getTime();
  useEffect(() => {
    if (anchorTime === undefined) return;
    const a = new Date(anchorTime);
    const last = addMonths(visibleMonth, monthsToRender - 1);
    if (isBeforeDay(a, visibleMonth) || isAfterDay(a, new Date(last.getFullYear(), last.getMonth() + 1, 0))) {
      goToMonth(a);
    }
  }, [anchorTime]);

  // ── Deshabilitado ─────────────────────────────────────────────────────────
  const disabledSet = useMemo(() => {
    if (!disabledDates || typeof disabledDates === 'function') return null;
    const s = new Set<number>();
    for (const d of disabledDates) {
      const p = toDate(d);
      if (p) s.add(p.getTime());
    }
    return s;
  }, [disabledDates]);

  /** Rango a medias: el usuario eligió el inicio y falta el fin. */
  const pendingStart = mode === 'range' && range.start && !range.end ? range.start : null;

  const isDisabled = useCallback((d: Date): boolean => {
    if (disabled) return true;
    if (min && isBeforeDay(d, min)) return true;
    if (max && isAfterDay(d, max)) return true;
    if (disabledDaysOfWeek?.includes(d.getDay() as WeekDay)) return true;
    if (disabledSet?.has(startOfDay(d).getTime())) return true;
    if (typeof disabledDates === 'function' && disabledDates(d)) return true;
    // Mientras se cierra un rango, los días que lo harían demasiado largo o
    // demasiado corto no se pueden pulsar.
    if (pendingStart) {
      const len = Math.abs(diffDays(pendingStart, d)) + 1;
      if (maxRangeDays && len > maxRangeDays) return true;
      if (minRangeDays && len < minRangeDays) return true;
    }
    return false;
  }, [disabled, min, max, disabledDaysOfWeek, disabledSet, disabledDates, pendingStart, maxRangeDays, minRangeDays]);

  // ── Selección ─────────────────────────────────────────────────────────────
  const commit = useCallback((next: CalendarValue<M>, complete: boolean) => {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
    if (complete) onComplete?.(next);
  }, [value, onChange, onComplete]);

  const [hovered, setHovered] = useState<Date | null>(null);

  const selectDay = useCallback((day: Date) => {
    onDayClick?.(day);
    if (readOnly || disabled || isDisabled(day)) return;
    const d = startOfDay(day);

    if (mode === 'range') {
      const r = range;
      if (!r.start || (r.start && r.end)) {
        commit({ start: d, end: null } as CalendarValue<M>, false);
        return;
      }
      // Segundo clic: si cae antes del inicio, se invierte en vez de reiniciar.
      const next = normalizeRange({ start: r.start, end: d });
      setHovered(null);
      commit(next as CalendarValue<M>, true);
      return;
    }

    if (mode === 'multiple') {
      const list = multiple;
      const exists = list.some(x => isSameDay(x, d));
      if (!exists && maxSelections && list.length >= maxSelections) return;
      const next = exists
        ? list.filter(x => !isSameDay(x, d))
        : [...list, d].sort((a, b) => compareDay(a, b));
      commit(next as CalendarValue<M>, true);
      return;
    }

    commit(d as CalendarValue<M>, true);
  }, [onDayClick, readOnly, disabled, isDisabled, mode, range, multiple, maxSelections, commit]);

  // ── Foco (roving tabindex + teclado) ──────────────────────────────────────
  const [focusDate, setFocusDate] = useState<Date>(() => anchor ?? today);
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (!shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]')?.focus();
  });

  const moveFocus = useCallback((next: Date) => {
    const d = startOfDay(next);
    if (min && isBeforeDay(d, min)) return;
    if (max && isAfterDay(d, max)) return;
    setFocusDate(d);
    shouldFocusRef.current = true;
    const last = addMonths(visibleMonth, monthsToRender - 1);
    if (isBeforeDay(d, visibleMonth)) goToMonth(d);
    else if (isAfterDay(d, new Date(last.getFullYear(), last.getMonth() + 1, 0))) {
      goToMonth(addMonths(d, -(monthsToRender - 1)));
    }
  }, [min, max, visibleMonth, monthsToRender, goToMonth]);

  const onGridKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    const k = e.key;
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (k in step) {
      e.preventDefault();
      moveFocus(addDays(focusDate, step[k]));
      return;
    }
    if (k === 'Home' || k === 'End') {
      e.preventDefault();
      const dow = (focusDate.getDay() - firstDayOfWeek + 7) % 7;
      moveFocus(addDays(focusDate, k === 'Home' ? -dow : 6 - dow));
      return;
    }
    if (k === 'PageUp' || k === 'PageDown') {
      e.preventDefault();
      const delta = k === 'PageUp' ? -1 : 1;
      moveFocus(addMonths(focusDate, e.shiftKey ? delta * 12 : delta));
      return;
    }
    if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      selectDay(focusDate);
      return;
    }
    if (k === 'Escape' && pendingStart) {
      e.preventDefault();
      commit({ start: null, end: null } as CalendarValue<M>, false);
    }
  }, [focusDate, firstDayOfWeek, moveFocus, selectDay, pendingStart, commit]);

  useEffect(() => {
    if (!autoFocus) return;
    shouldFocusRef.current = true;
    setFocusDate(f => f);
    gridRef.current?.querySelector<HTMLButtonElement>('[data-focused="true"]')?.focus();
  }, []);

  // ── Navegación ────────────────────────────────────────────────────────────
  const canGoPrev = !min || isAfterDay(addDays(visibleMonth, -1), addDays(min, -1));
  const lastVisible = addMonths(visibleMonth, monthsToRender - 1);
  const canGoNext = !max || isBeforeDay(new Date(lastVisible.getFullYear(), lastVisible.getMonth() + 1, 1), addDays(max, 1));

  const shift = useCallback((delta: number) => goToMonth(addMonths(visibleMonth, delta)), [goToMonth, visibleMonth]);

  // Swipe horizontal para cambiar de mes (sin robar el scroll vertical).
  const swipeRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const onSwipeDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeNavigation || e.pointerType === 'mouse') return;
    swipeRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }, [swipeNavigation]);
  const onSwipeUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0 && canGoNext) shift(1);
    else if (dx > 0 && canGoPrev) shift(-1);
  }, [canGoNext, canGoPrev, shift]);

  // ── Vistas mes / año ──────────────────────────────────────────────────────
  const [view, setView] = useState<View>('days');
  const [yearPage, setYearPage] = useState(() => visibleMonth.getFullYear());
  const months = useMemo(() => monthNames(locale), [locale]);
  const weekDays = useMemo(() => weekDayNames(locale, firstDayOfWeek), [locale, firstDayOfWeek]);

  const openMonthView = () => { setYearPage(visibleMonth.getFullYear()); setView(v => (v === 'days' ? 'months' : 'days')); };

  // ── Render de un mes ──────────────────────────────────────────────────────
  const renderMonth = (offset: number) => {
    const mDate = addMonths(visibleMonth, offset);
    const weeks = getMonthMatrix(mDate, firstDayOfWeek);
    const previewEnd = pendingStart && hovered ? hovered : null;
    const preview = previewEnd ? normalizeRange({ start: pendingStart, end: previewEnd }) : null;

    return (
      <div key={offset} className="min-w-0 flex-1" role="group" aria-label={formatMonthYear(mDate, locale)}>
        {monthsToRender > 1 && (
          <div className={`mb-1 text-center font-semibold ${text.base} ${sz.head}`}>
            {formatMonthYear(mDate, locale)}
          </div>
        )}
        <div className="grid grid-cols-7" role="row">
          {weekDays.map((w, i) => (
            <div key={i} role="columnheader" aria-label={w}
              className={`pb-1 text-center text-xs font-medium uppercase tracking-wide ${text.subtle}`}>
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map(day => {
            const outside = !isSameMonth(day, mDate);
            if (outside && !showOutsideDays) {
              return <div key={day.getTime()} className={sz.cell} aria-hidden="true" />;
            }

            const dayDisabled = isDisabled(day);
            const isStart = mode === 'range' && isSameDay(day, range.start);
            const isEnd = mode === 'range' && isSameDay(day, range.end);
            const inSel = mode === 'range'
              ? isWithin(day, range.start, range.end)
              : mode === 'multiple'
                ? multiple.some(d => isSameDay(d, day))
                : isSameDay(day, single);
            const inPreview = !!preview && isWithin(day, preview.start, preview.end);
            const inBand = (mode === 'range' && (isWithin(day, range.start, range.end) || inPreview));
            const selected = mode === 'range' ? (isStart || isEnd || (!!preview && (isSameDay(day, preview.start) || isSameDay(day, preview.end)))) : inSel;
            const isToday = isSameDay(day, today);
            const focused = isSameDay(day, focusDate);

            // Extremos de la banda: dan la forma de píldora al rango.
            const bandStart = inBand && (isSameDay(day, range.start) || (!!preview && isSameDay(day, preview.start)));
            const bandEnd = inBand && (isSameDay(day, range.end) || (!!preview && isSameDay(day, preview.end)));

            const bandCls = inBand && !(bandStart && bandEnd)
              ? `${bg.accentSoft} ${bandStart ? 'rounded-l-full' : ''} ${bandEnd ? 'rounded-r-full' : ''}`
              : '';

            const btnCls = cn(
              'flex h-full w-full items-center justify-center rounded-full font-medium leading-none',
              `${motion.colors} touch-manipulation select-none`,
              focusVisibleRing,
              'focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--nui-surface,#fff)] dark:focus-visible:ring-offset-[var(--nui-surface-dark,oklch(27.8%_.033_256.848))]',
              sz.text,
              selected
                ? `${bg.accent} ${text.onAccent} ${bgHover.accent} shadow-sm`
                : dayDisabled
                  ? 'cursor-not-allowed opacity-40'
                  : inBand
                    ? `${text.accent} ${bgHover.accentSoft}`
                    : outside
                      ? `${text.subtle} ${bgHover.surface}`
                      : `${text.muted} ${bgHover.surface}`,
              !selected && isToday ? `ring-1 ring-inset ${ringAccentSoft}` : '',
              readOnly && !dayDisabled ? 'cursor-default' : '',
            );

            const state: DayState = {
              date: day, today: isToday, selected, inRange: inBand,
              rangeStart: isStart, rangeEnd: isEnd, disabled: dayDisabled, outside,
            };

            return (
              <div key={day.getTime()} className={`${sz.cell} ${bandCls}`} role="gridcell" aria-selected={selected}>
                <button
                  type="button"
                  className={btnCls}
                  disabled={dayDisabled}
                  tabIndex={focused ? 0 : -1}
                  data-focused={focused || undefined}
                  data-today={isToday || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={formatDate(day, locale, { dateStyle: 'full' })}
                  onClick={() => { setFocusDate(day); selectDay(day); }}
                  onPointerEnter={() => pendingStart && !dayDisabled && setHovered(day)}
                  onFocus={() => pendingStart && setHovered(day)}
                >
                  {renderDay
                    ? renderDay(state)
                    : <span>{day.getDate()}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Resumen del valor ─────────────────────────────────────────────────────
  const summary = (() => {
    const fmt = (d: Date) => formatDate(d, locale, { day: '2-digit', month: 'short', year: 'numeric' });
    if (mode === 'range') {
      return `${range.start ? fmt(range.start) : labels.startDate} → ${range.end ? fmt(range.end) : labels.endDate}`;
    }
    if (mode === 'multiple') {
      return multiple.length ? multiple.map(fmt).join(' · ') : labels.selectDate;
    }
    return single ? fmt(single) : labels.selectDate;
  })();

  const gridStyle: CSSProperties | undefined = monthsToRender > 1
    ? { gridTemplateColumns: `repeat(${monthsToRender}, minmax(0, 1fr))` }
    : undefined;

  const applyPreset = (p: { start: DateInput; end: DateInput }) => {
    const next = normalizeRange({ start: toDate(p.start), end: toDate(p.end) });
    if (next.start) goToMonth(next.start);
    commit(next as CalendarValue<M>, true);
  };

  return (
    <div
      ref={rootRef}
      id={rootId}
      className={cn(
        'inline-block w-full max-w-full rounded-xl border',
        border.subtle, bg.surface, text.base,
        disabled ? 'opacity-60' : '',
        sz.gap,
        className,
      )}
      aria-label={ariaLabel ?? (mode === 'range' ? labels.selectRange : labels.selectDate)}
      aria-disabled={disabled || undefined}
    >
      {/* Cabecera */}
      <div className="mb-2 flex items-center justify-between gap-1">
        <button type="button" className={NAV_BTN} onClick={() => (view === 'years' ? setYearPage(y => y - 12) : shift(-1))}
          disabled={view === 'days' && !canGoPrev} aria-label={view === 'years' ? labels.previousYear : labels.previousMonth}>
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={openMonthView}
          className={`flex min-w-0 items-center gap-1 rounded-md px-2 py-1 font-semibold ${text.base}
            ${bgHover.surface} ${focusRing} ${motion.colors} touch-manipulation ${sz.head}`}
          aria-label={labels.selectMonth}
          aria-expanded={view !== 'days'}
        >
          <span className="truncate">
            {view === 'years'
              ? `${yearPage} – ${yearPage + 11}`
              : monthsToRender > 1
                ? `${formatMonthYear(visibleMonth, locale)} – ${formatMonthYear(lastVisible, locale)}`
                : formatMonthYear(visibleMonth, locale)}
          </span>
          <ChevronDownIcon className={`w-4 h-4 shrink-0 ${motion.transform} ${view !== 'days' ? 'rotate-180' : ''}`} />
        </button>

        <button type="button" className={NAV_BTN} onClick={() => (view === 'years' ? setYearPage(y => y + 12) : shift(1))}
          disabled={view === 'days' && !canGoNext} aria-label={view === 'years' ? labels.nextYear : labels.nextMonth}>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {showValueSummary && view === 'days' && (
        <div className={`mb-2 truncate text-center text-sm ${text.subtle}`} aria-live="polite">
          {summary}
        </div>
      )}

      {/* Atajos de rango */}
      {view === 'days' && mode === 'range' && presets && presets.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.range())}
              disabled={disabled || readOnly}
              className={`rounded-full border ${border.subtle} ${bg.surfaceMuted} px-3 py-1 text-xs font-medium ${text.subtle}
                ${bgHover.accentSoft} ${textHover.accent} ${focusRing} disabled:opacity-40
                ${motion.colors} touch-manipulation`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Cuerpo */}
      {view === 'days' && (
        <div
          ref={gridRef}
          role="grid"
          tabIndex={-1}
          onKeyDown={onGridKeyDown}
          onPointerDown={onSwipeDown}
          onPointerUp={onSwipeUp}
          onPointerLeave={() => { swipeRef.current = null; setHovered(null); }}
          className={monthsToRender > 1 ? 'grid gap-4' : ''}
          style={gridStyle}
        >
          {Array.from({ length: monthsToRender }, (_, i) => renderMonth(i))}
        </div>
      )}

      {view === 'months' && (
        <div className="grid grid-cols-3 gap-1.5">
          {months.map((name, i) => {
            const isCur = visibleMonth.getMonth() === i && visibleMonth.getFullYear() === yearPage;
            return (
              <button
                key={name}
                type="button"
                onClick={() => { goToMonth(new Date(yearPage, i, 1)); setView('days'); }}
                className={`rounded-lg px-2 py-2.5 text-sm font-medium ${motion.colors} touch-manipulation
                  ${focusRing} ${isCur
                    ? `${bg.accent} ${text.onAccent}`
                    : `${text.muted} ${bgHover.surface}`}`}
              >
                {name.slice(0, 3)}
              </button>
            );
          })}
          <button type="button" onClick={() => setView('years')}
            className={`col-span-3 mt-1 rounded-lg px-2 py-2 text-sm font-medium ${text.accent} ${bgHover.accentSoft}
              ${focusRing} ${motion.colors} touch-manipulation`}>
            {yearPage} · {labels.selectYear}
          </button>
        </div>
      )}

      {view === 'years' && (
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 12 }, (_, i) => yearPage + i).map(y => {
            const isCur = visibleMonth.getFullYear() === y;
            const outOfBounds = (min && y < min.getFullYear()) || (max && y > max.getFullYear());
            return (
              <button
                key={y}
                type="button"
                disabled={!!outOfBounds}
                onClick={() => { setYearPage(y); setView('months'); }}
                className={`rounded-lg px-1 py-2.5 text-sm font-medium ${motion.colors} touch-manipulation
                  ${focusRing} disabled:opacity-30 disabled:pointer-events-none ${isCur
                    ? `${bg.accent} ${text.onAccent}`
                    : `${text.muted} ${bgHover.surface}`}`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {/* Pie */}
      {showFooter && (
        <div className={`mt-2 flex items-center justify-between gap-2 border-t ${border.subtle} pt-2`}>
          <button
            type="button"
            className={FOOT_BTN}
            disabled={disabled || readOnly || isDisabled(today)}
            onClick={() => { goToMonth(today); moveFocus(today); if (view !== 'days') setView('days'); selectDay(today); }}
          >
            {labels.today}
          </button>
          <button
            type="button"
            className={`${FOOT_BTN} ${text.subtle} ${bgHover.surface}`}
            disabled={disabled || readOnly}
            onClick={() => { setHovered(null); commit(emptyValue(), false); }}
          >
            {labels.clear}
          </button>
        </div>
      )}
    </div>
  );
}
