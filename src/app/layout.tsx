import type { Metadata } from "next";
import { Inter }  from 'next/font/google';
import {Open_Sans } from 'next/font/google';
import "./globals.css";
import { ReduxProvider } from "../store/provider";

// Load Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Load Open Sans font
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Face Visa",
  description: "Face Visa",
  icons: {
    icon: "/icon-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${inter.variable} antialiased`}
      suppressHydrationWarning
    >
       <head>
        <link rel="icon" href="/icon-logo.svg" />
      </head>
      {/* <body suppressHydrationWarning className="!bg-[url('/bg.jpg')] bg-no-repeat bg-cover bg-center min-h-screen"> */}
      <body suppressHydrationWarning>
          <ReduxProvider>
            {children}
          </ReduxProvider>
      </body>
    </html>
  );
}