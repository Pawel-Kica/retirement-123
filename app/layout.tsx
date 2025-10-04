import type { Metadata } from "next";
import "./globals.css";
import { SimulationProvider } from "@/lib/context/SimulationContext";
import { Header } from "@/components/ui/Header";
import { HistorySidebar } from "@/components/ui/HistorySidebar";

export const metadata: Metadata = {
  title: "Symulator Emerytalny ZUS",
  description: "Zaprognozuj swoją przyszłą emeryturę - oficjalny symulator ZUS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">
        <Header />
        <SimulationProvider>
          {children}
          <HistorySidebar />
        </SimulationProvider>
      </body>
    </html>
  );
}
