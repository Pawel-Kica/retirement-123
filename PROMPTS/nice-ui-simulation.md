Directions for the AI agent — keep inputs, add simple interactivity

1. Layout

- Split form into 2 columns: left = existing inputs, right = “Live Preview”.
- Preview is sticky on desktop, full-width below on mobile.

2. Emoji age preview (right panel)

- Map age → emoji:
  0–12 👶, 13–19 🧒, 20–29 🧑, 30–44 🧔/🧑‍💼, 45–59 🧓, 60+ 👴/👵.
- Show big emoji + label “Age: 35 (Adult)”.
- Update on every change of the “age” field (input or slider).
- Smooth 200ms fade/scale on change.

3. Simple chart (right panel)

- Single, lightweight SVG bar:
  “Years worked” = currentYear - startYear.
  “Years to retirement” = retirementYear - currentYear.
- Visual: one horizontal bar split into 2 parts with labels.
- Recalculate and animate width on any relevant field change (age/start year/retirement year).

4. Sliders (optional, synced with inputs)

- Add sliders under the existing inputs; keep inputs as the source of truth.
- Bi-directional sync: typing updates slider; sliding updates input.
- Ranges:
  Age: 16–80 (step 1)
  Monthly gross: 0–50 000 (step 100)
  Start year: 1970–currentYear (step 1)
  Retirement year: currentYear–2100 (step 1)
- Debounce slider updates by 100ms.

5. State & validation

- Single state object: { age, gender, salary, startYear, retirementYear }.
- Guard rails: retirementYear > startYear; age aligns with years (non-blocking, just warn under field).

6. Events

- OnChange for each input/slider → update state → re-render emoji + chart.
- No network calls; all client-side.

7. Implementation notes

- Use plain SVG for the bar (no heavy chart lib).
- Keep styles minimal (two shades + subtle border); respect current design tokens.
- Provide utility: getAgeEmoji(age), getChartSegments({startYear, retirementYear}).

8. Deliverables

- Components: FormField (existing), AgeSlider, SalarySlider, YearSlider, LivePreview, EmojiBadge, WorkTimelineBar.
- Done when emoji and bar react instantly to changes and inputs/sliders stay in sync.

change it in in @page.txt/symulacja. Think hard, keep it simple, don't change anything else.
