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
        introduction: "Alex, as a third-year Computer Science student at the prestigious Stanford University, you have an incredible opportunity to prepare for a rewarding career as a Software Engineer. With your strong technical foundation, creative problem-solving abilities, and alignment with the industry's priorities, you are well-positioned to thrive in this dynamic field. I've crafted a personalized career development plan to guide you through the next steps and help you make the most of your time at Stanford.",
        sections: [
          {
            title: "Coursework",
            description: "Leverage Stanford's renowned Computer Science program to develop the essential technical skills for software engineering.",
            steps: [
              {
                title: "Enroll in Core CS Courses",
                description: "Ensure you complete the core Computer Science courses, such as Algorithms, Data Structures, and Programming Languages. These foundational classes will provide you with the strong technical background needed for software engineering roles.",
                timeline: "Complete by the end of your junior year",
                resources: [
                  "Stanford's CS Course Catalog",
                  "Academic Advising"
                ]
              },
              {
                title: "Explore Electives in Emerging Technologies",
                description: "Given your interest in AI and machine learning, consider taking electives in these cutting-edge areas, such as Machine Learning, Artificial Intelligence, and Deep Learning. These courses will allow you to gain specialized knowledge and stay ahead of industry trends.",
                timeline: "Take these courses in your junior and senior years",
                resources: [
                  "Stanford's CS Course Catalog",
                  "Faculty Advisors"
                ]
              },
              {
                title: "Develop Communication and Collaboration Skills",
                description: "While technical skills are essential, software engineering also requires strong communication and teamwork abilities. Enroll in courses that focus on technical writing, project management, and interpersonal skills to complement your technical expertise.",
                timeline: "Complete by the end of your junior year",
                resources: [
                  "Stanford's Communication and Collaboration Courses",
                  "Career Center"
                ]
              }
            ]
          },
          {
            title: "Extracurricular Activities",
            description: "Complement your academic pursuits with hands-on experience and personal growth opportunities.",
            steps: [
              {
                title: "Join a Student-Led Tech Club",
                description: "Get involved with organizations like the Stanford Computer Science Club or the Stanford Artificial Intelligence Laboratory Student Association. These groups offer opportunities to collaborate on projects, attend tech talks, and network with industry professionals.",
                timeline: "Join a club in your sophomore or junior year",
                resources: [
                  "Stanford Student Organizations Directory",
                  "Club Websites"
                ]
              },
              {
                title: "Participate in Hackathons and Coding Competitions",
                description: "Showcase your problem-solving skills and creativity by participating in hackathons and coding competitions, both on-campus and nationally. These events will challenge you to think outside the box and work under time pressure, valuable skills for software engineering.",
                timeline: "Participate in at least one hackathon per year",
                resources: [
                  "Stanford Hackathon Calendar",
                  "Major League Hacking"
                ]
              },
              {
                title: "Explore Entrepreneurial Opportunities",
                description: "Stanford's strong ties to Silicon Valley provide excellent opportunities to explore entrepreneurship. Consider participating in the StartX accelerator program or the Stanford Venture Studio to gain hands-on experience in building and launching your own tech projects.",
                timeline: "Explore these opportunities in your junior and senior years",
                resources: [
                  "StartX",
                  "Stanford Venture Studio"
                ]
              }
            ]
          },
          {
            title: "Internships and Work Experiences",
            description: "Gain practical, industry-relevant experience to complement your academic studies.",
            steps: [
              {
                title: "Pursue Internships at Tech Companies",
                description: "Leverage Stanford's connections to secure internships at leading tech companies, such as Google, Microsoft, or Apple. These experiences will allow you to apply your skills in a professional setting, build your network, and gain valuable insights into the software engineering industry.",
                timeline: "Secure at least one internship by the end of your junior year",
                resources: [
                  "Stanford Career Center",
                  "Company Recruiting Events"
                ]
              },
              {
                title: "Explore Research Opportunities",
                description: "Consider working as a research assistant for a professor in the Computer Science department, particularly in areas related to your interests in AI and machine learning. This will not only deepen your technical knowledge but also provide you with valuable research experience.",
                timeline: "Pursue research opportunities throughout your junior and senior years",
                resources: [
                  "CS Faculty Profiles",
                  "Undergraduate Research Program"
                ]
              },
              {
                title: "Gain Freelance or Contract Experience",
                description: "To further develop your skills and build your portfolio, consider taking on freelance or contract software engineering projects. This will allow you to work on a variety of projects, hone your problem-solving abilities, and demonstrate your expertise to potential employers.",
                timeline: "Seek out freelance opportunities in your junior and senior years",
                resources: [
                  "Upwork",
                  "Freelancer.com",
                  "Local Networking Events"
                ]
              }
            ]
          },
          {
            title: "Skill Development",
            description: "Continuously expand your technical and professional skills to stay competitive in the software engineering field.",
            steps: [
              {
                title: "Master Programming Languages and Frameworks",
                description: "Become proficient in the most in-demand programming languages and frameworks for software engineering, such as Python, Java, JavaScript, and React. Stay up-to-date with industry trends and continuously learn new technologies.",
                timeline: "Develop these skills throughout your time at Stanford",
                resources: [
                  "Online Tutorials",
                  "Stanford's CS Course Offerings",
                  "Industry Blogs"
                ]
              },
              {
                title: "Develop Strong Problem-Solving and Critical Thinking Skills",
                description: "As an ENTP, your natural inclination towards creative problem-solving aligns well with the demands of software engineering. Hone these skills through coding challenges, hackathons, and project-based learning.",
                timeline: "Cultivate these skills throughout your time at Stanford",
                resources: [
                  "Coding Practice Platforms",
                  "Stanford's Problem-Solving Courses"
                ]
              },
              {
                title: "Enhance Your Communication and Collaboration Abilities",
                description: "Effective communication and teamwork are essential for software engineers. Seek out opportunities to improve your written and verbal communication skills, as well as your ability to work collaboratively with cross-functional teams.",
                timeline: "Develop these skills throughout your time at Stanford",
                resources: [
                  "Stanford's Communication Courses",
                  "Teamwork Workshops"
                ]
              }
            ]
          },
          {
            title: "Networking and Connections",
            description: "Leverage Stanford's extensive network and resources to build meaningful connections in the software engineering industry.",
            steps: [
              {
                title: "Attend Tech Industry Events",
                description: "Participate in tech conferences, meetups, and networking events, both on-campus and in the broader Silicon Valley community. These will allow you to learn from industry experts, stay up-to-date on the latest trends, and make valuable connections with potential employers.",
                timeline: "Attend at least one event per semester",
                resources: [
                  "Stanford Career Center Events",
                  "Meetup.com",
                  "LinkedIn Events"
                ]
              },
              {
                title: "Connect with Alumni in Software Engineering",
                description: "Utilize Stanford's extensive alumni network to reach out to graduates who are working as software engineers. They can provide valuable insights, mentorship, and potentially even referrals for internships or job opportunities.",
                timeline: "Reach out to at least 3 alumni per semester",
                resources: [
                  "Stanford Alumni Association",
                  "LinkedIn Alumni Tool"
                ]
              },
              {
                title: "Build Relationships with Faculty and Researchers",
                description: "Engage with the renowned faculty and researchers in Stanford's Computer Science department. They can serve as mentors, provide research opportunities, and help you navigate the industry and academic pathways available to you.",
                timeline: "Establish relationships with at least 2 faculty members by the end of your junior year",
                resources: [
                  "CS Faculty Profiles",
                  "Office Hours",
                  "Research Seminars"
                ]
              }
            ]
          },
          {
            title: "Leveraging Stanford University Resources",
            description: "Take full advantage of the world-class resources and support available to you at Stanford University.",
            steps: [
              {
                title: "Utilize the Career Center",
                description: "The Stanford Career Center offers a wealth of resources, from career counseling and resume workshops to job search assistance and interview preparation. Regularly engage with the Career Center to ensure you're on the right track for your software engineering career.",
                timeline: "Visit the Career Center at least once per semester",
                resources: [
                  "Stanford Career Center",
                  "Career Counseling Appointments"
                ]
              },
              {
                title: "Participate in the Startup Garage Program",
                description: "As an ENTP with a strong interest in emerging technologies, the Startup Garage program at Stanford could be an excellent opportunity for you. This program allows students to work on their own startup ideas and gain hands-on entrepreneurial experience.",
                timeline: "Apply to the Startup Garage program in your junior or senior year",
                resources: [
                  "Startup Garage",
                  "Entrepreneurship Courses"
                ]
              },
              {
                title: "Explore the School of Engineering Resources",
                description: "The School of Engineering at Stanford offers a variety of resources, including workshops, speaker series, and student organizations, that can complement your software engineering career development. Take advantage of these opportunities to expand your knowledge and network.",
                timeline: "Engage with the School of Engineering resources throughout your time at Stanford",
                resources: [
                  "School of Engineering Events Calendar",
                  "Student Engineering Organizations"
                ]
              }
            ]
          }
        ],
        conclusion: "Alex, with your strong technical foundation, creative problem-solving abilities, and alignment with the software engineering industry's priorities, you are poised for success in this dynamic field. By leveraging the world-class resources and opportunities available to you at Stanford University, you can develop the necessary skills, gain practical experience, and build a robust professional network to thrive as a Software Engineer. I'm confident that by following this personalized career development plan, you will be well on your way to achieving your goals. Remember, I'm here to support you every step of the way. Wishing you all the best in your journey!"
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