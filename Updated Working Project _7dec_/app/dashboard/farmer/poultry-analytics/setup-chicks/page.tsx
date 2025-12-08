'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import ChicksEntry from '../../poultry-analytics-components/pages/ChicksEntry';

export default function Page() {
    return (
        <AppProvider>
            <ChicksEntry />
        </AppProvider>
    );
}
