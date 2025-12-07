'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import Dashboard from '../../poultry-analytics-components/pages/Dashboard';

export default function Page() {
    return (
        <AppProvider>
            <Dashboard />
        </AppProvider>
    );
}
