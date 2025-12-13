import { Button } from './Button';
import { CloseIcon } from '../icons/icons';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface ModalProps {
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
    showCloseButton?: boolean;
    zIndex?: number;
}

export interface ModalRef {
    handleClose: () => void;
}

export const Modal = forwardRef<ModalRef, ModalProps>(({
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-2xl',
    showCloseButton = true,
    zIndex = 50
}, ref) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useImperativeHandle(ref, () => ({
        handleClose
    }));

    return (
        <dialog
            open={show}
            className={`fixed inset-0 w-full h-full flex items-center justify-center p-4 ${show && 'opacity-100'} transition-opacity opacity-0 duration-300 bg-gray-900/60 backdrop-blur-sm`}
            style={{ zIndex: zIndex - 10 }}
        >
            <article
                className={`relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}
                style={{ zIndex }}
            >
                <header className="shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    {showCloseButton && (
                        <Button
                            variant='icon'
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </Button>
                    )}
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
                {footer && (
                    <footer className="shrink-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
                        {footer}
                    </footer>
                )}
            </article>
        </dialog>
    );
});

Modal.displayName = 'Modal';