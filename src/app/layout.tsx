import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lini's Birthday Gift",
  description: "A small magical story, made with love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
