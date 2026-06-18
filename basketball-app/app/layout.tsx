import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coach Pro - Elite Basketball Training",
  description: "Train like NBA. Professional basketball coaching platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}

