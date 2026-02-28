'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/Sidebar';
import { NotificationsProvider } from '@/components/NotificationsContext';
import type { Profile } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(async (result: { data: { user: any } }) => {
            const user = result.data.user;
            if (!user) {
                router.replace('/login');
                return;
            }
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setProfile(data as Profile | null);
            setLoading(false);
        });
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <NotificationsProvider>
            <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                {/* Mobile Hamburger Menu directly inside layout for all pages */}
                <div className="mobile-header">
                    <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isSidebarOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
                        </svg>
                    </button>
                </div>
                {/* Overlay for mobile clicking away */}
                {isSidebarOpen && (
                    <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
                )}
                <Sidebar profile={profile} onClose={() => setIsSidebarOpen(false)} />
                <div className="main-content">
                    {children}
                </div>
            </div>
        </NotificationsProvider>
    );
}
