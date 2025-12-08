'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import Reports from '../../poultry-analytics-components/pages/Reports';
import { Footer } from '@/app/components/Footer';

export default function Page() {
    return (
        <AppProvider>
            <Reports />
            <Footer />
        </AppProvider>
    );
}
