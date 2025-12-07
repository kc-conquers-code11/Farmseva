'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import DailyEntry from '../../poultry-analytics-components/pages/DailyEntry';

export default function Page() {
    return (
        <AppProvider>
            <DailyEntry />
        </AppProvider>
    );
}
