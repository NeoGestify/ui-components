import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  IconCursor, IconGrid, IconHand, IconReset, IconZoomIn, IconZoomOut,
  IconUndo, IconRedo, IconPlace, IconErase, IconWall,
  IconDownload, IconUpload, IconLayers,
} from '../../icons';
import type { ToolMode, ElementTypeDef, AreaShape } from '../types';
import { parseSvgMarkup } from '../utils/svgParser';
import { motion } from '../../../theme/motion';
import { sanitizeImageSrc } from '../utils/imageSrc';
import { bg, bgHover, border, borderHover, focusVisibleRing, ringAccent, text, textHover } from '../../../theme/tokens';
import { cn } from '../../../internal/cn';

// ─── ToolButton ───────────────────────────────────────────────────────────────

interface ToolButtonProps {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
  /** Área táctil ampliada. */
  large?: boolean;
}

/**
 * Indicador de foco compartido. `focus-visible` para que el anillo aparezca al
 * navegar con teclado pero no al pulsar con el ratón.
 */
const FOCUS_CLS =
  focusVisibleRing;

function ToolButton({ active, disabled, title, onClick, children, large }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'cursor-pointer', `flex items-center justify-center rounded ${motion.colors} shrink-0 disabled:opacity-30 disabled:cursor-not-allowed`,
        FOCUS_CLS,
        large ? 'w-10 h-10' : 'w-8 h-8',
        active
          ? `${bg.accentSoft} ${text.accent} ring-1 ${ringAccent}`
          : `${text.muted} ${bgHover.surface} ${textHover.base}`,
      )}
    >
      {children}
    </button>
  );
}

function Sep({ hidden }: { hidden?: boolean }) {
  if (hidden) return null;
  return <div className={`w-px h-6 ${bg.surfaceMuted} mx-1 shrink-0`} />;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PaletteGroup {
  id: string;
  name: string;
  /** True for the built-in domain config group; false for imported library groups. */
  isBase?: boolean;
  types: ElementTypeDef[];
}

interface ToolbarProps {
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  /** All element groups: base config group + any imported library groups. */
  paletteGroups: PaletteGroup[];
  activePlaceTypeId: string | null;
  onActivePlaceTypeChange: (id: string) => void;
  areaShape?: AreaShape;
  onToggleAreaShape?: () => void;
  onExportMap?: () => void;
  onImportMap?: () => void;
  onLoadLibrary?: () => void;
  onRemoveLibraryGroup?: (groupId: string) => void;
  /** Contenedor estrecho: se compacta la barra. */
  compact?: boolean;
  /** Contenedor muy estrecho: se ocultan los adornos prescindibles. */
  tight?: boolean;
  /** Puntero grueso: botones más grandes. */
  coarse?: boolean;
}

// ─── TypeChip ─────────────────────────────────────────────────────────────────

interface TypeChipProps {
  typeDef: ElementTypeDef;
  active: boolean;
  onClick: () => void;
}

function TypeChip({ typeDef, active, onClick }: TypeChipProps) {
  const preview = useMemo(
    () => (typeDef.shape === 'svg' && typeDef.svgMarkup ? parseSvgMarkup(typeDef.svgMarkup) : null),
    [typeDef.shape, typeDef.svgMarkup],
  );
  const imageHref = useMemo(
    () => (typeDef.shape === 'image' ? sanitizeImageSrc(typeDef.imageSrc) : null),
    [typeDef.shape, typeDef.imageSrc],
  );

  return (
    <button
      type="button"
      title={typeDef.label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'cursor-pointer', `flex items-center gap-1.5 px-2 py-1 rounded border text-xs whitespace-nowrap ${motion.colors}`,
        FOCUS_CLS,
        active
          ? `${border.accent} ${bg.accentSoft} ${text.accent} font-medium`
          : `${border.subtle} ${bg.surface} ${text.muted} ${borderHover.base} ${bgHover.surface}`,
      )}
    >
      {imageHref ? (
        <img
          src={imageHref}
          alt=""
          className="w-3 h-3 shrink-0 object-contain"
          loading="lazy"
        />
      ) : preview ? (
        <svg
          viewBox={preview.viewBox}
          className="w-2.5 h-2.5 shrink-0"
          style={{ color: typeDef.strokeColor }}
          dangerouslySetInnerHTML={{ __html: preview.innerHtml }}
        />
      ) : (
        <span
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ background: typeDef.color, border: `1px solid ${typeDef.strokeColor}` }}
        />
      )}
      {typeDef.label}
    </button>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

export function Toolbar({
  tool,
  onToolChange,
  showGrid,
  onToggleGrid,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  paletteGroups,
  activePlaceTypeId,
  onActivePlaceTypeChange,
  areaShape,
  onToggleAreaShape,
  onExportMap,
  onImportMap,
  onLoadLibrary,
  onRemoveLibraryGroup,
  compact = false,
  tight = false,
  coarse = false,
}: ToolbarProps) {
  // Active palette tab — track by group ID
  const [activeGroupId, setActiveGroupId] = useState<string | null>(
    () => paletteGroups[0]?.id ?? null,
  );

  // When groups change (library imported / removed), make sure active tab is still valid
  useEffect(() => {
    if (paletteGroups.length === 0) { setActiveGroupId(null); return; }
    if (!paletteGroups.find(g => g.id === activeGroupId)) {
      setActiveGroupId(paletteGroups[0].id);
    }
  }, [paletteGroups, activeGroupId]);

  const activeGroup = paletteGroups.find(g => g.id === activeGroupId) ?? null;

  return (
    <div className={`flex flex-col ${bg.surface} border-b ${border.subtle} shadow-sm shrink-0`}>
      {/* ── Main row ──
          Con poco ancho la fila se desplaza horizontalmente en lugar de
          desbordar o aplastar los botones. */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto">
        {/* Selection tools */}
        <ToolButton large={coarse} title="Seleccionar (V)" active={tool === 'SELECT'} onClick={() => onToolChange('SELECT')}>
          <IconCursor className="w-4 h-4" />
        </ToolButton>
        <ToolButton large={coarse} title="Desplazar (H)" active={tool === 'PAN'} onClick={() => onToolChange('PAN')}>
          <IconHand className="w-4 h-4" />
        </ToolButton>
        <ToolButton large={coarse} title="Dibujar pared (W)" active={tool === 'WALL'} onClick={() => onToolChange('WALL')}>
          <IconWall className="w-4 h-4" />
        </ToolButton>
        <ToolButton large={coarse} title="Colocar elemento (P)" active={tool === 'PLACE'} onClick={() => onToolChange('PLACE')}>
          <IconPlace className="w-4 h-4" />
        </ToolButton>
        <ToolButton large={coarse} title="Borrar (E)" active={tool === 'ERASE'} onClick={() => onToolChange('ERASE')}>
          <IconErase className="w-4 h-4" />
        </ToolButton>

        <Sep hidden={tight} />

        {/* History */}
        <ToolButton large={coarse} title="Deshacer (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>
          <IconUndo className="w-4 h-4" />
        </ToolButton>
        <ToolButton large={coarse} title="Rehacer (Ctrl+Y)" disabled={!canRedo} onClick={onRedo}>
          <IconRedo className="w-4 h-4" />
        </ToolButton>

        <Sep hidden={tight} />

        {/* View */}
        <ToolButton
          title={showGrid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
          active={showGrid}
          onClick={onToggleGrid}
        >
          <IconGrid className="w-4 h-4" />
        </ToolButton>

        <Sep hidden={tight} />

        {/* Zoom */}
        <ToolButton large={coarse} title="Acercar (+)" onClick={onZoomIn}>
          <IconZoomIn className="w-4 h-4" />
        </ToolButton>
        {!tight && (
          <span className={`text-xs ${text.subtle} w-10 text-center tabular-nums select-none shrink-0`}>
            {Math.round(zoom * 100)}%
          </span>
        )}
        <ToolButton large={coarse} title="Alejar (-)" onClick={onZoomOut}>
          <IconZoomOut className="w-4 h-4" />
        </ToolButton>
        <ToolButton large={coarse} title="Ajustar vista al plano (Ctrl+0)" onClick={onResetView}>
          <IconReset className="w-4 h-4" />
        </ToolButton>

        <Sep hidden={tight} />

        {/* Map export / import */}
        <ToolButton large={coarse} title="Exportar mapa JSON" onClick={() => onExportMap?.()}>
          <IconDownload className="w-4 h-4" />
        </ToolButton>
        <ToolButton large={coarse} title="Importar mapa JSON" onClick={() => onImportMap?.()}>
          <IconUpload className="w-4 h-4" />
        </ToolButton>

        {/* Element library import */}
        <ToolButton large={coarse} title="Cargar librería de elementos (.json)" onClick={() => onLoadLibrary?.()}>
          <IconLayers className="w-4 h-4" />
        </ToolButton>

        {areaShape !== undefined && (
          <>
            <Sep hidden={tight} />
            <ToolButton large={coarse} title={areaShape === 'polygon' ? 'Cambiar a rectángulo' : 'Cambiar a polígono'} onClick={() => onToggleAreaShape?.()}>
              <span className="text-xs font-medium">{areaShape === 'polygon' ? 'Poly' : 'Rect'}</span>
            </ToolButton>
          </>
        )}
      </div>

      {/* ── Element palette (only when PLACE is active and there are groups) ── */}
      {tool === 'PLACE' && paletteGroups.length > 0 && (
        <div className={`flex flex-col border-t ${border.subtle}`}>
          {/* Tab bar — one tab per group */}
          <div className={`flex items-end gap-0 overflow-x-auto ${bg.surfaceMuted} border-b ${border.subtle} px-2 pt-1`}>
            {paletteGroups.map(group => (
              <div
                key={group.id}
                className={cn(
                  `flex items-center shrink-0 rounded-t border-x border-t ${motion.colors}`,
                  group.id === activeGroupId
                    ? `${bg.surface} ${border.subtle} -mb-px`
                    : `${bg.surfaceMuted} border-transparent`,
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveGroupId(group.id)}
                  className={cn(
                    'cursor-pointer', `px-3 py-1 text-xs font-medium ${motion.colors} whitespace-nowrap rounded-t`,
                    FOCUS_CLS,
                    group.id === activeGroupId
                      ? `${text.base}`
                      : `${text.faint} ${textHover.muted}`,
                  )}
                >
                  {group.name || 'Sin nombre'}
                </button>
                {!group.isBase && onRemoveLibraryGroup && (
                  <button
                    type="button"
                    title={`Eliminar "${group.name}"`}
                    aria-label={`Eliminar librería ${group.name}`}
                    onClick={() => onRemoveLibraryGroup(group.id)}
                    className={`cursor-pointer pr-2 pl-0.5 py-1 rounded ${text.faint} ${textHover.danger} ${motion.colors} leading-none ${FOCUS_CLS}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Active group chips */}
          {activeGroup && (
            <div
              className={cn(
                `flex items-center gap-1 px-2 py-1.5 ${bg.surface} min-h-[36px]`,
                // En compacto la paleta no se envuelve (comería el lienzo):
                // se desplaza en una sola fila.
                compact ? 'flex-nowrap overflow-x-auto' : 'flex-wrap',
              )}
            >
              {activeGroup.types.map(typeDef => (
                <TypeChip
                  key={typeDef.id}
                  typeDef={typeDef}
                  active={activePlaceTypeId === typeDef.id}
                  onClick={() => onActivePlaceTypeChange(typeDef.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
