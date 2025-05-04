import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Stack,
  Title,
  Button,
  Loader,
  Alert,
  Divider,
  Paper,
  Text,
  Group,
  useMantineTheme,
  Box,
  Progress,
  Card,
  SimpleGrid,
  Badge
} from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import NameInputStep from './NameInputStep';
import BasicInfoStep from './BasicInfoStep';
import GoalsAndInterestsForm from './GoalsAndInterestsForm';
import MBTIStep from './MBTIStep';
import ImportantPreferencesStep from './ImportantPreferencesStep';
import ClaudeFooter from './ClaudeFooter';
import StepperProgressBar from './StepperProgressBar';
import JourneyGraph from './JourneyGraph';

// PlannerOutput component with modern styling
const PlannerOutput = ({ results }) => {
  const theme = useMantineTheme();

  if (!results) return null;

  return (
    <Paper shadow="xs" p="xl" withBorder style={{
      borderLeft: `4px solid ${theme.colors.brand[5]}`,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)'
    }}>
      <Stack spacing="xl">
        <Title order={3} color="brand.6" style={{ letterSpacing: '-0.02em' }}>Your Personalized Journey</Title>
        <Divider my="sm" />
        <section>
          <Title order={4} color="brand.7" mb="md">Key Milestones</Title>
          {results.milestones && results.milestones.length > 0 ? (
            <Stack spacing="md" mt="xs">
              {results.milestones.map((milestone, index) => (
                <Box key={index} style={{
                  padding: '1rem',
                  background: 'rgba(94, 106, 210, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(94, 106, 210, 0.1)'
                }}>
                  <Text style={{ lineHeight: 1.6 }}>• {milestone}</Text>
                </Box>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed">No milestones generated.</Text>
          )}
        </section>
        <Divider my="sm" />
        <section>
          <Title order={4} color="brand.7" mb="md">Weekly Focus Areas</Title>
          {results.timeAllocation ? (
            <Stack spacing="md" mt="xs">
              {Object.entries(results.timeAllocation).map(([key, value]) => (
                <Box key={key} style={{
                  padding: '1rem',
                  background: 'rgba(94, 106, 210, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(94, 106, 210, 0.1)'
                }}>
                  <Group position="apart">
                    <Text fw={500}>{key}</Text>
                    <Text color="brand.6" fw={600}>{value} hours</Text>
                  </Group>
                  <Progress
                    value={(value / 168) * 100}
                    color="brand.5"
                    size="sm"
                    mt="xs"
                    radius="xl"
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed">No time allocation suggestions generated.</Text>
          )}
        </section>
      </Stack>
    </Paper>
  );
};

// Dummy data for career trajectories
const dummyTrajectories = [
  { name: 'Software Engineer', score: 92 },
  { name: 'Product Manager', score: 85 },
  { name: 'Data Scientist', score: 78 },
  { name: 'UX Designer', score: 74 },
  { name: 'Academic Researcher', score: 68 }
];

function CareerTrajectories({ trajectories, onSelect }) {
  return (
    <>
      <Title order={3} mb="md" color="brand.6" align="center">Career Trajectory Options</Title>
      <SimpleGrid cols={3} spacing="lg" breakpoints={[{ maxWidth: 900, cols: 2 }, { maxWidth: 600, cols: 1 }]} mb="xl">
        {trajectories.map((t) => (
          <Card
            key={t.name}
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', borderColor: '#ffb347' }}
            onClick={() => onSelect && onSelect(t)}
          >
            <Group position="apart" mb="xs">
              <Text fw={600} size="lg" color="#2c1810">{t.name}</Text>
              <Badge color="brand" size="lg" variant="filled">{t.score}/100</Badge>
            </Group>
            <Text color="dimmed" size="sm">Click to view details</Text>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}

function App() {
  const theme = useMantineTheme();
  const [step, setStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState('forward');
  const [selectedTrajectory, setSelectedTrajectory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    year: '',
    major: '',
    university: '',
    goals: '',
    knowsGoals: false,
    goalType: 'industry',
    hobbies: '',
    interests: '',
    skills: '',
    mbtiType: '',
    preferences: []
  });

  const [plannerResults, setPlannerResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ensure smooth page scrolling on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const nextStep = () => {
    setAnimationDirection('forward');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setAnimationDirection('backward');
    setStep(prev => prev - 1);
  };

  const resetSteps = () => {
    setPlannerResults(null);
    setError(null);
    setAnimationDirection('forward');
    setStep(1);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKnowsGoalsChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      knowsGoals: checked,
      goals: checked ? prev.goals : ''
    }));
  };

  const handlePreferencesChange = (prefs) => {
    setFormData(prev => ({ ...prev, preferences: prefs }));
  };

  const generatePlan = async () => {
    setIsLoading(true);
    setError(null);
    setPlannerResults(null);
    setStep(6);

    const apiData = {
      basic_info: {
        name: formData.name,
        gender: formData.gender,
        year: formData.year,
        major: formData.major,
        university: formData.university,
      },
      career_goals: formData.knowsGoals ? formData.goals : "User does not know",
      hobbies: formData.hobbies,
      interests: formData.interests,
      skills: formData.skills,
      mbti_type: formData.mbtiType,
      preferences: formData.preferences
    };

    // const apiUrl = 'http://localhost:8000/generate-plan';
    // try {
    //   console.log("Sending data to API:", apiData);
    //   const response = await axios.post(apiUrl, apiData);
    //   console.log("Received data from API:", response.data);
    //   setPlannerResults({
    //     milestones: response.data?.milestones || [],
    //     timeAllocation: response.data?.time_allocation || {}
    //   });
    // } catch (err) {
    //   console.error("API Error:", err);
    //   setError(err.response?.data?.detail || 'Failed to generate plan. Please check your input and try again.');
    // } finally {
    //   setIsLoading(false);
    // }

    // Dummy results for local testing
    setTimeout(() => {
      setPlannerResults({
        career: "Software Engineer",
        introduction: "Hi Alex! I've created a personalized roadmap to help you navigate your journey from Stanford CS student to successful software engineer. As an ESFJ who values work-life balance and creative problem-solving, you're well-positioned to thrive in this field. Your natural ability to connect with others and preference for practical solutions will be tremendous assets. Let's make the most of your remaining time at Stanford!",
        sections: [
          {
            title: "Coursework Strategy",
            description: "Given your current stage as a junior, let's focus on courses that will strengthen your software engineering foundation while keeping your options open.",
            steps: [
              {
                title: "Core Systems Focus",
                description: "Since you're in your junior year, prioritize completing CS 110 and CS 111 if you haven't already. These systems courses are crucial for software engineering interviews and will give you practical knowledge you'll use daily.",
                timeline: "Next quarter",
                resources: [
                  "Course catalog",
                  "CS department advisors",
                  "Previous course evaluations"
                ]
              },
              {
                title: "Choose Your Track",
                description: "Consider the Systems or Human-Computer Interaction track, which align well with your ESFJ traits and interest in creative problem-solving. The Systems track will give you solid engineering fundamentals, while HCI lets you combine technical skills with user empathy.",
                timeline: "Before course selection for next quarter",
                resources: [
                  "Track requirements documentation",
                  "CS peer advisors",
                  "Professor office hours"
                ]
              }
            ]
          },
          {
            title: "Hands-on Experience",
            description: "Let's leverage Stanford's amazing opportunities to build your practical experience.",
            steps: [
              {
                title: "Summer Internship Preparation",
                description: "Alex, with your people skills, you'd thrive at companies that value collaboration. Target companies like Google, Microsoft, or smaller startups that emphasize work-life balance and creative culture. Start applying in fall for summer positions.",
                timeline: "September-November",
                resources: [
                  "BEAM career services",
                  "Handshake portal",
                  "CS department career fairs"
                ]
              },
              {
                title: "Teaching Assistant Role",
                description: "Consider becoming a CS198 Teaching Assistant for CS106B or similar courses. This will strengthen your fundamentals and leverage your natural ability to help others learn.",
                timeline: "Apply before next quarter",
                resources: [
                  "CS198 program coordinator",
                  "Current TAs",
                  "Course staff"
                ]
              }
            ]
          },
          {
            title: "Skill Development",
            description: "Focus on building both technical and soft skills that align with your personality and career goals.",
            steps: [
              {
                title: "Technical Portfolio",
                description: "Create 2-3 personal projects that showcase your creativity and problem-solving abilities. Consider building something that helps your community, which would align with your ESFJ values.",
                timeline: "Over the next two quarters",
                resources: [
                  "GitHub",
                  "Stanford makerspaces",
                  "CS project showcase events"
                ]
              },
              {
                title: "Communication Skills",
                description: "Your natural ESFJ strengths in communication are valuable! Further develop them through technical writing and presentation opportunities.",
                timeline: "Ongoing",
                resources: [
                  "PWR courses",
                  "Toastmasters at Stanford",
                  "Technical writing workshops"
                ]
              }
            ]
          },
          {
            title: "Networking",
            description: "Build meaningful connections that align with your extroverted nature.",
            steps: [
              {
                title: "Join Tech Communities",
                description: "Get involved with Stanford's CS community in ways that energize you. Consider joining Women in Computer Science (WiCS) or Association for Computing Machinery (ACM).",
                timeline: "Immediate",
                resources: [
                  "Student organizations directory",
                  "CS department events calendar",
                  "Club fairs"
                ]
              },
              {
                title: "Alumni Connections",
                description: "Connect with Stanford CS alumni who work at companies prioritizing work-life balance and creative culture.",
                timeline: "Ongoing",
                resources: [
                  "Stanford Alumni Network",
                  "LinkedIn",
                  "BEAM alumni events"
                ]
              }
            ]
          },
          {
            title: "Work-Life Balance",
            description: "Maintain your well-being while pursuing your goals.",
            steps: [
              {
                title: "Bay Area Exploration",
                description: "Take advantage of Stanford's location! Join hiking groups for local trails, explore San Francisco's tech meetups, or enjoy weekend trips to Santa Cruz.",
                timeline: "Weekly/Monthly",
                resources: [
                  "Stanford Outdoor Center",
                  "Bay Area Hiking Groups",
                  "Stanford Transportation"
                ]
              },
              {
                title: "Creative Outlets",
                description: "Balance your technical work with creative activities. Consider joining Stanford's Design for America chapter or participate in hackathons that focus on social impact.",
                timeline: "Quarterly",
                resources: [
                  "Stanford d.school events",
                  "Local hackathons",
                  "Campus recreation programs"
                ]
              }
            ]
          }
        ],
        conclusion: "Alex, you're in an excellent position to launch a fulfilling career as a software engineer! Your ESFJ traits of empathy, organization, and people skills will be incredible assets in this field. Remember to leverage Stanford's amazing resources while staying true to your priorities of work-life balance and creative problem-solving. Take it one step at a time, and don't hesitate to reach out to your advisors and peers for support. You've got this!"
      });
      setIsLoading(false);
    }, 800);
  };

  // CSS for the page layout with more margin at bottom
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '100px',
    background: 'transparent'
  };

  // CSS for the main content area
  const contentStyle = {
    flex: '1 0 auto',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem',
    paddingBottom: '100px'
  };

  // CSS for the steps container
  const stepsContainerStyle = {
    position: 'relative',
    minHeight: '400px',
    marginTop: '2rem',
    marginBottom: '2rem'
  };

  // Calculate animation properties based on step and direction
  const getAnimationStyle = (stepNum) => {
    const transition = 'all 400ms ease';
    const baseStyle = {
      position: 'absolute',
      width: '100%',
      top: 0,
      left: 0,
      transition,
      opacity: 0,
      transform: 'translateX(0)',
      pointerEvents: 'none',
    };

    if (step === stepNum) {
      return {
        ...baseStyle,
        opacity: 1,
        transform: 'translateX(0)',
        pointerEvents: 'auto',
      };
    } else if (step > stepNum) {
      return {
        ...baseStyle,
        opacity: 0,
        transform: 'translateX(-30px)',
      };
    } else {
      return {
        ...baseStyle,
        opacity: 0,
        transform: 'translateX(30px)',
      };
    }
  };

  // Determine if footer should be visible - only show on the first step
  const showFooter = step === 1;

  // Handler for selecting a career trajectory
  const handleTrajectorySelect = (trajectory) => {
    setSelectedTrajectory(trajectory);
    setStep(8); // Move to the new Journey Details step
  };

  // Handler for going back from Journey Details
  const handleBackToTrajectories = () => {
    setSelectedTrajectory(null);
    setStep(7);
  };

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <Title
          order={1}
          align="center"
          mb="xl"
          style={{
            fontWeight: 700,
            color: theme.colors.brand[6],
            letterSpacing: '-0.03em',
            fontSize: '2.5rem'
          }}
        >
          Claude Climb
        </Title>
        {/* Stepper Progress Bar just below the title */}
        <StepperProgressBar currentStep={step} />

        {/* Container for all steps with relative positioning */}
        <div style={stepsContainerStyle}>
          {/* Step 1: Name Input */}
          <div style={getAnimationStyle(1)}>
            <Paper shadow="sm" p="xl" withBorder style={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <NameInputStep
                formData={formData}
                onChange={handleFormChange}
                onNext={nextStep}
              />
            </Paper>
          </div>

          {/* Step 2: Basic Info */}
          <div style={getAnimationStyle(2)}>
            <Paper shadow="sm" p="xl" withBorder style={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <BasicInfoStep
                formData={formData}
                onChange={handleFormChange}
                onNext={nextStep}
                onBack={prevStep}
              />
            </Paper>
          </div>

          {/* Step 3: MBTI Assessment */}
          <div style={getAnimationStyle(3)}>
            <Paper shadow="sm" p="xl" withBorder style={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <MBTIStep
                onNext={nextStep}
                onBack={prevStep}
                onChange={(mbtiType) => handleFormChange('mbtiType', mbtiType)}
              />
            </Paper>
          </div>

          {/* Step 4: Important Preferences */}
          <div style={getAnimationStyle(4)}>
            <Paper shadow="sm" p="xl" withBorder style={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <ImportantPreferencesStep
                preferences={formData.preferences}
                onChange={handlePreferencesChange}
                onNext={nextStep}
                onBack={prevStep}
              />
            </Paper>
          </div>

          {/* Step 5: Goals and Interests */}
          <div style={getAnimationStyle(5)}>
            <Paper shadow="sm" p="xl" withBorder style={{
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}>
              <Title order={2} align="center" mb="xl" color="brand.6" style={{ letterSpacing: '-0.02em' }}>
                Let's Discover Your Path
              </Title>
              <GoalsAndInterestsForm
                data={formData}
                onChange={handleFormChange}
                onKnowsGoalsChange={handleKnowsGoalsChange}
              />
              <Group position="apart" mt="xl">
                <Button
                  variant="subtle"
                  onClick={prevStep}
                  color="gray"
                  leftIcon={<IconArrowLeft size={16} />}
                >
                  Back
                </Button>
                <Button
                  onClick={generatePlan}
                  loading={isLoading}
                  color="brand"
                  rightIcon={<IconArrowRight size={16} />}
                >
                  Create My Journey
                </Button>
              </Group>
            </Paper>
          </div>

          {/* Step 6: Career Trajectory Options */}
          <div style={getAnimationStyle(6)}>
            {step === 6 && !selectedTrajectory && (
              <CareerTrajectories trajectories={dummyTrajectories} onSelect={handleTrajectorySelect} />
            )}
          </div>

          {/* Step 7: Journey Details for selected trajectory */}
          <div style={getAnimationStyle(7)}>
            {step === 7 && !selectedTrajectory && (
              <CareerTrajectories trajectories={dummyTrajectories} onSelect={handleTrajectorySelect} />
            )}
          </div>

          {/* Step 8: Journey Details for selected trajectory */}
          <div style={getAnimationStyle(8)}>
            {step === 8 && selectedTrajectory && (
              <>
                <Title order={3} mb="md" color="brand.6" align="center">
                  {selectedTrajectory.name} - Match: {selectedTrajectory.score}/100
                </Title>
                <Button
                  onClick={handleBackToTrajectories}
                  variant='subtle'
                  color='gray'
                  leftIcon={<IconArrowLeft size={16} />}
                  mb='md'
                >
                  Back
                </Button>
                <JourneyGraph journey={plannerResults} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Only render the footer if no name has been entered */}
      {showFooter && <ClaudeFooter />}
    </div>
  );
}

export default App;