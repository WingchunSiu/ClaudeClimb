import { Textarea, Checkbox, Stack, Title } from '@mantine/core';

function GoalsAndInterestsForm({ data, onChange, onKnowsGoalsChange }) {

    const handleCheckboxChange = (event) => {
        onKnowsGoalsChange(event.currentTarget.checked);
    };

    return (
        <Stack>
            <Title order={3} mb="sm">Goals, Interests & Skills</Title>
            <Textarea
                label="Career Goals"
                placeholder="Describe your ideal career path, target roles, or industries..."
                value={data.goals}
                onChange={(event) => onChange('goals', event.currentTarget.value)}
                minRows={3}
                disabled={!data.knowsGoals} // Disable if checkbox is unchecked
            />
             <Checkbox
                label="I know my specific career goals"
                checked={data.knowsGoals}
                onChange={handleCheckboxChange}
            />

            <Textarea
                label="Hobbies (Optional)"
                placeholder="What do you enjoy doing in your free time?"
                value={data.hobbies}
                onChange={(event) => onChange('hobbies', event.currentTarget.value)}
                minRows={2}
            />
            <Textarea
                label="Interests (Optional)"
                placeholder="Topics, subjects, or areas you are curious about..."
                value={data.interests}
                onChange={(event) => onChange('interests', event.currentTarget.value)}
                minRows={2}
            />
            <Textarea
                label="Things You're Good At (Skills, Strengths - Optional)"
                placeholder="What are your key skills or things people say you excel at?"
                value={data.skills}
                onChange={(event) => onChange('skills', event.currentTarget.value)}
                minRows={2}
            />
        </Stack>
    );
}

export default GoalsAndInterestsForm;
