
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [keyword, setKeyword] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(true);
        setTimeout(() => {
            onClose();
            setSuccess(false);
            setEmail('');
            setKeyword('');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scaleUp">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-[#1a234a]">Novo Alerta de Vaga</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-800">Alerta Criado!</h4>
                        <p className="text-gray-500 mt-2">Você receberá as melhores vagas no seu e-mail.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Palavra-chave</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: Desenvolvedor, Design..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Seu E-mail</label>
                            <input
                                required
                                type="email"
                                placeholder="email@exemplo.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <p className="text-xs text-gray-400">
                            Ao criar um alerta, você concorda com nossos Termos de Uso e Política de Privacidade.
                        </p>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200"
                        >
                            Ativar Alerta Agora
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AlertModal;
