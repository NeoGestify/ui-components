import { VenueMapEditor } from './VenueMapEditor';
import type { VenueMapViewerProps } from './types';

export function VenueMapViewer({ elementStatus, onElementClick, ...rest }: VenueMapViewerProps) {
  return (
    <VenueMapEditor
      {...rest}
      fixed={true}
      elementStatus={elementStatus}
      onElementClick={onElementClick}
    />
  );
}
