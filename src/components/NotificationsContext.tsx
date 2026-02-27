'use client';

import { createContext, useContext, useState } from 'react';
import NotificationsSidebar from './NotificationsSidebar';

interface NotificationsContextType {
    openPanel: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({ openPanel: () => { } });

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <NotificationsContext.Provider value={{ openPanel: () => setIsOpen(true) }}>
            {children}
            <NotificationsSidebar open={isOpen} onClose={() => setIsOpen(false)} />
        </NotificationsContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationsContext);
