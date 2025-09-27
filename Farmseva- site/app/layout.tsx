import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import { CosmicAnalyticsProvider } from "cosmic-analytics";
import { AuthProvider } from 'cosmic-authentication';

const primaryFont = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"]
});

// Change the title and description to your own.
export const metadata: Metadata = {
  title: "FarmSeva – Pig & Poultry Farming Platform",
  description: "Schemes, marketplace, forum, smart dashboard, and alerts for pig & poultry farmers in India"
};

export default function RootLayout({
  children
}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html data-editor-id="app/layout.tsx:27:5" lang="en" className={primaryFont.className}>
      <body data-editor-id="app/layout.tsx:31:7" className="antialiased">
        <AuthProvider>
          <main data-editor-id="app/layout.tsx:32:9" className="min-h-screen">
            <CosmicAnalyticsProvider>
              {children}
            </CosmicAnalyticsProvider>
          </main>
        </AuthProvider>
        {process.env.VISUAL_EDITOR_ACTIVE === 'true' &&
        <script data-editor-id="app/layout.tsx:50:9" src="/editor.js" async />
        }
      </body>
    </html>);

}