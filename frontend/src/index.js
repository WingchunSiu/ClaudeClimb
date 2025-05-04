import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App';
import '@mantine/core/styles.css';
import './styles/claudeStyles.css'; // Import our custom Claude-inspired styles
import './styles/anthropicGradient.css'; // Import our Anthropic gradient styles

// Define colors outside the theme to avoid the "used before defined" error
const brandColors = [
  '#fff9f0', // lightest cream
  '#fff4e5',
  '#ffe9cc',
  '#ffdca3',
  '#ffc875',
  '#ffb347', // primary orange
  '#e69a3e',
  '#cc8235',
  '#b36b2c',
  '#995423'  // darkest orange
];

// Claude-inspired theme
const theme = {
  colorScheme: 'light',
  // Font settings inspired by Claude's aesthetic
  fontFamily: "'Source Sans Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily: "'Söhne', 'Inter', sans-serif",
    fontWeight: 600,
  },

  // Colors inspired by Claude's palette
  colors: {
    brand: brandColors,
  },
  primaryColor: 'brand',
  defaultRadius: 'md',

  // Global styles
  styles: {
    body: (currentTheme) => ({
      backgroundColor: currentTheme.colorScheme === 'dark' ? currentTheme.colors.dark[8] : '#fff9f0',
      color: currentTheme.colorScheme === 'dark' ? currentTheme.colors.gray[0] : '#2c1810',
    }),
    Title: {
      root: {
        fontWeight: 600,
        color: '#2c1810',
      }
    },
    Button: {
      root: {
        fontWeight: 500,
        '&:hover': {
          transform: 'translateY(-1px)',
        }
      }
    },
    Paper: {
      root: {
        backgroundColor: (currentTheme) =>
          currentTheme.colorScheme === 'dark' ? currentTheme.colors.dark[7] : '#fff',
        borderColor: 'rgba(255, 179, 71, 0.2)',
      }
    }
  },

  // Other components can be styled here
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: (theme) => ({
        root: {
          '&[data-variant="filled"]': {
            backgroundColor: theme.colors.brand[5],
            '&:hover': {
              backgroundColor: theme.colors.brand[6],
            }
          }
        }
      })
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
      }
    },
    TextInput: {
      styles: (theme) => ({
        input: {
          '&:focus': {
            borderColor: theme.colors.brand[5],
          }
        }
      })
    },
    Select: {
      styles: (theme) => ({
        input: {
          '&:focus': {
            borderColor: theme.colors.brand[5],
          }
        }
      })
    },
    Textarea: {
      styles: (theme) => ({
        input: {
          '&:focus': {
            borderColor: theme.colors.brand[5],
          }
        }
      })
    }
  }
};

// Add Google Fonts import to document head
const appendFontLinks = () => {
  // Source Sans Pro and Söhne-like alternative
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontLink);
};

// Call function to append font links
appendFontLinks();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
