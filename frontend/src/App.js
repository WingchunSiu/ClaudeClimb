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
  Progress
} from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import NameInputStep from './NameInputStep';
import BasicInfoStep from './BasicInfoStep';
import GoalsAndInterestsForm from './GoalsAndInterestsForm';
import MBTIStep from './MBTIStep';
import ImportantPreferencesStep from './ImportantPreferencesStep';
import ClaudeFooter from './ClaudeFooter';
import StepperProgressBar from './StepperProgressBar';

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

function App() {
  const theme = useMantineTheme();
  const [step, setStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState('forward');

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

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/generate-plan';

    try {
      console.log("Sending data to API:", apiData);
      const response = await axios.post(apiUrl, apiData);
      console.log("Received data from API:", response.data);
      setPlannerResults({
        milestones: response.data?.milestones || [],
        timeAllocation: response.data?.time_allocation || {}
      });
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.detail || 'Failed to generate plan. Please check your input and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // CSS for the page layout with more margin at bottom
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '25px',
    background: 'transparent'
  };

  // CSS for the main content area
  const contentStyle = {
    flex: '1 0 auto',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem'
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

          {/* Step 6: Loading / Error / Results */}
          <div style={getAnimationStyle(6)}>
            {isLoading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 0',
                gap: '1rem'
              }}>
                <Loader color="brand" size="lg" variant="dots" />
                <Text color="dimmed">Crafting your personalized journey...</Text>
              </div>
            )}
            {error && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Oops! Something went wrong"
                color="red"
                variant="filled"
                mt="md"
                radius="md"
              >
                {error}
              </Alert>
            )}
            {plannerResults && !isLoading && (
              <>
                <PlannerOutput results={plannerResults} />
                <Button
                  onClick={resetSteps}
                  variant='light'
                  mt='xl'
                  fullWidth
                  color="brand"
                  style={{
                    borderRadius: '8px',
                    height: '48px',
                    fontSize: '1rem'
                  }}
                >
                  Start a New Journey
                </Button>
              </>
            )}
            {!isLoading && error && (
              <Button
                onClick={resetSteps}
                variant='light'
                mt='xl'
                fullWidth
                color="red"
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  fontSize: '1rem'
                }}
              >
                Try Again
              </Button>
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