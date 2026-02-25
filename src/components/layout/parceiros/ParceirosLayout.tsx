import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderParceiros } from './HeaderParceiros';
import { SidebarParceiros } from './SidebarParceiros';

interface ParceirosLayoutProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onLogout: () => void;
}

export const ParceirosLayout: React.FC<ParceirosLayoutProps> = ({
    theme,
    toggleTheme,
    onLogout
}) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    return (
        <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
            <SidebarParceiros isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <HeaderParceiros theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} />

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
