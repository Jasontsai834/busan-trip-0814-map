import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "釜山 8/14-8/18 旅伴共用地圖",
  description:
    "釜山 2026/8/14-8/18 的互動旅伴地圖：景點、美食、Outlet、韓國潮流服飾、高爾夫用品、參考來源與 Google Maps 精確定位。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

