import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { WeddingProvider } from "@/context/WeddingContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wedding Planner 💍",
  description: "Organiza el día más especial de tu vida",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-rose-50">
        <WeddingProvider>
          <div className="flex">
            <Navigation />
            <main className="flex-1 md:ml-56 pb-24 md:pb-0 min-h-screen">
              {children}
            </main>
          </div>
        </WeddingProvider>
      </body>
    </html>
  );
}
