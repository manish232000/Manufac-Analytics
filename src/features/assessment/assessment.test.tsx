import { render, screen, userEvent, waitFor } from '@test-utils';
import { AssessmentForm } from './AssessmentForm';
import { SAMPLE_PATIENT } from './fixtures';
import { assessmentSchema } from './schema';

describe('Geriatric Assessment Tests', () => {
  // Test 1: Schema, via safeParse: date of birth exactly 60 versus one day short
  it('validates date of birth exactly 60 versus one day short against assessment date', () => {
    // Exactly 60 on assessmentDate '2026-08-07': born '1966-08-07' -> accepted
    const exactlySixty = assessmentSchema.safeParse({
      ...SAMPLE_PATIENT,
      assessmentDate: '2026-08-07',
      dateOfBirth: '1966-08-07',
    });
    expect(exactlySixty.success).toBe(true);

    // One day short of 60 on assessmentDate '2026-08-07': born '1966-08-08' -> rejected
    const oneDayShort = assessmentSchema.safeParse({
      ...SAMPLE_PATIENT,
      assessmentDate: '2026-08-07',
      dateOfBirth: '1966-08-08',
    });
    expect(oneDayShort.success).toBe(false);

    const dobError = !oneDayShort.success
      ? oneDayShort.error.issues.find((issue) => issue.path.includes('dateOfBirth'))
      : undefined;
    expect(dobError).toBeDefined();
    expect(dobError?.message).toBe('This pathway is for patients aged 60 and over');
  });

  // Test 2: Form, rendered: load the sample patient, submit, and assert save handler was called with parsed values
  it('loads sample patient, submits form, and calls save handler with parsed values', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<AssessmentForm onSave={handleSave} />);

    // Load sample patient
    const loadSampleButton = screen.getByRole('button', { name: /load sample patient/i });
    await user.click(loadSampleButton);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save assessment/i });
    await user.click(submitButton);

    // Assert save handler was called with the parsed values
    await waitFor(
      () => {
        expect(handleSave).toHaveBeenCalledTimes(1);
        expect(handleSave).toHaveBeenCalledWith(SAMPLE_PATIENT);
      },
      { timeout: 3000 }
    );

    // Assert success alert and formatted JSON output are displayed
    expect(await screen.findByTestId('success-alert')).toBeInTheDocument();
    expect(screen.getByTestId('saved-json')).toHaveTextContent('MRN-004821');
  });

  // Test 3: Form, rendered: submitting an empty form produces exactly 9 errors
  it('submits empty form and shows 9 errors with untouched quiet fields', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<AssessmentForm onSave={handleSave} />);

    const submitButton = screen.getByRole('button', { name: /save assessment/i });
    await user.click(submitButton);

    // 9 required errors show up
    expect(await screen.findByText('Must look like MRN-004821')).toBeInTheDocument();
    expect(screen.getByText('Patient name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
    expect(screen.getByText('Assessment date is required')).toBeInTheDocument();
    expect(screen.getByText('Select a mobility status')).toBeInTheDocument();
    expect(screen.getByText('Barthel Index score is required')).toBeInTheDocument();
    expect(screen.getByText('Enter the number of regular medications')).toBeInTheDocument();
    expect(screen.getByText('Next review date is required')).toBeInTheDocument();
    expect(
      screen.getByText('Consent must be obtained before the assessment can be saved')
    ).toBeInTheDocument();

    // Pharmacist review should not have an error on empty form
    expect(screen.queryByText(/Five or more medications is polypharmacy/i)).not.toBeInTheDocument();

    expect(handleSave).not.toHaveBeenCalled();
  });
});
