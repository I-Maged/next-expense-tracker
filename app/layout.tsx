import { Google_Sans_Flex } from "next/font/google";

import "./globals.css";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  // Google Sans Flex has no entry in Next's precalculated fallback-metrics
  // table, so the automatic lookup always fails. A manual fallback list
  // bypasses that lookup entirely (silences the build warning); combined
  // with adjustFontFallback: false no size-adjust CSS is generated either.
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${googleSansFlex.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
