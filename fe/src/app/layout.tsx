"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from '@/components/Navigation';
import Providers from '@/components/Providers';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import socketService from '@/lib/socket';

const inter = Inter({ subsets: ["latin"] });

const metadata: Metadata = {
  title: "RoboClaim",
  description: "AI-Powered Document Processing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketService.connect();
    }
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900`}>
        <Providers>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
