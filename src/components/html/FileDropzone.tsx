import {
  forwardRef, useCallback, useEffect, useRef, useState,
  type DragEvent as ReactDragEvent, type FC, type ReactNode,
} from 'react';
import { DocumentIcon, IconUpload, TrashIcon } from '../icons/icons';
import { bg, border, focusVisibleRing, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useMergedRefs } from '../../internal/mergeRefs';
import { useControllableState } from '../../internal/useControllableState';
import { useMessage } from '../../context/config/NuiConfigProvider';
import { Field, describedBy, useFieldIds } from './Field';

/** Por qué se ha descartado un archivo. */
export type RejectReason = 'type' | 'size' | 'count';

export interface RejectedFile {
  file: File;
  reason: RejectReason;
}

/** Tamaño en la unidad que toque, con una cifra decimal a partir de KB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const unidades = ['KB', 'MB', 'GB', 'TB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < unidades.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${unidades[i]}`;
}

/**
 * Comprueba un archivo contra la lista de `accept`, con las mismas reglas que
 * el navegador: extensión (`.pdf`), tipo exacto (`image/png`) o comodín
 * (`image/*`).
 */
export function acceptsFile(file: File, accept?: string): boolean {
  if (!accept) return true;
  const patrones = accept.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!patrones.length) return true;
  const nombre = file.name.toLowerCase();
  const tipo = file.type.toLowerCase();
  return patrones.some(p => {
    if (p.startsWith('.')) return nombre.endsWith(p);
    if (p.endsWith('/*')) return tipo.startsWith(p.slice(0, -1));
    return tipo === p;
  });
}

/**
 * Miniatura de una imagen. La URL se crea al montar y se libera al desmontar:
 * un `createObjectURL` sin su `revokeObjectURL` mantiene el archivo entero en
 * memoria mientras viva la pestaña.
 */
const Miniatura: FC<{ file: File }> = ({ file }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file.type.startsWith('image/')) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  if (!url) {
    return (
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded', bg.surfaceMuted, text.subtle)}>
        <DocumentIcon className="h-5 w-5" />
      </span>
    );
  }
  return <img src={url} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />;
};

export interface FileDropzoneProps extends AnimatableProps {
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  /** Se llama con lo que no ha pasado el filtro, para poder avisar. */
  onReject?: (rejected: RejectedFile[]) => void;
  label?: ReactNode;
  error?: string;
  helperText?: string;
  /** Texto grande dentro de la zona. Por defecto, el del `NuiConfigProvider`. */
  prompt?: ReactNode;
  /** Igual que en un `<input type="file">`: `.pdf,image/*`. */
  accept?: string;
  multiple?: boolean;
  /** Tamaño máximo por archivo, en bytes. */
  maxSize?: number;
  /** Número máximo de archivos. */
  maxFiles?: number;
  disabled?: boolean;
  required?: boolean;
  /** Oculta la lista de archivos elegidos. */
  hideList?: boolean;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

/**
 * Zona para soltar archivos, con su lista y su validación.
 *
 * El `<input type="file">` sigue estando ahí, oculto pero enfocable: es lo que
 * hace que el control funcione con el teclado, que el navegador abra su
 * selector nativo y que el campo viaje en un formulario. La zona grande es su
 * `<label>`, así que pulsarla es pulsar el campo.
 *
 * ```tsx
 * <FileDropzone
 *   label="Adjuntos"
 *   accept="image/*,.pdf"
 *   multiple
 *   maxSize={5 * 1024 * 1024}
 *   value={archivos}
 *   onChange={setArchivos}
 *   onReject={r => toast.error(`${r.length} archivo(s) rechazado(s)`)}
 * />
 * ```
 */
export const FileDropzone = forwardRef<HTMLInputElement, FileDropzoneProps>(({
  value,
  defaultValue,
  onChange,
  onReject,
  label,
  error,
  helperText,
  prompt,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled = false,
  required = false,
  hideList = false,
  name,
  id,
  className = '',
  animate,
  'aria-label': ariaLabel,
}, ref) => {
  const ids = useFieldIds(id, 'dropzone');
  const textoSoltar = useMessage('dropFiles');
  const quitarLabel = useMessage('remove');

  const [files, setFiles] = useControllableState<File[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  });

  const [encima, setEncima] = useState(false);
  // Arrastrar por encima de un hijo dispara `dragleave` en el padre. Con un
  // contador de entradas y salidas el resaltado no parpadea al pasar sobre el
  // texto o el icono de dentro.
  const profundidad = useRef(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInput = useMergedRefs<HTMLInputElement>(ref, inputRef);

  // Un `<input type="file">` no deja asignar su lista con una asignación
  // normal, pero sí aceptando la `FileList` de un `DataTransfer`. Sin esto,
  // `name` no serviría de nada: el navegador enviaría lo último que se eligió
  // en el diálogo, no lo que de verdad hay en la lista tras quitar o acumular.
  useEffect(() => {
    const el = inputRef.current;
    if (!el || typeof DataTransfer === 'undefined') return;
    try {
      const dt = new DataTransfer();
      for (const f of files) dt.items.add(f);
      el.files = dt.files;
    } catch {
      // Safari antiguo no deja escribir `files`. Se queda como estaba: la
      // lista visible sigue siendo correcta, solo el envío nativo se pierde.
    }
  }, [files]);

  const admitir = useCallback((entrantes: File[]) => {
    const buenos: File[] = [];
    const malos: RejectedFile[] = [];

    for (const f of entrantes) {
      if (!acceptsFile(f, accept)) { malos.push({ file: f, reason: 'type' }); continue; }
      if (maxSize !== undefined && f.size > maxSize) { malos.push({ file: f, reason: 'size' }); continue; }
      buenos.push(f);
    }

    setFiles(prev => {
      const base = multiple ? [...prev] : [];
      for (const f of buenos) {
        // Un archivo ya elegido no se duplica; se reconoce por nombre, tamaño
        // y fecha, que es lo único comparable sin leer el contenido.
        const repetido = base.some(x => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified);
        if (repetido) continue;
        if (maxFiles !== undefined && base.length >= maxFiles) { malos.push({ file: f, reason: 'count' }); continue; }
        base.push(f);
        if (!multiple) break;
      }
      return base;
    });

    if (malos.length) onReject?.(malos);
  }, [accept, maxSize, maxFiles, multiple, setFiles, onReject]);

  const onDrop = useCallback((e: ReactDragEvent<HTMLElement>) => {
    e.preventDefault();
    profundidad.current = 0;
    setEncima(false);
    if (disabled) return;
    admitir(Array.from(e.dataTransfer.files));
  }, [disabled, admitir]);

  const quitar = useCallback((i: number) => {
    setFiles(prev => prev.filter((_, j) => j !== i));
  }, [setFiles]);

  const lleno = maxFiles !== undefined && files.length >= maxFiles;

  return (
    <Field
      label={label}
      htmlFor={ids.id}
      error={error}
      errorId={ids.errorId}
      helperText={helperText}
      helperId={ids.helperId}
      required={required}
      className={className}
      style={motionStyle(animate)}
    >
      <div>
        <input
          ref={setInput}
          id={ids.id}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled || lleno}
          required={required && files.length === 0}
          aria-label={label === undefined ? ariaLabel : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, error, helperText)}
          name={name}
          onChange={e => admitir(Array.from(e.target.files ?? []))}
        />

        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- lo tiene: el input está arriba, oculto con `sr-only` para no perder ni el teclado ni el selector nativo. */}
        <label
          htmlFor={ids.id}
          onDragEnter={e => { e.preventDefault(); profundidad.current++; if (!disabled) setEncima(true); }}
          onDragOver={e => e.preventDefault()}
          onDragLeave={() => { profundidad.current = Math.max(0, profundidad.current - 1); if (profundidad.current === 0) setEncima(false); }}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center',
            motion.colors,
            encima ? `${border.accent} ${bg.accentSoft}` : `${border.base} ${bg.surfaceMuted}`,
            error ? border.dangerSubtle : '',
            disabled || lleno ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            // El foco vive en el input oculto; el aro se dibuja aquí.
            'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[color:var(--nui-ring,oklch(58.5%_.233_277.117))] dark:has-[:focus-visible]:ring-[color:var(--nui-ring-dark,oklch(67.3%_.182_276.935))]',
          )}
        >
          <IconUpload className={cn('h-8 w-8', encima ? text.accent : text.faint)} />
          <span className={cn('text-sm font-medium', text.muted)}>{prompt ?? textoSoltar}</span>
          {(accept || maxSize !== undefined || maxFiles !== undefined) && (
            <span className={cn('text-xs', text.faint)}>
              {[
                accept,
                maxSize !== undefined ? `máx. ${formatBytes(maxSize)}` : null,
                maxFiles !== undefined ? `hasta ${maxFiles}` : null,
              ].filter(Boolean).join(' · ')}
            </span>
          )}
        </label>

        {!hideList && files.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.size}-${f.lastModified}`}
                className={cn('flex items-center gap-3 rounded-lg border p-2', border.subtle, bg.surface)}
              >
                <Miniatura file={f} />
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-sm font-medium', text.base)}>{f.name}</span>
                  <span className={cn('block text-xs tabular-nums', text.subtle)}>{formatBytes(f.size)}</span>
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => quitar(i)}
                  aria-label={`${quitarLabel} ${f.name}`}
                  className={cn(
                    'shrink-0 rounded-md p-1.5', motion.colors, text.subtle, focusVisibleRing,
                    'hover:text-[color:var(--nui-danger-text,oklch(57.7%_.245_27.325))] dark:hover:text-[color:var(--nui-danger-text-dark,oklch(70.4%_.191_22.216))]',
                    'disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
                  )}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </Field>
  );
});

FileDropzone.displayName = 'FileDropzone';
