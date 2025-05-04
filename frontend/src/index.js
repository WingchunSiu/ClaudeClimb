import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App';
import '@mantine/core/styles.css';
import './claudeStyles.css'; // Import our custom Claude-inspired styles

// Define colors outside the theme to avoid the "used before defined" error
const brandColors = [
  '#f0f4ff', // lightest
  '#d9e2ff',
  '#bac9ff',
  '#95a8ff',
  '#7988f8',
  '#5e6ad2', // primary
  '#4a52a8',
  '#363c7e',
  '#252856',
  '#16172e'  // darkest
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
      backgroundColor: currentTheme.colorScheme === 'dark' ? currentTheme.colors.dark[8] : '#fafafa',
      color: currentTheme.colorScheme === 'dark' ? currentTheme.colors.gray[0] : currentTheme.colors.gray[9],
    }),
    Title: {
      root: {
        fontWeight: 600,
      }
    },
    Button: {
      root: {
        fontWeight: 500,
      }
    },
    Paper: {
      root: {
        backgroundColor: (currentTheme) =>
          currentTheme.colorScheme === 'dark' ? currentTheme.colors.dark[7] : '#ffffff',
      }
    }
  },

  // Other components can be styled here
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      }
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
      }
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
