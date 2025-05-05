import { useState, useEffect } from 'react';
import {
  Stack,
  Title,
  Text,
  Slider,
  Paper,
  Box,
  Group,
  useMantineTheme,
  Button
} from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

// MBTI type descriptions
const mbtiDescriptions = {
  ISTJ: "The Inspector: Practical, responsible, and organized",
  ISFJ: "The Protector: Caring, loyal, and traditional",
  INFJ: "The Counselor: Insightful, creative, and idealistic",
  INTJ: "The Mastermind: Strategic, independent, and innovative",
  ISTP: "The Craftsman: Analytical, practical, and spontaneous",
  ISFP: "The Composer: Artistic, sensitive, and peaceful",
  INFP: "The Healer: Idealistic, compassionate, and creative",
  INTP: "The Architect: Logical, innovative, and curious",
  ESTP: "The Dynamo: Energetic, practical, and spontaneous",
  ESFP: "The Performer: Enthusiastic, friendly, and fun-loving",
  ENFP: "The Champion: Enthusiastic, creative, and sociable",
  ENTJ: "The Commander: Bold, imaginative, and strong-willed",
  ESTJ: "The Supervisor: Practical, organized, and efficient",
  ESFJ: "The Provider: Caring, social, and traditional",
  ENFJ: "The Teacher: Charismatic, idealistic, and organized",
  ENTP: "The Visionary: Innovative, curious, and adaptable"
};

function MBTIStep({ onNext, onBack }) {
  const theme = useMantineTheme();
  const [sliderValues, setSliderValues] = useState({
    ei: 50, // Extraversion/Introversion
    sn: 50, // Sensing/Intuition
    tf: 50, // Thinking/Feeling
    jp: 50  // Judging/Perceiving
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mbtiType, setMbtiType] = useState('');

  // Calculate MBTI type based on slider values
  useEffect(() => {
    const type = [
      sliderValues.ei < 50 ? 'I' : 'E',
      sliderValues.sn < 50 ? 'S' : 'N',
      sliderValues.tf < 50 ? 'T' : 'F',
      sliderValues.jp < 50 ? 'J' : 'P'
    ].join('');
    setMbtiType(type);
  }, [sliderValues]);

  const handleSliderChange = (key, value) => {
    setSliderValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      // Send MBTI scores to backend
      const response = await fetch('/api/mbti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: {
            ei: sliderValues.ei,
            sn: sliderValues.sn,
            tf: sliderValues.tf,
            jp: sliderValues.jp
          }
        }),
      });

      if (response.ok) {
        // Get the updated profile
        const data = await response.json();
        console.log('MBTI scores updated:', data);
      } else {
        console.error('Failed to update MBTI scores:', await response.text());
      }
    } catch (error) {
      console.error('Error updating MBTI scores:', error);
    } finally {
      setIsSubmitting(false);
      // Always proceed to next step, even if the API call fails
      onNext();
    }
  };

  return (
    <Stack spacing="xl">
      <Title order={2} align="center" mb="xl" color="brand.6" style={{ letterSpacing: '-0.02em' }}>
        Discover Your Personality Type
      </Title>

      <Group grow align="flex-start" spacing="xl">
        {/* Left side - Sliders */}
        <Stack spacing="xl" style={{ flex: 1 }}>
          <Box>
            <Text fw={500} mb="xs" color="#2c1810">Extraversion vs. Introversion</Text>
            <Box mb="xs" px={2}>
              <Group position="apart" noWrap>
                <Text size="sm" color="dimmed" style={{ width: '80px' }}>Introversion</Text>
                <Text size="sm" color="dimmed" style={{ width: '80px', textAlign: 'right', marginLeft: 'auto' }}>Extraversion</Text>
              </Group>
            </Box>
            <Slider
              value={sliderValues.ei}
              onChange={(value) => handleSliderChange('ei', value)}
              marks={[
                { value: 0, label: 'I' },
                { value: 50, label: '' },
                { value: 100, label: 'E' }
              ]}
              styles={{
                markLabel: {
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#2c1810'
                }
              }}
            />
          </Box>

          <Box>
            <Text fw={500} mb="xs" color="#2c1810">Sensing vs. Intuition</Text>
            <Box mb="xs" px={2}>
              <Group position="apart" noWrap>
                <Text size="sm" color="dimmed" style={{ width: '80px' }}>Sensing</Text>
                <Text size="sm" color="dimmed" style={{ width: '80px', textAlign: 'right', marginLeft: 'auto' }}>Intuition</Text>
              </Group>
            </Box>
            <Slider
              value={sliderValues.sn}
              onChange={(value) => handleSliderChange('sn', value)}
              marks={[
                { value: 0, label: 'S' },
                { value: 50, label: '' },
                { value: 100, label: 'N' }
              ]}
              styles={{
                markLabel: {
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#2c1810'
                }
              }}
            />
          </Box>

          <Box>
            <Text fw={500} mb="xs" color="#2c1810">Thinking vs. Feeling</Text>
            <Box mb="xs" px={2}>
              <Group position="apart" noWrap>
                <Text size="sm" color="dimmed" style={{ width: '80px' }}>Thinking</Text>
                <Text size="sm" color="dimmed" style={{ width: '80px', textAlign: 'right', marginLeft: 'auto' }}>Feeling</Text>
              </Group>
            </Box>
            <Slider
              value={sliderValues.tf}
              onChange={(value) => handleSliderChange('tf', value)}
              marks={[
                { value: 0, label: 'T' },
                { value: 50, label: '' },
                { value: 100, label: 'F' }
              ]}
              styles={{
                markLabel: {
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#2c1810'
                }
              }}
            />
          </Box>

          <Box>
            <Text fw={500} mb="xs" color="#2c1810">Judging vs. Perceiving</Text>
            <Box mb="xs" px={2}>
              <Group position="apart" noWrap>
                <Text size="sm" color="dimmed" style={{ width: '80px' }}>Judging</Text>
                <Text size="sm" color="dimmed" style={{ width: '80px', textAlign: 'right', marginLeft: 'auto' }}>Perceiving</Text>
              </Group>
            </Box>
            <Slider
              value={sliderValues.jp}
              onChange={(value) => handleSliderChange('jp', value)}
              marks={[
                { value: 0, label: 'J' },
                { value: 50, label: '' },
                { value: 100, label: 'P' }
              ]}
              styles={{
                markLabel: {
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#2c1810'
                }
              }}
            />
          </Box>
        </Stack>

        {/* Right side - MBTI Type Display */}
        <Paper shadow="sm" p="xl" withBorder style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderLeft: '4px solid #ffb347'
        }}>
          <Stack spacing="md" align="center">
            <Title order={2} color="brand.6" style={{ letterSpacing: '-0.02em' }}>
              Your Personality Type
            </Title>
            
            {mbtiType && (
              <>
                <Text 
                  size="xl" 
                  fw={700} 
                  color="brand.6"
                  style={{ 
                    fontSize: '2.5rem',
                    letterSpacing: '0.1em'
                  }}
                >
                  {mbtiType}
                </Text>
                <Text 
                  size="lg" 
                  color="dimmed" 
                  align="center"
                  style={{ maxWidth: '400px' }}
                >
                  {mbtiDescriptions[mbtiType]}
                </Text>
              </>
            )}
          </Stack>
        </Paper>
      </Group>

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
          loading={isSubmitting}
        >
          Continue
        </Button>
      </Group>
    </Stack>
  );
}

export default MBTIStep; 