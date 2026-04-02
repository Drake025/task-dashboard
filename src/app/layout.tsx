import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'TaskFlow - Project Management Dashboard',
  description: 'A fully interactive task management dashboard with drag-and-drop kanban boards, calendar integration, progress tracking charts, and team collaboration tools.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
