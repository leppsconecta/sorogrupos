import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Toast } from '../components/feedback/Toast';
import { ConfirmModal } from '../components/feedback/ConfirmModal';
import { ToastMessage, ToastType, ConfirmOptions } from '../types';

// Omit callbacks from the show options, as we use Promises
export type ShowConfirmOptions = Omit<ConfirmOptions, 'onConfirm' | 'onCancel'>;

interface FeedbackContextType {
    toast: (payload: { type: ToastType; message: string; title?: string; duration?: number }) => void;
    confirm: (options: ShowConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Confirm Modal State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        options: ConfirmOptions | null;
    }>({ isOpen: false, options: null });

    // Ref to hold the current promise resolver
    const confirmResolver = useRef<((value: boolean) => void) | null>(null);

    const toast = useCallback(({ type, message, title, duration = 5000 }: { type: ToastType; message: string; title?: string, duration?: number }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message, title, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const confirm = useCallback((options: ShowConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            confirmResolver.current = resolve;
            setConfirmState({
                isOpen: true,
                options: {
                    ...options,
                    onConfirm: () => { }, // Handled by handleConfirm
                },
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (confirmResolver.current) {
            confirmResolver.current(true);
            confirmResolver.current = null;
        }
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const handleCancel = useCallback(() => {
        if (confirmResolver.current) {
            confirmResolver.current(false);
            confirmResolver.current = null;
        }
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <FeedbackContext.Provider value={{ toast, confirm }}>
            {children}

            {/* Toast Container - Fixed Position */}
            <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <Toast key={t.id} toast={t} onRemove={removeToast} />
                ))}
            </div>

            {/* Global Confirm Modal */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                options={confirmState.options}
                onConfirm={handleConfirm}
                onClose={handleCancel}
            />
        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (context === undefined) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
};
