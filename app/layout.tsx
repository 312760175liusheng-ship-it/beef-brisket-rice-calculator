import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "牛腩饭盈利计算器",
  description: "按熟牛腩克重、平台扣除和门店成本，测算每单利润与保本单量。",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
