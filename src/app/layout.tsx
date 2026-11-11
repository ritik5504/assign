import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftTransit - Production Bus Booking & Fleet Management",
  description:
    "Enterprise intercity bus booking platform. Real-time seat inventory, high-performance transactional reservation engine, and operations management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
