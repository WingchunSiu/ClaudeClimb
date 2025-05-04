import { Group, Text, Box, Center } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

const stepLabels = [
  'Intro',
  'Basic Info',
  'Personality',
  'Priorities',
  'Goals',
  'Results'
];

const orange = '#ffb347';
const darkGreen = '#1a3a1a';
const lightGray = '#e6e6e6';
const gray = '#d3d3d3';
const mutedGray = '#d3d3d3';
const mutedText = '#b0b0b0';

function StepperProgressBar({ currentStep }) {
  return (
    <Box style={{ position: 'relative', width: '100%', marginBottom: 32, marginTop: 8 }}>
      {/* Horizontal line behind all steps */}
      <Box
        style={{
          position: 'absolute',
          top: 24, // center of the circles
          left: 0,
          right: 0,
          height: 2,
          background: gray,
          zIndex: 0
        }}
      />
      {/* Orange progress line */}
      <Box
        style={{
          position: 'absolute',
          top: 24,
          left: 'calc(18px + 0.5rem)',
          width: `calc(${(currentStep - 1) / (stepLabels.length - 1) * 100}% - 18px - 0.5rem)`,
          height: 2,
          background: orange,
          zIndex: 1,
          transition: 'width 0.3s'
        }}
      />
      <Group position="apart" style={{ position: 'relative', zIndex: 2 }}>
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const isFuture = currentStep < stepNum;
          return (
            <Box key={label} style={{ flex: 1, minWidth: 0 }}>
              <Center style={{ flexDirection: 'column' }}>
                <Box
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isCompleted ? orange : isActive ? '#fff' : lightGray,
                    color: isCompleted ? '#fff' : isActive ? orange : mutedGray,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 18,
                    border: isActive ? `2px solid ${orange}` : '2px solid transparent',
                    boxShadow: isActive ? `0 0 0 4px ${orange}22` : undefined,
                    transition: 'border 0.2s, box-shadow 0.2s',
                    zIndex: 2
                  }}
                >
                  {isCompleted ? <IconCheck size={22} /> : stepNum}
                </Box>
                <Text
                  size="sm"
                  align="center"
                  style={{
                    marginTop: 8,
                    color: isActive ? darkGreen : isCompleted ? darkGreen : mutedText,
                    fontWeight: isActive ? 700 : 500,
                    whiteSpace: 'nowrap',
                    minWidth: 60
                  }}
                >
                  {label}
                </Text>
              </Center>
            </Box>
          );
        })}
      </Group>
    </Box>
  );
}

export default StepperProgressBar; 