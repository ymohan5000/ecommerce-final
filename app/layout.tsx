import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Toast } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AcmeStore - Modern E-commerce UI",
  description:
    "A beautiful and modern e-commerce user interface built with Next.js and Tailwind CSS.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
            <Toast richColors /> {/* <- Must be added here */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
