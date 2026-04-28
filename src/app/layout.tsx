import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Control",
  description: "Decision simulation system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
