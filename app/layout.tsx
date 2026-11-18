import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { CartProvider } from "@/lib/cart";
import { store } from "@/config/store";

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(store.siteUrl),
  title: { default: `${store.name}: Japanese figures for US collectors`, template: `%s | ${store.name}` },
  description:
    "A curated shop of 15 imported Japanese anime and game figures: Vocaloid, Evangelion, Genshin Impact, Honkai and more. Ships from Japan.",
  openGraph: { type: "website", siteName: store.name, locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#1F4FFF", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available so scroll-reveal styles apply; without JS everything stays visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <CartProvider>
          <MotionProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </MotionProvider>
        </CartProvider>
      </body>
    </html>
  );
}
