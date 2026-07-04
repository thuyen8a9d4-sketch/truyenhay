import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TruyệnHay - Đọc tiểu thuyết online miễn phí",
  description:
    "Nền tảng đọc và đăng tiểu thuyết online miễn phí. Khám phá hàng ngàn truyện thuộc mọi thể loại: ngôn tình, kiếm hiệp, huyền huyễn, đô thị...",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full`} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="flex min-h-full flex-col font-sans antialiased" suppressHydrationWarning>
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
