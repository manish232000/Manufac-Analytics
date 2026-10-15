import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Code,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { schemaResolver, useForm } from '@mantine/form';
import { SAMPLE_PATIENT } from './fixtures';
import { assessmentSchema, MOBILITY, type Assessment } from './schema';

type FormValues = {
  [K in keyof Assessment]: Assessment[K] extends number
    ? number | ''
    : Assessment[K] extends boolean
      ? boolean
      : Assessment[K] | '';
};

export interface AssessmentFormProps {
  onSave?: (saved: Assessment) => void | Promise<void>;
}

const initialValues: FormValues = {
  mrn: '',
  patientName: '',
  dateOfBirth: '',
  assessmentDate: '',
  mobility: '',
  barthelIndex: '',
  medicationCount: '',
  pharmacistReviewRequested: false,
  followUpDate: '',
  consentObtained: false,
};

const formatMobilityLabel = (value: string): string =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const mobilityOptions = MOBILITY.map((value) => ({
  value,
  label: formatMobilityLabel(value),
}));

export function AssessmentForm({ onSave }: AssessmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [savedAssessment, setSavedAssessment] = useState<Assessment | null>(null);

  const form = useForm<FormValues>({
    mode: 'controlled',
    initialValues,
    validate: schemaResolver(assessmentSchema),
    validateInputOnBlur: true,
    validateInputOnChange: false,
  });

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const parsed = assessmentSchema.parse(values);
      setSavedAssessment(parsed);
      await onSave?.(parsed);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    form.setValues(SAMPLE_PATIENT);
    form.clearErrors();
    setSavedAssessment(null);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Title order={1} mb="lg">
          Geriatric Care Assessment
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <Stack gap="md">
            <TextInput
              label="Medical record number"
              placeholder="MRN-004821"
              key={form.key('mrn')}
              {...form.getInputProps('mrn')}
            />

            <TextInput
              label="Patient name"
              key={form.key('patientName')}
              {...form.getInputProps('patientName')}
            />

            <DateInput
              label="Date of birth"
              valueFormat="YYYY-MM-DD"
              key={form.key('dateOfBirth')}
              {...form.getInputProps('dateOfBirth')}
            />

            <DateInput
              label="Assessment date"
              valueFormat="YYYY-MM-DD"
              maxDate={today}
              key={form.key('assessmentDate')}
              {...form.getInputProps('assessmentDate')}
            />

            <Select
              label="Mobility"
              placeholder="Select a mobility status"
              data={mobilityOptions}
              key={form.key('mobility')}
              {...form.getInputProps('mobility')}
            />

            <NumberInput
              label="Barthel Index"
              step={5}
              min={0}
              max={100}
              clampBehavior="none"
              key={form.key('barthelIndex')}
              {...form.getInputProps('barthelIndex')}
            />

            <NumberInput
              label="Regular medications"
              min={0}
              max={30}
              clampBehavior="none"
              key={form.key('medicationCount')}
              {...form.getInputProps('medicationCount')}
            />

            <Checkbox
              label="Pharmacist review requested"
              key={form.key('pharmacistReviewRequested')}
              {...form.getInputProps('pharmacistReviewRequested', { type: 'checkbox' })}
            />

            <DateInput
              label="Next review date"
              valueFormat="YYYY-MM-DD"
              key={form.key('followUpDate')}
              {...form.getInputProps('followUpDate')}
            />

            <Checkbox
              label="Patient or representative has given consent"
              key={form.key('consentObtained')}
              {...form.getInputProps('consentObtained', { type: 'checkbox' })}
            />

            <Group justify="space-between" mt="md">
              <Button type="button" variant="default" onClick={handleLoadSample}>
                Load sample patient
              </Button>

              <Button type="submit" loading={loading} disabled={loading}>
                Save assessment
              </Button>
            </Group>
          </Stack>
        </form>

        {savedAssessment && (
          <Alert
            color="teal"
            title="Assessment saved successfully"
            mt="xl"
            data-testid="success-alert"
          >
            <Code block data-testid="saved-json">
              {JSON.stringify(savedAssessment, null, 2)}
            </Code>
          </Alert>
        )}
      </Paper>
    </Container>
  );
}
