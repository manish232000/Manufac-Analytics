import { Box, Group } from '@mantine/core';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { AssessmentForm } from '../features/assessment/AssessmentForm';

export function HomePage() {
  return (
    <Box py="md">
      <Group justify="flex-end" px="xl">
        <ColorSchemeToggle />
      </Group>
      <AssessmentForm />
    </Box>
  );
}
