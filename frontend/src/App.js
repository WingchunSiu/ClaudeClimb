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
  Badge,
  Tooltip
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
            <Text color="dimmed" size="sm" mb="md">Click to generate detailed plan</Text>

{/* Add reasons as tags with tooltips */}
<Stack spacing="xs">
  {t.reasons && t.reasons.map((reason, index) => (
    <Tooltip
      key={index}
      label={reason.explanation}
      position="bottom"
      multiline
      width={300}
      withArrow
      transition="fade"
      transitionDuration={200}
    >
      <Badge
        color="blue"
        variant="light"
        size="sm"
        style={{ cursor: 'help' }}
        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking badge
      >
        {reason.strength}
      </Badge>
    </Tooltip>
  ))}
</Stack>
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
  const [isPlanning, setIsPlanning] = useState(false);
  const [planResults, setPlanResults] = useState(null);

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

    try {
      // Call the reasoning agent to get career recommendations
      const response = await axios.post('http://localhost:8000/api/reason', {
        // The reasoning agent will use the state store data
        // No need to send data as it's already in the state store
      });

      if (!response.data || !response.data.recommendations) {
        throw new Error('Invalid response from reasoning agent');
      }

      // Update the career trajectories with real data
      const trajectories = response.data.recommendations.map(rec => ({
        name: rec.career,
        score: rec.score,
        description: rec.description,
        reasons: rec.reasons
      }));

      // Store the full response for later use
      setPlannerResults(response.data);
      
      // Update the dummy trajectories with real data
      dummyTrajectories.splice(0, dummyTrajectories.length, ...trajectories);

    } catch (err) {
      console.error("Reasoning Agent Error:", err);
      setError(err.response?.data?.detail || 'Failed to generate career recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const runPlanningAgent = async (trajectory) => {
    setIsPlanning(true);
    setPlanResults(null);
    try {
      const response = await axios.post('http://localhost:8000/api/career-plan', {
        career: trajectory.name,
        score: trajectory.score,
        description: trajectory.description,
        reasons: trajectory.reasons
      });

      if (!response.data) {
        throw new Error('Invalid response from planning agent');
      }

      setPlanResults(response.data);
    } catch (err) {
      console.error("Planning Agent Error:", err);
      setPlanResults({ error: err.response?.data?.detail || 'Failed to generate detailed plan. Please try again.' });
    } finally {
      setIsPlanning(false);
    }
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
  const handleTrajectorySelect = async (trajectory) => {
    setSelectedTrajectory(trajectory);
    setStep(8); // Move to the Journey Details step
    await runPlanningAgent(trajectory);
  };

  // Handler for going back from Journey Details
  const handleBackToTrajectories = () => {
    setSelectedTrajectory(null);
    setPlanResults(null);
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
            {step === 6 && (
              <>
                {isLoading ? (
                  <Paper shadow="sm" p="xl" withBorder style={{
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                  }}>
                    <Stack spacing="xl" align="center">
                      <Loader size="xl" color="brand" />
                      <Title order={3} color="brand.6">
                        Your agents are reasoning your custom career plan...
                      </Title>
                      <Text color="dimmed" size="lg">
                        We're analyzing your profile, preferences, and goals to find the perfect career matches for you.
                      </Text>
                    </Stack>
                  </Paper>
                ) : error ? (
                  <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
                    {error}
                  </Alert>
                ) : (
                  <CareerTrajectories trajectories={dummyTrajectories} onSelect={handleTrajectorySelect} />
                )}
              </>
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
                {isPlanning ? (
                  <Paper shadow="sm" p="xl" withBorder style={{
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                  }}>
                    <Stack spacing="xl" align="center">
                      <Loader size="xl" color="brand" />
                      <Title order={3} color="brand.6">
                        Creating Your Personalized Journey Plan
                      </Title>
                      <Text color="dimmed" size="lg">
                        We're designing a detailed roadmap for your {selectedTrajectory.name} career path...
                      </Text>
                    </Stack>
                  </Paper>
                ) : planResults && !planResults.error ? (
                  <JourneyGraph journey={planResults} />
                ) : planResults && planResults.error ? (
                  <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
                    {planResults.error}
                  </Alert>
                ) : null}
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