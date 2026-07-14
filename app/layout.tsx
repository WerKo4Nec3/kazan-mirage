import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kazan Mirage — Historical Atlas",
  description:
    "Travel through the ages of Kazan. Click illustrated landmarks on a historical map to explore 360° panoramas across different eras.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
