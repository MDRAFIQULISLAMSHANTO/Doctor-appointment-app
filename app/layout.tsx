import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookMyDoc — Your Practice, Online",
  description: "BookMyDoc gives every doctor their own patient portal — appointment booking, digital prescriptions, patient records, and a branded landing page. No receptionist needed.",
  icons: {
    icon: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
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
