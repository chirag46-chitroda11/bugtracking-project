import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const ConfirmContext = createContext();

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context.confirm;
};

export const ConfirmProvider = ({ children }) => {
    const [config, setConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        resolve: null
    });

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfig({
                isOpen: true,
                title: options.title || 'Are you sure?',
                message: options.message || '',
                resolve
            });
        });
    }, []);

    const handleConfirm = () => {
        config.resolve(true);
        setConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        config.resolve(false);
        setConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal 
                isOpen={config.isOpen}
                title={config.title}
                message={config.message}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};
