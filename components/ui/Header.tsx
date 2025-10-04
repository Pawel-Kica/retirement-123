"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Pre-calculate EU star positions to avoid hydration mismatch
const EU_STAR_POSITIONS = [...Array(12)].map((_, i) => {
  const angle = (i * 30 - 90) * (Math.PI / 180);
  const x = 24 + 14 * Math.cos(angle);
  const y = 24 + 14 * Math.sin(angle);
  return { x, y };
});

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logoZUSnoweRozwiniecie.png"
                alt="ZUS - Zakład Ubezpieczeń Społecznych"
                width={340}
                height={60}
                className="h-10 md:h-12 lg:h-14 w-auto"
                priority
              />
            </Link>

            {/* Hamburger Menu Button - Visible on tablet and mobile */}
            <button
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <span
                className={`w-6 h-0.5 bg-[rgb(0,65,110)] transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
              ></span>
              <span
                className={`w-6 h-0.5 bg-[rgb(0,65,110)] transition-all ${isMenuOpen ? "opacity-0" : ""
                  }`}
              ></span>
              <span
                className={`w-6 h-0.5 bg-[rgb(0,65,110)] transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
              ></span>
            </button>

            {/* Navigation and Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
              {/* Kontakt */}
              <Link
                href="#"
                className="text-gray-700 hover:text-[rgb(0,65,110)] font-medium transition-colors cursor-pointer"
              >
                Kontakt
              </Link>

              {/* Language Selector */}
              <button className="flex items-center gap-1 text-gray-700 hover:text-[rgb(0,65,110)] font-medium transition-colors cursor-pointer">
                <span>PL</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Accessibility Buttons */}
              <button
                className="w-12 h-12 bg-[rgb(0,65,110)] hover:bg-[rgb(0,65,110)]/90 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Wersja dla osób z wadami słuchu"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2zM7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.79 5 11.51 5 9s1.01-4.79 2.64-6.36zM11.5 9c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5z" />
                </svg>
              </button>

              <button
                className="w-12 h-12 bg-[rgb(0,65,110)] hover:bg-[rgb(0,65,110)]/90 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Wersja dla osób niepełnosprawnych"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2zm-14.5 2c-1.67 0-3.15 1.06-3.71 2.63l-.54 1.58 1.94.66.54-1.58c.26-.76.97-1.29 1.77-1.29.19 0 .38.03.56.08l1.34.41 1.33-4-1.34-.41c-.36-.11-.74-.17-1.13-.17-.18 0-.36.01-.54.04L8.04 9.5C7.38 9.77 6.77 10 6.13 10H3v2h3.13c.84 0 1.64-.27 2.32-.78l.32-.24 1.33 4h2.4v-2h-1.47l-.66-2h4.64l.66 2H17v2h-2.4l-1.33-4-.32.24c-.68.51-1.48.78-2.32.78H7.5z" />
                </svg>
              </button>

              {/* BIP Logo */}
              <div className="w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 60 40" className="h-10 w-auto">
                  <text
                    x="5"
                    y="25"
                    fill="#d32f2f"
                    fontWeight="bold"
                    fontSize="20"
                    fontFamily="Arial, sans-serif"
                  >
                    bip
                  </text>
                </svg>
              </div>

              {/* Registration Button */}
              <Link
                href="#"
                className="px-4 py-2.5 border-2 border-[rgb(0,65,110)] text-[rgb(0,65,110)] hover:bg-[rgb(0,65,110)] hover:text-white rounded font-medium transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer"
              >
                Zarejestruj w PUE/eZUS
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

              {/* Login Button */}
              <Link
                href="#"
                className="px-4 py-2.5 bg-[rgb(255,179,79)] hover:bg-[rgb(255,179,79)]/90 text-[rgb(0,65,110)] rounded font-medium transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer"
              >
                Zaloguj do PUE/eZUS
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

              {/* Search Button */}
              <button
                className="w-12 h-12 border-2 border-gray-300 hover:border-[rgb(0,65,110)] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Szukaj"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* EU Flag */}
              <div className="flex flex-col items-center ml-2">
                <div className="w-12 h-12 bg-[rgb(0,51,153)] rounded flex items-center justify-center relative">
                  {/* EU Stars */}
                  {EU_STAR_POSITIONS.map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5"
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="#FFD700"
                        className="w-full h-full"
                      >
                        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-[rgb(0,65,110)] font-medium mt-1">
                  Unia Europejska
                </span>
              </div>
            </div>
          </div>

          {/* Mobile and Tablet Menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen
              ? "max-h-[1000px] opacity-100 mt-4"
              : "max-h-0 opacity-0"
              }`}
          >
            <div className="flex flex-col gap-4 pb-4">
              {/* Main Actions - Full width buttons */}
              <Link
                href="#"
                className="w-full px-4 py-3 bg-[rgb(255,179,79)] hover:bg-[rgb(255,179,79)]/90 text-[rgb(0,65,110)] rounded font-medium transition-colors flex items-center justify-between cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Zaloguj do PUE/eZUS</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

              <Link
                href="#"
                className="w-full px-4 py-3 border-2 border-[rgb(0,65,110)] text-[rgb(0,65,110)] hover:bg-[rgb(0,65,110)] hover:text-white rounded font-medium transition-colors flex items-center justify-between cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Zarejestruj w PUE/eZUS</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Navigation Links and Tools */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="#"
                  className="text-gray-700 hover:text-[rgb(0,65,110)] font-medium transition-colors cursor-pointer text-center py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kontakt
                </Link>

                <button className="flex items-center justify-center gap-1 text-gray-700 hover:text-[rgb(0,65,110)] font-medium transition-colors cursor-pointer py-2">
                  <span>PL</span>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Accessibility and Tools Row */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  className="w-12 h-12 bg-[rgb(0,65,110)] hover:bg-[rgb(0,65,110)]/90 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Wersja dla osób z wadami słuchu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2zM7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.79 5 11.51 5 9s1.01-4.79 2.64-6.36zM11.5 9c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5z" />
                  </svg>
                </button>

                <button
                  className="w-12 h-12 bg-[rgb(0,65,110)] hover:bg-[rgb(0,65,110)]/90 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Wersja dla osób niepełnosprawnych"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2zm-14.5 2c-1.67 0-3.15 1.06-3.71 2.63l-.54 1.58 1.94.66.54-1.58c.26-.76.97-1.29 1.77-1.29.19 0 .38.03.56.08l1.34.41 1.33-4-1.34-.41c-.36-.11-.74-.17-1.13-.17-.18 0-.36.01-.54.04L8.04 9.5C7.38 9.77 6.77 10 6.13 10H3v2h3.13c.84 0 1.64-.27 2.32-.78l.32-.24 1.33 4h2.4v-2h-1.47l-.66-2h4.64l.66 2H17v2h-2.4l-1.33-4-.32.24c-.68.51-1.48.78-2.32.78H7.5z" />
                  </svg>
                </button>

                <button
                  className="w-12 h-12 border-2 border-gray-300 hover:border-[rgb(0,65,110)] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Szukaj"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>

                <div className="w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 60 40" className="h-10 w-auto">
                    <text
                      x="5"
                      y="25"
                      fill="#d32f2f"
                      fontWeight="bold"
                      fontSize="20"
                      fontFamily="Arial, sans-serif"
                    >
                      bip
                    </text>
                  </svg>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[rgb(0,51,153)] rounded flex items-center justify-center relative">
                    {/* EU Stars */}
                    {EU_STAR_POSITIONS.map((pos, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5"
                        style={{
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="#FFD700"
                          className="w-full h-full"
                        >
                          <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-[rgb(0,65,110)] font-medium mt-1">
                    Unia Europejska
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
