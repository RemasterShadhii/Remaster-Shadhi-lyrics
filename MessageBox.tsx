
import React, { useEffect } from 'react';
import type { Message } from '../types';

interface MessageBoxProps {
    message: Message;
    onClose: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-rs-card-bg p-6 rounded-xl max-w-sm w-full shadow-2xl border border-rs-orange">
                <h3 className="text-xl font-bold text-rs-orange mb-3">{message.title}</h3>
                <p className="text-rs-text mb-4">{message.content}</p>
                <button onClick={onClose} className="w-full py-2 rounded-lg bg-rs-orange text-rs-dark-bg font-semibold hover:bg-white transition-colors">
                    Close
                </button>
            </div>
        </div>
    );
};

export default MessageBox;
