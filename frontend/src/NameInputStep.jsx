import { Stack, TextInput, Button, Title } from '@mantine/core';

function NameInputStep({ formData, onChange, onNext }) {
  const handleNameChange = (event) => {
    onChange('name', event.currentTarget.value);
  };

  const handleNext = (e) => {
    e.preventDefault(); // Prevent default form submission if wrapped in form
    if (formData.name.trim()) { // Basic validation: ensure name is not empty
        onNext();
    } else {
        // Optional: Add error feedback using Mantine's TextInput error prop
        console.log("Name is required");
    }
  };

  return (
    <Stack align="center" spacing="lg">
      <Title order={2} align="center">Welcome! Let's start with your name.</Title>
      <form onSubmit={handleNext} style={{ width: '100%' }}>
        <TextInput
          label="Name"
          placeholder="Enter your name"
          required
          value={formData.name}
          onChange={handleNameChange}
          size="lg"
          // Optional: Add error display logic here
          autoFocus // Focus the input when the step loads
        />
        <Button type="submit" size="md" mt="xl" fullWidth>
          Next
        </Button>
      </form>
    </Stack>
  );
}

export default NameInputStep;