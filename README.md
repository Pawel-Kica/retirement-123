# Specyfikacja funkcjonalna (MVP) — Symulator Emerytalny

## 0) Założenia wstępne

- Aplikacja webowa osadzona/udostępniona z witryny ZUS.
- Paleta kolorów (zgodna/zbliżona do Księgi Znaku ZUS):

  - Amber `rgb(255,179,79)`, Green `rgb(0,153,63)`, Gray `rgb(190,195,206)`,
  - Blue `rgb(63,132,210)`, Navy `rgb(0,65,110)`, Red `rgb(240,94,94)`, Black `rgb(0,0,0)`.

- Źródła danych (wgrane jako snapshoty do MVP):

  - „Prognoza wpływów i wydatków FUS do 2080 r.” (ZUS),
  - GUS (CPI, średnie płace), NBP, MF oraz inne dane ZUS.

---

## 1) Pulpit podstawowy (pierwszy ekran)

**Cel:** Ustawić oczekiwanie użytkownika i pokazać kontekst.

1. Pole „Oczekiwana emerytura (w dzisiejszych zł)” — input + slider.
2. Porównanie do obecnej średniej emerytury (etykieta/tooltip z wyjaśnieniem).
3. Wykres rozkładu grup emerytur (np. 3–5 segmentów):

   - „Poniżej minimalnej”, „Około minimalnej”, „Około średniej”, „Powyżej średniej”.
   - **Po najechaniu:** krótka charakterystyka grupy (np. dla „poniżej minimalnej”: niska aktywność zawodowa, brak stażu 25/20 lat → brak gwarancji minimum).

4. Losowa ciekawostka (np. „Czy wiesz, że… najwyższa emerytura: X zł; staż: Y lat; 0 dni L4”).
5. CTA: „Przejdź do symulacji”.

---

## 2) Symulacja emerytury (formularz)

**Cel:** Zebrać dane wejściowe i wybrać tryb liczenia.

**Obowiązkowe pola:**

1. Wiek (lata).
2. Płeć (K/M).
3. Wynagrodzenie brutto miesięczne (PLN, dziś).
4. Rok rozpoczęcia pracy (**zawsze styczeń danego roku**).
5. Planowany rok zakończenia aktywności zawodowej (**domyślnie** rok osiągnięcia wieku emerytalnego, **liczony od stycznia**).

**Fakultatywne pola:** 6. Wysokość zgromadzonych środków na **koncie** ZUS (jeśli znana). 7. Wysokość zgromadzonych środków na **subkoncie** ZUS (jeśli znana).

- Jeśli brak — system potrafi oszacować z samego wynagrodzenia i wskaźników.

**Opcje:** 8. Przełącznik „Uwzględniaj możliwość zwolnień lekarskich (L4)”.

- Obok: informacja o średniej długości L4 w Polsce dla K/M i **jak średnio obniża to świadczenie** (opis efektu, nie instrukcja prawna).

**Zasady przeliczeń ustawiane w tle (dla MVP):** 9. Odwrócenie indeksacji wynagrodzeń: z dzisiejszego brutto cofamy się do roku startu i prognozujemy do roku zakończenia używając średniego wzrostu płac (NBP/GUS). 10. Po kliknięciu „Zaprognozuj moją przyszłą emeryturę” → przejście do ekranu „Wynik”.

---

## 3) Wynik (podsumowanie symulacji)

**Cel:** Pokazać kwoty i kontekst porównawczy, plus warianty.

**Wyniki główne:**

1. **Wysokość rzeczywista (nominalna)** — emerytura w roku przejścia.
2. **Wysokość urealniona (w dzisiejszych zł)** — skorygowana CPI do „dziś”.

**Porównania i wskaźniki:** 3. Relacja do **prognozowanej średniej emerytury** w roku przejścia (wyświetl różnicę). 4. **Stopa zastąpienia** = emerytura (nominalna) / zindeksowane wynagrodzenie w roku przejścia. 5. **Wpływ L4**:

- „Bez uwzględnienia L4” vs „Z uwzględnieniem L4” (różnica w emeryturze i/lub bazie).

6. **Odroczenie przejścia na emeryturę**:

   - Warianty **+1, +2, +5 lat** — pokaż o ile wzrosłoby świadczenie.

7. **Relacja do oczekiwań** z pulpitu:

   - Jeśli prognoza < oczekiwanie → komunikat „Brakuje X zł”.
   - **Dodatkowo:** „Musisz pracować o ~N lat dłużej, aby osiągnąć oczekiwaną kwotę” (estymacja).

     - N wylicz z iteracyjnego zwiększania lat pracy w modelu (przy założeniach stałych).

**Nawigacja/akcje:** 8. CTA: „Przejdź do Dashboardu” (szersze modyfikacje założeń). 9. Akcja: „Pobierz raport (PDF)” (zawiera dane wejściowe, wykresy, tabele, założenia).

---

## 4) Dashboard (zaawansowane modyfikacje)

**Cel:** Dopracować scenariusz i zobaczyć wpływ zmian.

1. **Historia zarobków (przeszłość)** — tabela roczna:

   - Możliwość wpisania konkretnych kwot brutto dla wybranych lat (nadpisanie ścieżki).

2. **Prognozy (przyszłość)**:

   - Wprowadzenie innych kwot w przyszłości **lub** innego wskaźnika indeksacji płac (np. ręczna korekta % dla lat).

3. **Okresy chorobowe**:

   - Dodawanie okresów L4 (dni/rok) w przeszłości i przyszłości.

4. **Kapitał w czasie**:

   - Podgląd jak rośnie kwota na **koncie** i **subkoncie** ZUS rok do roku (wykres liniowy + tabela).

5. **Przelicz/Porównaj**:

   - Przycisk „Przelicz” po zmianach.
   - Prosta funkcja „Zapisz scenariusz A/B” i porównanie na wykresie (dobrowolne, lokalne).

6. **Eksport**:

   - „Pobierz raport (PDF)” dla aktualnego scenariusza.

---

## 5) Raport użytkownika (PDF)

**Zawartość:**

1. Parametry wejściowe (wiek, płeć, brutto, start/koniec, L4 on/off, konto/subkonto jeśli podano).
2. Założenia modelu użyte w obliczeniach (nazwy wskaźników i wartości z roku/zakresu).
3. Wyniki: nominalna i urealniona, stopa zastąpienia, relacje do średniej i oczekiwań.
4. Warianty +1/+2/+5 lat.
5. Wpływ L4: porównanie „bez” vs „z”.
6. Wykresy i tabele (m.in. kapitał konto/subkonto, ścieżka płac, wynik).
7. Data/godzina wygenerowania i wersja zestawu założeń.

---

## 6) Kod pocztowy (opcjonalny)

1. Na końcu ścieżki (np. w „Wynik” lub „Dashboard”): pole „Kod pocztowy” — **nieobowiązkowe**.
2. Używane wyłącznie do zagregowanych statystyk (w MVP: do pliku eksportu admina).

---

## 7) Raportowanie zainteresowania (admin export)

**Akcja dostępna z poziomu administratora narzędzia:**

- Eksport pliku **XLS/CSV** z nagłówkami:

  - **Data użycia**, **Godzina użycia**, **Emerytura oczekiwana**,
  - **Wiek**, **Płeć**, **Wysokość wynagrodzenia**,
  - **Czy uwzględniał okresy choroby**,
  - **Wysokość zgromadzonych środków na koncie**,
  - **Wysokość zgromadzonych środków na subkoncie**,
  - **Emerytura rzeczywista (nominalna)**,
  - **Emerytura urealniona**,
  - **Kod pocztowy**.

---

## 8) Logika obliczeń — krok po kroku (uproszczony model edukacyjny)

1. **Ścieżka płac**:

   - Z dzisiejszego brutto wyznaczamy wartości dla lat przeszłych i przyszłych, cofając/projektując wg średniego wzrostu płac (GUS/NBP).
   - Start i koniec zawsze w **styczniu** wskazanych lat.

2. **Wpływ L4** (jeśli włączone):

   - Dla K/M stosujemy średni roczny „współczynnik redukcji” bazy składkowej wynikający z L4.
   - Liczymy dwie ścieżki równolegle: **bez L4** i **z L4**.

3. **Składki i kapitał**:

   - Na bazie (z/bez L4) naliczamy składki emerytalne (parametr, np. 19,52%) i dopisujemy do **konta**.
   - **Subkonto** waloryzujemy osobno (parametry).
   - Coroczna waloryzacja kapitału zgodnie z przyjętymi wskaźnikami (snapshot z prognozy).

4. **Wyliczenie emerytury**:

   - **Nominalna**: suma kapitału / dzielnik (oczekiwana liczba miesięcy pobierania, zależna od wieku i płci).
   - **Urealniona**: nominalna podzielona przez skumulowany CPI do „dzisiaj”.

5. **Wskaźniki porównawcze**:

   - **Stopa zastąpienia** = emerytura nominalna / płaca zindeksowana w roku przejścia.
   - **Vs średnia**: porównanie do prognozowanej średniej emerytury w roku przejścia.

6. **Warianty odroczenia**:

   - +1/+2/+5 lat: dłuższy okres składkowy + krótszy okres pobierania → wyższa kwota.

7. **Ile lat brakuje do oczekiwań**:

   - Iteracyjnie zwiększamy rok zakończenia do momentu osiągnięcia oczekiwanej kwoty (maks. sensowny limit), zwracamy szacowane **N lat**.

---

## 9) Dane do wgrania w MVP (snapshoty)

- `wageGrowthByYear.json` — średni wzrost płac.
- `cpiByYear.json` — CPI.
- `averagePensionByYear.json` — prognoza średnich świadczeń.
- `annuityDivisor.json` — dzielniki (wiek/płeć).
- `sickImpactM.json`, `sickImpactF.json` — współczynniki redukcji bazy.
- `facts.json` — ciekawostki do pulpitu.
- `retirementAgeBySex.json` — wiek emerytalny do wyliczenia roku domyślnego.

---

# Prompt dla Agenta AI (Next.js + TypeScript)

Zbuduj MVP „Symulator Emerytalny ZUS” według poniższej listy funkcjonalności. Skup się na logice i ekranach; pomiń WCAG/testy/telemetrię.

**Stack:** Next.js (App Router), TypeScript, Tailwind, Recharts (wykresy), `xlsx` (export admin), generator PDF (HTML→PDF).

**Strony:**

- `/` (Pulpit): input „Oczekiwana emerytura”, wykres grup, ciekawostka, przycisk „Przejdź do symulacji”.
- `/symulacja`: formularz z polami obowiązkowymi (wiek, płeć, brutto, rok startu **styczeń**, rok końca **styczeń** z domyślnym wiekiem emerytalnym) i fakultatywnymi (konto, subkonto), przełącznik L4, przycisk „Zaprognozuj”.
- `/wynik`: wyświetl **nominalną** i **urealnioną**; pokaż: vs średnia w roku przejścia, **stopę zastąpienia**, wpływ L4 (bez vs z), warianty **+1/+2/+5** lat, relację do oczekiwań (brakująca kwota) oraz komunikat „pracuj ~N lat dłużej” jeśli poniżej oczekiwań; akcje: „Dashboard”, „Pobierz raport (PDF)”.
- `/dashboard`: edycja historii płac (tabela), prognoz (alternatywne wskaźniki/kwoty), okresów L4 (dni/rok), podgląd kapitału konto/subkonto w czasie (wykres + tabela), zapisz szybkie scenariusze A/B (lokalnie), „Przelicz”, „Pobierz raport (PDF)”.
- `/admin/export`: pobranie pliku XLS/CSV z nagłówkami:
  `Data użycia, Godzina użycia, Emerytura oczekiwana, Wiek, Płeć, Wysokość wynagrodzenia, Czy uwzględniał okresy choroby, Wysokość zgromadzonych środków na koncie, Wysokość zgromadzonych środków na subkoncie, Emerytura rzeczywista, Emerytura urealniona, Kod pocztowy`.

**Silnik (moduł):**

1. Zbuduj ścieżkę płac (cofanie/projekcja po `wageGrowthByYear`).
2. Policz wersje **bez L4** i **z L4** (redukcja bazy po `sickImpact{M/F}`).
3. Składki → kapitał konto/subkonto + waloryzacja roczna (parametry z prognozy).
4. Emerytura **nominalna** = kapitał / `annuityDivisor`.
5. Emerytura **urealniona** = nominalna / skumulowany CPI do „dziś”.
6. Stopa zastąpienia, porównanie do `averagePensionByYear`.
7. Warianty **+1/+2/+5**.
8. Szacowanie **N lat** do osiągnięcia oczekiwań (iteracyjnie).

**Wejście użytkownika (do PDF i exportu):**

- Wiek, Płeć, Brutto, Rok startu (styczeń), Rok końca (styczeń),
- L4: on/off,
- Konto, Subkonto (opcjonalnie),
- Oczekiwana emerytura (z pulpitu),
- Kod pocztowy (opcjonalnie).

**Artefakty:**

- Generuj raport PDF z: wejściami, założeniami, wynikami (nominal/real), stopą zastąpienia, vs średnia, L4 bez/z, wariantami +1/+2/+5, wykresami i tabelami, timestampem i wersją założeń.
- Generuj plik XLS/CSV dla admina z wymienionymi nagłówkami.

**Dane dołącz jako pliki JSON**: `wageGrowthByYear.json`, `cpiByYear.json`, `averagePensionByYear.json`, `annuityDivisor.json`, `sickImpactM.json`, `sickImpactF.json`, `facts.json`, `retirementAgeBySex.json`.
