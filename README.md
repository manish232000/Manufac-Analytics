# Geriatric Care Assessment Form

A single-page clinical assessment application designed for visiting nurses checking on elderly patients at home. Built with **React 19**, **TypeScript**, **Mantine v9**, and validated with **Zod 4**.

---

## Tech Stack & Architecture

- **React 19** + **TypeScript**
- **UI Framework**: [Mantine 9](https://mantine.dev/) (`@mantine/core`, `@mantine/dates`, `@mantine/form`, `@mantine/hooks`)
- **Schema & Validation**: [Zod 4](https://zod.dev/) with native Standard Schema integration via Mantine's `schemaResolver`
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
- **Toolchain**: Vite+ (`vp`) with Oxlint, Oxfmt, and PostCSS

---

## Features & Implementation Highlights

1. **10 Clinical Fields**:
   - `mrn`: Medical record number (`TextInput`, placeholder `MRN-004821`)
   - `patientName`: Patient name (`TextInput`, 2–60 characters)
   - `dateOfBirth`: Date of birth (`DateInput`, YYYY-MM-DD)
   - `assessmentDate`: Assessment date (`DateInput`, restricted with `maxDate={today}`)
   - `mobility`: Mobility status (`Select`, dynamically generated from `MOBILITY` constant with humanized labels)
   - `barthelIndex`: Barthel Index score (`NumberInput`, step 5, range 0–100, `clampBehavior="none"`)
   - `medicationCount`: Regular medications count (`NumberInput`, range 0–30, `clampBehavior="none"`)
   - `pharmacistReviewRequested`: Pharmacist review flag (`Checkbox`)
   - `followUpDate`: Next review date (`DateInput`, YYYY-MM-DD)
   - `consentObtained`: Informed consent verification (`Checkbox`)

2. **Schema & Validation Integrity**:
   - **No Rule Duplication**: All validation logic is driven strictly by the Zod 4 schema via `schemaResolver(assessmentSchema)`. No hand-written validation functions or JSX conditions.
   - **Type Derivation**: Form values type is derived mapped directly from `Assessment` (`z.infer<typeof assessmentSchema>`) without duplicate hand-written interfaces and with zero `any`.
   - **Clinical Score Integrity**: `clampBehavior="none"` ensures values typed by the clinician are never quietly rounded or clamped by the UI, but rejected with clear clinical error messages.
   - **Interactive Validation Timing**: Validation runs on blur and on submit. Untouched fields stay quiet until interaction.
   - **Empty Form Guarantees**: Exactly 9 errors appear on submitting an empty form, with zero cross-field noise due to guarded `.refine()` predicates.

3. **Clinician UX**:
   - **"Load sample patient" Button**: Automatically populates valid fixture data and clears field errors.
   - **Async Submission Simulation**: Simulated ~800ms save with disabled loading button state, followed by a teal success `Alert` rendering the parsed JSON in a `Code` block.

---

## Getting Started

### Prerequisites
- Node.js `^20.19.0 || >=22.0.0`
- Corepack / Yarn 4

### Installation
```bash
yarn install
```

### Development Server
```bash
yarn dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Full Verification
Runs formatting check (`vp check`), stylelint, vitest test suites, and production TypeScript build:
```bash
yarn test
```

### Running Tests
```bash
yarn vitest
```

---

## Test Coverage

Two core specification tests are implemented in `src/features/assessment/assessment.test.tsx`:
1. **Schema Boundary Test (`safeParse`)**:
   - Verifies a patient turning exactly 60 on the assessment date (`1966-08-07` on visit `2026-08-07`) is accepted.
   - Verifies a patient one day short of 60 (`1966-08-08`) is rejected with `"This pathway is for patients aged 60 and over"` on `dateOfBirth`.
2. **Rendered Form Integration Test (`RTL`)**:
   - Loads the sample patient fixture via the UI button, submits the form, and asserts the save handler was invoked with the exact parsed values.
3. **Empty Form Validation Test**:
   - Asserts exactly 9 field errors appear on empty submit, while optional/untouched fields stay quiet.

---

## Project Decisions & Notes

- **Zod 4 & Date Handling**: Zod 4 uses `z.iso.date()` expecting `'YYYY-MM-DD'` strings. Mantine 9's `DateInput` natively produces ISO date strings, avoiding `Date` object timezone quirks.
- **Dynamic Mobility Options**: `MOBILITY` tuple values (including any future snake_case additions) are converted into title-cased readable labels on the fly.
- **Time Spent**: ~1.5 hours.
