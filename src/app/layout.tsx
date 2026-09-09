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
THESIS: The library is the hero. A catalog wall of live game screens in rows named for the people in the room; refuses the centered hero, feature grid and three-step how-it-works.
OWN-WORLD: near-black violet ground; the tiles are the only colour, each game wearing its own screen; one violet ring on the focused tile; Geist at 800 for display, all-caps row headings tracked +0.08em; no emoji in the chrome, no gradient text.
STORY: "I could be playing in ten seconds" -> sees real games already running -> picks the row that matches who is in the room -> Start playing now.
FIRST VIEWPORT: hook line top-left with Start playing now; beneath it the Most played row of portrait tiles bleeding off the right edge, second row heading visible. Rails scroll horizontally with snap; the focused tile grows and reveals title, players and minutes, one line; its row lifts and the others dim.
FORM: streaming title-card wall; catalog challenger that beat the dealt structures; seed e32f4c27.
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
