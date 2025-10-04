---
title: Kompas Emerytalny — Koncepcje
author: Zespół
version: 0.1
last_updated: 2025-10-04
---

# Koncepcje: szybkie edukatory emerytalne

Spis treści:
- [Koncepcja 1 — Kompas Emerytalny („60 sekund do obrazu przyszłości”)](#koncepcja-1--kompas-emerytalny-60-sekund-do-obrazu-przyszłości)
- [Koncepcja 2 — Ścieżki Życia („Symulator zdarzeń na osi czasu”)](#koncepcja-2--ścieżki-życia-symulator-zdarzeń-na-osi-czasu)
- [Koncepcja 3 — Dźwignia Czasu („Ile warte jest +5 lat?”)](#koncepcja-3--dźwignia-czasu-ile-warte-jest-5-lat)
- [Źródła i dane](#źródła-i-dane)

---

## Koncepcja 1 — Kompas Emerytalny („60 sekund do obrazu przyszłości”)

### Problem & Insight
Młodzi pracownicy i freelancerzy odkładają temat emerytury — zbyt abstrakcyjne. Potrzebują błyskawicznego, prostego obrazu: „ile mogę dostać i co zwiększa/zmniejsza wynik”.

### Pomysł (nazwa, opis, mechanika)
Kompas Emerytalny — mikro-symulator w 3 krokach (~60 s). Użytkownik przesuwa 4 suwaki:
- pensja brutto
- wiek/rok startu
- planowany wiek przejścia
- „L4 w roku” (np. 0–3 mies.)

**Wynik:** duży wskaźnik (zegar/gauge) i dwie liczby: nominalna oraz w cenach dzisiejszych. Szybkie karty „co, jeśli +1/+2/+5 lat?”.

### Persona & emocje
- Junior dev / młody pracownik — „Chcę zobaczyć wynik bez wczytywania się”.
- Freelancer B2B — „Mam nieregularne miesiące — czy to bardzo boli?”
- 40-latek z rodziną — „Czy wystarczy? Co da +2 lata pracy?”

### MVP — funkcje
- Formularz minimalny: wiek, płeć, pensja brutto, lata pracy (start/stop), środki na koncie (opcjonalnie), przełącznik „uwzględnij L4” (slider miesięcy).
- Wynik: emerytura nominalna i realna, stopa zastąpienia (brutto), porównanie do przeciętnej.
- Karty „+1/+2/+5 lat” (przeliczane on-the-fly).
- Pobranie PDF (1 strona: wykres + parametry + podsumowanie).

### Tech Stack
- **Frontend:** Next.js (React, TS), Tailwind, react-hook-form + Zod, react-chartjs-2 (Chart.js), jsPDF + html2canvas.
- **Backend:** brak (czysty klient). Dane bazowe (tablica GUS, ścieżka CPI, benchmark ZUS) jako lokalne JSON/CSV; opcjonalnie Cloud Function/Vercel Edge do aktualizacji benchmarków.

### UI/UX — koncepcja (2–3 ekrany)
- Onboarding 60 s — 4 suwaki + przełącznik „uwzględnij L4”.
- Dashboard — duży gauge (emerytura **realna**), mini-cards: stopa zastąpienia, „vs. przeciętna”, „+1/+2/+5”.
- Raport PDF — podgląd + przycisk „Pobierz”.

### Wizualizacja wyników
- Gauge (emerytura realna), pasek porównawczy vs. przeciętna, sparkline wzrostu kapitału.
- Tooltip „dlaczego taka kwota?” — wzór: \(\text{Emerytura} \approx \frac{\sum \text{składek}}{K}\) + zastrzeżenie (Źródła: ZUS/GUS/NBP).

### Pitch & demo (3 min)
Wejście: „Ile masz dziś lat i ile chcesz mieć spokoju po 65?”  
Przesuwamy „wiek emerytalny” i „L4” — gauge skacze, a karta „+2 lata” pokazuje +X%.  
PDF „dla mnie” i „dla ucznia” — 1 klik. Efekt: natychmiastowy feedback + klarowna narracja.

### Wartość edukacyjna
- Uczy mechaniki dzielnika K i wpływu miesięcy bez składek.
- Uczy myślenia „realnie” (po inflacji) i „vs. przeciętna”.

### Rozwój po hackathonie
- Wczytywanie danych z PUE ZUS (po zalogowaniu) — „1 klik, bez wpisywania”.
- Scenariusze dla PPK/IKZE (warstwa porównawcza).
- Publiczne API do embedu w kursach edukacyjnych.

---

## Koncepcja 2 — Ścieżki Życia („Symulator zdarzeń na osi czasu”)

### Problem & Insight
Decyzje zawodowe są rozrzucone w czasie: urlop rodzicielski, okres freelancingu, dłuższe L4, podwyżka. Użytkownik nie widzi kumulatywnego efektu.

### Pomysł (nazwa, opis, mechanika)
Ścieżki Życia — budujesz **oś czasu** z kart-zdarzeń (np. „2 mies. L4”, „przerwa w pracy”, „awans +20%”, „powrót na etat”). Każda karta aktualizuje kapitał i dzielnik K w roku przejścia.

### Persona & emocje
- Studentka wchodząca na rynek — „Co jeśli rok przerwy?”
- Mama wracająca do pracy — „Urlop i L4 a emerytura — pokaż na timeline.”
- Kontraktor IT — „Zerowe składki w części roku — jak to boli?”

### MVP — funkcje
- Oś czasu: dodawanie kafli zdarzeń (L4, bezrobocie, podwyżka).
- Szybkie presety: „etat”, „freelance”, „miks”.
- Wynik: nominalna/realna, stopa zastąpienia, vs. przeciętna, +1/+2/+5.
- PDF z obrazem osi czasu.

### Tech Stack
- **Frontend:** SvelteKit (szybkie interakcje), TypeScript.
- **Wizualizacje:** ECharts (timeline + area), pdfmake, Zod.
- **Backend:** brak (dane w plikach).

### UI/UX — ekrany
- Canvas ścieżki — drag&drop kart-zdarzeń (minimalizm, duże hitboxy, dostępność klawiaturą).
- Dashboard skutków — 3 kafle + wykres kumulacji środków.
- Raport — „Moja ścieżka” z opisem skutków.

### Wizualizacja wyników
- **Waterfall:** wpływ zdarzeń na kapitał (ile „kosztowały” nieskładkowe miesiące).
- **Timeline area:** przyrost konta vs. brak przy danym zdarzeniu.
- Karty „co da +2 lata?”.

### Pitch & demo
W 120 s budujemy ścieżkę: „rok freelance (0 składek), 2 mies. L4, awans +20%”.  
Wykres „waterfall” pokazuje spadki/wzrosty i finalny efekt na stopie zastąpienia. Atut: storytelling na osi czasu.

### Wartość edukacyjna
Uczy różnicy między okresami składkowymi i nieskładkowymi oraz „cenie” przerw.

### Rozwój
- Scenariusze predefiniowane (np. „5 lat kariery w UE”, „kariera medyczna”).
- Integracja z danymi o średnim wynagrodzeniu GUS dla branż — automatyczne profile.
- Eksport ścieżek jako link edukacyjny (dla szkół/NGO).

---

## Koncepcja 3 — Dźwignia Czasu („Ile warte jest +5 lat?”)

### Problem & Insight
Ludzie niedoszacowują wpływu późniejszego przejścia na emeryturę (działa podwójnie: większy licznik, mniejszy mianownik). Potrzebny jasny „efekt dźwigni”.

### Pomysł (nazwa, opis, mechanika)
Dźwignia Czasu — jednopanelowy dashboard ze suwakiem wieku emerytalnego i natychmiastowym porównaniem 5 wariantów (–0, +1, +2, +3, +5). W jednym kadrze: tabela i wykres.

### Persona & emocje
- Osoba 55+ — „Czy opłaca się zostać o 2 lata dłużej?”
- Samorząd/edukator — „Chcę to pokazywać na slajdzie uczniom i rodzicom.”

### MVP — funkcje
- Jedno okno: parametry + wyniki dla 5 wariantów.
- Wykres „słupkowy wachlarz” dla emerytury realnej i stopy zastąpienia.
- PDF z tabelą i krótką interpretacją.

### Tech Stack
- **Frontend:** React + Vite, Recharts, jspdf-autotable.
- **Backend:** brak; dane parametryczne lokalne.

### UI/UX — ekrany
- Panel „Dźwignia” — parametry po lewej, po prawej 5 słupków + interpretacja.
- Raport — gotowy do druku (A4).

### Wizualizacja wyników
- **Bar-fan:** 5 słupków (0/+1/+2/+3/+5).
- Linia „vs. przeciętna” jako odniesienie.
- Badge „najlepszy kompromis” — heurystyka (np. +2).

### Pitch & demo
W 90 sekund pokazujemy, że przesuwając suwak z 65 → 67: słupek rośnie o X% (realnie), a stopa zastąpienia zbliża się do celu. Jedno okno, pełen obraz dźwigni czasu.

### Wartość edukacyjna
Krystalicznie objaśnia mechanikę dzielnika K i waloryzowanie o CPI (realny vs nominalny).

### Rozwój
- Tryb „klasowy” — wyświetlacz do sal szkolnych (QR do ustawień).
- Prosty endpoint do osadzeń w serwisach gmin/powiatów.

---

## Źródła i dane
- ZUS — wskaźniki, formuły (dzielnik K, waloryzacje).
- GUS/Statistics Poland — CPI, przeciętne wynagrodzenie.
- NBP — dane makro pomocnicze.

> Uwaga: w prototypie dane jako lokalne JSON/CSV; w wersji rozwojowej aktualizacja przez lekką funkcję edge.

