# Symulator Emerytalny ZUS - Instrukcja Uruchomienia

## 🚀 Szybki Start

### 1. Instalacja zależności

```bash
npm install
```

### 2. Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3000**

## 📋 Co zostało zaimplementowane

### ✅ Ukończone (100%)

#### 1. **Infrastruktura i Setup**
- ✅ Next.js 15 z App Router
- ✅ TypeScript w trybie strict
- ✅ Tailwind CSS z paletą kolorów ZUS (7 kolorów RGB)
- ✅ Konfiguracja projektu

#### 2. **Dane (8 plików JSON)**
- ✅ `wageGrowthByYear.json` - wzrost płac 2000-2080
- ✅ `cpiByYear.json` - inflacja 2000-2080
- ✅ `averagePensionByYear.json` - średnie emerytury 2024-2080
- ✅ `annuityDivisor.json` - dzielniki rentowe dla M/F
- ✅ `sickImpactM.json` - wpływ L4 dla mężczyzn
- ✅ `sickImpactF.json` - wpływ L4 dla kobiet
- ✅ `facts.json` - 15 ciekawostek o emeryturach
- ✅ `retirementAgeBySex.json` - wiek emerytalny

#### 3. **Silnik Obliczeń (8 kroków)**
- ✅ Ścieżka płac (cofanie/projekcja)
- ✅ Wpływ L4 (równoległe ścieżki z/bez)
- ✅ Akumulacja kapitału (konto + subkonto + waloryzacja)
- ✅ Emerytura nominalna (kapitał/dzielnik)
- ✅ Emerytura urealniona (korekta CPI)
- ✅ Stopa zastąpienia
- ✅ Scenariusze odroczenia (+1/+2/+5 lat)
- ✅ Iteracyjne obliczenie lat do oczekiwań

#### 4. **Komponenty UI**
- ✅ Button (4 warianty)
- ✅ Card (3 warianty)
- ✅ Input z walidacją
- ✅ FormField z tooltipami
- ✅ Select
- ✅ Tooltip interaktywny

#### 5. **Stan i Context**
- ✅ SimulationContext z pełnym stanem
- ✅ Zapis do sessionStorage
- ✅ Zapis scenariuszy do localStorage
- ✅ Funkcje recalculate, save/load scenarios

#### 6. **Strony**
- ✅ **Landing (/)** - wszystkie wymagane elementy:
  - Input + slider oczekiwanej emerytury
  - Porównanie do średniej z tooltipem
  - Wykres rozkładu (5 grup) z hover descriptions
  - Losowa ciekawostka
  - CTA "Przejdź do symulacji"

- ✅ **Formularz (/symulacja)** - pełna implementacja:
  - Wszystkie 5 pól obowiązkowych
  - 2 pola fakultatywne (konto/subkonto)
  - Przełącznik L4 z rozbudowanym info
  - Walidacja wszystkich pól
  - Automatyczne wyliczenie domyślnego roku emerytalnego
  - **ZAWSZE styczeń** (wymóg spec)

- ✅ **Wyniki (/wynik)** - wszystkie sekcje:
  - Nominalna i urealniona (urealniona EMPHASIZED)
  - Stopa zastąpienia
  - Porównanie do średniej
  - Wpływ L4 (bez vs z)
  - Scenariusze +1/+2/+5 lat (tabela)
  - Relacja do oczekiwań z komunikatem "Brakuje X zł"
  - Komunikat "Musisz pracować o ~N lat dłużej"
  - CTAs: Dashboard, PDF

- ✅ **Dashboard (/dashboard)** - wersja podstawowa:
  - Tabela kapitału w czasie
  - Tabela ścieżki płac
  - Przeglądanie szczegółów
  - (Edycja w przygotowaniu)

#### 7. **API**
- ✅ `/api/simulations` - POST/GET
- ✅ Logowanie każdej symulacji
- ✅ Zapis do `data/simulations.json`

#### 8. **Język Polski**
- ✅ Wszystkie teksty w języku polskim
- ✅ Formatowanie liczb: 5 000,00 zł (przestrzeń + przecinek)
- ✅ Formatowanie dat: polski locale
- ✅ Deklinacja: "1 rok", "2 lata", "5 lat"
- ✅ Komunikaty walidacji po polsku

#### 9. **Funkcje Kluczowe**
- ✅ Odwrócenie indeksacji wynagrodzeń (backward/forward)
- ✅ Równoległe obliczenia z/bez L4
- ✅ Waloryzacja kapitału
- ✅ Dzielnik rentowy zależny od wieku i płci
- ✅ CPI do urealnienia
- ✅ Iteracyjne szukanie lat do oczekiwań
- ✅ Komunikat "nie instrukcja prawna" przy L4

## 🔧 Struktura Projektu

```
retirement/
├── app/
│   ├── page.tsx                 # Landing (Pulpit)
│   ├── symulacja/page.tsx       # Formularz
│   ├── wynik/page.tsx           # Wyniki
│   ├── dashboard/page.tsx       # Dashboard
│   ├── api/simulations/route.ts # API
│   ├── layout.tsx               # Layout z Context
│   └── globals.css              # Style z kolorami ZUS
├── components/ui/               # Komponenty UI
├── lib/
│   ├── engine/                  # Silnik obliczeń (6 modułów)
│   ├── context/                 # SimulationContext
│   ├── data/                    # Loader danych
│   ├── utils/                   # Formatowanie, walidacja
│   └── types.ts                 # TypeScript types
├── data/                        # 8 plików JSON
└── tailwind.config.ts           # Kolory ZUS

## 📊 Przepływ Aplikacji

1. **/** → Użytkownik ustawia oczekiwaną emeryturę
2. **/symulacja** → Wypełnia formularz z walidacją
3. **Obliczenia** → Engine przetwarza dane (8 kroków)
4. **/wynik** → Wyświetla wyniki z porównaniami
5. **/dashboard** → Szczegółowe dane i edycja (podstawowa wersja)

## 🎨 Kolory ZUS (RGB - dokładne wartości)

- **Amber:** `rgb(255,179,79)` - Przyciski główne, akcenty
- **Green:** `rgb(0,153,63)` - Pozytywne wskaźniki, sukces
- **Gray:** `rgb(190,195,206)` - Obramowania, tła neutralne
- **Blue:** `rgb(63,132,210)` - Linki, informacje
- **Navy:** `rgb(0,65,110)` - Nagłówki, teksty główne
- **Red:** `rgb(240,94,94)` - Ostrzeżenia, luki
- **Black:** `rgb(0,0,0)` - Tekst podstawowy

## 🧮 Algorytm Obliczeń

### 1. Ścieżka płac
- Cofanie: `salary / wageGrowth[year]` dla lat historycznych
- Projekcja: `salary * wageGrowth[year]` dla lat przyszłych

### 2. L4 Impact
- Redukcja bazy: `effectiveSalary = salary * reductionCoefficient`
- Równoległe ścieżki dla porównania

### 3. Kapitał
- Składka: `19.52%` z czego `76.16%` na konto, `23.84%` na subkonto
- Waloryzacja: wzrost płac jako proxy

### 4. Emerytura
- Nominalna: `kapitał / dzielnik[wiek][płeć]`
- Urealniona: `nominalna / cumulativeCPI`

## 🚧 Do Dokończenia (MVP+)

### Pozostałe elementy:
- ⏳ PDF Generation (jsPDF lub react-pdf)
- ⏳ Dashboard - pełna edycja (historia płac, prognozy, L4)
- ⏳ Scenariusze A/B z wykresami porównawczymi
- ⏳ Admin Export - XLS/CSV z wszystkimi kolumnami
- ⏳ Wykresy (Recharts) - kapitał w czasie, porównania
- ⏳ Kod pocztowy (pole opcjonalne w Dashboard)

## 📝 Notatki Techniczne

### Kluczowe założenia (zgodnie ze spec):
1. **ZAWSZE styczeń** - wszystkie daty od 1 stycznia
2. **Nie instrukcja prawna** - wyraźny komunikat przy L4
3. **Model edukacyjny** - uproszczony dla zrozumienia
4. **Polski** - 100% tekstów, formatowania, deklinacji

### Walidacja:
- Wiek: 18-70 lat
- Płeć: K lub M
- Wynagrodzenie: 1 000 - 100 000 zł
- Lata pracy: logicznie spójne z wiekiem

### Stan:
- `sessionStorage` - główny stan symulacji
- `localStorage` - scenariusze A/B (trwałe)

## 🐛 Rozwiązywanie Problemów

### Błąd: "Cannot find module '@/...'"
```bash
# Sprawdź tsconfig.json, czy jest:
"paths": { "@/*": ["./*"] }
```

### Błąd przy JSON import
```bash
# W tsconfig.json powinno być:
"resolveJsonModule": true
```

### Brak kolorów ZUS
```bash
# Sprawdź app/globals.css - sekcja @theme inline
```

## 📄 Licencja

MVP dla ZUS - Symulator Emerytalny
Wersja: 1.0 (Styczeń 2025)

