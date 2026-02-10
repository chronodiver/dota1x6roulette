import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
    title: 'DOTA 1x6 Challenge Platform',
    description: 'Платформа челленджей для кастомной игры Dota 1x6. Крути рулетку, выполняй задания, попадай в топ!',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <Navbar />
                <main className="main-content">
                    {children}
                </main>
            </body>
        </html>
    );
}
