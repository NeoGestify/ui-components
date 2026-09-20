export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { TextArea, type TextAreaProps } from './TextArea';
export { Form, type FormProps } from './Form';
export { Select, type SelectProps, type SelectOption, type Option } from './Select';
export { Table, type TableProps, type ColumnDef, type SortState } from './Table';
export { DataTable, compareValues, type DataTableProps, type DataColumn } from './DataTable';
export { Modal, type ModalProps, type ModalRef } from './Modal';
export { Field, useFieldIds, describedBy, type FieldProps, type FieldIds } from './Field';
export { Drawer, type DrawerProps, type DrawerRef, type DrawerSide } from './Drawer';
export { Loading, type LoadingProps } from './Loading';

// ─── Presentación ───────────────────────────────────────────────────────────
export {
  Card, CardHeader, CardBody, CardFooter,
  type CardProps, type CardHeaderProps, type CardSectionProps,
} from './Card';
export { Avatar, AvatarGroup, initialsOf, type AvatarProps, type AvatarGroupProps } from './Avatar';
export { Badge, type BadgeProps } from './Badge';
export { Skeleton, SkeletonText, type SkeletonProps, type SkeletonTextProps } from './Skeleton';
export { Alert, type AlertProps } from './Alert';
export { Progress, type ProgressProps, type ProgressMark } from './Progress';
export {
  Divider, EmptyState, Stat, Kbd,
  type DividerProps, type EmptyStateProps, type StatProps, type KbdProps,
} from './Layout';

// ─── Navegación y estructura ────────────────────────────────────────────────
export { Accordion, type AccordionProps, type AccordionItem } from './Accordion';
export { Tabs, type TabsProps, type TabItem } from './Tabs';
export { Breadcrumb, type BreadcrumbProps, type BreadcrumbItem } from './Breadcrumb';
export { Pagination, pageRange, type PaginationProps } from './Pagination';
export { Collapsible, CollapsibleRegion, type CollapsibleProps, type CollapsibleRegionProps } from './Collapsible';
export { Stepper, type StepperProps, type StepItem } from './Stepper';
export { Timeline, type TimelineProps, type TimelineItem } from './Timeline';
export { Tree, type TreeProps, type TreeNode } from './Tree';
export { ScrollArea, type ScrollAreaProps } from './ScrollArea';

// ─── Controles ──────────────────────────────────────────────────────────────
export { Switch, type SwitchProps } from './Switch';
export { Checkbox, CheckboxBox, type CheckboxProps, type CheckboxBoxProps, type CheckboxSize } from './Checkbox';
export { Radio, RadioDot, type RadioProps, type RadioDotProps, type RadioSize } from './Radio';
export {
  NumberInput, decimalsOf, parseNumber, clampToStep, type NumberInputProps,
} from './NumberInput';
export { Slider, type SliderProps } from './Slider';
export { TagInput, type TagInputProps } from './TagInput';
export { Rating, type RatingProps } from './Rating';
export {
  FileDropzone, acceptsFile, formatBytes,
  type FileDropzoneProps, type RejectedFile, type RejectReason,
} from './FileDropzone';
export {
  ToggleGroup,
  type ToggleGroupProps, type ToggleGroupSingleProps, type ToggleGroupMultipleProps, type ToggleOption,
} from './ToggleGroup';
export { RadioGroup, type RadioGroupProps, type RadioOption } from './RadioGroup';
export { CheckboxGroup, type CheckboxGroupProps, type CheckboxOption } from './CheckboxGroup';
export { SegmentedControl, type SegmentedControlProps, type SegmentedOption } from './SegmentedControl';
export {
  Combobox,
  type ComboboxProps, type ComboboxMultipleProps, type ComboboxOption,
} from './Combobox';
export { Tooltip, type TooltipProps } from './Tooltip';

// ─── Capas flotantes ────────────────────────────────────────────────────────
export { Popover, type PopoverProps } from './Popover';
export { Dropdown, type DropdownProps, type DropdownItem } from './Dropdown';
export {
  ToastProvider, useToast,
  type ToastProviderProps, type ToastOptions, type ToastVariant, type ToastPosition,
} from './Toast';
export {
  CommandPalette, matchesQuery, normalize,
  type CommandPaletteProps, type CommandItem,
} from './CommandPalette';

// ─── Tipos compartidos ──────────────────────────────────────────────────────
export {
  toOptions, optionText,
  type NuiOption, type NuiOptionValue, type OptionsInput,
} from '../../internal/options';
export type { Placement, Side, Align } from '../../internal/position';
