import React from 'react';
import { Text, Group, Box } from '@mantine/core';

const ClaudeFooter = () => {
    return (
        <Box
            sx={() => ({
                width: '100%',
                padding: '20px 0',
                textAlign: 'center',
                marginTop: '40px',
                marginBottom: '120px',
                backgroundColor: 'transparent'
            })}
        >
            <Group position="center" spacing="xs" style={{ justifyContent: 'center' }}>
                <Text size="xs" color="dimmed" style={{ fontSize: '16px' }}>
                    Powered by
                </Text>

                {/* Accurate Anthropic Logo */}
                <div style={{
                    display: 'inline-block',
                    marginLeft: '6px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: '18px',
                    color: '#000000',
                    letterSpacing: '0',
                }}>
                    A\
                </div>
            </Group>
        </Box>
    );
};

export default ClaudeFooter;