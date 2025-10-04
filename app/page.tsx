"use client";

import { useEffect, useRef } from "react";
import { CTAButton } from "@/components/ui/CTAButton";
import { VerticalCarousel } from "@/components/ui/VerticalCarousel";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { useRouter } from "next/navigation";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

// Interactive Background Component
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const particleCount = 80;
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: ["#00843D", "#0088CC", "#F5A623", "#0B4C7C"][
          Math.floor(Math.random() * 4)
        ],
      });
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      newParticles.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + "80";
        ctx.fill();

        // Draw connections
        newParticles.forEach((otherParticle, j) => {
          if (i === j) return;
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = particle.color + Math.floor((1 - distance / 150) * 30).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Mouse interaction
        const mdx = mousePos.current.x - particle.x;
        const mdy = mousePos.current.y - particle.y;
        const mDistance = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDistance < 200) {
          particle.x -= (mdx / mDistance) * 0.5;
          particle.y -= (mdy / mDistance) * 0.5;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-[calc(100vh-92px)] bg-gradient-to-br from-white via-zus-green-light to-white relative overflow-hidden">
      <InteractiveBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mt-8">
        <div className="text-center mb-12 py-8">
          <div className="inline-block mb-4 px-4 py-2 bg-zus-green/10 rounded-full border border-zus-green/20">
            <span className="text-sm font-semibold text-zus-green">
               Symulator ZUS • Dane Rzeczywiste • 100% Darmowe
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-zus-grey-900 mb-2 leading-tight">
            Twoja Emerytura
          </h1>
          
          <div className="mb-6">
            <VerticalCarousel
              phrases={[
                "Precyzyjnie Obliczona",
                "Realistycznie Zaplanowana",
                "Dokładnie Prognozowana",
                "Mądrze Zaprognozowana",
                "Pewnie Oszacowana"
              ]}
              interval={3000}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-zus-green to-zus-blue bg-clip-text text-transparent"
            />
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Symulator emerytalny oparty na <span className="font-bold text-zus-green">rzeczywistych danych ZUS i aktualnych przepisach</span>.
            Poznaj swoją przyszłość finansową w 60 sekund.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-zus-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Dokładne Dane</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-zus-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Aktualne Przepisy</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-zus-orange" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Błyskawiczne Wyniki</span>
            </div>
          </div>

          {/* CTA Button */}
          <CTAButton onClick={() => router.push("/kalkulator")}>
            Rozpocznij Symulację
          </CTAButton>

          {/* Navigation Links */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
    
            <div 
              onClick={() => router.push("/zus")}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-zus-orange"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-zus-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-xl font-bold text-zus-grey-900 mb-2">Timeline</h3>
                <p className="text-zus-grey-700 text-sm">Planuj okresy pracy i bezrobocia</p>
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>
    </main>
  );
}
