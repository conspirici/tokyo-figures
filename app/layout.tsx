import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { CartProvider } from "@/lib/cart";
import { retailer, store } from "@/config/store";

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(store.siteUrl),
  title: { default: `${store.name}: Official US seller of Tokyo Figure`, template: `%s | ${store.name}` },
  description:
    "The official US seller of Tokyo Figure, Japan. Imported anime and game figures: Vocaloid, Evangelion, Genshin Impact, Honkai and more, shipped from Japan.",
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
            <div className="bg-ink px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
              <span className="mr-1.5 inline-block rounded bg-lime px-1.5 py-0.5 font-display text-[10px] tracking-wider text-ink sm:text-xs">OFFICIAL</span>
              US seller of{" "}
              <a href={retailer.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-lime">
                {retailer.name}
              </a>
              , Japan
            </div>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </MotionProvider>
        </CartProvider>
      </body>
    </html>
  );
}
