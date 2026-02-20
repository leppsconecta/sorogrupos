import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useFeedback } from './FeedbackContext';

interface ConnectionData {
    type: 'qrcode' | 'code' | 'error';
    data: string | null;
    message: string;
}

interface WhatsAppContextType {
    isWhatsAppConnected: boolean;
    connectedPhone: string | null;
    isConnectModalOpen: boolean;
    isDisconnectModalOpen: boolean;
    connectionStep: 'phone' | 'result' | 'success';
    phoneNumber: string;
    isProcessing: boolean;
    connectionData: ConnectionData | null;
    timeLeft: number;
    openConnectModal: () => void;
    closeConnectModal: () => void;
    openDisconnectModal: () => void;
    closeDisconnectModal: () => void;
    setPhoneNumber: (phone: string) => void;
    handleGenerateQRCode: () => Promise<void>;
    handleDisconnect: () => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useFeedback();

    // State
    const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    const [connectionStep, setConnectionStep] = useState<'phone' | 'result' | 'success'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('+55');
    const [isProcessing, setIsProcessing] = useState(false);
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
    const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
    const [timeLeft, setTimeLeft] = useState(90);

    // 1. Check Status & Realtime
    useEffect(() => {
        if (!user) return;

        const checkStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('whatsapp_conections')
                    .select('status, id, phone')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    setConnectionId(data.id);
                    setConnectedPhone(data.phone);
                    const currentStatus = data.status?.toLowerCase();

                    if (currentStatus === 'connected' || currentStatus === 'conectado') {
                        setIsWhatsAppConnected(true);
                        if (isConnectModalOpen && connectionStep !== 'success') {
                            setConnectionStep('success');
                        }
                    } else {
                        setIsWhatsAppConnected(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching connection status:', error);
            }
        };

        checkStatus();

        // Polling fallback
        const pollInterval = setInterval(checkStatus, 5000);

        // Realtime subscription
        const channel = supabase
            .channel('whatsapp-status-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'whatsapp_conections',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload: any) => {
                    checkStatus();
                    // Handle specific updates from payload if needed
                    if (payload.new && (payload.new.status === 'connected' || payload.new.status === 'conectado')) {
                        // force update
                    }
                }
            )
            .subscribe();

        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
        };
    }, [user, isConnectModalOpen, connectionStep]); // Dependencies similar to App.tsx

    // 2. Timer Logic
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (connectionStep === 'result' && connectionData?.type === 'qrcode') {
            setTimeLeft(90);
            intervalId = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalId);
                        setConnectionData(prevData =>
                            prevData ? { ...prevData, type: 'error', message: 'Tempo limite excedido. Tente novamente.' } : null
                        );
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [connectionStep, connectionData?.type]);

    // Actions
    const resetModal = () => {
        setIsConnectModalOpen(false);
        setConnectionStep('phone');
        setPhoneNumber('+55');
        setConnectionData(null);
    };

    const openConnectModal = () => {
        setConnectionStep('phone');
        setIsConnectModalOpen(true);
    };

    const closeConnectModal = resetModal;

    const openDisconnectModal = () => setIsDisconnectModalOpen(true);
    const closeDisconnectModal = () => setIsDisconnectModalOpen(false);

    const handleGenerateQRCode = async () => {
        if (phoneNumber.length < 12) return;
        if (!phoneNumber) return;
        if (isProcessing) return;

        setIsProcessing(true);
        setConnectionData(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            let currentConnectionId = connectionId;

            if (!currentConnectionId && user) {
                const { data } = await supabase
                    .from('whatsapp_conections')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();
                if (data?.id) {
                    currentConnectionId = data.id;
                    setConnectionId(data.id);
                }
            }

            const response = await fetch('https://webhook.leppsconecta.com.br/webhook/dd3c18ed-9015-4066-b994-ed5865b880ac', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: cleanPhone,
                    method: 'qrcode',
                    user_id: user?.id,
                    connection_id: currentConnectionId
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (data.success && data.data?.base64) {
                const base64Image = `data:image/png;base64,${data.data.base64}`;
                setConnectionData({
                    type: 'qrcode',
                    data: base64Image,
                    message: 'Escaneie o QR Code abaixo com seu WhatsApp'
                });
                setConnectionStep('result');
            } else {
                showToast(`${data.message || 'Erro ao gerar QR Code'}. Tente novamente.`, 'error');
            }

        } catch (error: any) {
            console.error('Webhook error:', error);
            if (error.name === 'AbortError') {
                showToast('A operação demorou muito. Tente novamente.', 'error');
            } else {
                showToast('Erro de comunicação com o servidor', 'error');
            }
        } finally {
            setIsProcessing(false);
            clearTimeout(timeoutId);
        }
    };

    const handleDisconnect = async () => {
        if (!user) return;
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const response = await fetch('https://webhook.leppsconecta.com.br/webhook/405917eb-1478-45e1-800d-f7e67569575b', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    solicitacao: 'desconectar',
                    id_user: user.id
                })
            });

            const data = await response.json();

            if (data.status === true) {
                setIsWhatsAppConnected(false);
                setConnectedPhone(null);
                setIsDisconnectModalOpen(false);
                showToast('Desconectado com sucesso!', 'success');
                // Optional: Reload or just update state
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast('Erro ao desconectar. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Disconnect error:', error);
            showToast('Erro ao desconectar.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <WhatsAppContext.Provider value={{
            isWhatsAppConnected,
            connectedPhone,
            isConnectModalOpen,
            isDisconnectModalOpen,
            connectionStep,
            phoneNumber,
            isProcessing,
            connectionData,
            timeLeft,
            openConnectModal,
            closeConnectModal,
            openDisconnectModal,
            closeDisconnectModal,
            setPhoneNumber,
            handleGenerateQRCode,
            handleDisconnect
        }}>
            {children}
        </WhatsAppContext.Provider>
    );
};

export const useWhatsApp = () => {
    const context = useContext(WhatsAppContext);
    if (context === undefined) {
        throw new Error('useWhatsApp must be used within a WhatsAppProvider');
    }
    return context;
};
