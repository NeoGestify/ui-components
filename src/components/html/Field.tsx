import { useId, type CSSProperties, type FC, type ReactNode } from 'react';
import { text } from '../../theme/tokens';
import { cn } from '../../internal/cn';

/** Identificadores derivados del `id` del control. */
export interface FieldIds {
  /** El del control en sí; es el que va en `htmlFor`. */
  id: string;
  /** Para `aria-labelledby` cuando la etiqueta no es un `<label>`. */
  labelId: string;
  errorId: string;
  helperId: string;
}

/**
 * Los cuatro identificadores de un campo, a partir del `id` que haya dado el
 * consumidor o de uno estable generado por React.
 *
 * ```ts
 * const ids = useFieldIds(id, 'input');
 * <input id={ids.id} aria-describedby={describedBy(ids, error, helperText)} />
 * ```
 */
export function useFieldIds(id: string | undefined, prefix: string): FieldIds {
  const auto = useId();
  const base = id || `${prefix}-${auto}`;
  return {
    id: base,
    labelId: `${base}-label`,
    errorId: `${base}-error`,
    helperId: `${base}-helper`,
  };
}

/**
 * A qué mensaje apunta `aria-describedby`. El error manda: cuando lo hay, el
 * texto de ayuda no se pinta, así que apuntar a él dejaría la referencia rota.
 */
export function describedBy(ids: FieldIds, error?: unknown, helperText?: unknown): string | undefined {
  if (error) return ids.errorId;
  if (helperText) return ids.helperId;
  return undefined;
}

export interface FieldProps {
  /** El control. */
  children: ReactNode;
  label?: ReactNode;
  /**
   * `id` del control al que apunta la etiqueta. Sin él la etiqueta se pinta
   * como `<p id={labelId}>`, que es lo correcto cuando el control es un grupo
   * y no un elemento de formulario.
   */
  htmlFor?: string;
  labelId?: string;
  /**
   * Texto de apoyo **encima** del control. Es lo que quiere un grupo de
   * opciones («elige una o más»), donde la instrucción se lee antes de actuar.
   */
  description?: ReactNode;
  descriptionId?: string;
  error?: ReactNode;
  errorId?: string;
  /** Texto de apoyo **debajo** del control, como en los campos de texto. */
  helperText?: ReactNode;
  helperId?: string;
  /** Marca la etiqueta con un asterisco. */
  required?: boolean;
  /** Contenido alineado a la derecha de la etiqueta: contadores, acciones. */
  labelAside?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Etiqueta, control, error y texto de ayuda: el envoltorio común de todos los
 * campos de la librería.
 *
 * Esto estaba copiado en seis sitios (`Input`, `TextArea`, `Select`,
 * `Combobox`, `DatePicker` y el constructor de elementos), cada uno con su
 * propia versión de los identificadores y del `aria-describedby`. Un cambio de
 * espaciado o un fallo de accesibilidad había que arreglarlo seis veces.
 *
 * También sirve para envolver un control ajeno y que herede el mismo aspecto:
 *
 * ```tsx
 * const ids = useFieldIds(undefined, 'color');
 * <Field label="Color" htmlFor={ids.id} error={error} errorId={ids.errorId}>
 *   <input id={ids.id} type="color" />
 * </Field>
 * ```
 */
export const Field: FC<FieldProps> = ({
  children,
  label,
  htmlFor,
  labelId,
  description,
  descriptionId,
  error,
  errorId,
  helperText,
  helperId,
  required = false,
  labelAside,
  className = '',
  style,
}) => {
  // Una etiqueta que ya viene como JSX se respeta tal cual: el consumidor la
  // habrá escrito con su propio `<label>` y su propio `htmlFor`.
  const esTexto = typeof label === 'string' || typeof label === 'number';

  const marca = required
    ? <span className={cn('ml-1', text.danger)} aria-hidden="true">*</span>
    : null;

  const etiqueta = label === undefined || label === null || label === false ? null
    : esTexto
      ? (htmlFor
          ? <label htmlFor={htmlFor} className={cn('block text-sm font-medium', text.muted)}>{label}{marca}</label>
          : <p id={labelId} className={cn('block text-sm font-medium', text.muted)}>{label}{marca}</p>)
      : label;

  return (
    <div className={cn('w-full space-y-1', className)} style={style}>
      {(etiqueta || labelAside) && (
        labelAside
          ? (
            <div className="flex items-baseline gap-2">
              <div className="min-w-0 flex-1">{etiqueta}</div>
              {labelAside}
            </div>
          )
          : etiqueta
      )}

      {description && !error && (
        <p id={descriptionId} className={cn('text-sm', text.subtle)}>{description}</p>
      )}

      {children}

      {error
        ? <p id={errorId} className={cn('text-sm', text.danger)} role="alert">{error}</p>
        : helperText
          ? <p id={helperId} className={cn('text-sm', text.subtle)}>{helperText}</p>
          : null}
    </div>
  );
};
