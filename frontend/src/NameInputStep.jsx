import { Stack, TextInput, Button, Title, Text, Box } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

function NameInputStep({ formData, onChange, onNext }) {
  const handleNameChange = (event) => {
    onChange('name', event.currentTarget.value);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onNext();
    } else {
      console.log("Name is required");
    }
  };

  return (
    <Stack align="center" spacing="xl">
      <Box style={{ textAlign: 'center' }}>
        <Title order={2} align="center" mb="md" style={{ letterSpacing: '-0.02em' }}>
          Welcome to Your Journey
        </Title>
        <Text color="dimmed" size="lg" mb="xl">
          Let's start by getting to know each other. What should I call you?
        </Text>
      </Box>
      
      <form onSubmit={handleNext} style={{ width: '100%', maxWidth: '400px' }}>
        <TextInput          
          placeholder="Enter your name"
          required
          value={formData.name}
          onChange={handleNameChange}
          size="lg"
          autoFocus
          styles={{
            input: {
              height: '56px',
              fontSize: '1.1rem',
              textAlign: 'center',
              '&::placeholder': {
                textAlign: 'center'
              }
            }
          }}
        />
        <Button 
          type="submit" 
          size="lg" 
          mt="xl" 
          fullWidth
          rightIcon={<IconArrowRight size={16} />}
          style={{
            height: '48px',
            fontSize: '1.1rem'
          }}
        >
          Begin Journey
        </Button>
      </form>
    </Stack>
  );
}

export default NameInputStep;