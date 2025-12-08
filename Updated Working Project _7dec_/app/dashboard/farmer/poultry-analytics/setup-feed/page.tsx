'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import FeedSetup from '../../poultry-analytics-components/pages/FeedSetup';
import { Footer } from '@/app/components/Footer';

export default function Page() {
    return (
        <AppProvider>
            <FeedSetup />
            <Footer />
        </AppProvider>
    );
}
