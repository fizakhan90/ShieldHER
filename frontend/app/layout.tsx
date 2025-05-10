import '../styles/globals.css'; 
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SheildHER - Misogyny Detection Simulator',
  description: 'An AI-powered tool for detecting and preventing online misogyny in real-time, supporting SDG 5 and SDG 10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full font-sans antialiased">
        {children}
      </body>
    </html>
  );
}