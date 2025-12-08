'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import DailyEntry from '../../poultry-analytics-components/pages/DailyEntry';
import { Footer } from '@/app/components/Footer';

export default function Page() {
    return (
        <AppProvider>
            <DailyEntry />
            <Footer />
        </AppProvider>
    );
}
