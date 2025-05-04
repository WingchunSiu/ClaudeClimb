import { Select, TextInput, Stack, Title, Button, Group, Text, Box } from '@mantine/core';
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react';

// Updated options to be more conversational
const YEAR_OPTIONS = [
  { value: 'freshman', label: 'First Year' },
  { value: 'sophomore', label: 'Second Year' },
  { value: 'junior', label: 'Third Year' },
  { value: 'senior', label: 'Fourth Year' },
  { value: 'graduate', label: 'Graduate Student' }
];

function BasicInfoStep({ formData, onChange, onNext, onBack }) {
  const handleNext = (e) => {
    e.preventDefault();
    if (formData.year && formData.major.trim()) {
      onNext();
    } else {
      console.log("Year and Major are required");
    }
  }

  return (
    <Stack spacing="xl">
      <Box style={{ textAlign: 'center' }}>
        <Title order={2} align="center" mb="md" style={{ letterSpacing: '-0.02em' }}>
          Tell Me About Your Academic Journey
        </Title>
        <Text color="dimmed" size="lg" mb="xl">
          This helps me understand where you are in your educational path
        </Text>
      </Box>

      <form onSubmit={handleNext} style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <Stack spacing="xl">            
          <Select
            label="What year are you in?"
            placeholder="Select your current year"
            required
            data={YEAR_OPTIONS}
            value={formData.year}
            onChange={(value) => onChange('year', value)}
            size="lg"
            styles={{
              input: {
                height: '56px',
                fontSize: '1.1rem'
              },
              label: {
                fontSize: '1rem',
                marginBottom: '0.5rem'
              }
            }}
          />
          <TextInput
            label="What are you studying?"
            placeholder="e.g., Computer Science, Psychology, Business..."
            required
            value={formData.major}
            onChange={(event) => onChange('major', event.currentTarget.value)}
            size="lg"
            styles={{
              input: {
                height: '56px',
                fontSize: '1.1rem'
              },
              label: {
                fontSize: '1rem',
                marginBottom: '0.5rem'
              }
            }}
          />
          <Box mt="md">
            <TextInput
              label="University/College"
              placeholder="e.g., University of Southern California"
              value={formData.university || ''}
              onChange={(e) => onChange('university', e.currentTarget.value)}
              size="lg"
              styles={{
                input: {
                  fontSize: '1.1rem',
                  color: '#2c1810'
                },
                label: {
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  color: '#2c1810'
                }
              }}
              mb="md"
            />
          </Box>
          <Group position="apart" mt="xl">
            <Button 
              variant="subtle" 
              onClick={onBack}
              leftIcon={<IconArrowLeft size={16} />}
              size="lg"
            >
              Back
            </Button>
            <Button 
              type="submit"
              rightIcon={<IconArrowRight size={16} />}
              size="lg"
            >
              Continue
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}

export default BasicInfoStep;