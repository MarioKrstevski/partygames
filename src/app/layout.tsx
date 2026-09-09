import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import OfflineSupport from "@/components/OfflineSupport";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Party Games — every party game in your pocket",
    template: "%s · Party Games",
  },
  description:
    "Charades, Truth or Dare, Never Have I Ever and more — play instantly with friends, no app install, no account needed. Create custom decks in your own language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <div
          hidden
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: A conventional landing page that proves itself with the product: the motto, then three real game screens in phone frames; features beneath; one game shown in three languages leading into "make your own deck".
OWN-WORLD: near-black violet ground with paper grain; colour lives only in the game screens; one violet for the primary action and the focus ring; Geist at 800 for display; no emoji in the chrome, no gradient text, no kickers.
STORY: "I don't want to install five apps" -> reads the motto -> sees three games already running -> learns it's customizable and in their language -> Start playing now.
FIRST VIEWPORT: motto and Start playing now on the left; three staggered phone frames on the right (Charades, Would You Rather, Never Have I Ever) that rise on load and drift apart as the page scrolls.
FORM: hero, features, language showcase, closing call; seed e32f4c27.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
-->`,
          }}
        />
        <Header />
        {children}
        <Toaster position="top-center" />
        <OfflineSupport />
      </body>
    </html>
  );
}
