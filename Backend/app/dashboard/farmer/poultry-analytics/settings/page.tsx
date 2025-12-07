'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import Settings from '../../poultry-analytics-components/pages/Settings';

export default function Page() {
    return (
        <AppProvider>
            <Settings />
        </AppProvider>
    );
}
