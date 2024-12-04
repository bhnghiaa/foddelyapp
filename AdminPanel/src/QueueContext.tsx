// QueueContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { FoodItems as FoodItemType } from '../src/@types';

type QueueItem = {
    item: FoodItemType;
    quantity: number;
};

type QueueContextType = {
    queue: QueueItem[];
    addToQueue: (item: FoodItemType) => void;
    removeFromQueue: (itemId: string) => void;
    total: number;
};

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ queue, setQueue ] = useState<QueueItem[]>([]);

    const addToQueue = (item: FoodItemType) => {
        setQueue(prev => {
            const existing = prev.find(q => q.item._id === item._id);
            if (existing) {
                return prev.map(q =>
                    q.item._id === item._id
                        ? { ...q, quantity: q.quantity + 1 }
                        : q
                );
            }
            return [ ...prev, { item, quantity: 1 } ];
        });
    };

    const removeFromQueue = (itemId: string) => {
        setQueue(prev => prev.filter(q => q.item._id !== itemId));
    };

    const total = queue.reduce((sum, q) => sum + (q.item.price * q.quantity), 0);

    return (
        <QueueContext.Provider value={{ queue, addToQueue, removeFromQueue, total }}>
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => {
    const context = useContext(QueueContext);
    if (context === undefined) {
        throw new Error('useQueue must be used within a QueueProvider');
    }
    return context;
};