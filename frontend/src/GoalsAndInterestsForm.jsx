import { useState } from 'react';
import { 
  Textarea, 
  Checkbox, 
  Stack, 
  Title, 
  TextInput, 
  Button, 
  Group, 
  Text, 
  Box,
  CloseButton,
  Select,
  useMantineTheme,
  Paper
} from '@mantine/core';
import { IconPlus, IconSparkles } from '@tabler/icons-react';

function GoalsAndInterestsForm({ data, onChange, onKnowsGoalsChange }) {
  const theme = useMantineTheme();
  const [newInterestItem, setNewInterestItem] = useState('');
  const [newSkillItem, setNewSkillItem] = useState('');
  
  // Combine hobbies and interests into a single array for display
  const interestItems = [...(data.interests || '').split(','), ...(data.hobbies || '').split(',')]
    .map(item => item.trim())
    .filter(item => item !== '');
    
  // Parse skills into an array for display
  const skillItems = (data.skills || '').split(',')
    .map(item => item.trim())
    .filter(item => item !== '');

  const handleCheckboxChange = (event) => {
    onKnowsGoalsChange(event.currentTarget.checked);
  };

  // Goal type options with more engaging descriptions
  const goalTypeOptions = [
    { 
      value: 'industry', 
      label: 'Industry Professional',
      description: 'Building a career in the corporate world',
      color: '#ffb347' 
    },
    { 
      value: 'academia', 
      label: 'Research & Academia',
      description: 'Pursuing knowledge and discovery',
      color: '#ffb347' 
    },
    { 
      value: 'entrepreneurship', 
      label: 'Entrepreneurship',
      description: 'Creating and building your own ventures',
      color: '#ffb347' 
    },
    { 
      value: 'creative', 
      label: 'Creative Arts',
      description: 'Expressing through art, design, or media',
      color: '#ffb347' 
    },
    { 
      value: 'other', 
      label: 'Other Path',
      description: 'Following a unique journey',
      color: '#ffb347' 
    },
  ];

  // Interest items management
  const addInterestItem = () => {
    if (newInterestItem.trim() === '') return;
    
    const updatedItems = [...interestItems, newInterestItem.trim()];
    onChange('interests', updatedItems.join(', '));
    onChange('hobbies', '');
    setNewInterestItem('');
  };

  const removeInterestItem = (indexToRemove) => {
    const updatedItems = interestItems.filter((_, index) => index !== indexToRemove);
    onChange('interests', updatedItems.join(', '));
  };

  const handleInterestKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterestItem();
    }
  };
  
  // Skill items management
  const addSkillItem = () => {
    if (newSkillItem.trim() === '') return;
    
    const updatedItems = [...skillItems, newSkillItem.trim()];
    onChange('skills', updatedItems.join(', '));
    setNewSkillItem('');
  };

  const removeSkillItem = (indexToRemove) => {
    const updatedItems = skillItems.filter((_, index) => index !== indexToRemove);
    onChange('skills', updatedItems.join(', '));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkillItem();
    }
  };
  
  // Reusable tag component with modern styling
  const TagItem = ({ item, onRemove }) => (
    <Paper 
      px="xs"
      py={5}
      data-tag="true"
      style={{
        backgroundColor: 'rgba(255, 179, 71, 0.08)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        border: '1px solid rgba(255, 179, 71, 0.2)',
        transition: 'all 0.2s ease'
      }}
    >
      <Text mr="xs" fw={500} color="#2c1810">{item}</Text>
      <CloseButton 
        size="xs" 
        onClick={onRemove}
        style={{ 
          width: '16px', 
          height: '16px',
          color: '#ffb347'
        }}
      />
    </Paper>
  );

  return (
    <Stack spacing="xl">            
      <Box>
        <Checkbox
          label={
            <Text fw={500} size="lg" color="#2c1810">
              I have a clear vision for my future path
            </Text>
          }
          checked={data.knowsGoals}
          onChange={handleCheckboxChange}
          mb="md"
        />
        
        {data.knowsGoals && (
          <Box mt="md">
            <Select
              label="What kind of journey interests you?"
              placeholder="Select your path"
              data={goalTypeOptions}
              value={data.goalType}
              onChange={(value) => onChange('goalType', value)}
              mb="md"
              size="lg"
              styles={(theme) => ({
                input: {
                  height: '56px',
                  fontSize: '1.1rem',
                  color: '#2c1810'
                },
                label: {
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  color: '#2c1810'
                },
                item: {
                  padding: '12px',
                  '&[data-selected]': {
                    '&, &:hover': {
                      backgroundColor: '#ffb347',
                      color: '#fff',
                    },
                  },
                },
              })}
              itemComponent={({ label, value }) => {
                const option = goalTypeOptions.find(opt => opt.value === value);
                return (
                  <Box>
                    <Text fw={500} style={{ color: option?.color }}>{label}</Text>
                    <Text size="sm" color="dimmed">{option?.description}</Text>
                  </Box>
                );
              }}
            />
            
            <Textarea
              label="Tell me about your dreams and aspirations"
              placeholder="What kind of impact do you want to make? What drives you? What are your goals?"
              value={data.goals}
              onChange={(event) => onChange('goals', event.currentTarget.value)}
              minRows={4}
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
            />
          </Box>
        )}
      </Box>

      <Box>
        <Group position="apart" mb="xs">
          <Text fw={600} size="lg" color="#2c1810">Passions & Interests</Text>
          <IconSparkles size={20} color="#ffb347" />
        </Group>
        <Text size="sm" color="dimmed" mb="md">
          What activities make you lose track of time? What topics could you talk about for hours?
        </Text>
        
        {/* Display entered interest items as tags */}
        <Box mb="md">
          {interestItems.length > 0 ? (
            <Group spacing="xs">
              {interestItems.map((item, index) => (
                <TagItem 
                  key={index} 
                  item={item} 
                  onRemove={() => removeInterestItem(index)} 
                />
              ))}
            </Group>
          ) : (
            <Text color="dimmed" size="sm" mb="xs">
              No interests added yet
            </Text>
          )}
        </Box>
        
        {/* Input for new interest items */}
        <div style={{ display: 'flex', marginBottom: '1rem' }}>
          <TextInput
            placeholder="e.g., Photography, AI, Travel, Music..."
            value={newInterestItem}
            onChange={(e) => setNewInterestItem(e.currentTarget.value)}
            onKeyPress={handleInterestKeyPress}
            style={{ flexGrow: 1, marginRight: '0.5rem' }}
            size="lg"
            styles={{
              input: {
                height: '48px',
                fontSize: '1.1rem',
                color: '#2c1810'
              }
            }}
          />
          <Button 
            onClick={addInterestItem} 
            color="brand"
            leftIcon={<IconPlus size={16} />}
            size="lg"
          >
            Add
          </Button>
        </div>
      </Box>
      
      <Box>
        <Group position="apart" mb="xs">
          <Text fw={600} size="lg" color="#2c1810">Natural Talents</Text>
          <IconSparkles size={20} color="#ffb347" />
        </Group>
        <Text size="sm" color="dimmed" mb="md">
          What comes naturally to you? What do others often compliment you on?
        </Text>
        
        {/* Display entered skill items as tags */}
        <Box mb="md">
          {skillItems.length > 0 ? (
            <Group spacing="xs">
              {skillItems.map((item, index) => (
                <TagItem 
                  key={index} 
                  item={item} 
                  onRemove={() => removeSkillItem(index)} 
                />
              ))}
            </Group>
          ) : (
            <Text color="dimmed" size="sm" mb="xs">
              No talents added yet
            </Text>
          )}
        </Box>
        
        {/* Input for new skill items */}
        <div style={{ display: 'flex', marginBottom: '1rem' }}>
          <TextInput
            placeholder="e.g., Problem Solving, Communication, Creativity..."
            value={newSkillItem}
            onChange={(e) => setNewSkillItem(e.currentTarget.value)}
            onKeyPress={handleSkillKeyPress}
            style={{ flexGrow: 1, marginRight: '0.5rem' }}
            size="lg"
            styles={{
              input: {
                height: '48px',
                fontSize: '1.1rem',
                color: '#2c1810'
              }
            }}
          />
          <Button 
            onClick={addSkillItem} 
            color="brand"
            leftIcon={<IconPlus size={16} />}
            size="lg"
          >
            Add
          </Button>
        </div>
      </Box>
    </Stack>
  );
}

export default GoalsAndInterestsForm;