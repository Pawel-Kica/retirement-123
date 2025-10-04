import type { Metadata } from "next";
import "./globals.css";
import { SimulationProvider } from "@/lib/context/SimulationContext";
import { Header } from "@/components/ui/Header";

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
        <SimulationProvider>
          <Header />
          {children}
        </SimulationProvider>
      </body>
    </html>
  );
}
