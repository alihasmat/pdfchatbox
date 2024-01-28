import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import {Toaster} from "react-hot-toast"
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDFChatBox",
  description: "Chat with any pdf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en">
          <body className="bg-gradient-to-tl from-rose-100 to-teal-100 text-foreground">
              {children}
          <Toaster />
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
