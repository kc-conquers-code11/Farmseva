'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import Settings from '../../poultry-analytics-components/pages/Settings';
import { Footer } from '@/app/components/Footer';

export default function Page() {
    return (
        <AppProvider>
            <Settings />
            <Footer />
        </AppProvider>
    );
}
