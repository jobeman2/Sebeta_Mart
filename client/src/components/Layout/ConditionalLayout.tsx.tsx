// app/components/Layout/ConditionalLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import TopHeader from "./Topheader/Topheader";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide header/footer for admin and city-clerk routes
  const hideLayout = pathname?.startsWith("/admin") || pathname?.startsWith("/city-clerk");

  return (
    <>
      {!hideLayout && <TopHeader />}
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
