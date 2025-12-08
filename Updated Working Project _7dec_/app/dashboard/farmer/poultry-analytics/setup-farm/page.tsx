'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import FarmSetup from '../../poultry-analytics-components/pages/FarmSetup';
import { Footer } from '@/app/components/Footer';

export default function Page() {
    return (
        <AppProvider>
            <FarmSetup />
            <Footer />
        </AppProvider>
    );
}
