'use client';

import { AppProvider } from '../../poultry-analytics-components/context/AppContext';
import FarmSetup from '../../poultry-analytics-components/pages/FarmSetup';

export default function Page() {
    return (
        <AppProvider>
            <FarmSetup />
        </AppProvider>
    );
}
