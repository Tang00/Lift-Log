import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lift Log",
  description: "Mobile-first workout tracking with simple sign-in",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
