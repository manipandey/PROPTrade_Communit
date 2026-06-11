import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PropNepal — Nepal's Premier Prop Trading Community",
  description: "Connect with Nepal's funded traders. Share payout proofs, log trading journals, compare prop firm reviews, and master evaluation strategies to access institutional capital.",
  keywords: ["prop trading", "Nepal", "FTMO", "FundedNext", "trading journal", "funded trader"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          id="theme-loader"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('propnepal_theme') || 'dark';
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
