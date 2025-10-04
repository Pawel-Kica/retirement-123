import type { Metadata } from "next";
import "./globals.css";
import { SimulationProvider } from "@/lib/context/SimulationContext";
import { Header } from "@/components/ui/Header";
import { ClientBody } from "@/components/ClientBody";
import { HistorySidebar } from "@/components/ui/HistorySidebar";
import { SnakeGame } from "@/components/ui/SnakeGame";

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
      <ClientBody className="antialiased">
        <SimulationProvider>
          <Header />
          {children}
        </SimulationProvider>
      </ClientBody>
    </html>
  );
}
