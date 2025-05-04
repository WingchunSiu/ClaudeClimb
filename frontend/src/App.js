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
  useMantineTheme
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import NameInputStep from './NameInputStep';
import BasicInfoStep from './BasicInfoStep';
import GoalsAndInterestsForm from './GoalsAndInterestsForm';
import ClaudeFooter from './ClaudeFooter'; // Make sure this points to the newest footer component

// Updated PlannerOutput with improved styling
const PlannerOutput = ({ results }) => {
  const theme = useMantineTheme();

  if (!results) return null;

  return (
    <Paper shadow="xs" p="md" withBorder style={{ borderLeft: `4px solid ${theme.colors.brand[5]}` }}>
      <Stack>
        <Title order={3} color="brand.6">Your Generated Plan</Title>
        <Divider my="sm" />
        <section>
          <Title order={4} color="brand.7">Milestones</Title>
          {results.milestones && results.milestones.length > 0 ? (
            <Stack spacing="xs" mt="xs">
              {results.milestones.map((milestone, index) => (
                <Text key={index} style={{ lineHeight: 1.5 }}>• {milestone}</Text>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed">No milestones generated.</Text>
          )}
        </section>
        <Divider my="sm" />
        <section>
          <Title order={4} color="brand.7">Weekly Hour Allocation</Title>
          {results.timeAllocation ? (
            <Stack spacing="xs" mt="xs">
              {Object.entries(results.timeAllocation).map(([key, value]) => (
                <Text key={key} style={{ lineHeight: 1.5 }}><b>{key}:</b> {value} hours</Text>
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
    goals: '',
    knowsGoals: true,
    hobbies: '',
    interests: '',
    skills: ''
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

  const generatePlan = async () => {
    setIsLoading(true);
    setError(null);
    setPlannerResults(null);
    setStep(4);

    const apiData = {
      basic_info: {
        name: formData.name,
        gender: formData.gender,
        year: formData.year,
        major: formData.major,
      },
      career_goals: formData.knowsGoals ? formData.goals : "User does not know",
      hobbies: formData.hobbies,
      interests: formData.interests,
      skills: formData.skills,
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
    paddingBottom: '25px' // Added padding at the bottom of the page
  };

  // CSS for the main content area
  const contentStyle = {
    flex: '1 0 auto',
    width: '100%',
    maxWidth: '720px',
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

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        {/* Title with Claude-styled branding */}
        <Title
          order={1}
          align="center"
          mb="xl"
          style={{
            fontWeight: 600,
            color: theme.colors.brand[6],
            letterSpacing: '-0.02em'
          }}
        >
          Claude Climb
        </Title>

        {/* Container for all steps with relative positioning */}
        <div style={stepsContainerStyle}>
          {/* Step 1: Name Input */}
          <div style={getAnimationStyle(1)}>
            <Paper shadow="sm" p="lg" withBorder style={{ borderRadius: '8px' }}>
              <NameInputStep
                formData={formData}
                onChange={handleFormChange}
                onNext={nextStep}
              />
            </Paper>
          </div>

          {/* Step 2: Basic Info */}
          <div style={getAnimationStyle(2)}>
            <Paper shadow="sm" p="lg" withBorder style={{ borderRadius: '8px' }}>
              <BasicInfoStep
                formData={formData}
                onChange={handleFormChange}
                onNext={nextStep}
                onBack={prevStep}
              />
            </Paper>
          </div>

          {/* Step 3: Goals and Interests */}
          <div style={getAnimationStyle(3)}>
            <Paper shadow="sm" p="lg" withBorder style={{ borderRadius: '8px' }}>
              <Title order={2} align="center" mb="lg" color="brand.6">Goals & Interests</Title>
              <GoalsAndInterestsForm
                data={formData}
                onChange={handleFormChange}
                onKnowsGoalsChange={handleKnowsGoalsChange}
              />
              <Group position="apart" mt="xl">
                <Button variant="subtle" onClick={prevStep} color="gray">
                  Back
                </Button>
                <Button onClick={generatePlan} loading={isLoading} color="brand">
                  Generate My Plan
                </Button>
              </Group>
            </Paper>
          </div>

          {/* Step 4: Loading / Error / Results */}
          <div style={getAnimationStyle(4)}>
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                <Loader color="brand" size="lg" variant="dots" />
              </div>
            )}
            {error && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Error"
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
                  mt='lg'
                  fullWidth
                  color="brand"
                  style={{ borderRadius: '6px' }}
                >
                  Start Over
                </Button>
              </>
            )}
            {!isLoading && error && (
              <Button
                onClick={resetSteps}
                variant='light'
                mt='lg'
                fullWidth
                color="red"
                style={{ borderRadius: '6px' }}
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>

      <ClaudeFooter />
    </div>
  );
}

export default App;