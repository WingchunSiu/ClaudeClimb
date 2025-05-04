import React, { useState } from 'react';
import { Paper, Title, Text, Stack, Group, Badge, Divider, Box, Collapse, UnstyledButton } from '@mantine/core';
import { IconClock, IconBook, IconUsers, IconBriefcase, IconBrain, IconBuilding, IconChevronDown } from '@tabler/icons-react';

function JourneyGraph({ journey }) {
  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({});

  const sectionIcons = {
    'Coursework': <IconBook size={24} color="#ffb347" />,
    'Extracurricular Activities': <IconUsers size={24} color="#ffb347" />,
    'Internships and Work Experiences': <IconBriefcase size={24} color="#ffb347" />,
    'Skill Development': <IconBrain size={24} color="#ffb347" />,
    'Networking and Connections': <IconUsers size={24} color="#ffb347" />,
    'Leveraging University Resources': <IconBuilding size={24} color="#ffb347" />
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!journey) return null;

  return (
    <Stack spacing="xl">
      {/* Introduction Card */}
      <Paper shadow="sm" p="xl" withBorder style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderLeft: '4px solid #ffb347'
      }}>
        <Text size="lg" style={{ lineHeight: 1.6 }}>
          {journey.introduction}
        </Text>
      </Paper>

      {/* Sections */}
      {journey.sections.map((section, index) => (
        <Paper key={index} shadow="sm" p="xl" withBorder style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <UnstyledButton 
            onClick={() => toggleSection(index)}
            style={{ width: '100%' }}
          >
            <Group position="apart" mb={expandedSections[index] ? "md" : 0}>
              <Group>
                {sectionIcons[section.title] || <IconBook size={24} color="#ffb347" />}
                <Title order={3} color="brand.6">{section.title}</Title>
              </Group>
              <Group spacing="xs">
                <Badge size="lg" variant="light" color="brand">
                  {section.steps.length} Steps
                </Badge>
                <IconChevronDown 
                  size={24} 
                  color="#ffb347"
                  style={{
                    transform: expandedSections[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease'
                  }}
                />
              </Group>
            </Group>
          </UnstyledButton>
          
          <Collapse in={expandedSections[index]}>
            <Text color="dimmed" mb="xl" style={{ lineHeight: 1.6 }}>
              {section.description}
            </Text>

            <Stack spacing="md">
              {section.steps.map((step, stepIndex) => (
                <Box key={stepIndex} style={{
                  padding: '1rem',
                  background: 'rgba(255, 179, 71, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 179, 71, 0.1)'
                }}>
                  <Group position="apart" mb="xs">
                    <Title order={4} color="brand.7">{step.title}</Title>
                    <Group spacing="xs">
                      <IconClock size={16} color="#ffb347" />
                      <Text size="sm" color="dimmed">{step.timeline}</Text>
                    </Group>
                  </Group>
                  
                  <Text mb="md" style={{ lineHeight: 1.6 }}>
                    {step.description}
                  </Text>

                  {step.resources && step.resources.length > 0 && (
                    <>
                      <Divider my="sm" />
                      <Group spacing="xs">
                        {step.resources.map((resource, resourceIndex) => (
                          <Badge key={resourceIndex} variant="dot" color="brand">
                            {resource}
                          </Badge>
                        ))}
                      </Group>
                    </>
                  )}
                </Box>
              ))}
            </Stack>
          </Collapse>
        </Paper>
      ))}

      {/* Conclusion Card */}
      <Paper shadow="sm" p="xl" withBorder style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderLeft: '4px solid #ffb347'
      }}>
        <Text size="lg" style={{ lineHeight: 1.6 }}>
          {journey.conclusion}
        </Text>
      </Paper>
    </Stack>
  );
}

export default JourneyGraph; 