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
  useMantineTheme
} from '@mantine/core';

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
  
  // Goal type options for dropdown with color styling
  const goalTypeOptions = [
    { value: 'industry', label: 'Industry', color: theme.colors.blue[6] },
    { value: 'academia', label: 'Research/Academia', color: theme.colors.violet[6] },
    { value: 'entrepreneurship', label: 'Entrepreneurship', color: theme.colors.orange[6] },
    { value: 'creative', label: 'Creative', color: theme.colors.green[6] },
    { value: 'other', label: 'Other', color: theme.colors.gray[6] },
  ];

  // Interest items management
  const addInterestItem = () => {
    if (newInterestItem.trim() === '') return;
    
    // Create updated lists
    const updatedItems = [...interestItems, newInterestItem.trim()];
    
    // Update the parent component state
    // We'll store the combined interests in the 'interests' field
    onChange('interests', updatedItems.join(', '));
    onChange('hobbies', ''); // Clear hobbies as we're now using just interests
    
    // Clear the input field
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
    
    // Create updated lists
    const updatedItems = [...skillItems, newSkillItem.trim()];
    
    // Update the parent component state
    onChange('skills', updatedItems.join(', '));
    
    // Clear the input field
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
  
  // Reusable tag component
  const TagItem = ({ item, onRemove }) => (
    <Box 
      px="xs"
      py={5}
      style={{
        backgroundColor: '#f1f3f5',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px'
      }}
    >
      <Text mr="xs">{item}</Text>
      <CloseButton 
        size="xs" 
        onClick={onRemove}
        style={{ width: '16px', height: '16px' }}
      />
    </Box>
  );

  return (
    <Stack>            
      <Checkbox
        label="I know my specific career goals"
        checked={data.knowsGoals}
        onChange={handleCheckboxChange}
        mb="xs"
      />
      
      {data.knowsGoals && (
        <>
          <Select
            label="What type of career are you pursuing?"
            placeholder="Select a career type"
            data={goalTypeOptions}
            value={data.goalType}
            onChange={(value) => onChange('goalType', value)}
            mb="md"
            styles={(theme) => ({
              item: {
                '&[data-selected]': {
                  '&, &:hover': {
                    backgroundColor: 
                      goalTypeOptions.find(option => option.value === data.goalType)?.color || 
                      theme.colors.brand[6],
                    color: theme.white,
                  },
                },
              },
              input: {
                color: goalTypeOptions.find(option => option.value === data.goalType)?.color || 
                        theme.black,
                fontWeight: data.goalType ? 500 : 400,
              }
            })}
            itemComponent={({ label, value }) => {
              const option = goalTypeOptions.find(opt => opt.value === value);
              return (
                <div>
                  <Text style={{ color: option?.color }}>{label}</Text>
                </div>
              );
            }}
          />
          
          <Textarea
            label="Career Goals"
            placeholder="Describe your ideal career path, target roles, or industries..."
            value={data.goals}
            onChange={(event) => onChange('goals', event.currentTarget.value)}
            minRows={3}
          />
        </>
      )}

      <Box mt="md">
        <Text fw={500} size="sm" mb={5}>Hobbies & Interests</Text>
        <Text size="xs" color="dimmed" mb="xs">
          What makes you so immersed that you lose track of time?
        </Text>
        
        {/* Display entered interest items as tags */}
        <Box mb="xs">
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
              No hobbies or interests added yet
            </Text>
          )}
        </Box>
        
        {/* Input for new interest items - FIXED ALIGNMENT */}
        <div style={{ display: 'flex', marginBottom: '1rem' }}>
          <TextInput
            placeholder="Reading, painting, technology, travel..."
            value={newInterestItem}
            onChange={(e) => setNewInterestItem(e.currentTarget.value)}
            onKeyPress={handleInterestKeyPress}
            style={{ flexGrow: 1, marginRight: '0.5rem' }}
            size="md"
            styles={{
              input: {
                height: '42px', // Match the height of the button
                lineHeight: '42px'
              }
            }}
          />
          <Button 
            onClick={addInterestItem} 
            color="brand"
            style={{ 
              minWidth: '80px',
              height: '42px'
            }}
            size="md"
          >
            Add
          </Button>
        </div>
      </Box>
      
      <Box mt="md">
        <Text fw={500} size="sm" mb={5}>Skills & Strengths</Text>
        <Text size="xs" color="dimmed" mb="xs">
          What are you good at, but not necessarily enjoy?
        </Text>
        
        {/* Display entered skill items as tags */}
        <Box mb="xs">
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
              No skills or strengths added yet
            </Text>
          )}
        </Box>
        
        {/* Input for new skill items - FIXED ALIGNMENT */}
        <div style={{ display: 'flex', marginBottom: '1rem' }}>
          <TextInput
            placeholder="Leadership, problem-solving, programming..."
            value={newSkillItem}
            onChange={(e) => setNewSkillItem(e.currentTarget.value)}
            onKeyPress={handleSkillKeyPress}
            style={{ flexGrow: 1, marginRight: '0.5rem' }}
            size="md"
            styles={{
              input: {
                height: '42px', // Match the height of the button
                lineHeight: '42px'
              }
            }}
          />
          <Button 
            onClick={addSkillItem} 
            color="brand"
            style={{ 
              minWidth: '80px',
              height: '42px'
            }}
            size="md"
          >
            Add
          </Button>
        </div>
      </Box>
    </Stack>
  );
}

export default GoalsAndInterestsForm;