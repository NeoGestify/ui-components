export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { TextArea, type TextAreaProps } from './TextArea';
export { Form, type FormProps } from './Form';
export { Select, type SelectProps, type SelectOption, type Option } from './Select';
export { Table, type TableProps, type ColumnDef, type SortState } from './Table';
export { Modal, type ModalProps, type ModalRef } from './Modal';
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
export { Progress, type ProgressProps } from './Progress';
export {
  Divider, EmptyState, Stat, Kbd,
  type DividerProps, type EmptyStateProps, type StatProps, type KbdProps,
} from './Layout';

// ─── Navegación y estructura ────────────────────────────────────────────────
export { Accordion, type AccordionProps, type AccordionItem } from './Accordion';
export { Tabs, type TabsProps, type TabItem } from './Tabs';
export { Breadcrumb, type BreadcrumbProps, type BreadcrumbItem } from './Breadcrumb';
export { Pagination, pageRange, type PaginationProps } from './Pagination';

// ─── Controles ──────────────────────────────────────────────────────────────
export { Switch, type SwitchProps } from './Switch';
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
export type { Placement, Side, Align } from '../../internal/position';
