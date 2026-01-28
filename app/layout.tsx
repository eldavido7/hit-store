// app/layout.tsx
import type { Metadata } from "next";
import { Cormorant, Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/cart-context";
import { Toaster } from "@/components/toaster";
import { MainLayout } from "@/components/main-layout";
import Script from "next/script";

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://herimmigranttales.org"),
  title: {
    default: "Her Immigrant Tales | Immigrant Women Stories",
    template: "%s | Her Immigrant Tales",
  },
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Her Immigrant Tales",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${quicksand.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="google-site-verification"
          content="B3IWgJs4tw2ngICyBC4RIVca-uT2cPwAe_KL5zISANI"
        />
        {/* Google Analytics */}
        {GA_ID ? (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        ) : null}

        {/* Block indexing on admin/maintainance paths */}
        {process.env.NODE_ENV === "production" && (
          <>
            {["/dashboard", "/maintainance"].some(
              (path) =>
                typeof window !== "undefined" &&
                window.location.pathname.startsWith(path)
            ) && (
              <>
                <meta name="robots" content="noindex, nofollow" />
                <meta name="googlebot" content="noindex" />
              </>
            )}
          </>
        )}
      </head>
      <body className="font-quicksand antialiased">
        <script src="https://js.paystack.co/v1/inline.js" async></script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <CartProvider>
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </CartProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
