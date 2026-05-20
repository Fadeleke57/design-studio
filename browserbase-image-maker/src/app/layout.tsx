import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Browserbase Image Maker",
  description: "Draw with randomized circle and square pixels! Click or drag to create art.",
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
