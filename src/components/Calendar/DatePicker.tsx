import {
  useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, CloseIcon } from '../icons/icons';
import { Calendar } from './Calendar';
import { formatDate, toDate, toISODate, type DateRange } from './dateUtils';
import {
  DEFAULT_LABELS, type CalendarMode, type CalendarProps, type CalendarValue, type DateInput,
} from './types';
// `text` se renombra: dentro del componente hay una variable local con ese nombre.
import { bg, bgHover, border, focusRing, focusVisibleRing, text as textCls } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';

/** Ancho de ventana por debajo del cual el desplegable se abre como hoja inferior. */
const SHEET_BREAKPOINT = 640;

export interface DatePickerProps<M extends CalendarMode = 'single'>
  extends Omit<CalendarProps<M>, 'className' | 'showFooter' | 'autoFocus'>, AnimatableProps {
  label?: ReactNode;
  placeholder?: string;
  error?: string;
  helperText?: string;
  /** Formato del texto del campo. Por defecto `{ dateStyle: 'medium' }`. */
  displayFormat?: Intl.DateTimeFormatOptions;
  /** Botón para vaciar la selección. */
  clearable?: boolean;
  /** Cierra al completar la selección (fecha suelta o rango cerrado). */
  closeOnSelect?: boolean;
  /** `name` del input oculto, para enviar el valor en un `<form>`. */
  name?: string;
  required?: boolean;
  /** Clases del contenedor externo. */
  className?: string;
  /** Clases del campo. */
  inputClassName?: string;
  /** Clases del panel del calendario. */
  calendarClassName?: string;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Campo de fecha con calendario desplegable.
 *
 * En pantallas anchas abre un panel flotante bajo el campo; en móvil abre una
 * hoja inferior a pantalla completa, mucho más cómoda con el pulgar.
 *
 * ```tsx
 * <DatePicker mode="range" label="Estancia" value={range} onChange={setRange} />
 * ```
 */
export function DatePicker<M extends CalendarMode = 'single'>(props: DatePickerProps<M>) {
  const {
    label, placeholder, error, helperText, displayFormat = { dateStyle: 'medium' },
    clearable = true, closeOnSelect = true, name, required, className = '',
    inputClassName = '', calendarClassName = '', onOpenChange, animate,
    mode = 'single' as M, value, defaultValue, onChange, onComplete,
    locale = 'es-ES', disabled = false, readOnly = false, labels: labelsProp,
    id, ...calendarProps
  } = props;

  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelsProp }), [labelsProp]);
  const autoId = useId();
  const fieldId = id || `datepicker-${autoId}`;
  const descId = `${fieldId}-desc`;

  const [open, setOpen] = useState(false);
  const [isSheet, setIsSheet] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < SHEET_BREAKPOINT,
  );
  const [dropUp, setDropUp] = useState(false);
  // Un frame por detrás de `open`, para que el panel se monte cerrado y la
  // transición tenga desde dónde salir.
  const [shown, setShown] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Estado interno cuando el componente no está controlado.
  const emptyValue = useMemo(() => (
    (mode === 'range' ? { start: null, end: null } : mode === 'multiple' ? [] : null) as CalendarValue<M>
  ), [mode]);
  const [innerValue, setInnerValue] = useState<CalendarValue<M>>(
    () => (defaultValue !== undefined ? defaultValue : emptyValue) as CalendarValue<M>,
  );
  const current = (value !== undefined ? value : innerValue) as CalendarValue<M>;

  const setOpenState = useCallback((next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  }, [onOpenChange]);

  const handleChange = useCallback((next: CalendarValue<M>) => {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  }, [value, onChange]);

  const handleComplete = useCallback((next: CalendarValue<M>) => {
    onComplete?.(next);
    if (closeOnSelect && mode !== 'multiple') {
      setOpenState(false);
      triggerRef.current?.focus();
    }
  }, [onComplete, closeOnSelect, mode, setOpenState]);

  // El panel no puede medirse a sí mismo para decidir cuántos meses caben (se
  // mediría a sí mismo encogido), así que se decide por el ancho de la ventana.
  const monthsInPanel = isSheet ? 1 : (calendarProps.numberOfMonths ?? (mode === 'range' ? 2 : 1));
  const panelWidthPx = monthsInPanel * 290;

  // ── Colocación: hoja inferior en móvil, panel flotante en escritorio ──────
  // Se mide siempre (no solo al abrir) para que el calendario ya sepa cuántos
  // meses debe pintar en el primer frame, sin saltos.
  useEffect(() => {
    const decide = () => {
      const sheet = window.innerWidth < SHEET_BREAKPOINT;
      setIsSheet(sheet);
      if (sheet) return;
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      // ~380 px es lo que ocupa el panel; si no cabe abajo, se abre hacia arriba.
      setDropUp(window.innerHeight - r.bottom < 380 && r.top > 380);
      // Si tampoco cabe a la derecha, se ancla por el borde derecho.
      setAlignRight(window.innerWidth - r.left < panelWidthPx + 16 && r.right > panelWidthPx);
    };
    decide();
    window.addEventListener('resize', decide);
    return () => window.removeEventListener('resize', decide);
  }, [open, panelWidthPx]);

  useEffect(() => {
    if (!open) { setShown(false); return; }
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Cierre por clic fuera / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpenState(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpenState(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpenState]);

  // Bloquea el scroll del fondo mientras la hoja está abierta.
  useEffect(() => {
    if (!open || !isSheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open, isSheet]);

  // ── Texto del campo y valor para formularios ──────────────────────────────
  const fmt = useCallback((d: Date) => formatDate(d, locale, displayFormat), [locale, displayFormat]);

  const { text, formValue, hasValue } = useMemo(() => {
    if (mode === 'range') {
      const r = (current ?? {}) as DateRange;
      const s = toDate(r.start as DateInput);
      const e = toDate(r.end as DateInput);
      if (!s && !e) return { text: '', formValue: '', hasValue: false };
      return {
        text: `${s ? fmt(s) : '…'} – ${e ? fmt(e) : '…'}`,
        formValue: `${s ? toISODate(s) : ''}/${e ? toISODate(e) : ''}`,
        hasValue: true,
      };
    }
    if (mode === 'multiple') {
      const list = (Array.isArray(current) ? current : []).map(d => toDate(d as DateInput)).filter(Boolean) as Date[];
      if (!list.length) return { text: '', formValue: '', hasValue: false };
      return {
        text: list.length <= 2 ? list.map(fmt).join(', ') : `${list.length} fechas`,
        formValue: list.map(toISODate).join(','),
        hasValue: true,
      };
    }
    const d = toDate(current as DateInput);
    return { text: d ? fmt(d) : '', formValue: d ? toISODate(d) : '', hasValue: !!d };
  }, [current, mode, fmt]);

  const hint = placeholder ?? (mode === 'range' ? labels.selectRange : labels.selectDate);

  const calendar = (
    <Calendar<M>
      {...(calendarProps as CalendarProps<M>)}
      mode={mode}
      value={current}
      onChange={handleChange}
      onComplete={handleComplete}
      locale={locale}
      readOnly={readOnly}
      labels={labelsProp}
      numberOfMonths={monthsInPanel}
      responsive={false}
      autoFocus
      showFooter
      showValueSummary={mode === 'range'}
      className={`border-0 shadow-none ${calendarClassName}`}
    />
  );

  const showClear = clearable && hasValue && !disabled && !readOnly;

  const triggerCls = [
    'relative flex w-full items-center gap-2 rounded-md border py-2 pl-3 text-left text-sm transition-colors',
    showClear ? 'pr-9' : 'pr-3',
    `${bg.surface} ${textCls.base}`,
    focusRing,
    'disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
    error ? border.dangerSubtle : border.base,
    inputClassName,
  ].filter(Boolean).join(' ');

  const helpNode = error
    ? <p id={descId} className={`text-sm ${textCls.danger}`} role="alert">{error}</p>
    : helperText
      ? <p id={descId} className={`text-sm ${textCls.subtle}`}>{helperText}</p>
      : null;

  return (
    <div ref={rootRef} className={`relative w-full space-y-1 ${className}`}>
      {label && (
        typeof label === 'string' ? (
          <label htmlFor={fieldId} className={`block text-sm font-medium ${textCls.muted}`}>
            {label}
            {required && <span className={`ml-1 ${textCls.danger}`} aria-hidden="true">*</span>}
          </label>
        ) : label
      )}

      {/* El botón de limpiar va FUERA del disparador: anidar un control dentro
          de otro es HTML inválido y los lectores de pantalla lo ignoran. */}
      <div className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          className={triggerCls}
          disabled={disabled}
          onClick={() => setOpenState(!open)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={!!error || undefined}
          aria-describedby={helpNode ? descId : undefined}
        >
          <CalendarIcon className={`h-4 w-4 shrink-0 ${textCls.faint}`} />
          <span className={`min-w-0 flex-1 truncate ${hasValue ? '' : textCls.subtle}`}>
            {text || hint}
          </span>
        </button>
        {showClear && (
          <button
            type="button"
            aria-label={labels.clear}
            onClick={() => handleChange(emptyValue)}
            className={`absolute inset-y-0 right-0 flex items-center rounded-md px-2 ${textCls.faint}
              hover:text-[var(--nui-text-muted,oklch(37.3%_.034_259.733))]
              dark:hover:text-[var(--nui-text-muted-dark,oklch(87.2%_.01_258.338))] ${focusVisibleRing}`}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {name && <input type="hidden" name={name} value={formValue} />}
      {helpNode}

      {open && !isSheet && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={typeof label === 'string' ? label : hint}
          className={`absolute z-50 ${dropUp ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'} ${alignRight ? 'right-0' : 'left-0'}
            max-w-[min(92vw,44rem)] rounded-xl border ${border.subtle} ${bg.surface} shadow-xl
            ${motion.enterFast} ${shown ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ width: panelWidthPx, ...motionStyle(animate) }}
        >
          {calendar}
        </div>
      )}

      {open && isSheet && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center" style={motionStyle(animate)}>
          <div
            className={`absolute inset-0 bg-[color-mix(in_oklab,var(--nui-scrim,oklch(21%_.034_264.665))_45%,transparent)] backdrop-blur-[1px]
              ${motion.fade} ${shown ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setOpenState(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={typeof label === 'string' ? label : hint}
            className={`relative w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border-t ${border.subtle}
              ${bg.surface} pb-[env(safe-area-inset-bottom)] shadow-2xl
              ${motion.enter} ${shown ? 'translate-y-0' : 'translate-y-full'}`}
          >
            {/* Asa: pista visual de que la hoja se puede cerrar. */}
            <div className="flex justify-center pt-2" onClick={() => setOpenState(false)}>
              <span className="h-1.5 w-10 rounded-full bg-[var(--nui-border,oklch(87.2%_.01_258.338))] dark:bg-[var(--nui-border-dark,oklch(44.6%_.03_256.802))]" />
            </div>
            {calendar}
            <div className="flex gap-2 px-3 pb-3">
              <button
                type="button"
                onClick={() => setOpenState(false)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium ${bg.accent} ${textCls.onAccent}
                  ${bgHover.accent} ${focusRing} focus:ring-offset-2 transition-colors touch-manipulation`}
              >
                {labels.apply}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
