You are a senior frontend engineer and product designer working directly inside the existing WeatherGPT codebase.

Your job is to audit and redesign the frontend UI/UX while preserving the existing backend, API contracts, functionality, and data flow.

IMPORTANT: Do not start editing files immediately.

You must complete PHASE 1, report your findings and proposed plan to me, and only then begin modifying files.

---

# PROJECT: WeatherGPT

WeatherGPT is a weather assistant with an LLM-powered conversational interface.

The backend is already functional.

Your primary objective is to redesign the frontend around the design direction:

> "Calm instrument"

The interface should feel like a quiet, typographic weather-station display rather than a generic AI dashboard.

The UI should be minimal, information-dense without being cluttered, highly responsive, accessible, and driven entirely by real backend data.

---

# NON-NEGOTIABLE RULES

1. DO NOT break existing backend functionality.
2. DO NOT change existing API contracts.
3. DO NOT remove existing features.
4. DO NOT fabricate weather data.
5. DO NOT hardcode weather values that should come from the backend.
6. DO NOT replace the existing framework or architecture.
7. DO NOT introduce a major dependency unless absolutely necessary.
8. Follow the existing project's coding conventions.
9. Reuse existing components/utilities where practical.
10. Refactor rather than unnecessarily rewrite.
11. Do not modify backend logic unless a genuinely necessary optional field is missing.
12. If a backend field is required but unavailable:
    - first identify the missing field,
    - explain why it is needed,
    - use a safe frontend fallback where possible,
    - clearly report it to me.
13. Never silently invent an API field or response shape.
14. Never leave demo/sample weather numbers in production UI.
15. Never leave debugging code, console errors, or temporary placeholder UI behind.
16. Do not remove working API calls simply because the new UI does not immediately need them.
17. Before changing anything, inspect the actual repository rather than assuming its structure.

---

# PHASE 1 — UNDERSTAND BEFORE CHANGING ANYTHING

First inspect the ENTIRE relevant codebase.

Do not make edits during this phase.

## 1. Project map

Identify:

- frontend framework
- build tool
- TypeScript/JavaScript usage
- CSS/styling solution
- component structure
- routing
- state management
- hooks
- utilities
- API/service layer
- authentication
- location handling
- theme handling
- chat implementation
- weather data processing
- alert handling
- responsive/mobile implementation
- existing animation implementation
- existing icon library
- installed dependencies

Identify the important frontend files and explain their responsibilities.

## 2. Backend/API map

Inspect the backend and document:

- API endpoints
- HTTP methods
- request bodies
- query parameters
- response shapes
- error responses
- authentication requirements
- weather-related endpoints
- chat endpoints
- alert endpoints
- location endpoints
- multilingual endpoints if any
- voice-related functionality if any

Do not modify backend files during this phase.

## 3. UI data inventory

Create a table showing which fields are ACTUALLY available from the backend.

Check specifically for:

- temperature
- feels-like temperature
- condition
- precipitation probability
- precipitation amount
- wind speed
- wind direction
- humidity
- visibility
- pressure
- UV index
- hourly forecast
- daily forecast
- weather alerts
- alert severity
- data source
- last-updated timestamp
- confidence
- uncertainty
- location
- sunrise
- sunset
- air quality
- any other useful weather fields

For every field, state:

- available / unavailable
- exact backend field name
- response location/path
- where it is currently consumed
- whether it is safe to expose directly in the redesigned UI

Do NOT assume field names.

## 4. Current UI audit

Identify:

- current visual hierarchy
- current layout
- sidebar structure
- dashboard structure
- chat structure
- mobile behavior
- theme implementation
- accessibility issues
- duplicated components
- unnecessary visual complexity
- hardcoded/mock data
- inconsistent styling
- broken states
- loading states
- error states
- responsive issues

## 5. Phase 1 report

Before modifying any file, provide me with:

### Architecture
Short summary of the actual stack.

### Frontend structure
Important files/components and their roles.

### Backend/API
Endpoints and response shapes actually found.

### Available UI data
Actual fields available to the frontend.

### Missing data
Fields requested by the new UI but not returned by the backend.

### Risks
Anything that could break existing functionality.

### Proposed implementation plan
Explain the exact files/components you expect to modify.

STOP HERE.

Do not edit files until this Phase 1 report has been shown.

---

# PHASE 2 — DESIGN DIRECTION

Once Phase 1 is approved, implement the following.

## CORE DESIGN PRINCIPLE

"Calm instrument."

The interface should resemble a refined weather station rather than a generic AI application.

Minimal chrome.

One rich element:

> the living weather scene.

Everything else should remain quiet, typographic, functional, and restrained.

Avoid making every component look like a floating rounded card.

---

# LAYOUT

## Desktop

Use three primary regions:

LEFT:
- collapsible sidebar

CENTER:
- weather scene
- verdict
- hourly forecast
- 7-day forecast
- quick-reply chips

RIGHT:
- conversational AI chat pane

The main weather experience should remain immediately visible without requiring the user to open chat.

## Mobile

At widths down to 360px:

- sidebar becomes drawer or bottom navigation
- weather scene occupies approximately the top 40%
- temperature is prominent
- location visible
- one-line verdict visible
- hourly strip below
- chat becomes a bottom sheet
- components should be the SAME underlying components as desktop
- only layout/reordering should change

Do not create an entirely separate mobile application.

---

# SIDEBAR

Preserve the existing muted sage/slate visual language as the foundation.

Refine it rather than replacing it.

## Expanded

Include:

- logo
- WeatherGPT
- New Conversation
- Main
  - Dashboard
  - Conversation AI
  - Weather Alerts
- Intelligence
  - Personal Intelligence
  - Smart City
  - Climate Analysis
- bottom section
  - Settings
  - Feedback
  - About

Climate Analysis should be collapsed by default if appropriate to the existing routing structure.

## Collapsed

Show icon-only navigation.

Requirements:

- tooltips
- keyboard navigation
- aria-label
- aria-current on active item
- visible focus state
- smooth approximately 200ms width transition
- persist expanded/collapsed state in localStorage
- wrap localStorage access in try/catch so storage failures do not break the UI

---

# ANSWER FIRST, CHAT SECOND

On initial load:

DO NOT show:

"Hello, I'm WeatherGPT."

Instead immediately present the weather verdict.

Example structure:

Heavy rain after 5 pm.
Carry an umbrella.

The exact content MUST come from real weather data.

No fabricated values.

---

# HERO WEATHER SCENE

The hero should contain:

- large lightweight temperature
- location
- current condition
- one-line weather verdict
- weather scene
- subtle data-source/update information

Example visual hierarchy:

29°
Coimbatore

Heavy rain after 5 pm.
Carry an umbrella.

The temperature should use tabular numerals.

Progressive disclosure:

Default:
- temperature
- condition
- verdict

Expanded:
- wind
- humidity
- UV
- pressure
- visibility
- other fields only if actually available

If a value is unavailable:

- show "-"
OR
- hide that metric

Never invent it.

---

# ANIMATED WEATHER SCENE

This is the ONE visually rich element of the application.

Build using:

- Canvas
OR
- SVG
OR
- CSS animation

Do not use:

- stock video
- generated images
- unnecessary animation libraries
- heavy new dependencies

The scene MUST be data-driven.

## Data relationships

Rain particle density:
- follows precipitation probability/precipitation data

Cloud movement:
- follows wind speed

Sun/moon:
- follows time of day

Sky tone:
- follows time of day

Fog:
- follows visibility/humidity where available

## Scenes

Implement:

1. Clear day
2. Cloudy
3. Rain
4. Storm
5. Fog
6. Night

Storm animation must contain only a subtle lightning flash.

Do not create aggressive strobing.

## Demo preview

Add a small preview control:

- Stormy
- Clear
- Night

Selecting one overrides live weather data.

Display a small:

"Preview"

indicator.

Provide a clear way to return to:

"Live"

weather data.

## Performance

Requirements:

- target 60fps
- cap particle counts
- use requestAnimationFrame where appropriate
- clean up animation loops
- pause animation when document.visibilityState is hidden
- respect prefers-reduced-motion
- when reduced motion is enabled, use a static scene
- provide a low-bandwidth/static-gradient fallback

Do not leak animation frames or event listeners.

---

# HOURLY FORECAST

Show the next 24 hours.

Use a horizontally scrollable strip.

Each item may contain:

- time
- weather icon
- temperature
- precipitation probability

Only show fields actually returned by the backend.

Do not fabricate missing values.

---

# 7-DAY FORECAST

Show the next 7 days.

Keep it visually quiet.

Use:

- day
- weather condition/icon
- high
- low
- precipitation if available

Avoid turning each day into a giant card.

---

# QUICK REPLIES

Provide contextual chips such as:

- Good time to spray?
- Leave now or wait?
- Show humidity
- What should I pack?

These must trigger the existing chat flow rather than creating a second implementation.

Where practical, tailor suggestions to available context.

Example:

Agriculture context:
"Good time to spray?"

Commute context:
"Leave now or wait?"

General user:
"What should I pack?"

---

# CHAT

Preserve the existing chat functionality and API contract.

Requirements:

- user question appears above assistant response
- support streaming/typing state if the existing backend supports it
- proper loading state
- aria-live for assistant responses
- quick-reply chips inside chat
- readable message hierarchy
- minimal visual chrome

Do not redesign the backend chat protocol.

Do not change request/response shapes.

---

# VISUAL SYSTEM

## Light mode

- warm off-white background
- near-black text
- muted sage/slate secondary tones

## Dark mode

- deep ink/slate background
- never pure black
- softened text

Implement through CSS variables/design tokens.

Theme toggle:

- light
- dark

Default:
- system preference

Persist selection safely.

## Accent

Only ONE weather-driven accent should dominate at a time.

Examples:

Sun:
- amber

Rain:
- steel blue

Fog:
- grey-green

Night:
- indigo-grey

Use the accent primarily for:

- hero
- active chips
- tiny highlights

Do not turn the entire UI into a gradient.

---

# TYPOGRAPHY

Use one clean sans-serif typeface.

Prefer an existing project font if already installed.

Otherwise use an appropriate system fallback rather than introducing a dependency purely for typography.

Requirements:

- tabular numerals for weather data
- large lightweight temperature
- clear hierarchy
- generous spacing
- 8px spacing grid
- thin 1px borders where useful
- minimal shadows

---

# AVOID AI-GENERATED UI PATTERNS

DO NOT use:

- purple/blue gradients
- glowing orbs
- gradient text
- excessive glassmorphism
- sparkle icons
- "AI-powered" badges
- emoji weather icons
- identical rounded cards everywhere
- giant decorative blobs
- excessive pills
- excessive shadows
- excessive animations
- cluttered dashboards

The UI should feel designed, not generated.

---

# ICONS

Use the project's existing icon system if one exists.

If Lucide or another line-icon library is already installed, reuse it.

Do not introduce another icon library unnecessarily.

Weather icons should be consistent line icons or custom SVG.

No emoji icons.

---

# TRUST AND TRANSPARENCY

Show unobtrusively:

- data source
- last updated time

Example:

IMD · Updated 4 min ago

Only display the actual source returned by the backend.

If confidence/uncertainty exists:

show it subtly.

If not available:

do not fabricate confidence.

---

# STATES

Implement proper states for:

## Loading

Use restrained skeleton/loading states.

Do not show fake weather numbers while loading.

## Error

Show:

- understandable error message
- retry button

Retry the existing API call.

## Empty

Provide an appropriate empty state.

## Missing data

Use:

"-"

or hide the metric.

## Unreliable data

Use a graceful message such as:

"I don't have reliable weather data for that location right now."

Do not invent fallback weather values.

---

# ACCESSIBILITY

Target WCAG AA.

Implement:

- semantic HTML
- keyboard navigation
- visible focus rings
- aria-labels
- aria-current
- aria-live for chat responses
- accessible buttons
- sufficient color contrast
- accessible tooltips
- reduced-motion support

---

# LANGUAGE

Add a language selector in the header.

FIRST inspect whether the backend already supports multilingual responses.

If multilingual support exists:

connect the selector to the existing implementation.

If it does not exist:

- build the UI only if it can be safely implemented on the frontend
- do not invent backend functionality
- clearly document what is missing in CHANGES.md

---

# VOICE

Implement/use the Web Speech API for voice input where supported.

Requirements:

- feature detection
- microphone button
- graceful unsupported-browser fallback
- accessible labels
- existing chat submission flow should remain unchanged

Optional read-aloud may be implemented if compatible with the existing architecture.

Do not break browsers that do not support SpeechRecognition.

---

# TEXT SIZE

Add an accessibility text-size control:

A / A+

Use a root font-size/custom-property approach so the entire interface scales consistently.

Persist the preference where appropriate.

---

# LOCATION

Preserve existing location functionality.

If the application already supports:

- automatic location detection
- permission handling
- manual location selection
- city search
- autocomplete

reuse it.

If the backend supports location search/autocomplete, connect to it.

If it does not:

do not invent a backend endpoint.

Device location should be used when the user has not supplied a specific location.

If the user explicitly specifies a location, use that location.

---

# IMPLEMENTATION ORDER

Work in these small reviewable stages:

## STEP 1
Design tokens + theme system

Verify:
- build
- existing API calls
- existing functionality

## STEP 2
Layout + sidebar

Verify:
- desktop
- mobile
- routing
- sidebar state persistence

## STEP 3
Hero + animated weather scene

Verify:
- real weather data
- animation cleanup
- reduced motion
- preview mode

## STEP 4
Hourly + daily forecast + quick replies

Verify:
- no fabricated values
- responsive overflow
- existing data flow

## STEP 5
Chat pane

Verify:
- existing API
- streaming/typing
- errors
- accessibility

## STEP 6
Loading/error/empty states + accessibility + polish

Verify:
- WCAG AA basics
- keyboard navigation
- focus states
- mobile 360px
- theme persistence
- no console errors

AFTER EACH STEP:

Run the project's existing build/typecheck/lint/test commands where available.

Fix regressions before proceeding.

---

# BACKEND SAFETY RULE

The backend already works.

Treat backend API contracts as immutable.

Do NOT:

- rename API fields
- rename endpoints
- change request formats
- change response formats
- remove backend functionality
- rewrite backend architecture
- replace the backend

If a genuinely necessary UI field does not exist:

1. identify it
2. explain why
3. determine whether the UI can safely omit it
4. use a safe optional frontend fallback where possible
5. only propose a backend change if absolutely necessary
6. document it in CHANGES.md

Do not silently modify backend behavior.

---

# DELIVERABLES

When finished, provide:

## 1. Updated code

All required frontend changes implemented.

## 2. CHANGES.md

Create:

CHANGES.md

Include:

- summary
- files changed
- components added
- components refactored
- styling/token changes
- animation changes
- accessibility changes
- backend fields used
- backend fields requested but unavailable
- assumptions
- anything not implemented and why

## 3. Verification checklist

Include:

- [ ] Light mode works
- [ ] Dark mode works
- [ ] System theme preference works
- [ ] Theme persistence works
- [ ] Sidebar expands/collapses
- [ ] Sidebar state persists
- [ ] Sidebar keyboard navigation works
- [ ] Hero uses real weather data
- [ ] Animated scene reacts to real weather data
- [ ] Preview mode works
- [ ] Live mode can be restored
- [ ] Reduced-motion mode works
- [ ] Low-bandwidth/static fallback works
- [ ] Animation pauses when tab is hidden
- [ ] Hourly forecast works
- [ ] 7-day forecast works
- [ ] Chat works with existing backend
- [ ] Chat loading/streaming state works
- [ ] Error states work
- [ ] Retry works
- [ ] No fabricated weather data
- [ ] No placeholder weather numbers
- [ ] Voice feature detects browser support
- [ ] Language selector behaves correctly
- [ ] Text-size control works
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] aria-live is implemented appropriately
- [ ] Mobile works at 360px width
- [ ] Desktop layout works
- [ ] No unnecessary dependencies added
- [ ] No console errors
- [ ] Build passes
- [ ] Typecheck passes if available
- [ ] Lint passes if available
- [ ] Existing backend/API contracts remain unchanged

## 4. Assumptions and limitations

Clearly list:

- assumptions you made
- fields you could not obtain
- features unavailable in the backend
- browser limitations
- anything that requires future backend work

---

# FINAL RULE

Do not tell me something "works" unless you actually verified it.

Do not claim that an endpoint returns a field unless you inspected the code or actual response shape.

Do not claim the build passes unless you ran the build.

Do not claim there are no console errors unless you actually checked.

Do not replace real data with mock data to make the UI look complete.

The priority order is:

1. Preserve functionality
2. Preserve backend contracts
3. Use real data
4. Correct responsive behavior
5. Accessibility
6. Performance
7. Visual refinement

The final product should feel like a carefully designed weather instrument, not an AI-generated dashboard.

BEGIN WITH PHASE 1 ONLY.
Show me the codebase/API audit and your proposed implementation plan before modifying any files.

==================================================
AMENDMENTS (these override the original prompt where they conflict)
==================================================

1. Open-Meteo is called client-side, so extending its request params is NOT a backend contract change. Add: hourly + daily precipitation_probability, hourly precipitation, cloud_cover, is_day, surface_pressure (current). Extend hourly to 24h and daily to 7 days (forecast_hours/forecast_days). Keep all existing fields and calls working.

2. The verdict must be generated by a deterministic, pure frontend function over real forecast data (precipitation probability, precipitation, wind, UV, temperature). No LLM, no hardcoded or example text. If data is missing, show no verdict instead of guessing.

3. Data source label: "Open-Meteo" with "Updated X min ago" from current.time. SACHET alerts are labeled separately as NDMA SACHET. Do not use IMD.

4. /chat returns { reply: string } only. Implement a loading/typing indicator, not fake streaming.

5. The desktop chat pane and the /chat route must share ONE chat state (a single useChat instance via context or equivalent), so there is only one conversation and conversation_id.

6. Respect TemperatureUnitProvider everywhere, including the hero, hourly and daily strips.

7. Keep all existing routes. Show the 3-region layout (chat pane) only on the dashboard route. Other routes stay full-width. Keep every existing sidebar item and group (Main / Intelligence / Utility / bottom Settings, Feedback, About). Don't remove or relocate any nav item.

8. Language: /chat has no language parameter. Do NOT invent one or inject hidden prompt text. Make the selector set the speech recognition language only, and document in CHANGES.md that translated replies need backend work.

9. Stay on Tailwind v3. Do not upgrade to v4. Do not delete postcss.config_2.js or @tailwindcss/postcss without asking me.

10. Report the real npm scripts (build, lint, typecheck, test) and run the baseline build for real.

11. Stop after EACH step. Show what changed (files + one-line reasons), paste the real command output, and wait for me to reply "continue".

==================================================
STEP 1 SCOPE (do NOT start until I approve the Phase 1 report)
==================================================

Step 1 = design tokens and theme system only.

- Define CSS variables for light and dark (warm off-white / deep ink-slate, muted sage secondary tones). Keep the existing sage sidebar palette. Add the four weather accents (sun, rain, fog, night) and a root text-scale variable for the A / A+ control.
- Wire tokens into tailwind.config.js and index.css. Add a tabular-numerals utility using font-variant-numeric: tabular-nums (not a monospace font-family) and apply it to the header clock.
- Theme: light / dark, defaulting to system preference, persisted with try/catch around localStorage. Reuse the existing ThemeProvider. Do not create a second one.
- Use the existing project font or a system stack. No new font dependency.
- Contrast: all body text must be at least 4.5:1 on its background in both themes. Muted text should be around #6A7873 or darker in light mode. Don't use the amber sun accent for text on light backgrounds.
- Hardcoded colors: find components still using hardcoded classes like bg-white, text-slate-*, border-gray-* that would break dark mode. List them first, then swap them for token-based classes in layout, header, sidebar, dashboard, chat and alerts. Colors only, no structure or behavior changes.

Out of scope for Step 1: layout changes, sidebar behavior, new components, the canvas scene, API changes, deleting any files.

When done: run `npx tsc --noEmit` and `npm run build`, paste the real output, list every file changed with a one-line reason, tell me how to visually verify it, then STOP and wait for "continue".