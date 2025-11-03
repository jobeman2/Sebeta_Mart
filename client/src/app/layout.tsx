import type { Metadata } from "next";
import "./globals.css";

// Auth Context
import { AuthProvider } from "@/context/Authcontext";
import TopHeader from "@/components/Layout/Topheader/Topheader";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer/Footer";

export const metadata: Metadata = {
  title: "Sebeta Mart",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <AuthProvider>
          <TopHeader />
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
