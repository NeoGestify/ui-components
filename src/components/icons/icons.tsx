import type { Props } from "../../types/types";
import { cn } from '../../internal/cn';

// Spinner de carga animado
export function SpinnerIcon({ className = "" }: { className?: string }) {
    return (
        <svg className={cn('animate-spin h-8 w-8 text-[color:var(--nui-accent,oklch(51.1%_.262_276.966))] dark:text-[color:var(--nui-accent-dark,oklch(58.5%_.233_277.117))] mx-auto mb-4', className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
    );
}

export function AnimateSpin({ className }: Props) {
    return (
        <svg
            className={cn('animate-spin', className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    )
}
export function GearIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
}

export function CheckIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
}

export function BackIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    )
}

export function NotFoundIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    )
}

export function BoxIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    )
}

export function ChartIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
        </svg>
    )
}

export function UsersIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2a5 5 0 1 0 5 5a5 5 0 0 0-5-5m0 8a3 3 0 1 1 3-3a3 3 0 0 1-3 3m9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z" />
        </svg>
    )
}

export function DocumentIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    )
}

export function LogoutIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </svg>
    )
}

export function HomeIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
        </svg>
    )
}

export function BuildingIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
        </svg>
    )
}

export function CashIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>
    )
}

export function MenuIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
            />
        </svg>
    )
}

export function CloseIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    )
}

export function AddIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    )
}

export function SearchIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
        </svg>
    )
}

export function SaveIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
        </svg>
    )
}

export function CancelIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path strokeDasharray="60" d="M5.64 5.64c3.51 -3.51 9.21 -3.51 12.73 0c3.51 3.51 3.51 9.21 0 12.73c-3.51 3.51 -9.21 3.51 -12.73 0c-3.51 -3.51 -3.51 -9.21 -0 -12.73Z">
                    <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="60;0" />
                </path>
                <path strokeDasharray="20" strokeDashoffset="20" d="M6 6l12 12">
                    <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.3s" to="0" />
                </path>
            </g>
        </svg>
    )
}

export function DeleteIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
        </svg>
    )
}

export function EditIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
        </svg>
    )
}

export function CategorieIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path fill="currentColor" d="M11.15 3.4L7.43 9.48c-.41.66.07 1.52.85 1.52h7.43c.78 0 1.26-.86.85-1.52L12.85 3.4a.993.993 0 0 0-1.7 0" /><circle cx="17.5" cy="17.5" r="4.5" fill="currentColor" /><path fill="currentColor" d="M4 21.5h6c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1" /></svg>
    )
}

export function FolderIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
        </svg>
    )
}

export function ArrowIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path fill="currentColor" d="M17.77 3.77L16 2L6 12l10 10l1.77-1.77L9.54 12z" /></svg>
    )
}

export function FilterIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.36 20.213L9 21v-8.5L4.52 7.572A2 2 0 0 1 4 6.227V4h16v2.172a2 2 0 0 1-.586 1.414L15 12m0 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0m5.2 2.2L22 22" /></svg>
    )
}

export function QuestionIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z" /><g fill="none"><path d="m12.593 23.258-.011.002-.071.035-.02.004-.014-.004-.071-.035q-.016-.005-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093q.019.005.029-.008l.004-.014-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" /><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16m0 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0-9.5a3.625 3.625 0 0 1 1.348 6.99.8.8 0 0 0-.305.201c-.044.05-.051.114-.05.18L13 14a1 1 0 0 1-1.993.117L11 14v-.25c0-1.153.93-1.845 1.604-2.116a1.626 1.626 0 1 0-2.229-1.509 1 1 0 1 1-2 0A3.625 3.625 0 0 1 12 6.5" /></g></svg>
    )
}

export function LocationIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
}

export function CalendarIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    )
}

export function InfoIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32"><path fill="none" d="M0 0h32v32H0z" /><path fill="currentColor" d="M17 22v-8h-4v2h2v6h-3v2h8v-2zM16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8" /><path fill="currentColor" d="M16 30a14 14 0 1 1 14-14 14 14 0 0 1-14 14m0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4" /></svg>
    )
}

export function MoonIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    )
}

export function SunIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    )
}

export function CamaraIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
                <circle cx="12" cy="13" r="3" />
            </g>
        </svg>
    )
}

export function ArrowLeftIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    )
}

export function ArrowRightIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    )
}

export function TrashIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    )
}

export function MinusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
    );
}

export function MoneyIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

export function PercentIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    )
}

export function StackIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v18M17 3v18" />
        </svg>
    )
}

export function ClockIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

export function CheckCircleIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 1024 1024"><path fill="none" d="M0 0h1024v1024H0z" /><path fill="currentColor" d="M512 0C229.232 0 0 229.232 0 512c0 282.784 229.232 512 512 512 282.784 0 512-229.216 512-512C1024 229.232 794.784 0 512 0m0 961.008c-247.024 0-448-201.984-448-449.01 0-247.024 200.976-448 448-448s448 200.977 448 448-200.976 449.01-448 449.01m204.336-636.352L415.935 626.944l-135.28-135.28c-12.496-12.496-32.752-12.496-45.264 0-12.496 12.496-12.496 32.752 0 45.248l158.384 158.4c12.496 12.48 32.752 12.48 45.264 0 1.44-1.44 2.673-3.009 3.793-4.64l318.784-320.753c12.48-12.496 12.48-32.752 0-45.263-12.512-12.496-32.768-12.496-45.28 0" /></svg>
    )
}

export function CajasIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    )
}

export function PrinterIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z" /><path fill="currentColor" d="M19 7h-1V2H6v5H5c-1.65 0-3 1.35-3 3v7c0 1.1.9 2 2 2h2v3h12v-3h2c1.1 0 2-.9 2-2v-7c0-1.65-1.35-3-3-3M8 4h8v3H8zm8 16H8v-4h8zm4-3h-2v-3H6v3H4v-7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1z" /><path fill="currentColor" d="M14 11h4v1h-4z" /></svg>
    )
}

export function NetworkIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <rect width="6" height="6" x="16" y="16" rx="1" />
                <rect width="6" height="6" x="2" y="16" rx="1" />
                <rect width="6" height="6" x="9" y="2" rx="1" />
                <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8" />
            </g>
        </svg>
    )
}

export function TestIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
    )
}

export function FacturacionIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z" /><path fill="currentColor" d="M9.5 10.5H12a1 1 0 0 0 0-2h-1V8a1 1 0 0 0-2 0v.55a2.5 2.5 0 0 0 .5 4.95h1a.5.5 0 0 1 0 1H8a1 1 0 0 0 0 2h1v.5a1 1 0 0 0 2 0v-.55a2.5 2.5 0 0 0-.5-4.95h-1a.5.5 0 0 1 0-1M21 12h-3V3a1 1 0 0 0-.5-.87 1 1 0 0 0-1 0l-3 1.72-3-1.72a1 1 0 0 0-1 0l-3 1.72-3-1.72a1 1 0 0 0-1 0A1 1 0 0 0 2 3v16a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1M5 20a1 1 0 0 1-1-1V4.73l2 1.14a1.08 1.08 0 0 0 1 0l3-1.72 3 1.72a1.08 1.08 0 0 0 1 0l2-1.14V19a3 3 0 0 0 .18 1Zm15-1a1 1 0 0 1-2 0v-5h2Z" /></svg>
    )
}

export function WhatsAppIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52s.198-.298.298-.497c.099-.198.05-.371-.025-.52s-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074s2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413s.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.478-8.413" /></svg>
    )
}

export function ArchiveIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    )
}

export function CopyIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    )
}

export function PasteIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M20 10h-2V5c0-1.1-.9-2-2-2h-2c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h6v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2m-10 2v4H4V5h2v2h8V5h2v5h-4c-1.1 0-2 .9-2 2m10 8h-8v-8h8z" />
        </svg>
    )
}

export function RestaurantMenuIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path fill="currentColor" d="M6 22q-.825 0-1.412-.587T4 20v-2q-.425 0-.712-.288T3 17t.288-.712T4 16v-3q-.425 0-.712-.288T3 12t.288-.712T4 11V8q-.425 0-.712-.288T3 7t.288-.712T4 6V4q0-.825.588-1.412T6 2h12q.825 0 1.413.588T20 4v16q0 .825-.587 1.413T18 22zm0-2h12V4H6v2q.425 0 .713.288T7 7t-.288.713T6 8v3q.425 0 .713.288T7 12t-.288.713T6 13v3q.425 0 .713.288T7 17t-.288.713T6 18zm3.5-7v3.25q0 .325.213.538t.537.212.538-.213.212-.537V13q.65-.175 1.075-.712t.425-1.213V7.5q0-.2-.15-.35T12 7t-.35.15-.15.35v3.275h-.75V7.5q0-.2-.15-.35T10.25 7t-.35.15-.15.35v3.275H9V7.5q0-.2-.15-.35T8.5 7t-.35.15T8 7.5v3.575q0 .675.425 1.213T9.5 13m5.5 0v3.25q0 .325.213.538t.537.212.538-.213.212-.537V7.575q0-.275-.187-.425T15.825 7q-.325 0-.712.175t-.738.525q-.425.425-.65.963T13.5 9.825V12q0 .425.288.713T14.5 13zm-9 7V4z" /></svg>
    )
}

export function CloudIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z" /><path fill="currentColor" d="m19.21 12.04-1.53-.11-.3-1.5A5.484 5.484 0 0 0 12 6C9.94 6 8.08 7.14 7.12 8.96l-.5.95-1.07.11A3.99 3.99 0 0 0 2 14c0 2.21 1.79 4 4 4h13c1.65 0 3-1.35 3-3 0-1.55-1.22-2.86-2.79-2.96" opacity=".3" /><path fill="currentColor" d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96M19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95A5.47 5.47 0 0 1 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11A2.98 2.98 0 0 1 22 15c0 1.65-1.35 3-3 3" /></svg>
    )
}

export function ShieldIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    )
}

export function BarsChartsIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    )
}

export function LightingIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    )
}

export function LifeGuardIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    )
}

export function MonitorIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 18q-.825 0-1.412-.587T2 16V5q0-.825.588-1.412T4 3h16q.825 0 1.413.588T22 5v11q0 .825-.587 1.413T20 18h-3l.7.7q.15.15.225.338t.075.387V20q0 .425-.288.712T17 21H7q-.425 0-.712-.288T6 20v-.575q0-.2.075-.387T6.3 18.7L7 18zm0-2h16V5H4zm0 0V5z" />
        </svg>
    )
}

export function TruckIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    )
}

export function IconCursor({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <path d="M2 1l12 5.5-5.5 1.5L7 13.5 2 1z" />
        </svg>
    );
}

export function IconHand({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 16 16">
            <path d="M0 0h16v16H0z" fill="none" />
            <path fill="currentColor" d="M11 0a1 1 0 0 1 1 1v5.5a.5.5 0 0 0 1 0V3a1 1 0 1 1 2 0v8a4 4 0 0 1-4 4H5.872a.5.5 0 0 1-.167-.03a1.5 1.5 0 0 1-.766-.41l-3.5-3.5a1.5 1.5 0 1 1 2.122-2.12L4 9.378V2a1 1 0 1 1 2 0v3.5a.5.5 0 0 0 1 0V1a1 1 0 1 1 2 0v4.5a.5.5 0 0 0 1 0V1a1 1 0 0 1 1-1" />
        </svg>

    );
}

export function IconGrid({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <path
                fillRule="evenodd"
                d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z"
                clipRule="evenodd"
                opacity={0.7}
            />
        </svg>
    );
}

export function IconZoomIn({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <path d="M6.5 1a5.5 5.5 0 104.39 8.803l3.154 3.153a.75.75 0 001.06-1.06l-3.153-3.154A5.5 5.5 0 006.5 1zM2.5 6.5a4 4 0 118 0 4 4 0 01-8 0zM6 4.75a.75.75 0 011.5 0V6h1.25a.75.75 0 010 1.5H7.5v1.25a.75.75 0 01-1.5 0V7.5H4.75a.75.75 0 010-1.5H6V4.75z" />
        </svg>
    );
}

export function IconZoomOut({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <path d="M6.5 1a5.5 5.5 0 104.39 8.803l3.154 3.153a.75.75 0 001.06-1.06l-3.153-3.154A5.5 5.5 0 006.5 1zM2.5 6.5a4 4 0 118 0 4 4 0 01-8 0zM4.75 6a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" />
        </svg>
    );
}

export function IconReset({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 4a.75.75 0 01.75.75v3.19l1.28 1.28a.75.75 0 01-1.06 1.06l-1.5-1.5A.75.75 0 017.25 8V4.75A.75.75 0 018 4z" />
        </svg>
    );
}

export function IconUndo({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M7 19v-2h7.1q1.575 0 2.738-1T18 13.5T16.838 11T14.1 10H7.8l2.6 2.6L9 14L4 9l5-5l1.4 1.4L7.8 8h6.3q2.425 0 4.163 1.575T20 13.5t-1.737 3.925T14.1 19z" />
        </svg>
    );
}

export function IconRedo({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M9.9 19q-2.425 0-4.163-1.575T4 13.5t1.738-3.925T9.9 8h6.3l-2.6-2.6L15 4l5 5l-5 5l-1.4-1.4l2.6-2.6H9.9q-1.575 0-2.738 1T6 13.5T7.163 16T9.9 17H17v2z" />
        </svg>
    );
}

export function IconPlace({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M5.616 20q-.672 0-1.144-.472T4 18.385v-8.77q0-.67.472-1.143Q4.944 8 5.616 8H8.73v1H5.616q-.27 0-.443.173T5 9.616v8.769q0 .269.173.442t.443.173h12.769q.269 0 .442-.173t.173-.442v-8.77q0-.269-.173-.442T18.385 9h-3.116V8h3.115q.672 0 1.144.472T20 9.616v8.769q0 .67-.472 1.143q-.472.472-1.143.472zM12 15.308L8.692 12l.708-.708l2.1 2.095V1.5h1v11.887l2.1-2.095l.708.708z" />
        </svg>
    );
}

export function IconErase({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" fillRule="evenodd" d="M3.5 12.9a2 2 0 0 0 0 2.828l3.858 3.858H4.086a1 1 0 1 0 0 2h16a1 1 0 0 0 0-2h-9.13l9.515-9.515a2 2 0 0 0 0-2.828L16.228 3a2 2 0 0 0-2.829 0zm4.326-1.498l-2.912 2.912l4.243 4.242l2.911-2.911zM9.24 9.988l4.243 4.243l5.573-5.574l-4.242-4.243z" clipRule="evenodd" />
        </svg>
    );
}

export function IconDuplicate({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 15.5H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9.5a1 1 0 0 1 1 1v1m-6 14H19a1 1 0 0 0 1-1V9.5a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1" />
        </svg>
    );
}

export function IconWall({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            {/* Two parallel lines forming a wall corner — represents wall cross-section */}
            <path strokeWidth="2" d="M3 14 L3 2 L14 2" />
            <path strokeWidth="2" d="M6 14 L6 5 L14 5" />
        </svg>
    );
}

export function IconDownload({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z" />
            <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z" />
        </svg>
    );
}

export function IconUpload({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z" />
            <path d="M7.646 1.146a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L8.5 2.707V11.5a.5.5 0 01-1 0V2.707L5.354 4.854a.5.5 0 11-.708-.708l3-3z" />
        </svg>
    );
}

export function IconPolygon({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeLinejoin="round">
            <path strokeWidth="1.5" d="M8 2 L14 6 L12 13 L4 13 L2 6 Z" />
            <circle cx="8" cy="2" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="14" cy="6" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="13" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="2" cy="6" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function IconLayers({ className }: Props) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="currentColor">
            <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .265 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0l3.515-1.874zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z" />
        </svg>
    );
}

export function ChevronDownIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z" />
        </svg>
    );
}

export function SortAscIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="m19 3l4 5h-3v12h-2V8h-3zm-5 15v2H3v-2zm0-7v2H3v-2zm-2-7v2H3V4z" />
        </svg>
    );
}

export function SortDescIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M20 4v12h3l-4 5l-4-5h3V4zm-8 14v2H3v-2zm2-7v2H3v-2zm0-7v2H3V4z" />
        </svg>
    );
}

export function SortBothIcon({ className }: Props) {
    return (
        <svg viewBox="0 0 12 12" className={className} fill="currentColor" aria-hidden>
            <path d="M6 1.5l3 3.5H3L6 1.5zm0 9l-3-3.5h6L6 10.5z" />
        </svg>
    );
}

export function FingerPrintIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
    );
}

export function PasswordIcon({ className }: Props) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

export function ShareIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M17 22q-1.25 0-2.125-.875T14 19q0-.15.075-.7L7.05 14.2q-.4.375-.925.588T5 15q-1.25 0-2.125-.875T2 12t.875-2.125T5 9q.6 0 1.125.213t.925.587l7.025-4.1q-.05-.175-.062-.337T14 5q0-1.25.875-2.125T17 2t2.125.875T20 5t-.875 2.125T17 8q-.6 0-1.125-.213T14.95 7.2l-7.025 4.1q.05.175.063.338T8 12t-.012.363t-.063.337l7.025 4.1q.4-.375.925-.587T17 16q1.25 0 2.125.875T20 19t-.875 2.125T17 22m0-2q.425 0 .713-.287T18 19t-.288-.712T17 18t-.712.288T16 19t.288.713T17 20M5 13q.425 0 .713-.288T6 12t-.288-.712T5 11t-.712.288T4 12t.288.713T5 13m12.713-7.288Q18 5.426 18 5t-.288-.712T17 4t-.712.288T16 5t.288.713T17 6t.713-.288M17 5" />
        </svg>
    );
}

export function QRIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M3 10V4q0-.425.288-.712T4 3h6q.425 0 .713.288T11 4v6q0 .425-.288.713T10 11H4q-.425 0-.712-.288T3 10m2-1h4V5H5zM3 20v-6q0-.425.288-.712T4 13h6q.425 0 .713.288T11 14v6q0 .425-.288.713T10 21H4q-.425 0-.712-.288T3 20m2-1h4v-4H5zm8-9V4q0-.425.288-.712T14 3h6q.425 0 .713.288T21 4v6q0 .425-.288.713T20 11h-6q-.425 0-.712-.288T13 10m2-1h4V5h-4zm4 12v-2h2v2zm-6-6v-2h2v2zm2 2v-2h2v2zm-2 2v-2h2v2zm2 2v-2h2v2zm2-2v-2h2v2zm0-4v-2h2v2zm2 2v-2h2v2z" />
        </svg>
    )
}

export function ClaudeIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M21 10.5h3v3h-3v3h-1.5v3H18v-3h-1.5v3H15v-3H9v3H7.5v-3H6v3H4.5v-3H3v-3H0v-3h3v-6h18Zm-15 0h1.5v-3H6Zm10.5 0H18v-3h-1.5z" />
        </svg>

    );
}

export function GeminiIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 32 32"><path fill="none" d="M0 0h32v32H0z" /><defs><path id="SVG8iAahc8M" fill="#fff" d="M57.067 28.61q-7.396-3.184-12.945-8.732-5.547-5.546-8.732-12.944a38.4 38.4 0 0 1-1.97-5.824A1.464 1.464 0 0 0 32 .001c-.671 0-1.255.458-1.419 1.11a38.4 38.4 0 0 1-1.971 5.823q-3.186 7.397-8.732 12.944-5.548 5.548-12.945 8.732a38.4 38.4 0 0 1-5.824 1.972A1.464 1.464 0 0 0 0 32c0 .67.458 1.255 1.11 1.418a38.4 38.4 0 0 1 5.823 1.972q7.396 3.184 12.945 8.732 5.55 5.546 8.732 12.944a38.4 38.4 0 0 1 1.971 5.824c.164.65.749 1.11 1.419 1.11s1.255-.458 1.419-1.11a38.4 38.4 0 0 1 1.971-5.823q3.185-7.395 8.732-12.944 5.548-5.548 12.945-8.732a38.4 38.4 0 0 1 5.824-1.972A1.464 1.464 0 0 0 64 32.001c0-.672-.458-1.255-1.11-1.42a38.4 38.4 0 0 1-5.823-1.97" /></defs><g fill="none"><g mask="url(#SVGrwDDMAfw)" transform="translate(2 2)scale(.4375)"><use href="#SVG8iAahc8M" /><g filter="url(#SVG4022te6D)"><ellipse cx="14.208" cy="16.716" fill="#ffe432" rx="14.208" ry="16.716" transform="rotate(19.552 -43.96 -16.268)" /></g><g filter="url(#SVGfWehPcwe)"><ellipse cx="27.054" cy="2.551" fill="#fc413d" rx="18.394" ry="18.799" /></g><g filter="url(#SVGOVrG7dor)"><ellipse cx="19.224" cy="24.904" fill="#00b95c" rx="19.224" ry="24.904" transform="rotate(-2.799 667.58 51.694)" /></g><g filter="url(#SVGOVrG7dor)"><ellipse cx="18.843" cy="20.744" fill="#00b95c" rx="18.843" ry="20.744" transform="rotate(-31.317 81.174 36.482)" /></g><g filter="url(#SVGZfuD4bKL)"><ellipse cx="66.462" cy="24.977" fill="#3186ff" rx="18.093" ry="17.423" /></g><g filter="url(#SVGZWZ8re1E)"><ellipse cx="20.929" cy="22.075" fill="#fbbc04" rx="20.929" ry="22.075" transform="rotate(37.251 9.618 -7.898)" /></g><g filter="url(#SVG5frwbcHz)"><ellipse cx="24.131" cy="22.292" fill="#3186ff" rx="24.131" ry="22.292" transform="rotate(34.51 19.317 63.957)" /></g><g filter="url(#SVGQLeO6cNv)"><path fill="#749bff" d="M54.226-2.304c2.794 3.799-.797 11.184-8.02 16.497-7.222 5.312-15.342 6.539-18.136 2.74S28.866 5.75 36.09.436c7.223-5.312 15.343-6.539 18.136-2.74" /></g><g filter="url(#SVG0Tg9pchZ)"><ellipse cx="27.585" cy="17.148" fill="#fc413d" rx="27.585" ry="17.148" transform="rotate(-42.847 5.973 20.37)" /></g><g filter="url(#SVG2faIRbvE)"><ellipse cx="14.782" cy="8.596" fill="#ffee48" rx="14.782" ry="8.596" transform="rotate(35.592 -44.338 25.191)" /></g></g><defs><filter id="SVG4022te6D" width="38.868" height="42.756" x="-19.618" y="12.903" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="2.46" /></filter><filter id="SVGfWehPcwe" width="84.353" height="85.162" x="-15.122" y="-40.03" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="11.891" /></filter><filter id="SVGOVrG7dor" width="78.916" height="90.22" x="-20.768" y="11.483" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="10.109" /></filter><filter id="SVGZfuD4bKL" width="74.611" height="73.27" x="29.156" y="-11.658" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="9.606" /></filter><filter id="SVGZWZ8re1E" width="77.538" height="78.151" x="-38.291" y="-16.269" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="8.706" /></filter><filter id="SVG5frwbcHz" width="78.218" height="76.898" x="7.78" y="-6.098" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="7.775" /></filter><filter id="SVGQLeO6cNv" width="55.879" height="51.479" x="13.208" y="-18.425" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="6.957" /></filter><filter id="SVG0Tg9pchZ" width="70.203" height="68.674" x="-15.474" y="-31.027" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="5.876" /></filter><filter id="SVG2faIRbvE" width="55.137" height="51.261" x="-14.173" y="20.474" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="7.273" /></filter><mask id="SVGrwDDMAfw" width="64" height="64" x="0" y="0" maskUnits="userSpaceOnUse"><use href="#SVG8iAahc8M" /></mask></defs></g></svg>
    );
}

export function OpenAIIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.1 13.3L8 16.8l-4.2-2.6A4 4 0 0 1 6 6.7m6 7.8L6 11V6a4 4 0 0 1 7.6-2m-3.7 9.3V6.2l4.4-2.6a4 4 0 0 1 5.3 5.8m-9.7 1.3L16 7.2l4.2 2.6a4 4 0 0 1-2.2 7.5m-6-7.8l6 3.5v5a4 4 0 0 1-7.6 2m3.7-9.3v7.1l-4.4 2.6a4 4 0 0 1-5.3-5.8" />
        </svg>

    );
}

export function AnthropicIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M16.765 5h-3.308l5.923 15h3.23zM7.226 5L1.38 20h3.308l1.307-3.154h6.154l1.23 3.077h3.309L10.688 5zm-.308 9.077l2-5.308l2.077 5.308z" />
        </svg>
    );
}

export function bashIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path d="m7 7l1.227 1.057C8.742 8.502 9 8.724 9 9s-.258.498-.773.943L7 11m4 0h3" />
                <path d="M12 21c3.75 0 5.625 0 6.939-.955a5 5 0 0 0 1.106-1.106C21 17.625 21 15.749 21 12s0-5.625-.955-6.939a5 5 0 0 0-1.106-1.106C17.625 3 15.749 3 12 3s-5.625 0-6.939.955A5 5 0 0 0 3.955 5.06C3 6.375 3 8.251 3 12s0 5.625.955 6.939a5 5 0 0 0 1.106 1.106C6.375 21 8.251 21 12 21" />
            </g>
        </svg>
    );
}

export function GoogleIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 16 16">
            <path d="M0 0h16v16H0z" fill="none" />
            <g fill="none" fillRule="evenodd" clipRule="evenodd">
                <path fill="#f44336" d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86" opacity=".987" />
                <path fill="#ffc107" d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92" opacity=".997" />
                <path fill="#448aff" d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49" opacity=".999" />
                <path fill="#43a047" d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z" opacity=".993" />
            </g>
        </svg>
    )
}

export function ChevronLeftIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z" />
        </svg>
    );
}

export function ChevronRightIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
    );
}

export function ChevronUpIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" />
        </svg>
    );
}

/** Persona única. `UsersIcon` es la versión en grupo. */
export function UserIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10m0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5" />
        </svg>
    );
}

/** Triángulo de advertencia. */
export function WarningIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 5.99L19.53 19H4.47zM12 2L1 21h22z" />
            <path fill="currentColor" d="M13 16h-2v2h2zm0-6h-2v5h2z" />
        </svg>
    );
}

/** Círculo con exclamación: error o incidencia. */
export function ErrorIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20m0 18a8 8 0 1 1 0-16a8 8 0 0 1 0 16" />
            <path fill="currentColor" d="M11 7h2v6h-2zm0 8h2v2h-2z" />
        </svg>
    );
}

/** Barra inclinada: separador de rutas de navegación. */
export function SlashIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" d="M9 18L15 6" />
        </svg>
    );
}

/** Aro de carga: arco de 3/4 sobre una pista tenue. */
export function RingSpinnerIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}

/** Aro de carga con un cuarto de arco: más discreto que `RingSpinnerIcon`. */
export function QuarterSpinnerIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}

export function AndroidIcon({ className }: Props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 1408 1664"><path fill="none" d="M0 0h1408v1664H0z" /><path fill="currentColor" d="M493 355q16 0 27.5-11.5T532 316t-11.5-27.5T493 277t-27 11.5-11 27.5 11 27.5 27 11.5m422 0q16 0 27-11.5t11-27.5-11-27.5-27-11.5-27.5 11.5T876 316t11.5 27.5T915 355M103 539q42 0 72 30t30 72v430q0 43-29.5 73t-72.5 30-73-30-30-73V641q0-42 30-72t73-30m1060 19v666q0 46-32 78t-77 32h-75v227q0 43-30 73t-73 30-73-30-30-73v-227H635v227q0 43-30 73t-73 30q-42 0-72-30t-30-73l-1-227h-74q-46 0-78-32t-32-78V558zM931 153q107 55 171 153.5t64 215.5H241q0-117 64-215.5T477 153L406 22q-7-13 5-20 13-6 20 6l72 132q95-42 201-42t201 42L977 8q7-12 20-6 12 7 5 20zm477 488v430q0 43-30 73t-73 30q-42 0-72-30t-30-73V641q0-43 30-72.5t72-29.5q43 0 73 29.5t30 72.5" /></svg>
    )
}

export function AppleIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="none" d="M0 0h1024v1024H0z" /><path fill="currentColor" d="M747.4 535.7c-.4-68.2 30.5-119.6 92.9-157.5-34.9-50-87.7-77.5-157.3-82.8-65.9-5.2-138 38.4-164.4 38.4-27.9 0-91.7-36.6-141.9-36.6C273.1 298.8 163 379.8 163 544.6c0 48.7 8.9 99 26.7 150.8 23.8 68.2 109.6 235.3 199.1 232.6 46.8-1.1 79.9-33.2 140.8-33.2 59.1 0 89.7 33.2 141.9 33.2 90.3-1.3 167.9-153.2 190.5-221.6-121.1-57.1-114.6-167.2-114.6-170.7m-105.1-305c50.7-60.2 46.1-115 44.6-134.7-44.8 2.6-96.6 30.5-126.1 64.8-32.5 36.8-51.6 82.3-47.5 133.6 48.4 3.7 92.6-21.2 129-63.7" /></svg>

    );
}

export function LinuxIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="none" d="M0 0h16v16H0z" /><g fill="currentColor"><path d="M8.996 4.497c.104-.076.1-.168.186-.158s.022.102-.098.207c-.12.104-.308.243-.46.323-.291.152-.631.336-.993.336s-.647-.167-.853-.33c-.102-.082-.186-.162-.248-.221-.11-.086-.096-.207-.052-.204.075.01.087.109.134.153.064.06.144.137.241.214.195.154.454.304.778.304s.702-.19.932-.32c.13-.073.297-.204.433-.304M7.34 3.781c.055-.02.123-.031.174-.003.011.006.024.021.02.034-.012.038-.074.032-.11.05-.032.017-.057.052-.093.054-.034 0-.086-.012-.09-.046-.007-.044.058-.072.1-.089m.581-.003c.05-.028.119-.018.173.003.041.017.106.045.1.09-.004.033-.057.046-.09.045-.036-.002-.062-.037-.093-.053-.036-.019-.098-.013-.11-.051-.004-.013.008-.028.02-.034" /><path fillRule="evenodd" d="M8.446.019c2.521.003 2.38 2.66 2.364 4.093-.01.939.509 1.574 1.04 2.244.474.56 1.095 1.38 1.45 2.32.29.765.402 1.613.115 2.465a.8.8 0 0 1 .254.152l.001.002c.207.175.271.447.329.698.058.252.112.488.224.615.344.382.494.667.48.922-.015.254-.203.43-.435.57-.465.28-1.164.491-1.586 1.002-.443.527-.99.83-1.505.871a1.25 1.25 0 0 1-1.256-.716v-.001a1 1 0 0 1-.078-.21c-.67.038-1.252-.165-1.718-.128-.687.038-1.116.204-1.506.206-.151.331-.445.547-.808.63-.5.114-1.126 0-1.743-.324-.577-.306-1.31-.278-1.85-.39-.27-.057-.51-.157-.626-.384-.116-.226-.095-.538.07-.988.051-.16.012-.398-.026-.648a2.5 2.5 0 0 1-.037-.369c0-.133.022-.265.087-.386v-.002c.14-.266.368-.377.577-.451s.397-.125.53-.258c.143-.15.27-.374.443-.56q.036-.037.073-.07c-.081-.538.007-1.105.192-1.662.393-1.18 1.223-2.314 1.811-3.014.502-.713.65-1.287.701-2.016.042-.997-.705-3.974 2.112-4.2q.168-.015.321-.013m2.596 10.866-.03.016c-.223.121-.348.337-.427.656-.08.32-.107.733-.13 1.206v.001c-.023.37-.192.824-.31 1.267s-.176.862-.036 1.128v.002c.226.452.608.636 1.051.601s.947-.304 1.36-.795c.474-.576 1.218-.796 1.638-1.05.21-.126.324-.242.333-.4.009-.157-.097-.403-.425-.767-.17-.192-.217-.462-.274-.71-.056-.247-.122-.468-.26-.585l-.001-.001c-.18-.157-.356-.17-.565-.164q-.069.001-.14.005c-.239.275-.805.612-1.197.508-.359-.09-.562-.508-.587-.918m-7.204.03H3.83c-.189.002-.314.09-.44.225-.149.158-.276.382-.445.56v.002h-.002c-.183.184-.414.239-.61.31-.195.069-.353.143-.46.35v.002c-.085.155-.066.378-.029.624.038.245.096.507.018.746v.002l-.001.002c-.157.427-.155.678-.082.822.074.143.235.22.48.272.493.103 1.26.069 1.906.41.583.305 1.168.404 1.598.305.431-.098.712-.369.75-.867v-.002c.029-.292-.195-.673-.485-1.052-.29-.38-.633-.752-.795-1.09v-.002l-.61-1.11c-.21-.286-.43-.462-.68-.5a1 1 0 0 0-.106-.008M9.584 4.85c-.14.2-.386.37-.695.467-.147.048-.302.17-.495.28a1.3 1.3 0 0 1-.74.19.97.97 0 0 1-.582-.227c-.14-.113-.25-.237-.394-.322a3 3 0 0 1-.192-.126c-.063 1.179-.85 2.658-1.226 3.511a5.4 5.4 0 0 0-.43 1.917c-.68-.906-.184-2.066.081-2.568.297-.55.343-.701.27-.649-.266.436-.685 1.13-.848 1.844-.085.372-.1.749.01 1.097.11.349.345.67.766.931.573.351.963.703 1.193 1.015s.302.584.23.777a.4.4 0 0 1-.212.22.7.7 0 0 1-.307.056l.184.235c.094.124.186.249.266.375 1.179.805 2.567.496 3.568-.218.1-.342.197-.664.212-.903.024-.474.05-.896.136-1.245s.244-.634.53-.791a1 1 0 0 1 .138-.061q.005-.045.013-.087c.082-.546.569-.572 1.18-.303.588.266.81.499.71.814h.13c.122-.398-.133-.69-.822-1.025l-.137-.06a2.35 2.35 0 0 0-.012-1.113c-.188-.79-.704-1.49-1.098-1.838-.072-.003-.065.06.081.203.363.333 1.156 1.532.727 2.644a1.2 1.2 0 0 0-.342-.043c-.164-.907-.543-1.66-.735-2.014-.359-.668-.918-2.036-1.158-2.983M7.72 3.503a1 1 0 0 0-.312.053c-.268.093-.447.286-.559.391-.022.021-.05.04-.119.091s-.172.126-.321.238q-.198.151-.13.38c.046.15.192.325.459.476.166.098.28.23.41.334a1 1 0 0 0 .215.133.9.9 0 0 0 .298.066c.282.017.49-.068.673-.173s.34-.233.518-.29c.365-.115.627-.345.709-.564a.37.37 0 0 0-.01-.309c-.048-.096-.148-.187-.318-.257h-.001c-.354-.151-.507-.162-.705-.29-.321-.207-.587-.28-.807-.279m-.89-1.122h-.025a.4.4 0 0 0-.278.135.76.76 0 0 0-.191.334 1.2 1.2 0 0 0-.051.445v.001c.01.162.041.299.102.436.05.116.109.204.183.274l.089-.065.117-.09-.023-.018a.4.4 0 0 1-.11-.161.7.7 0 0 1-.054-.22v-.01a.7.7 0 0 1 .014-.234.4.4 0 0 1 .08-.179q.056-.069.126-.073h.013a.18.18 0 0 1 .123.05c.045.04.08.09.11.162a.7.7 0 0 1 .054.22v.01a.7.7 0 0 1-.002.17 1.1 1.1 0 0 1 .317-.143 1.3 1.3 0 0 0 .002-.194V3.23a1.2 1.2 0 0 0-.102-.437.8.8 0 0 0-.227-.31.4.4 0 0 0-.268-.102m1.95-.155a.63.63 0 0 0-.394.14.9.9 0 0 0-.287.376 1.2 1.2 0 0 0-.1.51v.015q0 .079.01.152c.114.027.278.074.406.138a1 1 0 0 1-.011-.172.8.8 0 0 1 .058-.278.5.5 0 0 1 .139-.2.26.26 0 0 1 .182-.069.26.26 0 0 1 .178.081c.055.054.094.12.124.21.029.086.042.17.04.27l-.002.012a.8.8 0 0 1-.057.277c-.024.059-.089.106-.122.145.046.016.09.03.146.052a5 5 0 0 1 .248.102 1.2 1.2 0 0 0 .244-.763 1.2 1.2 0 0 0-.11-.495.9.9 0 0 0-.294-.37.64.64 0 0 0-.39-.133z" /></g></svg>
    );
}

export function LinuxAltIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 295"><path fill="none" d="M0 0h256v295H0z" /><defs><linearGradient id="SVGPY0tCbOa" x1="48.548%" x2="51.047%" y1="115.276%" y2="41.364%"><stop offset="0%" stopColor="#ffeed7" /><stop offset="100%" stopColor="#bdbfc2" /></linearGradient><linearGradient id="SVGZrQemdEu" x1="54.407%" x2="46.175%" y1="2.404%" y2="90.542%"><stop offset="0%" stopColor="#fff" stopOpacity=".8" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVGViD9UWNq" x1="51.86%" x2="47.947%" y1="88.248%" y2="9.748%"><stop offset="0%" stopColor="#ffeed7" /><stop offset="100%" stopColor="#bdbfc2" /></linearGradient><linearGradient id="SVGpwAGebry" x1="49.925%" x2="49.924%" y1="85.49%" y2="13.811%"><stop offset="0%" stopColor="#ffeed7" /><stop offset="100%" stopColor="#bdbfc2" /></linearGradient><linearGradient id="SVGeLJpbd6T" x1="53.901%" x2="45.956%" y1="3.102%" y2="93.895%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVGoqBSHerK" x1="45.593%" x2="54.811%" y1="5.475%" y2="93.524%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVG4QSySb4K" x1="49.984%" x2="49.984%" y1="89.845%" y2="40.632%"><stop offset="0%" stopColor="#ffeed7" /><stop offset="100%" stopColor="#bdbfc2" /></linearGradient><linearGradient id="SVGmqOHmezj" x1="53.505%" x2="42.746%" y1="99.975%" y2="23.545%"><stop offset="0%" stopColor="#ffeed7" /><stop offset="100%" stopColor="#bdbfc2" /></linearGradient><linearGradient id="SVG6COJqcYh" x1="49.841%" x2="50.241%" y1="13.229%" y2="94.673%"><stop offset="0%" stopColor="#fff" stopOpacity=".8" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVGMM2cICtb" x1="49.927%" x2="50.727%" y1="37.327%" y2="92.782%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVGGYYiOcHn" x1="49.876%" x2="49.876%" y1="2.299%" y2="81.204%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVGWdyw0crI" x1="49.833%" x2="49.824%" y1="2.272%" y2="71.799%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVG83oHF3vg" x1="53.467%" x2="38.949%" y1="48.921%" y2="98.1%"><stop offset="0%" stopColor="#ffa63f" /><stop offset="100%" stopColor="#ff0" /></linearGradient><linearGradient id="SVGLpQcUdBQ" x1="52.373%" x2="47.579%" y1="143.009%" y2="-64.622%"><stop offset="0%" stopColor="#ffeed7" /><stop offset="100%" stopColor="#bdbfc2" /></linearGradient><linearGradient id="SVGehok0c3p" x1="30.581%" x2="65.887%" y1="34.024%" y2="89.175%"><stop offset="0%" stopColor="#ffa63f" /><stop offset="100%" stopColor="#ff0" /></linearGradient><linearGradient id="SVGSLPsocSe" x1="59.572%" x2="48.361%" y1="-17.216%" y2="66.118%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVGr4fuKdTl" x1="47.769%" x2="51.373%" y1="1.565%" y2="104.313%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVGOxCzIbUA" x1="43.55%" x2="57.114%" y1="4.533%" y2="92.827%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="SVGp3HnSbuR" x1="49.733%" x2="50.558%" y1="17.609%" y2="99.385%"><stop offset="0%" stopColor="#ffa63f" /><stop offset="100%" stopColor="#ff0" /></linearGradient><linearGradient id="SVGSUrnubkU" x1="50.17%" x2="49.68%" y1="2.89%" y2="94.17%"><stop offset="0%" stopColor="#fff" stopOpacity=".65" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient><filter id="SVGSbSGrdoj" width="200%" height="200%" x="-50%" y="-50%" filterUnits="objectBoundingBox"><feOffset in="SourceAlpha" result="shadowOffsetOuter1" /><feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="6.5" /></filter></defs><g fill="none"><path fill="#000" fillOpacity=".2" d="M235.125 249.359c0 17.355-52.617 31.497-117.54 31.497S.044 266.806.044 249.359c0-17.356 52.618-31.498 117.54-31.498 64.924 0 117.45 14.142 117.541 31.498" filter="url(#SVGSbSGrdoj)" transform="translate(10)" /><path fill="#000" d="M63.213 215.474c-11.387-16.346-13.591-69.606 12.947-102.39C89.292 97.383 92.69 86.455 93.7 71.67c.734-16.805-11.846-66.851 35.537-70.616 48.027-3.857 45.364 43.526 45.088 68.596-.183 21.12 15.52 33.15 26.355 49.68 19.927 30.303 18.274 82.461-3.765 110.745-27.916 35.354-51.791 20.018-67.678 21.304-29.752 1.745-30.762 17.54-66.024-35.905" /><path fill="url(#SVGPY0tCbOa)" d="M169.1 122.451c8.265 7.622 29.661 41.69-4.224 62.995-11.937 7.438 10.653 35.721 21.488 22.039 19.193-24.61 6.98-63.913-4.591-77.963-7.714-9.917-19.651-13.774-12.672-7.07" transform="translate(10)" /><path fill="#000" stroke="#000" strokeWidth=".977" d="M176.805 117.86c13.59 11.02 38.292 49.587 2.204 74.748-11.846 7.806 10.468 32.508 23.049 19.927 43.618-43.894-1.102-94.308-16.53-111.664-13.774-15.151-25.987 3.49-8.723 16.989Z" /><path fill="url(#SVGZrQemdEu)" d="M147.245 25.02c-.459 12.581-14.325 23.51-30.946 24.52S86.639 41 87.097 28.418c.46-12.581 14.326-23.509 30.947-24.519 16.62-.918 29.66 8.54 29.201 21.12" transform="translate(10)" /><path fill="url(#SVGViD9UWNq)" d="M107.483 54.957c.46 8.173-3.397 15.06-8.723 15.335s-10.01-6.06-10.47-14.232S91.688 41 97.014 40.725s10.01 6.06 10.468 14.233" transform="translate(10)" /><path fill="url(#SVGpwAGebry)" d="M117.125 55.6c.184 9.458 6.337 16.988 13.683 16.805 7.346-.184 13.131-7.99 12.948-17.54-.184-9.458-6.336-16.988-13.683-16.804-7.346.183-13.223 8.08-12.948 17.539" transform="translate(10)" /><path fill="#000" d="M133.186 57.712c-.092 5.234 2.48 9.458 5.877 9.458 3.306 0 6.153-4.224 6.245-9.366.091-5.234-2.48-9.459-5.878-9.459-3.397 0-6.152 4.225-6.244 9.367m-21.212.092c.459 4.316-1.194 7.989-3.582 8.356-2.387.276-4.683-2.938-5.142-7.254s1.194-7.99 3.581-8.357c2.388-.275 4.684 2.939 5.143 7.255" /><path fill="url(#SVGeLJpbd6T)" d="M124.564 54.773c-.276 2.939 1.102 5.326 3.03 5.51s3.765-2.112 4.04-4.959c.276-2.938-1.102-5.326-3.03-5.51-1.928-.183-3.765 2.113-4.04 4.96" transform="translate(10)" /><path fill="url(#SVGoqBSHerK)" d="M99.953 55.508c.276 2.388-.734 4.5-2.203 4.683-1.47.184-2.847-1.653-3.123-4.132-.275-2.388.735-4.5 2.204-4.683 1.47-.184 2.847 1.744 3.122 4.132" transform="translate(10)" /><path fill="url(#SVG4QSySb4K)" d="M71.027 145.684c6.52-14.785 20.386-40.772 20.662-60.883 0-15.978 47.843-19.835 51.7-3.856 3.856 15.978 13.59 39.853 19.834 51.424 6.245 11.478 24.335 48.118 5.051 80.074-17.356 28.284-69.973 50.69-98.073-3.856-9.55-18.917-7.806-42.333.826-62.903" transform="translate(10)" /><path fill="url(#SVGmqOHmezj)" d="M65.15 134.664c-5.601 10.56-17.172 38.293 11.112 53.445 30.395 16.162 30.303 49.312-6.245 33.517-33.425-14.233-18.641-71.902-9.274-85.676 6.06-9.642 15.243-21.488 4.407-1.286" transform="translate(10)" /><path fill="#000" stroke="#000" strokeWidth="1.25" d="M79.925 122.727c-8.907 14.509-30.211 48.669-1.652 66.484 38.384 23.6 27.548 47.108-7.53 25.895-49.404-29.568-5.97-89.257 13.774-112.03 22.59-25.529 4.316 4.683-4.592 19.65Z" /><path fill="url(#SVG6COJqcYh)" d="M156.428 151.285c0 16.162-15.519 37.1-42.15 36.916-27.456.183-39.118-20.754-39.118-36.916s18.182-29.293 40.588-29.293c22.498.092 40.68 13.132 40.68 29.293" transform="translate(10)" /><path fill="url(#SVGMM2cICtb)" d="M141.92 100.504c-.276 16.713-11.204 20.662-24.978 20.662s-23.784-2.48-24.978-20.662c0-11.387 11.203-17.998 24.978-17.998 13.774-.092 24.977 6.52 24.977 17.998" transform="translate(10)" /><path fill="url(#SVGGYYiOcHn)" d="M58.63 126.216c9-13.682 28.008-34.711 3.582 2.939-19.835 31.038-7.346 50.965-.918 56.474 18.549 16.53 17.814 27.64 3.214 18.917-31.314-18.641-24.794-50.047-5.878-78.33" transform="translate(10)" /><path fill="url(#SVGWdyw0crI)" d="M188.936 131.818c-7.806-16.07-32.6-56.842 1.193-9.459 30.763 42.884 9.183 72.729 5.326 75.667-3.856 2.939-16.804 8.908-13.04-1.469 3.858-10.377 22.958-30.028 6.52-64.74" transform="translate(10)" /><path fill="url(#SVG83oHF3vg)" stroke="#e68c3f" strokeWidth="6.25" d="M51.835 258.542c-20.57-10.928-50.414 2.112-39.578-27.457 2.204-6.704-3.214-16.805.275-23.325 4.133-7.989 13.04-6.244 18.366-11.57 5.234-5.51 8.54-15.06 18.366-13.59 9.734 1.468 16.254 13.406 23.049 28.099 5.05 10.468 22.865 25.253 21.672 37.007-1.47 17.998-21.948 21.396-42.15 10.836Z" transform="translate(10)" /><path fill="url(#SVGLpQcUdBQ)" d="M201.608 189.119c-3.122 5.877-16.162 15.335-24.886 12.856-8.815-2.388-12.856-15.795-11.111-25.988 1.653-11.386 11.111-12.03 23.05-6.336 12.855 6.336 16.712 11.662 12.947 19.468" transform="translate(10)" /><path fill="url(#SVGehok0c3p)" stroke="#e68c3f" strokeWidth="6.251" d="M194.445 253.49c15.06-18.273 48.578-14.508 25.988-39.577-4.775-5.418-3.306-16.989-9.183-21.947-6.887-6.061-14.509-1.102-21.488-4.224-6.979-3.398-14.325-9.918-22.865-5.327-8.54 4.684-9.459 16.805-10.285 32.783-.735 11.479-11.203 30.671-5.602 41.231 8.081 16.346 29.11 14.142 43.435-2.938Z" transform="translate(10)" /><path fill="url(#SVGSLPsocSe)" d="M187.925 229.064c23.325-34.435 5.97-34.16.092-36.823-5.877-2.755-12.03-8.173-18.916-4.408-6.888 3.857-7.255 13.775-7.439 26.814-.275 9.367-8.08 25.07-3.397 33.793 5.693 10.193 19.467-4.591 29.66-19.376" transform="translate(10)" /><path fill="url(#SVGr4fuKdTl)" d="M47.06 234.023c-34.895-22.59-18.55-30.303-13.315-33.885 6.336-4.591 6.428-13.407 14.233-12.58 7.806.826 12.397 10.468 17.631 22.406 3.857 8.54 17.264 19.927 16.254 29.753-1.285 11.57-19.743 3.948-34.803-5.694" transform="translate(10)" /><path fill="#000" d="M209.588 188.843c-2.755 4.776-13.958 12.306-21.396 10.285-7.622-1.928-11.112-12.672-9.55-20.753 1.377-9.183 9.55-9.642 19.834-5.05 10.928 4.958 14.326 9.182 11.112 15.518" /><path fill="url(#SVGOxCzIbUA)" d="M192.058 186.18c-1.745 3.306-9.091 8.54-14.234 7.163-5.142-1.377-7.713-8.815-6.887-14.417.735-6.336 6.244-6.704 13.223-3.581 7.53 3.49 9.918 6.428 7.898 10.835" transform="translate(10)" /><path fill="url(#SVGp3HnSbuR)" stroke="#e68c3f" strokeWidth="3.75" d="M97.107 66.344c3.673-3.398 12.58-13.774 29.477-2.939 3.122 2.02 5.693 2.204 11.662 4.775 12.03 4.96 6.336 16.897-6.52 20.937-5.51 1.745-10.468 8.449-20.386 7.806-8.54-.46-10.744-6.06-15.978-9.091-9.275-5.234-10.652-12.305-5.602-16.07 5.051-3.765 6.98-5.143 7.347-5.418Z" transform="translate(10)" /><path stroke="#e68c3f" strokeWidth="2.5" d="M148.43 75.986c-5.05.275-15.979 11.203-27.457 11.203s-18.366-10.652-20.11-10.652" /><path fill="url(#SVGSUrnubkU)" d="M102.8 65.426c1.837-1.653 7.622-6.153 15.244-1.562 1.653.919 3.306 1.929 5.693 3.306 4.867 2.847 2.48 6.98-3.398 9.55-2.663 1.102-7.07 3.49-10.376 3.306-3.673-.367-6.153-2.755-8.54-4.316-4.5-2.938-4.224-5.418-2.112-7.346 1.56-1.47 3.305-2.847 3.49-2.938" transform="translate(10)" /></g></svg>
    )
}

export function WindowsIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z" /><path fill="currentColor" d="m3 5.557 7.357-1.002.004 7.097-7.354.042zm7.354 6.913.006 7.103-7.354-1.011v-6.14zm.892-8.046L21.001 3v8.562l-9.755.077zm9.758 8.113-.003 8.523-9.755-1.378-.014-7.161z" /></svg>
    )
}

export function FedoraIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="none" d="M0 0h448v512H0z" /><path fill="currentColor" d="M225 32C101.3 31.7.8 131.7.4 255.4L0 425.7a53.6 53.6 0 0 0 53.6 53.9l170.2.4c123.7.3 224.3-99.7 224.6-223.4S348.7 32.3 225 32m169.8 157.2L333 126.6c2.3-4.7 3.8-9.2 3.8-14.3v-1.6l55.2 56.1a101 101 0 0 1 2.8 22.4M331 94.3a106.06 106.06 0 0 1 58.5 63.8l-54.3-54.6a26.5 26.5 0 0 0-4.2-9.2M118.1 247.2a49.7 49.7 0 0 0-7.7 11.4l-8.5-8.5a86 86 0 0 1 16.2-2.9M97 251.4l11.8 11.9-.9 8a34.7 34.7 0 0 0 2.4 12.5l-27-27.2a80.6 80.6 0 0 1 13.7-5.2m-18.2 7.4 38.2 38.4a53.2 53.2 0 0 0-14.1 4.7L67.6 266a107 107 0 0 1 11.2-7.2m-15.2 9.8 35.3 35.5a67.3 67.3 0 0 0-10.5 8.5L53.5 278a64.3 64.3 0 0 1 10.1-9.4m-13.3 12.3 34.9 35a56.8 56.8 0 0 0-7.7 11.4l-35.8-35.9c2.8-3.8 5.7-7.2 8.6-10.5m-11 14.3 36.4 36.6a48.3 48.3 0 0 0-3.6 15.2l-39.5-39.8a100 100 0 0 1 6.7-12m-8.8 16.3 41.3 41.8a63.5 63.5 0 0 0 6.7 26.2L25.8 326c1.4-4.9 2.9-9.6 4.7-14.5m-7.9 43 61.9 62.2a31.24 31.24 0 0 0-3.6 14.3v1.1l-55.4-55.7a88.3 88.3 0 0 1-2.9-21.9m5.3 30.7 54.3 54.6a28.4 28.4 0 0 0 4.2 9.2 106.32 106.32 0 0 1-58.5-63.8m-5.3-37a80.7 80.7 0 0 1 2.1-17l72.2 72.5a37.6 37.6 0 0 0-9.9 8.7zm253.3-51.8-42.6-.1-.1 56c-.2 69.3-64.4 115.8-125.7 102.9-5.7 0-19.9-8.7-19.9-24.2a24.89 24.89 0 0 1 24.5-24.6c6.3 0 6.3 1.6 15.7 1.6a55.91 55.91 0 0 0 56.1-55.9l.1-47c0-4.5-4.5-9-8.9-9l-33.6-.1c-32.6-.1-32.5-49.4.1-49.3l42.6.1.1-56a105.18 105.18 0 0 1 105.6-105 86.4 86.4 0 0 1 20.2 2.3c11.2 1.8 19.9 11.9 19.9 24 0 15.5-14.9 27.8-30.3 23.9-27.4-5.9-65.9 14.4-66 54.9l-.1 47a8.94 8.94 0 0 0 8.9 9l33.6.1c32.5.2 32.4 49.5-.2 49.4m23.5-.3a35.6 35.6 0 0 0 7.6-11.4l8.5 8.5a102 102 0 0 1-16.1 2.9m21-4.2L308.6 280l.9-8.1a34.7 34.7 0 0 0-2.4-12.5l27 27.2a75 75 0 0 1-13.7 5.3m18-7.4-38-38.4c4.9-1.1 9.6-2.4 13.7-4.7l36.2 35.9c-3.8 2.5-7.9 5-11.9 7.2m15.5-9.8-35.3-35.5a61 61 0 0 0 10.5-8.5l34.9 35a125 125 0 0 1-10.1 9m13.2-12.3-34.9-35a63.2 63.2 0 0 0 7.7-11.4l35.8 35.9a130 130 0 0 1-8.6 10.5m11-14.3-36.4-36.6a48.3 48.3 0 0 0 3.6-15.2l39.5 39.8a88 88 0 0 1-6.7 12m13.5-30.9a141 141 0 0 1-4.7 14.3L345.6 190a58.2 58.2 0 0 0-7.1-26.2zm1-5.6-71.9-72.1a32 32 0 0 0 9.9-9.2l64.3 64.7a91 91 0 0 1-2.3 16.6" /></svg>
    )
}

export function DebianIcon({ className }: Props) {
    return(
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="none" d="M0 0h32v32H0z"/><path fill="currentColor" d="M18.505 16.907c-.532 0 .109.265.801.375.188-.136.36-.297.521-.443-.432.099-.88.12-1.323.068zm2.855-.71c.307-.437.536-.916.624-1.411-.077.359-.265.667-.437.973-1 .625-.093-.359 0-.744-1.068 1.344-.145.796-.187 1.181zm1.041-2.728c.068-.964-.188-.667-.265-.297.093.057.171.667.265.297M16.505.412c.265.057.599.093.563.161.307-.068.369-.136-.573-.161zm.563.161-.204.041.188-.016V.573zm8.828 13.255c.025.855-.271 1.265-.511 2l-.464.24c-.375.719.037.463-.228 1.036-.589.521-1.787 1.631-2.163 1.735-.265 0 .188-.333.256-.453-.787.536-.641.803-1.828 1.136l-.037-.084c-2.963 1.391-7.067-1.359-7-5.12-.041.229-.093.177-.161.271a4.73 4.73 0 0 1 2.667-4.667 4.48 4.48 0 0 1 4.975.641 4.46 4.46 0 0 0-3.631-1.735c-1.573.011-3.036 1.011-3.531 2.093-.803.505-.891 1.959-1.24 2.215-.479 3.463.88 4.957 3.172 6.719.359.249.109.281.161.463a6.25 6.25 0 0 1-2.041-1.547c.307.443.629.88 1.068 1.213-.735-.239-1.693-1.729-1.975-1.796 1.24 2.213 5.041 3.891 7.016 3.067a8.3 8.3 0 0 1-3.109-.375c-.437-.213-1.027-.683-.932-.76A7.74 7.74 0 0 0 24.229 19c.583-.469 1.24-1.255 1.421-1.265-.265.427.057.213-.156.583.584-.957-.265-.396.609-1.651l.323.437c-.12-.797.985-1.755.88-3.011.256-.4.267.401 0 1.292.387-.984.105-1.131.199-1.948.109.271.24.563.307.844-.239-.932.267-1.599.376-2.136-.12-.067-.376.401-.428-.708 0-.489.136-.265.188-.369-.109-.068-.349-.428-.511-1.147.109-.176.297.439.459.453-.109-.563-.271-1-.271-1.443-.453-.905-.156.136-.532-.401-.453-1.452.401-.333.453-.984.719 1.027 1.12 2.615 1.308 3.281a13 13 0 0 0-.657-2.349c.215.095-.343-1.651.281-.495a10.4 10.4 0 0 0-4.88-5.848c.24.224.563.515.443.557-1-.6-.828-.641-.973-.891-.813-.333-.871.025-1.417 0-1.547-.829-1.839-.735-3.249-1.272l.068.308c-1.032-.333-1.204.135-2.308 0-.068-.052.36-.188.703-.24-.984.136-.932-.187-1.905.041.229-.171.479-.28.735-.427-.797.052-1.923.469-1.573.093-1.317.6-3.651 1.428-4.959 2.652l-.041-.292c-.599.719-2.615 2.145-2.771 3.079l-.177.041c-.308.531-.505 1.135-.76 1.683-.396.692-.6.265-.532.369-.801 1.631-1.197 3-1.547 4.135.24.36 0 2.199.093 3.677-.4 7.281 5.12 14.365 11.147 16 .896.308 2.197.308 3.323.333-1.323-.369-1.495-.197-2.776-.651-.932-.427-1.136-.932-1.787-1.505l.265.464c-1.292-.453-.76-.557-1.812-.891l.281-.36c-.417-.041-1.109-.708-1.297-1.083l-.453.015c-.547-.667-.839-1.161-.812-1.547l-.145.267c-.172-.281-2.027-2.532-1.068-2.011-.172-.161-.412-.271-.667-.735l.187-.229c-.463-.583-.853-1.359-.828-1.599.271.317.428.401.604.443-1.176-2.896-1.239-.161-2.135-2.937l.197-.027c-.129-.213-.239-.453-.344-.677l.079-.801c-.839-.984-.24-4.136-.12-5.865.095-.724.708-1.468 1.172-2.64l-.276-.052c.532-.948 3.12-3.828 4.317-3.683.573-.735-.119 0-.239-.187 1.281-1.319 1.681-.933 2.531-1.172.937-.537-.797.213-.359-.204 1.604-.396 1.135-.932 3.228-1.129.215.129-.52.187-.692.343 1.333-.651 4.197-.489 6.079.365 2.171 1.025 4.613 4.011 4.708 6.839l.104.025c-.052 1.136.177 2.428-.224 3.615l.265-.563zM12.719 17.64l-.068.376c.349.463.631.968 1.068 1.344-.317-.625-.557-.881-1-1.735zm.828-.041c-.187-.197-.292-.453-.411-.692.104.427.343.801.572 1.172zm14.589-3.172-.095.199a9.4 9.4 0 0 1-.921 2.948 8.9 8.9 0 0 0 1-3.147zM16.599.161c.36-.135.88-.068 1.265-.161-.489.041-.984.068-1.463.136l.197.025zM4.016 6.855c.088.76-.579 1.067.145.557.401-.881-.145-.24-.135-.557zm-.844 3.546c.161-.521.203-.828.265-1.12-.464.583-.224.703-.265 1.104z"/></svg>
    )
}


export function StarIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11c.08.2.27.34.49.36l5.51.44c.51.04.72.68.33 1.02l-4.2 3.6a.56.56 0 0 0-.18.56l1.28 5.39c.12.5-.42.9-.86.63l-4.72-2.88a.56.56 0 0 0-.58 0l-4.72 2.88c-.44.27-.98-.13-.86-.63l1.28-5.39a.56.56 0 0 0-.18-.56l-4.2-3.6c-.39-.34-.18-.98.33-1.02l5.51-.44a.56.56 0 0 0 .49-.36z" />
        </svg>
    );
}

export function StarFilledIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M10.79 3.11a1.34 1.34 0 0 1 2.42 0l2.13 5.11 5.51.44c1.19.1 1.67 1.58.77 2.36l-4.2 3.6 1.28 5.39c.28 1.16-.98 2.08-2 1.46L12 18.6l-4.7 2.87c-1.02.62-2.28-.3-2-1.46l1.28-5.39-4.2-3.6c-.9-.78-.42-2.26.77-2.36l5.51-.44z" />
        </svg>
    );
}

export function ChevronRightSmallIcon({ className }: Props) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24c.3.3.3.77 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0" />
        </svg>
    );
}
