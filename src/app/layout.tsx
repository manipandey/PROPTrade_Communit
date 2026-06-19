import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlphaJournal — Nepal's Premier Trading Community",
  description: "Connect with funded traders. Share payout proofs, log trading journals, compare prop firm reviews, and master evaluation strategies to access institutional capital.",
  keywords: ["trading journal", "prop trading", "Nepal", "FTMO", "FundedNext", "funded trader", "SMC", "Forex Nepal"],
  authors: [{ name: "Maniraj Pandey" }],
  openGraph: {
    title: "AlphaJournal — Nepal's Premier Trading Community",
    description: "Connect with funded traders. Share payout proofs, log trading journals, compare prop firm reviews, and master evaluation strategies.",
    url: "https://alphajournal.vercel.app",
    siteName: "AlphaJournal",
    images: [
      {
        url: "/og-image.jpg", // This would be the social sharing image
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlphaJournal — Nepal's Premier Trading Community",
    description: "Connect with funded traders. Share payout proofs, log trading journals, and master evaluation strategies.",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          id="theme-loader"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('alphajournal_theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full overflow-hidden">{children}</body>
    </html>
  );
}
