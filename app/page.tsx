/**
 * Landing Page - Symulator Emerytalny ZUS
 * Pulpit podstawowy (pierwszy ekran)
 */

import { ExpectedPensionInput } from '@/components/landing/ExpectedPensionInput';
import { PensionGroupsChart } from '@/components/landing/PensionGroupsChart';
import { FactCard } from '@/components/landing/FactCard';
import { CTAButton } from '@/components/landing/CTAButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center pt-20 pb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            Oficjalny Symulator ZUS
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zus-navy mb-6 tracking-tight">
            Symulator Emerytalny ZUS
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Zaprognozuj swoją przyszłą emeryturę i dowiedz się, ile możesz otrzymywać
          </p>
        </header>

        {/* Main Content - Two Column Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Expected Pension Input */}
            <section className="animate-fadeIn">
              <ExpectedPensionInput />
            </section>

            {/* Pension Groups Chart */}
            <section className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <PensionGroupsChart />
            </section>

            {/* CTA Button */}
            <section className="py-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <CTAButton />
            </section>
          </div>

          {/* Right Column - Tips Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
              <FactCard />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 py-10 border-t border-gray-300">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <span className="text-3xl font-bold text-zus-navy">ZUS</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              © 2025 Zakład Ubezpieczeń Społecznych
            </p>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto">
              Symulator ma charakter edukacyjny i nie stanowi oficjalnej prognozy emerytury.
              Rzeczywista wysokość świadczenia zależy od wielu czynników i wymaga indywidualnej analizy.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
