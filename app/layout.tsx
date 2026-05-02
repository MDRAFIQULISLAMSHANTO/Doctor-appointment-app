import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dr. Jahangir Alam Chowdhury | Physical Medicine Specialist, Chittagong",
  description: "Expert care for Arthritis, Pain, Paralysis & Physical Medicine Rehabilitation. Book your appointment online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
