import { TextInput, Select, Stack, Title } from '@mantine/core';

// Assume options are defined elsewhere or passed as props
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];
const YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

function StudentInfoForm({ data, onChange }) {
    return (
        <Stack>
             <Title order={3} mb="sm">Basic Information</Title>
            <TextInput
                label="Full Name"
                placeholder="Your full name"
                required
                value={data.name}
                onChange={(event) => onChange('name', event.currentTarget.value)}
            />
            <Select
                label="Gender"
                placeholder="Select gender"
                data={GENDER_OPTIONS}
                value={data.gender}
                onChange={(value) => onChange('gender', value)} // Select passes value directly
                clearable
            />
            <Select
                label="Current Year"
                placeholder="Select year"
                required
                data={YEAR_OPTIONS}
                value={data.year}
                onChange={(value) => onChange('year', value)} // Select passes value directly
            />
            <TextInput
                label="Major / Field of Study"
                placeholder="e.g., Computer Science, History"
                required
                value={data.major}
                onChange={(event) => onChange('major', event.currentTarget.value)}
            />
        </Stack>
    );
}

export default StudentInfoForm;
