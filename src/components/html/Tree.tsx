import {
  useCallback, useMemo, useRef,
  type FC, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import { ChevronRightSmallIcon } from '../icons/icons';
import { bg, bgHover, focusVisibleRing, text } from '../../theme/tokens';
import { motion, motionStyle, type AnimatableProps } from '../../theme/motion';
import { cn } from '../../internal/cn';
import { useControllableState } from '../../internal/useControllableState';
import { useMessage } from '../../context/config/NuiConfigProvider';
import { CheckboxBox } from './Checkbox';

export interface TreeNode {
  /** Identificador único en todo el árbol. */
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  /** Texto pequeño alineado a la derecha: un contador, un estado. */
  meta?: ReactNode;
}

/** Un nodo con su sitio en el árbol, tal y como se ve en pantalla. */
interface NodoPlano {
  node: TreeNode;
  level: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
  hasChildren: boolean;
  expanded: boolean;
}

export interface TreeProps extends AnimatableProps {
  nodes: TreeNode[];
  /** Ramas abiertas. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Nodos marcados. Con `selectable="single"` la lista tiene un elemento. */
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (selected: string[]) => void;
  /** Se llama con el nodo entero, que suele ser lo que hace falta. */
  onNodeClick?: (node: TreeNode) => void;
  selectable?: 'none' | 'single' | 'multiple';
  /** Marca cada rama con su línea de sangría. */
  showGuides?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

/** Recorre el árbol en el orden en que se ve, saltándose lo que está plegado. */
function aplanar(nodes: TreeNode[], abiertos: Set<string>, level = 0, parentId: string | null = null): NodoPlano[] {
  const salida: NodoPlano[] = [];
  nodes.forEach((node, i) => {
    const hasChildren = Boolean(node.children?.length);
    const expanded = hasChildren && abiertos.has(node.id);
    salida.push({
      node, level, parentId,
      posInSet: i + 1,
      setSize: nodes.length,
      hasChildren,
      expanded,
    });
    if (expanded) salida.push(...aplanar(node.children!, abiertos, level + 1, node.id));
  });
  return salida;
}

/**
 * Árbol de nodos plegables.
 *
 * Sigue el patrón `tree` de ARIA: **una sola** parada de tabulación para todo
 * el árbol y dentro se navega con las flechas —arriba y abajo entre lo visible,
 * derecha para abrir o bajar al primer hijo, izquierda para cerrar o subir al
 * padre—. Es lo que espera quien usa lector de pantalla, y de paso es mucho más
 * rápido que tabular por cientos de nodos.
 *
 * ```tsx
 * <Tree
 *   nodes={carpetas}
 *   selectable="multiple"
 *   defaultExpanded={['raiz']}
 *   onNodeClick={abrir}
 * />
 * ```
 */
export const Tree: FC<TreeProps> = ({
  nodes,
  expanded,
  defaultExpanded,
  onExpandedChange,
  selected,
  defaultSelected,
  onSelectedChange,
  onNodeClick,
  selectable = 'none',
  showGuides = true,
  size = 'md',
  animate,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const desplegarLabel = useMessage('expand');
  const plegarLabel = useMessage('collapse');

  const [abiertos, setAbiertos] = useControllableState<string[]>({
    value: expanded,
    defaultValue: defaultExpanded ?? [],
    onChange: onExpandedChange,
  });
  const [marcados, setMarcados] = useControllableState<string[]>({
    value: selected,
    defaultValue: defaultSelected ?? [],
    onChange: onSelectedChange,
  });

  const rootRef = useRef<HTMLUListElement>(null);
  const abiertosSet = useMemo(() => new Set(abiertos), [abiertos]);
  const planos = useMemo(() => aplanar(nodes, abiertosSet), [nodes, abiertosSet]);

  // Con qué nodo entra el tabulador: el primero marcado, o el primero de todos.
  const focoInicial = planos.find(p => marcados.includes(p.node.id))?.node.id ?? planos[0]?.node.id;

  const alternarRama = useCallback((id: string) => {
    setAbiertos(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, [setAbiertos]);

  const activar = useCallback((p: NodoPlano) => {
    if (p.node.disabled) return;
    if (selectable === 'single') setMarcados([p.node.id]);
    if (selectable === 'multiple') {
      setMarcados(prev => (prev.includes(p.node.id) ? prev.filter(x => x !== p.node.id) : [...prev, p.node.id]));
    }
    // Un nodo sin hijos no tiene rama que abrir, así que pulsarlo es elegirlo;
    // uno con hijos también despliega, que es lo que espera todo el mundo de
    // una carpeta.
    if (p.hasChildren && selectable === 'none') alternarRama(p.node.id);
    onNodeClick?.(p.node);
    // Al pulsar con el ratón el foco se queda en el botón interior, que está
    // fuera del recorrido; las flechas seguirían moviéndose desde el nodo
    // anterior. Se devuelve al nodo pulsado, que es donde el usuario cree estar.
    enfocarRef.current(p.node.id);
  }, [selectable, setMarcados, alternarRama, onNodeClick]);

  const enfocar = useCallback((id: string | undefined) => {
    if (!id) return;
    rootRef.current
      ?.querySelector<HTMLLIElement>(`[data-tree-item="${CSS.escape(id)}"]`)
      ?.focus();
  }, []);

  // `activar` se declara antes que `enfocar` en el orden de dependencias, así
  // que se llega a él por una ref en vez de reordenar los dos y crear un ciclo.
  const enfocarRef = useRef(enfocar);
  enfocarRef.current = enfocar;

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLLIElement>, p: NodoPlano) => {
    // Los nodos van anidados, así que un `<li>` hijo está DENTRO del `<li>` de
    // su padre y la tecla sube por todos ellos. Sin esto, una flecha izquierda
    // sobre una rama la cerraba y acto seguido cerraba también a su padre, a su
    // abuelo y hasta la raíz, dejando el foco en la nada.
    if (e.target !== e.currentTarget) return;
    e.stopPropagation();

    const i = planos.findIndex(x => x.node.id === p.node.id);
    if (i < 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        enfocar(planos[i + 1]?.node.id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        enfocar(planos[i - 1]?.node.id);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (p.hasChildren && !p.expanded) alternarRama(p.node.id);
        else if (p.expanded) enfocar(planos[i + 1]?.node.id);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (p.expanded) alternarRama(p.node.id);
        else if (p.parentId) enfocar(p.parentId);
        break;
      case 'Home':
        e.preventDefault();
        enfocar(planos[0]?.node.id);
        break;
      case 'End':
        e.preventDefault();
        enfocar(planos[planos.length - 1]?.node.id);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activar(p);
        break;
      default:
        break;
    }
  }, [planos, enfocar, alternarRama, activar]);

  const filaCls = size === 'sm' ? 'gap-1.5 py-1 text-xs' : 'gap-2 py-1.5 text-sm';

  const pintar = (lista: TreeNode[], level: number): ReactNode => (
    <ul
      role={level === 0 ? 'tree' : 'group'}
      ref={level === 0 ? rootRef : undefined}
      aria-label={level === 0 ? ariaLabel : undefined}
      className={cn(
        level === 0 ? '' : 'ml-3',
        level > 0 && showGuides
          ? 'border-l border-[color:var(--nui-border-subtle,oklch(92.8%_.006_264.531))] dark:border-[color:var(--nui-border-subtle-dark,oklch(37.3%_.034_259.733))] pl-2'
          : '',
      )}
    >
      {lista.map(node => {
        const p = planos.find(x => x.node.id === node.id);
        // Un nodo cuyo padre está plegado no aparece en la lista aplanada;
        // tampoco se pinta.
        if (!p) return null;
        const activo = marcados.includes(node.id);

        return (
          <li
            key={node.id}
            role="treeitem"
            data-tree-item={node.id}
            aria-expanded={p.hasChildren ? p.expanded : undefined}
            aria-selected={selectable === 'none' ? undefined : activo}
            aria-disabled={node.disabled || undefined}
            aria-level={p.level + 1}
            aria-posinset={p.posInSet}
            aria-setsize={p.setSize}
            tabIndex={node.id === focoInicial ? 0 : -1}
            onKeyDown={e => onKeyDown(e, p)}
            className={cn('rounded-md', focusVisibleRing)}
          >
            <div
              className={cn(
                'flex items-center rounded-md px-1', filaCls, motion.colors,
                node.disabled ? 'opacity-50' : cn('cursor-pointer', bgHover.surface),
                activo ? bg.accentSoft : '',
              )}
            >
              {p.hasChildren ? (
                <button
                  type="button"
                  // Fuera del recorrido: el árbol se abre con la flecha derecha,
                  // y una parada por rama haría el tabulador interminable.
                  tabIndex={-1}
                  aria-label={`${p.expanded ? plegarLabel : desplegarLabel} ${typeof node.label === 'string' ? node.label : ''}`.trim()}
                  disabled={node.disabled}
                  onClick={() => alternarRama(node.id)}
                  className={cn('shrink-0 rounded p-0.5', text.subtle, motion.colors, 'cursor-pointer')}
                >
                  <ChevronRightSmallIcon
                    className={cn('h-4 w-4', motion.transform, p.expanded ? 'rotate-90' : '')}
                  />
                </button>
              ) : (
                // Hueco del mismo ancho que la flecha: sin él, las hojas se
                // desalinean respecto de las ramas de su mismo nivel.
                <span className="h-5 w-5 shrink-0" aria-hidden="true" />
              )}

              {selectable === 'multiple' && (
                <span className="shrink-0" aria-hidden="true">
                  <CheckboxBox checked={activo} size="sm" />
                </span>
              )}

              {node.icon && (
                <span className={cn('shrink-0', text.subtle)} aria-hidden="true">{node.icon}</span>
              )}

              <button
                type="button"
                tabIndex={-1}
                disabled={node.disabled}
                onClick={() => activar(p)}
                className={cn(
                  'min-w-0 flex-1 truncate text-left',
                  activo ? cn('font-medium', text.accent) : text.base,
                  'cursor-pointer disabled:cursor-not-allowed',
                )}
              >
                {node.label}
              </button>

              {node.meta !== undefined && (
                <span className={cn('shrink-0 text-xs tabular-nums', text.faint)}>{node.meta}</span>
              )}
            </div>

            {p.expanded && node.children && pintar(node.children, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div style={motionStyle(animate)} className={className}>
      {pintar(nodes, 0)}
    </div>
  );
};
