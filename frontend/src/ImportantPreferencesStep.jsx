import { useState } from 'react';
import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Box,
  TextInput,
  Paper,
  SimpleGrid,
  Input
} from '@mantine/core';
import { IconPlus, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

const defaultPreferences = [
  'Work-life balance',
  'Intellectual stimulation',
  'Family',
  'Creativity',
  'Financial security',
  'Helping others',
  'Adventure',
  'Stability',
  'Autonomy',
  'Community',
  'Recognition',
  'Learning',
  'Health',
  'Flexibility',
  'Leadership',
  'Collaboration',
  'Personal growth',
  'Travel',
  'Making a difference',
  'Innovation',
  'Nature',
  'Spirituality',
  'Friendship',
  'Challenge',
  'Respect',
  'Freedom',
  'Diversity',
  'Achievement',
  'Security',
  'Fun',
  'Trust'
];

function ImportantPreferencesStep({ preferences, onChange, onNext, onBack }) {
  const [customPref, setCustomPref] = useState('');
  const [selected, setSelected] = useState(preferences || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allPreferences, setAllPreferences] = useState([
    ...defaultPreferences,
    ...(preferences ? preferences.filter(p => !defaultPreferences.includes(p)) : [])
  ]);
  const maxSelected = 7;

  const handleToggle = (pref) => {
    let updated;
    if (selected.includes(pref)) {
      updated = selected.filter((p) => p !== pref);
    } else {
      if (selected.length >= maxSelected) return;
      updated = [...selected, pref];
    }
    setSelected(updated);
    onChange(updated);
  };

  const handleAddCustom = () => {
    const trimmed = customPref.trim();
    if (
      trimmed &&
      !selected.includes(trimmed) &&
      !allPreferences.includes(trimmed) &&
      selected.length < maxSelected
    ) {
      setAllPreferences(prev => [...prev, trimmed]);
      const updated = [...selected, trimmed];
      setSelected(updated);
      onChange(updated);
      setCustomPref('');
    }
  };

  const handleNext = async () => {
    if (selected.length < 3) return;
    
    setIsSubmitting(true);
    try {
      // Send priorities to backend
      const response = await fetch('http://localhost:8000/api/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priorities: selected
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Priorities updated:', data);
      } else {
        console.error('Failed to update priorities:', await response.text());
      }
    } catch (error) {
      console.error('Error updating priorities:', error);
    } finally {
      setIsSubmitting(false);
      // Always proceed to next step, even if the API call fails
      onNext();
    }
  };

  return (
    <Stack spacing="xl">
      <Title order={2} align="center" mb="xs" color="brand.6" style={{ letterSpacing: '-0.02em' }}>
        What is important to you?
      </Title>
      <Text align="center" color="dimmed" mb="md">
        Select your top values and preferences. You can always add your own!
      </Text>
      {selected.length >= maxSelected && (
        <Text align="center" color="red" size="sm" mb={-10}>
          You can select up to {maxSelected} preferences.
        </Text>
      )}
      <SimpleGrid cols={3} spacing="md" breakpoints={[{ maxWidth: 900, cols: 2 }, { maxWidth: 600, cols: 1 }]}> 
        {allPreferences.map((pref) => (
          <Button
            key={pref}
            variant={selected.includes(pref) ? 'filled' : 'outline'}
            color={selected.includes(pref) ? 'brand' : 'brand'}
            fullWidth
            size="md"
            style={{
              fontWeight: 500,
              background: selected.includes(pref) ? undefined : 'rgba(255,255,255,0.7)',
              borderColor: selected.includes(pref) ? undefined : 'rgba(255,179,71,0.2)',
              color: selected.includes(pref) ? '#fff' : '#2c1810',
              boxShadow: selected.includes(pref) ? '0 2px 8px rgba(255,179,71,0.08)' : undefined,
              transition: 'all 0.15s',
              letterSpacing: '0.01em',
              opacity: !selected.includes(pref) && selected.length >= maxSelected ? 0.5 : 1,
              cursor: !selected.includes(pref) && selected.length >= maxSelected ? 'not-allowed' : 'pointer'
            }}
            onClick={() => handleToggle(pref)}
            disabled={!selected.includes(pref) && selected.length >= maxSelected}
          >
            {pref}
          </Button>
        ))}
      </SimpleGrid>
      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        <TextInput
          placeholder="Add a New Preference Here"
          value={customPref}
          onChange={(e) => setCustomPref(e.currentTarget.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom(); }}
          style={{ flexGrow: 1, marginRight: '0.5rem' }}
          size="md"
          disabled={selected.length >= maxSelected}
        />
        <Button
          leftIcon={<IconPlus size={16} />}
          color="brand"
          onClick={handleAddCustom}
          size="md"
          variant="filled"
          disabled={selected.length >= maxSelected}
        >
          Add
        </Button>
      </div>
      <Group position="apart" mt="xl">
        <Button
          variant="subtle"
          onClick={onBack}
          color="gray"
          leftIcon={<IconArrowLeft size={16} />}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          color="brand"
          rightIcon={<IconArrowRight size={16} />}
          disabled={selected.length < 3}
          loading={isSubmitting}
        >
          Continue
        </Button>
      </Group>
    </Stack>
  );
}

export default ImportantPreferencesStep; 