'use client';

import { Bell } from 'lucide-react';

interface TopbarProps {
    title: string;
    children?: React.ReactNode;
    onToggleNotifications?: () => void;
    notificationCount?: number;
}

export default function Topbar({ title, children, onToggleNotifications, notificationCount = 5 }: TopbarProps) {
    return (
        <div className="topbar">
            <span className="topbar-title">{title}</span>
            <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {children}

                {onToggleNotifications && (
                    <button
                        className="btn btn-ghost"
                        onClick={onToggleNotifications}
                        style={{ padding: '8px', position: 'relative' }}
                        title="Notifications"
                    >
                        <Bell size={18} />
                        {notificationCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: 6,
                                right: 8,
                                width: 8,
                                height: 8,
                                background: 'var(--color-accent)',
                                borderRadius: '50%',
                                border: '2px solid var(--color-bg)'
                            }} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
