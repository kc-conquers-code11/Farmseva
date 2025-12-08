'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import FeedSetup from '../../poultry-analytics-components/pages/FeedSetup';

export default function Page() {
    return (
        <AppProvider>
            <FeedSetup />
        </AppProvider>
    );
}
