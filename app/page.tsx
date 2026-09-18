import { headers } from "next/headers";

import { BottomCta } from "@/components/homepage/BottomCta";
import { Features } from "@/components/homepage/Features";
import { Hero } from "@/components/homepage/Hero";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const authenticated = session !== null;

  return (
    <div className="flex min-h-full flex-col">
      <Navbar ctaHref={authenticated ? "/dashboard" : "/signup"} />
      <main className="flex flex-1 flex-col">
        <Hero authenticated={authenticated} />
        <Features />
        <HowItWorks />
        <BottomCta authenticated={authenticated} />
      </main>
      <Footer authenticated={authenticated} />
    </div>
  );
}
