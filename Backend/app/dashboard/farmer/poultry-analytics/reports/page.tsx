'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import Reports from '../../poultry-analytics-components/pages/Reports';

export default function Page() {
    return (
        <AppProvider>
            <Reports />
        </AppProvider>
    );
}
