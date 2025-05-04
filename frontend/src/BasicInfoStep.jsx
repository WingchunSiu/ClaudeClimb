import { Select, TextInput, Stack, Title, Button, Group } from '@mantine/core';

// Assume options are defined elsewhere or passed as props
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];
const YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

function BasicInfoStep({ formData, onChange, onNext, onBack }) {

  const handleNext = (e) => {
      e.preventDefault();
      // Basic validation
      if (formData.year && formData.major.trim()) {
          onNext();
      } else {
          console.log("Year and Major are required");
          // Add error feedback if desired
      }
  }

  return (
    <Stack>
      <Title order={2} align="center">Tell us a bit more...</Title>
       <form onSubmit={handleNext} style={{ width: '100%' }}>
        <Stack spacing="md">
            <Select
                label="Gender"
                placeholder="Select gender"
                data={GENDER_OPTIONS}
                value={formData.gender}
                onChange={(value) => onChange('gender', value)}
                clearable
            />
            <Select
                label="Current Year"
                placeholder="Select year"
                required
                data={YEAR_OPTIONS}
                value={formData.year}
                onChange={(value) => onChange('year', value)}
            />
            <TextInput
                label="Major / Field of Study"
                placeholder="e.g., Computer Science, History"
                required
                value={formData.major}
                onChange={(event) => onChange('major', event.currentTarget.value)}
            />
            <Group position="apart" mt="xl">
                <Button variant="default" onClick={onBack}>
                    Back
                </Button>
                <Button type="submit">
                    Next
                </Button>
            </Group>
        </Stack>
       </form>
    </Stack>
  );
}

export default BasicInfoStep;